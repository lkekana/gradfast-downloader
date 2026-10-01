import { create } from "zustand";
import { useQuery, queryOptions } from "@tanstack/react-query";
import mime from 'mime';
import { cachedPastPapers, cachedModules } from "@/lib/data";
import type { GradfastModules, Module, PastPaper } from "@/lib/types";

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
    handleDownload: (moduleID: string, paper: PastPaper) => Promise<void>
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
        const xCookiesHeader = response.headers.get("x-cookies") || response.headers.get("X-Cookies");
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
        const response = await fetch(proxyURL.toString(), {
            ...options,
            headers: requestHeaders,
        });
        if (!response.ok) {
            throw new Error(`Proxy request failed with status ${response.status}`);
        }
        const xCookiesHeader = response.headers.get("x-cookies") || response.headers.get("X-Cookies");
        if (xCookiesHeader) {
            set({ cookies: xCookiesHeader });
        }
        return response;
    },

    handleDownload: async (moduleID, paper) => {
        const { proxyFetch } = get();
        const url = paper.url;

		const blob = await (await proxyFetch(url)).blob();
        console.log(blob);
		const tempURL = URL.createObjectURL(blob);

        const constructedFilename = `${moduleID} - ${paper.year} - ${paper.description} ${paper.memo === "yes" ? "MEMO" : ""}.${getExtensionFromMime(blob.type) || "pdf"}`.trim();
        alert(`Constructed filename: ${constructedFilename}`);

		let fileName = new URL(url).pathname.split('/').pop();
		if (!fileName) {
			fileName = constructedFilename; // Fallback to constructed filename if URL doesn't provide one
		}
		else {
			fileName = decodeURIComponent(fileName); // Decode the filename from the URL
		}

		// 1. Create a temporary anchor element
		const link = document.createElement('a');
		link.href = tempURL;
		
		// 2. Set the desired filename for the download
		link.setAttribute('download', fileName);
		
		// 3. Append to body, trigger click, and clean up
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		window.URL.revokeObjectURL(tempURL); // Clean up the object URL
    }
}));

export const getModuleInfoOptions = (moduleCode: {
    prefix: string;
    number: number;
}, apiFetch: FetchType) => {
    const fullCode = `${moduleCode.prefix}${moduleCode.number}`;
    return queryOptions(
    {
        queryKey: ["moduleInfo", fullCode],
        queryFn: async () => {
            // return new Promise<Module | null>((resolve) => {
            // 	const module = cachedModules.find(
            // 		(m) => `${m.code.prefix}${m.code.number}` === currentModuleCode,
            // 	);
            // 	resolve(module || null);
            // });

            // make request to ${API_PROXY}/module/${currentModuleCode} and return the data
            const data = await apiFetch(`${import.meta.env.VITE_API_PROXY}/module/${fullCode}`);
            return {
                code: {
                    prefix: data.prefix,
                    number: data.code,
                },
                faculty: cachedModules.find((m) => m.code.prefix === data.prefix && m.code.number === data.code)?.faculty || "Unknown",
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
                    (m) => m.code.prefix === moduleCode.prefix && m.code.number === moduleCode.number
                ) || null
            );
        },
    });
};

export const getPastPapersOptions = (moduleCode: {
	prefix: string;
	number: number;
}, apiFetch: FetchType) => {
    const fullCode = `${moduleCode.prefix}${moduleCode.number}`;
    return queryOptions(
    {
        queryKey: ["modulePastPapers", fullCode],
        queryFn: async () => {
            // make request to ${API_PROXY}/module/${currentModuleCode}/past-papers and return the data
            const data = await apiFetch(`${import.meta.env.VITE_API_PROXY}/module/${fullCode}/past-papers`);
            return data as PastPaper[];
        },
        staleTime: 1000 * 60 * 55, // 55 minutes
        gcTime: 1000 * 60 * 60 * 24, // 24 hours
        initialData: () => {
            return cachedPastPapers[fullCode] || [];
        },
    }
)};

export const getModulesOptions = (apiFetch: FetchType) => {
    return queryOptions(
    {
        queryKey: ["modules"],
        queryFn: async () => {
            // make request to ${API_PROXY}/modules and return the data
            const data = await apiFetch(`${import.meta.env.VITE_API_PROXY}/modules`);
            return data as GradfastModules;
        },
        initialData: [],
    }
)}

export function useModuleInfo(moduleCode: { prefix: string; number: number }) {
    const apiFetch = useApiStore((state) => state.apiFetch);
    const options = getModuleInfoOptions(moduleCode, apiFetch);
    return useQuery(options);
}

export function useModulePastPapers(moduleCode: { prefix: string; number: number }) {
    const apiFetch = useApiStore((state) => state.apiFetch);
    const options = getPastPapersOptions(moduleCode, apiFetch);
    return useQuery(options);
}

export function useModules() {
    const apiFetch = useApiStore((state) => state.apiFetch);
    const options = getModulesOptions(apiFetch);
    return useQuery(options);
}