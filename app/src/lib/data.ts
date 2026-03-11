import type { Module, ModuleInfo, PastPaper } from "./types";

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

export const modules: Module[] = [
	{
		code: {
			prefix: "STK",
			number: 110,
		},
		name: "Statistics",
		faculty: "Faculty of Economic and Management Sciences",
		period: periods[Math.floor(Math.random() * periods.length)],
	},
	{
		code: {
			prefix: "NMC",
			number: 123,
		},
		name: "Materials science",
		faculty:
			"Faculty of Engineering, Built Environment and Information Technology",
		period: periods[Math.floor(Math.random() * periods.length)],
	},
	{
		code: {
			prefix: "COS",
			number: 151,
		},
		name: "Introduction to Computer Science",
		faculty:
			"Faculty of Engineering, Built Environment and Information Technology",
		period: periods[Math.floor(Math.random() * periods.length)],
	},
	{
		code: {
			prefix: "STK",
			number: 120,
		},
		name: "Statistics",
		faculty: "Faculty of Economic and Management Sciences",
		period: periods[Math.floor(Math.random() * periods.length)],
	},
	{
		code: {
			prefix: "CIR",
			number: 113,
		},
		name: "Chemical engineering",
		faculty:
			"Faculty of Engineering, Built Environment and Information Technology",
		period: periods[Math.floor(Math.random() * periods.length)],
	},
	{
		code: {
			prefix: "MBY",
			number: 161,
		},
		name: "Introduction to microbiology",
		faculty: "Faculty of Natural and Agricultural Sciences",
		period: periods[Math.floor(Math.random() * periods.length)],
	},
	{
		code: {
			prefix: "COS",
			number: 326,
		},
		name: "Database Systems",
		faculty:
			"Faculty of Engineering, Built Environment and Information Technology",
		period: periods[Math.floor(Math.random() * periods.length)],
	},
	{
		code: {
			prefix: "PHY",
			number: 124,
		},
		name: "First course in physics",
		faculty: "Faculty of Natural and Agricultural Sciences",
		period: periods[Math.floor(Math.random() * periods.length)],
	},
	{
		code: {
			prefix: "NMC",
			number: 113,
		},
		name: "Materials science",
		faculty:
			"Faculty of Engineering, Built Environment and Information Technology",
		period: periods[Math.floor(Math.random() * periods.length)],
	},
	{
		code: {
			prefix: "COS",
			number: 314,
		},
		name: "Artificial Intelligence",
		faculty:
			"Faculty of Engineering, Built Environment and Information Technology",
		period: periods[Math.floor(Math.random() * periods.length)],
	},
	{
		code: {
			prefix: "FSK",
			number: 116,
		},
		name: "Physics",
		faculty: "Faculty of Natural and Agricultural Sciences",
		period: periods[Math.floor(Math.random() * periods.length)],
	},
	{
		code: {
			prefix: "INF",
			number: 214,
		},
		name: "Informatics: Database Design",
		faculty:
			"Faculty of Engineering, Built Environment and Information Technology",
		period: periods[Math.floor(Math.random() * periods.length)],
	},
	{
		code: {
			prefix: "COS",
			number: 212,
		},
		name: "Data Structures and Algorithms",
		faculty:
			"Faculty of Engineering, Built Environment and Information Technology",
		period: periods[Math.floor(Math.random() * periods.length)],
	},
	{
		code: {
			prefix: "WTW",
			number: 114,
		},
		name: "Calculus",
		faculty: "Faculty of Natural and Agricultural Sciences",
		period: periods[Math.floor(Math.random() * periods.length)],
	},
	{
		code: {
			prefix: "COS",
			number: 332,
		},
		name: "Computer Networks",
		faculty:
			"Faculty of Engineering, Built Environment and Information Technology",
		period: periods[Math.floor(Math.random() * periods.length)],
	},
	{
		code: {
			prefix: "EBN",
			number: 122,
		},
		name: "Electricity and electronics",
		faculty:
			"Faculty of Engineering, Built Environment and Information Technology",
		period: periods[Math.floor(Math.random() * periods.length)],
	},
	{
		code: {
			prefix: "CHM",
			number: 171,
		},
		name: "General chemistry",
		faculty: "Faculty of Natural and Agricultural Sciences",
		period: periods[Math.floor(Math.random() * periods.length)],
	},
	{
		code: {
			prefix: "COS",
			number: 216,
		},
		name: "Netcentric Computer Systems",
		faculty:
			"Faculty of Engineering, Built Environment and Information Technology",
		period: periods[Math.floor(Math.random() * periods.length)],
	},
	{
		code: {
			prefix: "WTW",
			number: 161,
		},
		name: "Linear algebra",
		faculty: "Faculty of Natural and Agricultural Sciences",
		period: periods[Math.floor(Math.random() * periods.length)],
	},
	{
		code: {
			prefix: "GLY",
			number: 162,
		},
		name: "Environmental and hazard geology",
		faculty: "Faculty of Natural and Agricultural Sciences",
		period: periods[Math.floor(Math.random() * periods.length)],
	},
	{
		code: {
			prefix: "COS",
			number: 222,
		},
		name: "Operating Systems",
		faculty:
			"Faculty of Engineering, Built Environment and Information Technology",
		period: periods[Math.floor(Math.random() * periods.length)],
	},
	{
		code: {
			prefix: "COS",
			number: 344,
		},
		name: "Computer Graphics",
		faculty:
			"Faculty of Engineering, Built Environment and Information Technology",
		period: periods[Math.floor(Math.random() * periods.length)],
	},
	{
		code: {
			prefix: "JPO",
			number: 122,
		},
		name: "Additional Physics",
		faculty: "Faculty of Natural and Agricultural Sciences",
		period: periods[Math.floor(Math.random() * periods.length)],
	},
	{
		code: {
			prefix: "SWK",
			number: 122,
		},
		name: "Mechanics",
		faculty:
			"Faculty of Engineering, Built Environment and Information Technology",
		period: periods[Math.floor(Math.random() * periods.length)],
	},
	{
		code: {
			prefix: "COS",
			number: 301,
		},
		name: "Software engineering",
		faculty:
			"Faculty of Engineering, Built Environment and Information Technology",
		period: periods[Math.floor(Math.random() * periods.length)],
	},
	{
		code: {
			prefix: "COS",
			number: 284,
		},
		name: "Computer Organisation and Architecture",
		faculty:
			"Faculty of Engineering, Built Environment and Information Technology",
		period: periods[Math.floor(Math.random() * periods.length)],
	},
	{
		code: {
			prefix: "CMY",
			number: 127,
		},
		name: "General chemistry",
		faculty: "Faculty of Natural and Agricultural Sciences",
		period: periods[Math.floor(Math.random() * periods.length)],
	},
	{
		code: {
			prefix: "WTW",
			number: 134,
		},
		name: "Mathematics",
		faculty: "Faculty of Natural and Agricultural Sciences",
		period: periods[Math.floor(Math.random() * periods.length)],
	},
	{
		code: {
			prefix: "WTW",
			number: 126,
		},
		name: "Linear algebra",
		faculty: "Faculty of Natural and Agricultural Sciences",
		period: periods[Math.floor(Math.random() * periods.length)],
	},
	{
		code: {
			prefix: "CHM",
			number: 172,
		},
		name: "General chemistry",
		faculty: "Faculty of Natural and Agricultural Sciences",
		period: periods[Math.floor(Math.random() * periods.length)],
	},
	{
		code: {
			prefix: "WTW",
			number: 285,
		},
		name: "Discrete Structures",
		faculty: "Faculty of Natural and Agricultural Sciences",
		period: periods[Math.floor(Math.random() * periods.length)],
	},
	{
		code: {
			prefix: "WTW",
			number: 128,
		},
		name: "Calculus",
		faculty: "Faculty of Natural and Agricultural Sciences",
		period: periods[Math.floor(Math.random() * periods.length)],
	},
	{
		code: {
			prefix: "COS",
			number: 226,
		},
		name: "Concurrent Systems",
		faculty:
			"Faculty of Engineering, Built Environment and Information Technology",
		period: periods[Math.floor(Math.random() * periods.length)],
	},
	{
		code: {
			prefix: "WST",
			number: 111,
		},
		name: "Mathematical statistics",
		faculty: "Faculty of Natural and Agricultural Sciences",
		period: periods[Math.floor(Math.random() * periods.length)],
	},
	{
		code: {
			prefix: "JPO",
			number: 152,
		},
		name: "Additional Physics",
		faculty: "Faculty of Natural and Agricultural Sciences",
		period: periods[Math.floor(Math.random() * periods.length)],
	},
	{
		code: {
			prefix: "WTW",
			number: 158,
		},
		name: "Calculus",
		faculty: "Faculty of Natural and Agricultural Sciences",
		period: periods[Math.floor(Math.random() * periods.length)],
	},
	{
		code: {
			prefix: "COS",
			number: 330,
		},
		name: "Computer security and ethics",
		faculty:
			"Faculty of Engineering, Built Environment and Information Technology",
		period: periods[Math.floor(Math.random() * periods.length)],
	},
	{
		code: {
			prefix: "EBN",
			number: 111,
		},
		name: "Electricity and electronics",
		faculty:
			"Faculty of Engineering, Built Environment and Information Technology",
		period: periods[Math.floor(Math.random() * periods.length)],
	},
	{
		code: {
			prefix: "COS",
			number: 333,
		},
		name: "Programming Languages",
		faculty:
			"Faculty of Engineering, Built Environment and Information Technology",
		period: periods[Math.floor(Math.random() * periods.length)],
	},
	{
		code: {
			prefix: "IMY",
			number: 310,
		},
		name: "Human-Computer Interaction",
		faculty:
			"Faculty of Engineering, Built Environment and Information Technology",
		period: periods[Math.floor(Math.random() * periods.length)],
	},
	{
		code: {
			prefix: "COS",
			number: 132,
		},
		name: "Imperative Programming",
		faculty:
			"Faculty of Engineering, Built Environment and Information Technology",
		period: periods[Math.floor(Math.random() * periods.length)],
	},
	{
		code: {
			prefix: "COS",
			number: 121,
		},
		name: "Software Modelling",
		faculty:
			"Faculty of Engineering, Built Environment and Information Technology",
		period: periods[Math.floor(Math.random() * periods.length)],
	},
	{
		code: {
			prefix: "MGC",
			number: 110,
		},
		name: "Graphical communication",
		faculty:
			"Faculty of Engineering, Built Environment and Information Technology",
		period: periods[Math.floor(Math.random() * periods.length)],
	},
	{
		code: {
			prefix: "BES",
			number: 220,
		},
		name: "Engineering statistics",
		faculty:
			"Faculty of Engineering, Built Environment and Information Technology",
		period: periods[Math.floor(Math.random() * periods.length)],
	},
	{
		code: {
			prefix: "WTW",
			number: 148,
		},
		name: "Calculus",
		faculty: "Faculty of Natural and Agricultural Sciences",
		period: periods[Math.floor(Math.random() * periods.length)],
	},
	{
		code: {
			prefix: "WTW",
			number: 124,
		},
		name: "Mathematics",
		faculty: "Faculty of Natural and Agricultural Sciences",
		period: periods[Math.floor(Math.random() * periods.length)],
	},
	{
		code: {
			prefix: "SLK",
			number: 120,
		},
		name: "Psychology",
		faculty: "Faculty of Humanities",
		period: periods[Math.floor(Math.random() * periods.length)],
	},
	{
		code: {
			prefix: "CHM",
			number: 181,
		},
		name: "General chemistry",
		faculty: "Faculty of Natural and Agricultural Sciences",
		period: periods[Math.floor(Math.random() * periods.length)],
	},
	{
		code: {
			prefix: "BME",
			number: 120,
		},
		name: "Biometry",
		faculty: "Faculty of Natural and Agricultural Sciences",
		period: periods[Math.floor(Math.random() * periods.length)],
	},
	{
		code: {
			prefix: "CIR",
			number: 123,
		},
		name: "Chemical engineering",
		faculty:
			"Faculty of Engineering, Built Environment and Information Technology",
		period: periods[Math.floor(Math.random() * periods.length)],
	},
	{
		code: {
			prefix: "WTW",
			number: 164,
		},
		name: "Mathematics",
		faculty: "Faculty of Natural and Agricultural Sciences",
		period: periods[Math.floor(Math.random() * periods.length)],
	},
	{
		code: {
			prefix: "WTW",
			number: 152,
		},
		name: "Mathematical modelling",
		faculty: "Faculty of Natural and Agricultural Sciences",
		period: periods[Math.floor(Math.random() * periods.length)],
	},
	{
		code: {
			prefix: "COS",
			number: 110,
		},
		name: "Program Design: Introduction",
		faculty:
			"Faculty of Engineering, Built Environment and Information Technology",
		period: periods[Math.floor(Math.random() * periods.length)],
	},
	{
		code: {
			prefix: "BOT",
			number: 161,
		},
		name: "Plant Biology",
		faculty: "Faculty of Natural and Agricultural Sciences",
		period: periods[Math.floor(Math.random() * periods.length)],
	},
	{
		code: {
			prefix: "FSK",
			number: 176,
		},
		name: "Physics",
		faculty: "Faculty of Natural and Agricultural Sciences",
		period: periods[Math.floor(Math.random() * periods.length)],
	},
	{
		code: {
			prefix: "GLY",
			number: 161,
		},
		name: "Historical geology",
		faculty: "Faculty of Natural and Agricultural Sciences",
		period: periods[Math.floor(Math.random() * periods.length)],
	},
	{
		code: {
			prefix: "WTW",
			number: 168,
		},
		name: "Calculus",
		faculty: "Faculty of Natural and Agricultural Sciences",
		period: periods[Math.floor(Math.random() * periods.length)],
	},
	{
		code: {
			prefix: "WTW",
			number: 146,
		},
		name: "Linear algebra",
		faculty: "Faculty of Natural and Agricultural Sciences",
		period: periods[Math.floor(Math.random() * periods.length)],
	},
	{
		code: {
			prefix: "INF",
			number: 261,
		},
		name: "Informatics",
		faculty:
			"Faculty of Engineering, Built Environment and Information Technology",
		period: periods[Math.floor(Math.random() * periods.length)],
	},
	{
		code: {
			prefix: "WTW",
			number: 115,
		},
		name: "Discrete structures",
		faculty: "Faculty of Natural and Agricultural Sciences",
		period: periods[Math.floor(Math.random() * periods.length)],
	},
];

