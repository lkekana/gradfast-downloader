import { moduleInfos, pastPapers } from "@/lib/data";
import { ModuleInfo, PastPaper } from "./types";

export const getDownloadPath = async (): Promise<string> => {
	// Simulate an API call to get the download path
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve("/downloads/past-papers/");
		}, 1000);
	});
};

export const downloadPath: string = "/downloads/past-papers/";

export const getModulePastPapers = async (moduleCode: {
	prefix: string;
	number: number;
}): Promise<PastPaper[]> => {
	// Simulate an API call to fetch past papers for a module
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(pastPapers);
		}, 1500);
	});
};

export const getModuleInfo = async (moduleCode: {
	prefix: string;
	number: number;
}): Promise<ModuleInfo> => {
	// Simulate an API call to fetch module information
	return new Promise((resolve) => {
		setTimeout(() => {
			const randomIndex = Math.floor(Math.random() * moduleInfos.length);
			resolve(moduleInfos[randomIndex]);
		}, 1200);
	});
};

export const getPastPaperCounts = (
	pastPapers: PastPaper[],
): {
	exams: number;
	semesterTests: number;
	classTests: number;
	practicals: number;
	tutorials: number;
} => {
	// Simulate an API call to count past papers by category
	return {
		exams: pastPapers.filter((p) => p.category === "Exams").length,
		semesterTests: pastPapers.filter((p) => p.category === "Semester Tests")
			.length,
		classTests: pastPapers.filter((p) => p.category === "Class Tests").length,
		practicals: Math.floor(Math.random() * 10),
		tutorials: Math.floor(Math.random() * 10),
	};
};
