import { createServerFn } from "@tanstack/react-start";
import {
	cachedPastPapers,
	cachedModules,
	cachedModuleInfo,
} from "./data.server";

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

		return {
			module,
			moduleInfo: info,
			pastPapers: papers.map((p) => ({ ...p, url: decodeURIComponent(p.url) })),
		};
	});

export const getServerModulesList = createServerFn({ method: "GET" }).handler(
	async () => {
		return cachedModules;
	},
);

export const getModule = createServerFn({ method: "GET" })
	.validator((data: { prefix: string; number: number }) => data)
	.handler(async ({ data }: { data: { prefix: string; number: number } }) => {
		return cachedModules.find(
			(m) => m.code.prefix === data.prefix && m.code.number === data.number,
		);
	});

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
		return (
			cachedModules.find(
				(m) => m.code.prefix === data.prefix && m.code.number === data.number,
			)?.faculty || "Unknown"
		);
	});
