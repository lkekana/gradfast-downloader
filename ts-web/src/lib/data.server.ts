import catalog from "../assets/catalog.json";
import moduleInfo from "../assets/module_info.json";
import titleCase from "voca/title_case";

const retiredModules: ModuleInfo[] = [
	{
		code: {
			prefix: "GLY",
			number: 162,
		},
		name: "Environmental and hazard geology",
		credits: 8,
		associatedProgrammes: [],
		qualification: "Undergraduate",
		faculty: "Faculty of Natural and Agricultural Sciences",
		content: "Note: This module is no longer offered.",
		nqfLevel: 0,
		prerequisites: [],
		contactTime: "N/A",
		language: "N/A",
		period: "Quarter 3",
	},
	{
		code: {
			prefix: "GLY",
			number: 161,
		},
		name: "Historical geology",
		credits: 8,
		associatedProgrammes: [],
		qualification: "Undergraduate",
		faculty: "Faculty of Natural and Agricultural Sciences",
		content: "Note: This module is no longer offered.",
		nqfLevel: 0,
		prerequisites: [],
		contactTime: "N/A",
		language: "N/A",
		period: "Quarter 4",
	},
	{
		code: {
			prefix: "WTW",
			number: 126,
		},
		name: "Linear algebra",
		credits: 8,
		associatedProgrammes: [],
		qualification: "Undergraduate",
		faculty: "Faculty of Natural and Agricultural Sciences",
		content: "Note: This module is no longer offered.",
		nqfLevel: 0,
		prerequisites: [],
		contactTime: "N/A",
		language: "N/A",
		period: "Semester 2",
	},
	{
		code: {
			prefix: "WTW",
			number: 128,
		},
		name: "Calculus",
		credits: 8,
		associatedProgrammes: [],
		qualification: "Undergraduate",
		faculty: "Faculty of Natural and Agricultural Sciences",
		content: "Note: This module is no longer offered.",
		nqfLevel: 0,
		prerequisites: [],
		contactTime: "N/A",
		language: "N/A",
		period: "Semester 2",
	},
];

import type { Module, ModuleInfo, PastPaper } from "./types";
import { getPastPaperCounts } from "./data";

export const cachedPastPapers = catalog as unknown as Record<
	string,
	PastPaper[]
>;
const someCachedModules: ModuleInfo[] = moduleInfo as unknown as ModuleInfo[];
export const cachedModuleInfo: ModuleInfo[] = [
	...someCachedModules,
	...retiredModules,
].map((module) => ({
	...module,
	name: titleCase(module.name),
}));

export const cachedModules: Module[] = cachedModuleInfo.map((module) => {
	const fullCode = `${module.code.prefix}${module.code.number}`;
  	const papers = cachedPastPapers[fullCode] || [];

	return {
		code: module.code,
		name: module.name,
		faculty: module.faculty,
		period: module.period,
		cachedPastPaperCounts: getPastPaperCounts(papers),
	};
});
console.log("cachedModules", cachedModules);