export const moduleInfos: ModuleInfo[] = [
	{
		// code: "BES 220",
		code: {
			prefix: "BES",
			number: 220,
		},
		name: "Engineering statistics",
		credits: 16,
		associatedProgrammes: [
			{
				programmeName: "BSc Engineering",
				curriculumName: "BSc Engineering 2022",
			},
			{
				programmeName: "BEng",
				curriculumName: "BEng 2022",
			},
		],
		qualification: "Undergraduate",
		faculty:
			"Faculty of Engineering, Built Environment and Information Technology",
		content:
			"Engineering systems are often subjected to variation, uncertainty and incomplete information. Mathematical statistics provides the basis for effectively handling and quantifying the effect of these factors. This module provides an introduction to the concepts of mathematical statistics and will include the following syllabus themes: data analysis, probability theory, stochastic modelling, statistical inference and  regression analysis.",
		nqfLevel: 6,
		prerequisites: ["WTW 158 GS", "WTW 164 GS"],
		contactTime: "3 lectures per week",
		language: "Module is presented in English",
		period: "Semester 2",
	},
	{
		// code: "CMY 719",
		code: {
			prefix: "CMY",
			number: 719,
		},
		name: "Advanced chemistry",
		credits: 16,
		associatedProgrammes: [
			{
				programmeName: "MSc Chemistry",
				curriculumName: "MSc Chemistry 2023",
			},
		],
		qualification: "Postgraduate",
		faculty: "Faculty of Natural and Agricultural Sciences",
		content:
			"Students work on one project during the year which has a significant component that can be described as instrumental or computational or analysis of data or theoretical. A report and a presentation are required.",
		nqfLevel: 8,
		prerequisites: "No prerequisites.",
		contactTime: "6 practicals per week for 9 weeks, 1 seminar",
		language: "Module is presented in English",
		period: "Semester 1 and Semester 2",
	},
	{
		// code: "SPN 102",
		code: {
			prefix: "SPN",
			number: 102,
		},
		name: "Spanish 2",
		credits: 16,
		associatedProgrammes: [
			{
				programmeName: "BA Languages",
				curriculumName: "BA Languages 2023",
			},
			{
				programmeName: "BA Humanities",
				curriculumName: "BA Humanities 2023",
			},
		],
		qualification: "Undergraduate",
		faculty: "Faculty of Humanities",
		content:
			'Please note: Students with an advanced knowledge of Spanish (e.g. levels B1, B2 or higher) are not allowed to register for this module.An intensive introductory study of the Spanish language focusing on the acquisition of basic communication skills, namely listening, reading, speaking and writing. It also offers a brief introduction to the culture of Spanish-speaking countries. This module complies with the requirements for level A2 set by the "Common European Framework for Reference for Languages."The module is presented in English at the beginning, but it gradually shifts into Spanish.',
		nqfLevel: 5,
		prerequisites: ["SPN 101"],
		contactTime: "1 lecture per week, 4 discussion classes per week",
		language: "Module is presented in Spanish",
		period: "Semester 2",
	},
	{
		// code: "MSF 780",
		code: {
			prefix: "MSF",
			number: 780,
		},
		name: "Fracture mechanics",
		credits: 16,
		associatedProgrammes: [
			{
				programmeName: "MSc Mechanical Engineering",
				curriculumName: "MSc Mechanical Engineering 2023",
			},
			{
				programmeName: "MSc Civil Engineering",
				curriculumName: "MSc Civil Engineering 2023",
			},
		],
		qualification: "Postgraduate",
		faculty:
			"Faculty of Engineering, Built Environment and Information Technology",
		content:
			"Historical development; Linear Elastic Fracture Mechanics (LEFM): Stress concentrations and singularities, stress intensity factor, stability of crack propagation; Elasto-plastic fracture mechanics: crack tip plasticity, small scale yielding, measurement of Kic, J-integral; Fatigue crack growth: Paris Law; life prediction; combined mode fracture, strain energy density methods.",
		nqfLevel: 8,
		prerequisites: "No prerequisites.",
		contactTime: "21 contact hours per semester",
		language: "Module is presented in English",
		period: "Semester 2",
	},
	{
		// code: "INF 315",
		code: {
			prefix: "INF",
			number: 315,
		},
		name: "Information systems in business",
		credits: 16,
		associatedProgrammes: [
			{
				programmeName: "BCom Informatics",
				curriculumName: "BCom Informatics 2023",
			},
			{
				programmeName: "BSc Computer Science",
				curriculumName: "BSc Computer Science 2023",
			},
		],
		qualification: "Undergraduate",
		faculty: "Faculty of Economic and Management Sciences",
		content:
			"A review of current trends which are relevant to the application of information systems within a business environment.",
		nqfLevel: 7,
		prerequisites: ["INF 261 GS", "INF 225 GS", "INF 271 GS"],
		contactTime: "2 lectures per week",
		language: "Module is presented in English",
		period: "Semester 1",
	},
	{
		// code: "GEN 893",
		code: {
			prefix: "GEN",
			number: 893,
		},
		name: "Research project",
		credits: 16,
		associatedProgrammes: [
			{
				programmeName: "MSc Research Psychology",
				curriculumName: "MSc Research Psychology 2023",
			},
		],
		qualification: "Postgraduate",
		faculty: "Faculty of Veterinary Science",
		content: "",
		nqfLevel: 9,
		prerequisites: ["VRM 813"],
		contactTime: "",
		language: "Module is presented in English",
		period: "Year",
	},
	{
		// code: "VES 310",
		code: {
			prefix: "VES",
			number: 310,
		},
		name: "English teaching",
		credits: 16,
		associatedProgrammes: [
			{
				programmeName: "BEd Foundation Phase Teaching",
				curriculumName: "BEd Foundation Phase Teaching 2023",
			},
			{
				programmeName: "BEd Intermediate Phase Teaching",
				curriculumName: "BEd Intermediate Phase Teaching 2023",
			},
			{
				programmeName:
					"BEd Senior Phase and Further Education and Training Teaching",
				curriculumName:
					"BEd Senior Phase and Further Education and Training Teaching 2023",
			},
		],
		qualification: "Undergraduate",
		faculty: "Faculty of Education",
		content:
			"English teaching is a unique specialisation that offers the specific language at either home language, first additional language or second additional language entails a thorough overview of the learning content with specific focus on practical application as prescribed by the CAPS and the National Curriculum Statement documents. Student-teachers must develop sound teaching practice skills (microteaching), curriculum differentiation, content and teaching plans (CAPS) and appropriate informal, formal assessment of content as well as recording, reporting and moderation of assessment.",
		nqfLevel: 7,
		prerequisites: "No prerequisites.",
		contactTime: "60 lectures per year, 12 tutorials per year",
		language: "Module is presented in English",
		period: "Year",
	},
];

