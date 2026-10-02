import { create } from "zustand";
import { useQuery, queryOptions } from "@tanstack/react-query";
import mime from "mime";
import { cachedPastPapers, cachedModules } from "@/lib/data";
import type { GradfastModules, Module, PastPaper } from "@/lib/types";
import { useSettingsStore } from "./useSettingsStore";
import pLimit from "p-limit";
import { toast } from "@/hooks/use-toast";

// biome-ignore lint/suspicious/noExplicitAny: FetchType is a generic fetch function that returns any type of data
type FetchType = (url: string, options?: RequestInit) => Promise<any>;
type ProxyFetchType = (url: string, options?: RequestInit) => Promise<Response>;

function getExtensionFromMime(contentType: string): string | null {
	// mime.getExtension automatically strips charset metadata if present
	return mime.getExtension(contentType);
}

interface ApiState {
	cookies: string | null;
	apiFetch: FetchType;
	proxyFetch: ProxyFetchType;
	handlePaperDownload: (moduleID: string, paper: PastPaper) => Promise<void>;
	checkPapersAvailability: (papers: PastPaper[]) => Promise<{ paper: PastPaper; available: boolean }[]>;
	checkPapersAvailabilityDynamic: (papers: PastPaper[], onResult: (paper: PastPaper, isAvailable: boolean) => void) => Promise<void>;
	handlePapersDownload: (dirHandle: FileSystemDirectoryHandle, moduleID: string, papers: PastPaper[], onPaperComplete?: (paper: PastPaper) => void) => Promise<void>;
	// modulesQuery: DefinedUseQueryResult<Module[], Error>
	// currentModuleCode: string | null;
	// setCurrentModuleCode: React.Dispatch<React.SetStateAction<string | null>>;
	// moduleInfoQuery: DefinedUseQueryResult<Module | null, Error>
	// modulePastPapersQuery: DefinedUseQueryResult<PastPaper[], Error>
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

	handlePaperDownload: async (moduleID, paper) => {
		const { proxyFetch } = get();
		const url = paper.url;

		const blob = await (await proxyFetch(url)).blob();
		console.log(blob);
		const tempURL = URL.createObjectURL(blob);

		const constructedFilename =
			`${moduleID} - ${paper.year} - ${paper.description} ${paper.memo === "yes" ? "MEMO" : ""}.${getExtensionFromMime(blob.type) || "pdf"}`.trim();
		alert(`Constructed filename: ${constructedFilename}`);

		let fileName = new URL(url).pathname.split("/").pop();
		if (!fileName) {
			fileName = constructedFilename; // Fallback to constructed filename if URL doesn't provide one
		} else {
			fileName = decodeURIComponent(fileName); // Decode the filename from the URL
		}

		// 1. Create a temporary anchor element
		const link = document.createElement("a");
		link.href = tempURL;

		// 2. Set the desired filename for the download
		link.setAttribute("download", fileName);

		// 3. Append to body, trigger click, and clean up
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		window.URL.revokeObjectURL(tempURL); // Clean up the object URL
	},

	checkPapersAvailability: async (papers) => {
		const { parallelDownloads: parallelDownloadsCount } = useSettingsStore.getState();
		const { proxyFetch } = get();

		const checkPaper = async (paper: PastPaper) => {
			const url = paper.url;
			const resp = await proxyFetch(url, { method: "HEAD" });
			return { paper, available: resp.ok };
		};

		const limit = pLimit(parallelDownloadsCount || 3);
		const downloadPromises = papers.map((paper) => limit(() => checkPaper(paper)));
		const results = await Promise.allSettled(downloadPromises);
		return papers.map((paper, index) => {
			const result = results[index];
			if (result.status === "fulfilled") {
				return result.value;
			} else {
				console.error(`Error checking availability for paper ${paper.year} - ${paper.description}:`, result.reason);
				return { paper, available: false };
			}
		});
	},

	checkPapersAvailabilityDynamic: async (papers, onResult) => {
		const { parallelDownloads: parallelDownloadsCount } = useSettingsStore.getState();
		const { proxyFetch } = get();

		const checkPaper = async (paper: PastPaper) => {
			try {
				const url = paper.url;
				const resp = await proxyFetch(url, { method: "HEAD" });
				onResult(paper, resp.ok);
			}
			catch (error) {
				console.error(error);
				onResult(paper, false);
				console.warn(`Paper unavailable: ${paper.year} - ${paper.description}`);
			}
		};

		const limit = pLimit(parallelDownloadsCount || 3);
		const downloadPromises = papers.map((paper) => limit(() => checkPaper(paper)));
		await Promise.allSettled(downloadPromises);
	},

	handlePapersDownload: async (dirHandle, moduleID, papers, onPaperComplete) => {
		const { parallelDownloads: parallelDownloadsCount } = useSettingsStore.getState();
		const { proxyFetch } = get();

		const downloadPaper = async (paper: PastPaper) => {
			const url = paper.url;
			const blob = await (await proxyFetch(url)).blob();
			const constructedFilename =
			`${moduleID} - ${paper.year} - ${paper.description} ${paper.memo === "yes" ? "MEMO" : ""}.${getExtensionFromMime(blob.type) || "pdf"}`.trim();

			let fileName = new URL(url).pathname.split("/").pop();
			if (!fileName) {
				fileName = constructedFilename; // Fallback to constructed filename if URL doesn't provide one
			} else {
				fileName = decodeURIComponent(fileName); // Decode the filename from the URL
			}

			// Create a new file in the directory
			const fileHandle = await dirHandle.getFileHandle(constructedFilename, {
				create: true,
			});
			const writableStream = await fileHandle.createWritable();
			await writableStream.write(blob);
			await writableStream.close();
			if (onPaperComplete) {
				onPaperComplete(paper);
			}
		};

		const limit = pLimit(parallelDownloadsCount || 3);
		const downloadPromises = papers.map((paper) => limit(() => downloadPaper(paper)));
		const results = await Promise.allSettled(downloadPromises);
		const failedDownloads = results.filter((result) => result.status === "rejected");
		if (failedDownloads.length > 0) {
			alert(`${failedDownloads.length} downloads failed.`);
		}
		toast({
			title: "✅ Download Complete",
			description: `${papers.length - failedDownloads.length} files saved to ${dirHandle.name}.`,
			variant: "default",
		});
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
