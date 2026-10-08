import type { ModuleInfo, PastPaper } from "./types";
import catalog from "../assets/catalog.json";
import moduleInfo from "../assets/module_info.json";

export const facultyAbbreviation = (faculty: string | undefined) => {
	if (faculty === undefined) return "GEN";
	faculty = faculty.trim().toLowerCase();
	if (
		faculty === "faculty of economic and management sciences" ||
		faculty.includes("economic") ||
		faculty.includes("management")
	)
		return "EMS";
	if (
		faculty === "gordon institute of business science" ||
		faculty.includes("gibs") ||
		faculty.includes("business") ||
		faculty.includes("gordon")
	)
		return "GIBS";
	if (faculty === "faculty of health sciences" || faculty.includes("health"))
		return "HS";
	if (faculty === "faculty of education" || faculty.includes("education"))
		return "EDU";
	if (faculty === "faculty of humanities" || faculty.includes("humanities"))
		return "HUM";
	if (faculty === "faculty of law" || faculty.includes("law")) return "LAW";
	if (
		faculty === "faculty of veterinary science" ||
		faculty.includes("veterinary") ||
		faculty.includes("vet")
	)
		return "VET";
	if (
		faculty === "faculty of theology and religion" ||
		faculty.includes("theology") ||
		faculty.includes("religion")
	)
		return "THE";
	if (
		faculty === "faculty of natural and agricultural sciences" ||
		faculty.includes("natural") ||
		faculty.includes("agricultural")
	)
		return "NAS";
	if (
		faculty ===
			"faculty of engineering, built environment and information technology" ||
		faculty.includes("engineering") ||
		faculty.includes("built") ||
		faculty.includes("environment") ||
		faculty.includes("information") ||
		faculty.includes("technology")
	)
		return "EBIT";
	return "GEN";
};

export const periodAbbreviation = (period: string | undefined) => {
	if (period === undefined) return "GEN";
	period = period.trim().toLowerCase();
	if (period === "semester 1") return "S1";
	if (period === "semester 2") return "S2";
	if (period === "year") return "Y";
	if (period === "quarter 1") return "Q1";
	if (period === "quarter 2") return "Q2";
	if (period === "quarter 3") return "Q3";
	if (period === "quarter 4") return "Q4";
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
	},
];

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

export const getPastPaperCounts = (
	pastPapers: PastPaper[],
): {
	exams: number;
	semesterTests: number;
	classTests: number;
	practicals: number;
	tutorials: number;
	other: number;
} => {
	return {
		exams: pastPapers.filter(
			(p) =>
				p.category === "Exams" ||
				p.category === "Exam" ||
				p.category === "Exam Opportunities",
		).length,
		semesterTests: pastPapers.filter(
			(p) => p.category === "Semester Tests" || p.category === "Semester Test",
		).length,
		classTests: pastPapers.filter((p) => p.category === "Class Tests").length,
		practicals: pastPapers.filter((p) => p.category === "Practical Tests")
			.length,
		tutorials: pastPapers.filter(
			(p) => p.category === "Tutorials" || p.category === "Tutorial Tests",
		).length,
		other: pastPapers.filter(
			(p) =>
				![
					"Exams",
					"Exam",
					"Semester Tests",
					"Exam Opportunities",
					"Semester Test",
					"Class Tests",
					"Tutorials",
					"Tutorial Tests",
					"Practical Tests",
				].includes(p.category),
		).length,
	};
};

export const cachedPastPapers = catalog as unknown as Record<
	string,
	PastPaper[]
>;
const someCachedModules: ModuleInfo[] = moduleInfo as unknown as ModuleInfo[];
export const cachedModuleInfo = [...someCachedModules, ...retiredModules].map(
	(module) => ({
		...module,
		name: titleCase(module.name),
	}),
);
export const cachedModules = cachedModuleInfo.map((module) => ({
	code: module.code,
	name: module.name,
	faculty: module.faculty,
	period: module.period,
}));

export const getModuleInfo = (moduleCode: {
	prefix: string;
	number: number;
}): ModuleInfo | undefined => {
	const module = cachedModuleInfo.find(
		(m) =>
			m.code.prefix.toLowerCase() === moduleCode.prefix.toLowerCase() &&
			m.code.number === moduleCode.number,
	);
	return module;
};
