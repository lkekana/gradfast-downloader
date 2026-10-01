import { cachedModuleInfo } from "@/lib/data";
import type { ModuleInfo, PastPaper } from "./types";

export const getDownloadPath = async (): Promise<string> => {
	// Simulate an API call to get the download path
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve("/downloads/past-papers/");
		}, 1000);
	});
};

export const downloadPath: string = "/downloads/past-papers/";

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
		exams: pastPapers.filter((p) => p.category === "Exams" || p.category === "Exam" || p.category === "Exam Opportunities").length,
		semesterTests: pastPapers.filter((p) => p.category === "Semester Tests" || p.category === "Semester Test")
			.length,
		classTests: pastPapers.filter((p) => p.category === "Class Tests").length,
		practicals: pastPapers.filter((p) => p.category === "Practical Tests").length,
		tutorials: pastPapers.filter((p) => p.category === "Tutorials" || p.category === "Tutorial Tests").length,
		other: pastPapers.filter((p) => !["Exams", "Exam", "Semester Tests", "Exam Opportunities", "Semester Test", "Class Tests", "Tutorials", "Tutorial Tests", "Practical Tests"].includes(p.category)).length,
	};
};
