import { create } from "zustand";
import { useQuery, queryOptions } from "@tanstack/react-query";
import { cachedPastPapers, cachedModules } from "@/lib/data";
import type { GradfastModules, Module, PastPaper } from "@/lib/types";

// biome-ignore lint/suspicious/noExplicitAny: FetchType is a generic fetch function that returns any type of data
type FetchType = (url: string, options?: RequestInit) => Promise<any>;
type ProxyFetchType = (url: string, options?: RequestInit) => Promise<Response>;

export type CloudfrontPolicy = {
	Statement: {
		Resource: string;
		Condition: {
			DateLessThan: {
				"AWS:EpochTime": number;
			};
		};
	}[];
};

export const parseCloudfrontPolicy = (policyb64: string): CloudfrontPolicy | null => {
	try {
		const cleanedB64 = policyb64.replace(/-/g, "+").replace(/_/g, "=").replace(/~/g, "/");
		const decodedText = atob(cleanedB64);
		const obj = JSON.parse(decodedText) as CloudfrontPolicy;
		return obj;
	} catch (error) {
		console.error("Failed to parse CloudFront-Policy cookie value:", error);
		return null;
	}
};

interface ApiState {
	cookies: string | null;
	apiFetch: FetchType;
	proxyFetch: ProxyFetchType;
	cookiesExpired: () => boolean;
	refreshCookies: () => Promise<void>;
}

export const useApiStore = create<ApiState>((set, get) => ({
	cookies: null,

	apiFetch: async (url, options = {}) => {
		const { cookies } = get();
		const requestHeaders = new Headers(options.headers || {});
		if (requestHeaders.get("Content-Type") === null) {
			requestHeaders.set("Content-Type", "application/json");
		}
		if (cookies) {
			requestHeaders.set("X-Cookies", cookies);
		}
		const response = await fetch(url, {
			...options,
			headers: requestHeaders,
		});
		if (!response.ok) {
			throw new Error(`API request failed with status ${response.status}`);
		}
		const xCookiesHeader =
			response.headers.get("x-cookies") || response.headers.get("X-Cookies");
		if (xCookiesHeader) {
			set({ cookies: xCookiesHeader });
		}
		return response.json();
	},

	proxyFetch: async (url, options = {}) => {
		const { cookies, cookiesExpired, refreshCookies } = get();
		if (cookiesExpired()) {
			await refreshCookies();
		}

		const requestHeaders = new Headers(options.headers || {});
		if (cookies) {
			requestHeaders.set("X-Cookies", cookies);
		}
		// const proxyURL = `${import.meta.env.VITE_API_PROXY}/proxy?url=${encodeURIComponent(url)}`;
		const proxyURL = new URL(`${import.meta.env.VITE_CDN_PROXY}/proxy`);
		proxyURL.searchParams.append("url", url);

		// the URL object converts spaces to +, but we want %20 for spaces in the query string, so we need to replace + with %20
		const [baseUrl, queryString] = proxyURL.href.split('?');
		const finalUrl = queryString 
		? `${baseUrl}?${queryString.replace(/\+/g, '%20')}` 
		: baseUrl;

		const response = await fetch(finalUrl, {
			...options,
			headers: requestHeaders,
		});
		if (!response.ok) {
			throw new Error(`Proxy request failed with status ${response.status}`);
		}
		const xCookiesHeader =
			response.headers.get("x-cookies") || response.headers.get("X-Cookies");
		if (xCookiesHeader) {
			set({ cookies: xCookiesHeader });
		}
		return response;
	},

	cookiesExpired: () => {
		const { cookies } = get();
		if (!cookies) return true;
		try {
			const decoded = atob(cookies);
			const parsed = JSON.parse(decoded) as { name: string; value: string }[];
			// find the cookie with name "CloudFront-Policy"
			const policyCookie = parsed.find(
				(cookie: { name: string; value: string }) =>
					cookie.name === "CloudFront-Policy",
			);
			if (!policyCookie) return true;
			const policyValue = policyCookie.value;
			// policyValue is a base64 encoded JSON string, so we need to decode it first
			const policy = parseCloudfrontPolicy(policyValue);
			if (policy === null) return true;
			const expirationTime =
				policy.Statement[0].Condition.DateLessThan["AWS:EpochTime"];
			const currentTime = Math.floor(Date.now() / 1000);
			return currentTime >= expirationTime;
		} catch (error) {
			console.error("Error checking cookies expiration:", error);
			return true;
		}
	},

	refreshCookies: async () => {
		const { cookies } = get();
		if (cookies === null) {
			// cookies never received
			const response = await fetch(`${import.meta.env.VITE_AUTH_PROXY}/auth`, {
				method: "GET",
			});
			if (!response.ok) {
				throw new Error(`Failed to refresh cookies: ${response.status}`);
			}
			const newCookies = response.headers.get("x-cookies");
			if (newCookies) {
				set({ cookies: newCookies });
			}
		}
		else {
			// cookies exist, refresh them by making a request to the API proxy with the current cookies
			const randomModule = cachedModules[Math.floor(Math.random() * cachedModules.length)];
			const code = `${randomModule.code.prefix}${randomModule.code.number}`;
			const { apiFetch } = get();
			await apiFetch(
				`${import.meta.env.VITE_API_PROXY}/module/${code}`,
				{
					method: "GET",
					headers: {
						"X-Cookies": cookies,
					},
				},
			);
			if (get().cookiesExpired()) {
				await apiFetch(`${import.meta.env.VITE_API_PROXY}/module/${code}/past-papers`, {
					method: "GET",
					headers: {
						"X-Cookies": cookies,
					},
				});
			}
			if (get().cookiesExpired()) {
				throw new Error("Failed to refresh cookies");
			}
		}
	},
}));