export const pastPapers: PastPaper[] = [
	{
		category: "Exams",
		version: "1",
		description: "Antisemester Exam",
		year: "2002",
		memo: "yes",
		url: "https://cdn.gradfast.com/BES220/bes210_Exam_2002_June%20MEMO%20-%201475871024373.pdf",
	},
	{
		category: "Exams",
		version: "1",
		description: "Antisemester Exam",
		year: "2003",
		memo: "no",
		url: "https://cdn.gradfast.com/BES220/bes210_Exam_2003_June%20-%201475871048231.pdf",
	},
	{
		category: "Exams",
		version: "1",
		description: "Antisemester Exam",
		year: "2004",
		memo: "yes",
		url: "https://cdn.gradfast.com/BES220/bes210_Exam_2004_June%20MEMO%20-%201475871066826.pdf",
	},
	{
		category: "Exams",
		version: "1",
		description: "Supplementary Exam",
		year: "2004",
		memo: "yes",
		url: "https://cdn.gradfast.com/BES220/bes210_Exam_2004_SUP%20MEMO%20-%201475871090209.pdf",
	},
	{
		category: "Exams",
		version: "1",
		description: "Antisemester Exam",
		year: "2005",
		memo: "no",
		url: "https://cdn.gradfast.com/BES220/bes210_Exam_2005_June%20-%201475871108261.pdf",
	},
	{
		category: "Exams",
		version: "1",
		description: "Antisemester Exam",
		year: "2007",
		memo: "yes",
		url: "https://cdn.gradfast.com/BES220/bes210_Exam_2007_June%20MEMO%20-%201475871120845.pdf",
	},
	{
		category: "Exams",
		version: "1",
		description: "Supplementary Exam",
		year: "2007",
		memo: "yes",
		url: "https://cdn.gradfast.com/BES220/bes210_Exam_2007_Sup+MEMO%20-%201475871136133.pdf",
	},
	{
		category: "Exams",
		version: "1",
		description: "Supplementary Exam",
		year: "2008",
		memo: "yes",
		url: "https://cdn.gradfast.com/BES220/bes210_Exam_2008_Sup%20MEMO%20-%201475871148422.pdf",
	},
	{
		category: "Exams",
		version: "1",
		description: "Exam",
		year: "2010",
		memo: "no",
		url: "https://cdn.gradfast.com/BES220/bes220_Exam_2010_Nov%20-%201475871164084.pdf",
	},
	{
		category: "Exams",
		version: "1",
		description: "Exam",
		year: "2011",
		memo: "no",
		url: "https://cdn.gradfast.com/BES220/bes221_Exam_2011_Nov%20-%201475871187742.pdf",
	},
	{
		category: "Exams",
		version: "1",
		description: "Supplementary Exam",
		year: "2011",
		memo: "no",
		url: "https://cdn.gradfast.com/BES220/bes221_Exam_2011_Sup%20-%201475871204655.pdf",
	},
	{
		category: "Semester Tests",
		version: "1",
		description: "Sick Test",
		year: "2010",
		memo: "no",
		url: "https://cdn.gradfast.com/BES220/Bes220_SickTest_2010%20-%201475871251276.pdf",
	},
	{
		category: "Semester Tests",
		version: "1",
		description: "Sick Test",
		year: "2011",
		memo: "yes",
		url: "https://cdn.gradfast.com/BES220/Bes220_SickTest_2011%20MEMO%20-%201475871267147.pdf",
	},
	{
		category: "Semester Tests",
		version: "1",
		description: "Semester Test 1",
		year: "2011",
		memo: "yes",
		url: "https://cdn.gradfast.com/BES220/Bes220_ST1_2011%20MEMO%20-%201475871282738.pdf",
	},
	{
		category: "Semester Tests",
		version: "1",
		description: "Semester Test 1",
		year: "2014",
		memo: "yes",
		url: "https://cdn.gradfast.com/BES220/Bes220_ST1_2014Memo%20-%201475871305830.pdf",
	},
	{
		category: "Semester Tests",
		version: "1",
		description: "Semester Test 2",
		year: "2009",
		memo: "no",
		url: "https://cdn.gradfast.com/BES220/Bes220_ST2_2009Oct%20-%201475871330096.pdf",
	},
	{
		category: "Semester Tests",
		version: "1",
		description: "Semester Test 2",
		year: "2011",
		memo: "yes",
		url: "https://cdn.gradfast.com/BES220/Bes220_ST2_2011Memo%20-%201475871342850.pdf",
	},
];
