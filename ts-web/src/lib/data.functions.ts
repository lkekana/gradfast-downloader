import { createServerFn } from "@tanstack/react-start";
import {
	cachedPastPapers,
	cachedModules,
	cachedModuleInfo,
} from "@/lib/data.server";
import { setResponseHeaders } from '@tanstack/react-start/server'

const cache24h = new Headers({
	"Cache-Control": "public, max-age=86400, immutable",
});

export const getServerModuleData = createServerFn({ method: "GET" })
	.validator((data: { prefix: string; number: number }) => data)
	.handler(async ({ data }) => {
		const { prefix, number } = data;
		const fullCode = `${prefix}${number}`;

		const module = cachedModules.find(
			(m) => m.code.prefix === prefix && m.code.number === number,
		);
		const papers = cachedPastPapers[fullCode] || [];
		const info = cachedModuleInfo.find(
			(m) => m.code.prefix === prefix && m.code.number === number,
		);

		if (!module || !info) throw new Error("Module not found");

		setResponseHeaders(
			cache24h
		  )
		return {
			module,
			moduleInfo: info,
			pastPapers: papers.map((p) => ({ ...p, url: decodeURIComponent(p.url) })),
		};
	});

export const getServerModulesList = createServerFn({ method: "GET" })
.handler(
	async () => {
		setResponseHeaders(
			cache24h
		  )
		return cachedModules;
	},
);

export const getRandomModule = createServerFn({ method: "GET" }).handler(
	async () => {
		const randomModule =
			cachedModules[Math.floor(Math.random() * cachedModules.length)];
		return randomModule;
	},
);

export const getModuleFaculty = createServerFn({ method: "GET" })
	.validator((data: { prefix: string; number: number }) => data)
	.handler(async ({ data }: { data: { prefix: string; number: number } }) => {
		setResponseHeaders(
			cache24h
		  )
		return (
			cachedModules.find(
				(m) => m.code.prefix === data.prefix && m.code.number === data.number,
			)?.faculty || "Unknown"
		);
	});
