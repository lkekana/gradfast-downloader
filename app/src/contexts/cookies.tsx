import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { type DefinedUseQueryResult, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GradfastModules, Module, PastPaper } from "@/lib/types";
import { cachedPastPapers, cachedModules } from "@/lib/data";
import { queryOptions } from "@tanstack/react-query";
import mime from 'mime';

// biome-ignore lint/suspicious/noExplicitAny: FetchType is a generic fetch function that returns any type of data
type FetchType = (url: string, options?: RequestInit) => Promise<any>;
type ProxyFetchType = (url: string, options?: RequestInit) => Promise<Response>;

function getExtensionFromMime(contentType: string): string | null {
    // mime.getExtension automatically strips charset metadata if present
    return mime.getExtension(contentType); 
}

// Helper to generate the options
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
    const { apiFetch } = useCookies();
    const options = getModuleInfoOptions(moduleCode, apiFetch);
    return useQuery(options);
}

export function useModulePastPapers(moduleCode: { prefix: string; number: number }) {
    const { apiFetch } = useCookies();
    const options = getPastPapersOptions(moduleCode, apiFetch);
    return useQuery(options);
}

export function useModules() {
    const { apiFetch } = useCookies();
    const options = getModulesOptions(apiFetch);
    return useQuery(options);
}

interface CookieContextType {
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

const CookieContext = createContext<CookieContextType | undefined>(undefined);

export function CookieProvider({ children }: { children: React.ReactNode }) {
	const [cookies, setCookies] = useState<string | null>(null);

    const apiFetch = useCallback(async (url: string, options: RequestInit = {}) => {
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
            setCookies(xCookiesHeader);
        }
        return response.json();
    }, [cookies]);

