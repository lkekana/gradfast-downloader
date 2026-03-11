export interface PastPaper {
	category: "Exams" | "Semester Tests" | "Class Tests";
	version: string; // API returns as string, e.g., "1"
	description: string;
	year: string; // API returns as string, e.g., "2005"
	memo: "yes" | "no";
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
