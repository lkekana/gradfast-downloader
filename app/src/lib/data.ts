import type { Module, ModuleInfo, PastPaper } from "./types";
import catalog from "../assets/catalog.json";
import moduleInfo from "../assets/module_info.json";

export const facultyAbbreviation = (faculty: string | undefined) => {
	if (faculty === undefined) return "GEN";
	if (faculty === "Faculty of Economic and Management Sciences") return "EMS";
	if (faculty === "Gordon Institute of Business Science") return "GIBS";
	if (faculty === "Faculty of Health Sciences") return "HS";
	if (faculty === "Faculty of Education") return "EDU";
	if (faculty === "Faculty of Humanities") return "HUM";
	if (faculty === "Faculty of Law") return "LAW";
	if (faculty === "Faculty of Veterinary Science") return "VET";
	if (faculty === "Faculty of Theology and Religion") return "THE";
	if (faculty === "Faculty of Natural and Agricultural Sciences") return "NAS";
	if (
		faculty ===
		"Faculty of Engineering, Built Environment and Information Technology"
	)
		return "EBIT";
	return "GEN";
};

export const periodAbbreviation = (period: string | undefined) => {
	if (period === undefined) return "GEN";
	if (period === "Semester 1") return "S1";
	if (period === "Semester 2") return "S2";
	if (period === "Year") return "Y";
	if (period === "Quarter 1") return "Q1";
	if (period === "Quarter 2") return "Q2";
	if (period === "Quarter 3") return "Q3";
	if (period === "Quarter 4") return "Q4";
	return "GEN";
};

export const periods = [
	"Semester 1",
	"Semester 2",
	"Year",
	"Quarter 1",
	"Quarter 2",
	"Quarter 3",
	"Quarter 4",
];

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
	}];

export type APIModuleInfo = {
	code: {
		prefix: string;
		number: number;
	};
	name: string;
	credits: string;
	period: string;
	prerequisites: string[];
};

const titleCase = (str: string) => {
	// title case for all words except for 'and', 'in', 'to'
	return str
		.split(" ")
		.map((word) => {
			if (["and", "in", "to"].includes(word.toLowerCase())) {
				return word.toLowerCase();
			}
			return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
		})
		.join(" ");
};

export const cachedPastPapers = catalog as unknown as Record<string, PastPaper[]>;
const someCachedModules: ModuleInfo[] = (moduleInfo as unknown as ModuleInfo[]);
export const cachedModuleInfo = [...someCachedModules, ...retiredModules].map((module) => ({
	...module,
	name: titleCase(module.name),
}));
export const cachedModules = cachedModuleInfo.map((module) => ({
	code: module.code,
	name: module.name,
	faculty: module.faculty,
	period: module.period,
}));