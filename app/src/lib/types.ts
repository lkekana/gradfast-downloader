export type PaperCategory =
	| "Exams"
	| "Exam"
	| "Semester Tests"
	| "Semester Test"
	| "Class Tests"
	| "Tutorials"
	| "Tutorial Tests"
	| "Clicker Tests"
	| "Assignments"
	| "Practical Tests"
	| "Exam Opportunities"
	| "Sample Questions";

export type MemoStatus = "yes" | "no" | "partial";

export interface PastPaper {
	category: PaperCategory;
	version: string; // API returns as string, e.g., "1", "2", "A", "B"
	description: string;
	year: string; // API returns as string, e.g., "2005", "0", "00"
	memo: MemoStatus;
	url: string;
}

export interface Category {
	name: string;
	description: string;
}

export interface Module {
	code: {
		prefix: string;
		number: number;
	};
	name: string;
	faculty: string;
	period: string;
}

export interface ModuleInfo {
	code: {
		prefix: string;
		number: number;
	};
	name: string;
	credits: number;
	associatedProgrammes: {
		programmeName: string;
		programmeCode: string;
		curriculumName: string;
	}[];
	qualification: "UPOnline" | "Postgraduate" | "Undergraduate";
	faculty: string;
	content: string;
	nqfLevel: number;
	prerequisites: Array<string> | string;
	contactTime: string;
	language: string;
	period: string;
}

export type GradfastModules = {
	prefix: string;
	code: number;
	name: string;
}[];

export type GradfastModuleInfo = {
	code: {
		prefix: string;
		number: number;
	};
	name: string;
	credits: string;
	period: string;
	prerequisites: string[];
};