export const getModuleInfoOptions = (
	moduleCode: {
		prefix: string;
		number: number;
	},
	apiFetch: FetchType,
) => {
	const fullCode = `${moduleCode.prefix}${moduleCode.number}`;
	return queryOptions({
		queryKey: ["moduleInfo", fullCode],
		queryFn: async () => {
			// make request to ${API_PROXY}/module/${currentModuleCode} and return the data
			const data = await apiFetch(
				`${import.meta.env.VITE_API_PROXY}/module/${fullCode}`,
			);
			return {
				code: {
					prefix: data.prefix,
					number: data.code,
				},
				faculty:
					cachedModules.find(
						(m) => m.code.prefix === data.prefix && m.code.number === data.code,
					)?.faculty || "Unknown",
				name: data.name,
				// credits: parseInt(data.credits, 10),
				period: data.period,
				// prerequisites: data.prerequisites,
			} as Module;
		},
		staleTime: 1000 * 60 * 55, // 55 minutes
		gcTime: 1000 * 60 * 60 * 24, // 24 hours
		initialData: () => {
			return cachedModules.find(
					(m) =>
						m.code.prefix === moduleCode.prefix &&
						m.code.number === moduleCode.number,
			);
		},
	});
};

export const getPastPapersOptions = (
	moduleCode: {
		prefix: string;
		number: number;
	},
	apiFetch: FetchType,
) => {
	const fullCode = `${moduleCode.prefix}${moduleCode.number}`;
	return queryOptions({
		queryKey: ["modulePastPapers", fullCode],
		queryFn: async () => {
			// make request to ${API_PROXY}/module/${currentModuleCode}/past-papers and return the data
			const data = await apiFetch(
				`${import.meta.env.VITE_API_PROXY}/module/${fullCode}/past-papers`,
			);

			// URL decode the paper URLs
			return data.map((paper: PastPaper) => ({
				...paper,
				url: decodeURIComponent(paper.url),
			})) as PastPaper[];
		},
		staleTime: 1000 * 60 * 55, // 55 minutes
		gcTime: 1000 * 60 * 60 * 24, // 24 hours
		initialData: () => {
			return cachedPastPapers[fullCode];
		},
	});
};

export const getModulesOptions = (apiFetch: FetchType) => {
	return queryOptions({
		queryKey: ["modules"],
		queryFn: async () => {
			// make request to ${API_PROXY}/modules and return the data
			const data = await apiFetch(`${import.meta.env.VITE_API_PROXY}/modules`);
			return data as GradfastModules;
		},
		initialData: [],
	});
};

export const getPaperAvailabilityOptions = (
	paper: PastPaper,
	proxyFetch: ProxyFetchType
) => queryOptions({
	queryKey: ["paperAvailability", paper.url],
	queryFn: async () => {
		try {
			const resp = await proxyFetch(paper.url, { method: "HEAD" });
			return resp.ok;
		} catch (_error) {
			// proxyFetch throws if !response.ok, so we catch it and return false
			return false; 
		}
	},
	staleTime: 1000 * 60 * 60 * 24 * 365, // 1 year
	gcTime: 1000 * 60 * 60 * 24 * 365,    // 1 year
	retry: 1,
});

export function useModuleInfo(moduleCode: { prefix: string; number: number }, additionalOptions: Partial<ReturnType<typeof getModuleInfoOptions>> = {}) {
	const apiFetch = useApiStore((state) => state.apiFetch);
	const options = getModuleInfoOptions(moduleCode, apiFetch);
	return useQuery({
		...options,
		...additionalOptions,
	});
}

export function useModulePastPapers(moduleCode: {
	prefix: string;
	number: number;
}, additionalOptions: Partial<ReturnType<typeof getPastPapersOptions>> = {}) {
	const apiFetch = useApiStore((state) => state.apiFetch);
	const options = getPastPapersOptions(moduleCode, apiFetch);
	return useQuery({
		...options,
		...additionalOptions,
	});
}

export function useModules(additionalOptions: Partial<ReturnType<typeof getModulesOptions>> = {}) {
	const apiFetch = useApiStore((state) => state.apiFetch);
	const options = getModulesOptions(apiFetch);
	return useQuery({
		...options,
		...additionalOptions,
	});
}