    const proxyFetch = useCallback(async (url: string, options: RequestInit = {}) => {
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
            throw new Error(`API request failed with status ${response.status}`);
        }
        const xCookiesHeader = response.headers.get("x-cookies") || response.headers.get("X-Cookies");
        if (xCookiesHeader) {
            setCookies(xCookiesHeader);
        }
        return response;
    }, [cookies]);

    const handleDownload = useCallback(async (moduleID: string, paper: PastPaper): Promise<void> => {
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
	  }, [proxyFetch]);

	// const queryClient = useQueryClient();
	// const modulesQuery = useQuery({
	// 	queryKey: ["modules"],
	// 	queryFn: async () => {
	// 		// Simulate an API call to fetch modules
	// 		return new Promise<Module[]>((resolve) => {
	// 			setTimeout(() => {
	// 				resolve(cachedModules);
	// 			}, 1000);
	// 		});
	// 	},
	// 	initialData: cachedModules,
	// });

	// const [currentModuleCode, setCurrentModuleCode] = useState<string | null>(
	// 	null,
	// );
	// const moduleInfoQuery = useQuery({
	// 	queryKey: ["moduleInfo", currentModuleCode],
	// 	queryFn: async () => {
	// 		if (!currentModuleCode) return null;
	// 		// return new Promise<Module | null>((resolve) => {
	// 		// 	const module = cachedModules.find(
	// 		// 		(m) => `${m.code.prefix}${m.code.number}` === currentModuleCode,
	// 		// 	);
	// 		// 	resolve(module || null);
	// 		// });

    //         // make request to ${API_PROXY}/module/${currentModuleCode} and return the data
    //         const data = await apiFetch(`${import.meta.env.VITE_API_PROXY}/module/${currentModuleCode}`);
    //         return {
    //             code: {
    //                 prefix: data.prefix,
    //                 number: data.code,
    //             },
    //             faculty: cachedModules.find((m) => m.code.prefix === data.prefix)?.faculty || "Unknown",
    //             name: data.name,
    //             // credits: parseInt(data.credits, 10),
    //             period: data.period,
    //             // prerequisites: data.prerequisites,
    //         } as Module;
	// 	},
    //     enabled: !!currentModuleCode,
    //     staleTime: 1000 * 60 * 55, // 55 minutes
    //     gcTime: 1000 * 60 * 60 * 24, // 24 hours
	// 	initialData: () => {
	// 		if (!currentModuleCode) return null;
	// 		return (
	// 			cachedModules.find(
	// 				(m) => `${m.code.prefix}${m.code.number}` === currentModuleCode,
	// 			) || null
	// 		);
	// 	},
	// });
    // const modulePastPapersQuery = useQuery({
    //     queryKey: ["modulePastPapers", currentModuleCode],
    //     queryFn: async () => {
    //         if (!currentModuleCode) return [];
            
    //         // make request to ${API_PROXY}/module/${currentModuleCode}/past-papers and return the data
    //         const data = await apiFetch(`${import.meta.env.VITE_API_PROXY}/module/${currentModuleCode}/past-papers`);

    //         // sample response: [{"category":"Exam Opportunities","version":"1","description":"Exam Opportunity 1","year":"2015","memo":"no","url":"https://cdn.gradfast.com/COS110/COS110%20-%20Semester%20Test%201%20-%202015.pdf"},{"category":"Exam Opportunities","version":"1","description":"Exam Opportunity 2","year":"2015","memo":"no","url":"https://cdn.gradfast.com/COS110/COS110%20-%202015%20-%20Exam%20Opportunity%202.pdf"},{"category":"Tutorials","version":"1","description":"Tutorial 1","year":"2015","memo":"no","url":"https://cdn.gradfast.com/COS110/COS110%20-%20Tutorial%201%20-%202015.pdf"},{"category":"Tutorials","version":"1","description":"Tutorial 2","year":"2015","memo":"no","url":"https://cdn.gradfast.com/COS110/COS110%20-%20Tutorial%202%20-%202015.pdf"},{"category":"Tutorials","version":"1","description":"Tutorial 3","year":"2015","memo":"no","url":"https://cdn.gradfast.com/COS110/COS110%20-%20Tutorial%203%20-%202015.pdf"},{"category":"Tutorials","version":"1","description":"Tutorial 4","year":"2015","memo":"no","url":"https://cdn.gradfast.com/COS110/COS110%20-%20Tutorial%204%20-%202015.pdf"},{"category":"Tutorials","version":"1","description":"Tutorial 5","year":"2015","memo":"no","url":"https://cdn.gradfast.com/COS110/COS110%20-%20Tutorial%205%20-%202015.pdf"},{"category":"Tutorials","version":"1","description":"Tutorial 6","year":"2015","memo":"no","url":"https://cdn.gradfast.com/COS110/COS110%20-%20Tutorial%206%20-%202015.pdf"},{"category":"Exam Opportunities","version":"1","description":"Exam Opportunity 3","year":"2003","memo":"no","url":"https://cdn.gradfast.com/COS110/cos110_exam_2003_june.pdf"},{"category":"Exam Opportunities","version":"1","description":"Supplementary Exam","year":"2001","memo":"no","url":"https://cdn.gradfast.com/COS110/cos110_Sup_2001_june.pdf"}]
    //         return data as PastPaper[];
    //     },
    //     enabled: !!currentModuleCode,
    //     staleTime: 1000 * 60 * 55, // 55 minutes
    //     gcTime: 1000 * 60 * 60 * 24, // 24 hours
    //     initialData: () => {
    //         if (!currentModuleCode) return [];
    //         return cachedPastPapers[currentModuleCode] || [];
    //     },
    // });

	// React Query manages the mutation/network lifecycle
	// const loginMutation = useMutation({
	// 	mutationFn: async (credentials: Record<string, string>) => {
	// 		const response = await axios.post("/api/auth/login", credentials);
	// 		return response.data; // Expecting { cookies: "..." }
	// 	},
	// 	onSuccess: (data) => {
	// 		// Store token synchronously in Context state
	// 		setCookies(data.cookies);
	// 	},
	// });

	// const logout = () => {
	// 	setCookies(null);
	// 	queryClient.clear(); // Wipe the React Query cache on logout
	// };

	return (
		<CookieContext.Provider
			value={{ cookies, 
                // modulesQuery, currentModuleCode, setCurrentModuleCode, moduleInfoQuery, modulePastPapersQuery
                apiFetch,
                proxyFetch,
                handleDownload
                }}
		>
			{children}
		</CookieContext.Provider>
	);
}
export const useCookies = () => {
	const context = useContext(CookieContext);
	if (context === undefined) {
		throw new Error("useCookies must be used within an CookieProvider");
	}
	return context;
};
