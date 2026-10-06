import { create } from "zustand";
import { useQuery, queryOptions } from "@tanstack/react-query";
import { cachedPastPapers, cachedModules } from "@/lib/data";
import type { GradfastModules, Module, PastPaper } from "@/lib/types";

// biome-ignore lint/suspicious/noExplicitAny: FetchType is a generic fetch function that returns any type of data
type FetchType = (url: string, options?: RequestInit) => Promise<any>;
type ProxyFetchType = (url: string, options?: RequestInit) => Promise<Response>;

interface ApiState {
	cookies: string | null;
	apiFetch: FetchType;
	proxyFetch: ProxyFetchType;
}

export const useApiStore = create<ApiState>((set, get) => ({
	cookies: null,
	setCookies: (cookies: string) => set({ cookies }),

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
		const { cookies } = get();
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
			return (
				cachedModules.find(
					(m) =>
						m.code.prefix === moduleCode.prefix &&
						m.code.number === moduleCode.number,
				) || null
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
			return cachedPastPapers[fullCode] || [];
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

export function useModuleInfo(moduleCode: { prefix: string; number: number }) {
	const apiFetch = useApiStore((state) => state.apiFetch);
	const options = getModuleInfoOptions(moduleCode, apiFetch);
	return useQuery(options);
}

export function useModulePastPapers(moduleCode: {
	prefix: string;
	number: number;
}) {
	const apiFetch = useApiStore((state) => state.apiFetch);
	const options = getPastPapersOptions(moduleCode, apiFetch);
	return useQuery(options);
}

export function useModules() {
	const apiFetch = useApiStore((state) => state.apiFetch);
	const options = getModulesOptions(apiFetch);
	return useQuery(options);
}
