export type Category = {
    name: string;
    description: string;
};

// faculties
/*
[
  {
    "faculty": "Faculty of Economic and Management Sciences"
  },
  {
    "faculty": "Gordon Institute of Business Science"
  },
  {
    "faculty": "Faculty of Health Sciences"
  },
  {
    "faculty": "Faculty of Education"
  },
  {
    "faculty": "Faculty of Humanities"
  },
  {
    "faculty": "Faculty of Law"
  },
  {
    "faculty": "Faculty of Veterinary Science"
  },
  {
    "faculty": "Faculty of Theology and Religion"
  },
  {
    "faculty": "Faculty of Natural and Agricultural Sciences"
  },
  {
    "faculty": "Faculty of Engineering, Built Environment and Information Technology"
  }
]
*/

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
    if (faculty === "Faculty of Engineering, Built Environment and Information Technology") return "EBIT";
    return "GEN";
}

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
}

export type Module = {
    prefix: string;
    code: number;
    name: string;
    faculty: string;
    period: string;
};

export const periods = [
    "Semester 1",
    "Semester 2",
    "Year",
    "Quarter 1",
    "Quarter 2",
    "Quarter 3",
    "Quarter 4"
];

export const modules: Module[] = [
    {
        "prefix": "STK",
        "code": 110,
        "name": "Statistics",
        "faculty": "Faculty of Economic and Management Sciences",
        "period": periods[Math.floor(Math.random() * periods.length)]
    },
    {
        "prefix": "NMC",
        "code": 123,
        "name": "Materials science",
        "faculty": "Faculty of Engineering, Built Environment and Information Technology",
        "period": periods[Math.floor(Math.random() * periods.length)]
    },
    {
        "prefix": "COS",
        "code": 151,
        "name": "Introduction to Computer Science",
        "faculty": "Faculty of Engineering, Built Environment and Information Technology",
        "period": periods[Math.floor(Math.random() * periods.length)]
    },
    {
        "prefix": "STK",
        "code": 120,
        "name": "Statistics",
        "faculty": "Faculty of Economic and Management Sciences",
        "period": periods[Math.floor(Math.random() * periods.length)]
    },
    {
        "prefix": "CIR",
        "code": 113,
        "name": "Chemical engineering",
        "faculty": "Faculty of Engineering, Built Environment and Information Technology",
        "period": periods[Math.floor(Math.random() * periods.length)]
    },
    {
        "prefix": "MBY",
        "code": 161,
        "name": "Introduction to microbiology",
        "faculty": "Faculty of Natural and Agricultural Sciences",
        "period": periods[Math.floor(Math.random() * periods.length)]
    },
    {
        "prefix": "COS",
        "code": 326,
        "name": "Database Systems",
        "faculty": "Faculty of Engineering, Built Environment and Information Technology",
        "period": periods[Math.floor(Math.random() * periods.length)]
    },
    {
        "prefix": "PHY",
        "code": 124,
        "name": "First course in physics",
        "faculty": "Faculty of Natural and Agricultural Sciences",
        "period": periods[Math.floor(Math.random() * periods.length)]
    },
    {
        "prefix": "NMC",
        "code": 113,
        "name": "Materials science",
        "faculty": "Faculty of Engineering, Built Environment and Information Technology",
        "period": periods[Math.floor(Math.random() * periods.length)]
    },
    {
        "prefix": "COS",
        "code": 314,
        "name": "Artificial Intelligence",
        "faculty": "Faculty of Engineering, Built Environment and Information Technology",
        "period": periods[Math.floor(Math.random() * periods.length)]
    },
    {
        "prefix": "FSK",
        "code": 116,
        "name": "Physics",
        "faculty": "Faculty of Natural and Agricultural Sciences",
        "period": periods[Math.floor(Math.random() * periods.length)]
    },
    {
        "prefix": "INF",
        "code": 214,
        "name": "Informatics: Database Design",
        "faculty": "Faculty of Engineering, Built Environment and Information Technology",
        "period": periods[Math.floor(Math.random() * periods.length)]
    },
    {
        "prefix": "COS",
        "code": 212,
        "name": "Data Structures and Algorithms",
        "faculty": "Faculty of Engineering, Built Environment and Information Technology",
        "period": periods[Math.floor(Math.random() * periods.length)]
    },
    {
        "prefix": "WTW",
        "code": 114,
        "name": "Calculus",
        "faculty": "Faculty of Natural and Agricultural Sciences",
        "period": periods[Math.floor(Math.random() * periods.length)]
    },
    {
        "prefix": "COS",
        "code": 332,
        "name": "Computer Networks",
        "faculty": "Faculty of Engineering, Built Environment and Information Technology",
        "period": periods[Math.floor(Math.random() * periods.length)]
    },
    {
        "prefix": "EBN",
        "code": 122,
        "name": "Electricity and electronics",
        "faculty": "Faculty of Engineering, Built Environment and Information Technology",
        "period": periods[Math.floor(Math.random() * periods.length)]
    },
    {
        "prefix": "CHM",
        "code": 171,
        "name": "General chemistry",
        "faculty": "Faculty of Natural and Agricultural Sciences",
        "period": periods[Math.floor(Math.random() * periods.length)]
    },
    {
        "prefix": "COS",
        "code": 216,
        "name": "Netcentric Computer Systems",
        "faculty": "Faculty of Engineering, Built Environment and Information Technology",
        "period": periods[Math.floor(Math.random() * periods.length)]
    },
    {
        "prefix": "WTW",
        "code": 161,
        "name": "Linear algebra",
        "faculty": "Faculty of Natural and Agricultural Sciences",
        "period": periods[Math.floor(Math.random() * periods.length)]
    },
    {
        "prefix": "GLY",
        "code": 162,
        "name": "Environmental and hazard geology",
        "faculty": "Faculty of Natural and Agricultural Sciences",
        "period": periods[Math.floor(Math.random() * periods.length)]
    },
    {
        "prefix": "COS",
        "code": 222,
        "name": "Operating Systems",
        "faculty": "Faculty of Engineering, Built Environment and Information Technology",
        "period": periods[Math.floor(Math.random() * periods.length)]
    },
    {
        "prefix": "COS",
        "code": 344,
        "name": "Computer Graphics",
        "faculty": "Faculty of Engineering, Built Environment and Information Technology",
        "period": periods[Math.floor(Math.random() * periods.length)]
    },
    {
        "prefix": "JPO",
        "code": 122,
        "name": "Additional Physics",
        "faculty": "Faculty of Natural and Agricultural Sciences",
        "period": periods[Math.floor(Math.random() * periods.length)]
    },
    {
        "prefix": "SWK",
        "code": 122,
        "name": "Mechanics",
        "faculty": "Faculty of Engineering, Built Environment and Information Technology",
        "period": periods[Math.floor(Math.random() * periods.length)]
    },
    {
        "prefix": "COS",
        "code": 301,
        "name": "Software engineering",
        "faculty": "Faculty of Engineering, Built Environment and Information Technology",
        "period": periods[Math.floor(Math.random() * periods.length)]
    },
    {
        "prefix": "COS",
        "code": 284,
        "name": "Computer Organisation and Architecture",
        "faculty": "Faculty of Engineering, Built Environment and Information Technology",
        "period": periods[Math.floor(Math.random() * periods.length)]
    },
    {
        "prefix": "CMY",
        "code": 127,
        "name": "General chemistry",
        "faculty": "Faculty of Natural and Agricultural Sciences",
        "period": periods[Math.floor(Math.random() * periods.length)]
    },
    {
        "prefix": "WTW",
        "code": 134,
        "name": "Mathematics",
        "faculty": "Faculty of Natural and Agricultural Sciences",
        "period": periods[Math.floor(Math.random() * periods.length)]
    },
    {
        "prefix": "WTW",
        "code": 126,
        "name": "Linear algebra",
        "faculty": "Faculty of Natural and Agricultural Sciences",
        "period": periods[Math.floor(Math.random() * periods.length)]
    },
    {
        "prefix": "CHM",
        "code": 172,
        "name": "General chemistry",
        "faculty": "Faculty of Natural and Agricultural Sciences",
        "period": periods[Math.floor(Math.random() * periods.length)]
    },
    {
        "prefix": "WTW",
        "code": 285,
        "name": "Discrete Structures",
        "faculty": "Faculty of Natural and Agricultural Sciences",
        "period": periods[Math.floor(Math.random() * periods.length)]
    },
    {
        "prefix": "WTW",
        "code": 128,
        "name": "Calculus",
        "faculty": "Faculty of Natural and Agricultural Sciences",
        "period": periods[Math.floor(Math.random() * periods.length)]
    },
    {
        "prefix": "COS",
        "code": 226,
        "name": "Concurrent Systems",
        "faculty": "Faculty of Engineering, Built Environment and Information Technology",
        "period": periods[Math.floor(Math.random() * periods.length)]
    },
    {
        "prefix": "WST",
        "code": 111,
        "name": "Mathematical statistics",
        "faculty": "Faculty of Natural and Agricultural Sciences",
        "period": periods[Math.floor(Math.random() * periods.length)]
    },
    {
        "prefix": "JPO",
        "code": 152,
        "name": "Additional Physics",
        "faculty": "Faculty of Natural and Agricultural Sciences",
        "period": periods[Math.floor(Math.random() * periods.length)]
    },
    {
        "prefix": "WTW",
        "code": 158,
        "name": "Calculus",
        "faculty": "Faculty of Natural and Agricultural Sciences",
        "period": periods[Math.floor(Math.random() * periods.length)]
    },
    {
        "prefix": "COS",
        "code": 330,
        "name": "Computer security and ethics",
        "faculty": "Faculty of Engineering, Built Environment and Information Technology",
        "period": periods[Math.floor(Math.random() * periods.length)]
    },
    {
        "prefix": "EBN",
        "code": 111,
        "name": "Electricity and electronics",
        "faculty": "Faculty of Engineering, Built Environment and Information Technology",
        "period": periods[Math.floor(Math.random() * periods.length)]
    },
    {
        "prefix": "COS",
        "code": 333,
        "name": "Programming Languages",
        "faculty": "Faculty of Engineering, Built Environment and Information Technology",
        "period": periods[Math.floor(Math.random() * periods.length)]
    },
    {
        "prefix": "IMY",
        "code": 310,
        "name": "Human-Computer Interaction",
        "faculty": "Faculty of Engineering, Built Environment and Information Technology",
        "period": periods[Math.floor(Math.random() * periods.length)]
    },
    {
        "prefix": "COS",
        "code": 132,
        "name": "Imperative Programming",
        "faculty": "Faculty of Engineering, Built Environment and Information Technology",
        "period": periods[Math.floor(Math.random() * periods.length)]
    },
    {
        "prefix": "COS",
        "code": 121,
        "name": "Software Modelling",
        "faculty": "Faculty of Engineering, Built Environment and Information Technology",
        "period": periods[Math.floor(Math.random() * periods.length)]
    },
    {
        "prefix": "MGC",
        "code": 110,
        "name": "Graphical communication",
        "faculty": "Faculty of Engineering, Built Environment and Information Technology",
        "period": periods[Math.floor(Math.random() * periods.length)]
    },
    {
        "prefix": "BES",
        "code": 220,
        "name": "Engineering statistics",
        "faculty": "Faculty of Engineering, Built Environment and Information Technology",
        "period": periods[Math.floor(Math.random() * periods.length)]
    },
    {
        "prefix": "WTW",
        "code": 148,
        "name": "Calculus",
        "faculty": "Faculty of Natural and Agricultural Sciences",
        "period": periods[Math.floor(Math.random() * periods.length)]
    },
    {
        "prefix": "WTW",
        "code": 124,
        "name": "Mathematics",
        "faculty": "Faculty of Natural and Agricultural Sciences",
        "period": periods[Math.floor(Math.random() * periods.length)]
    },
    {
        "prefix": "SLK",
        "code": 120,
        "name": "Psychology",
        "faculty": "Faculty of Humanities",
        "period": periods[Math.floor(Math.random() * periods.length)]
    },
    {
        "prefix": "CHM",
        "code": 181,
        "name": "General chemistry",
        "faculty": "Faculty of Natural and Agricultural Sciences",
        "period": periods[Math.floor(Math.random() * periods.length)]
    },
    {
        "prefix": "BME",
        "code": 120,
        "name": "Biometry",
        "faculty": "Faculty of Natural and Agricultural Sciences",
        "period": periods[Math.floor(Math.random() * periods.length)]
    },
    {
        "prefix": "CIR",
        "code": 123,
        "name": "Chemical engineering",
        "faculty": "Faculty of Engineering, Built Environment and Information Technology",
        "period": periods[Math.floor(Math.random() * periods.length)]
    },
    {
        "prefix": "WTW",
        "code": 164,
        "name": "Mathematics",
        "faculty": "Faculty of Natural and Agricultural Sciences",
        "period": periods[Math.floor(Math.random() * periods.length)]
    },
    {
        "prefix": "WTW",
        "code": 152,
        "name": "Mathematical modelling",
        "faculty": "Faculty of Natural and Agricultural Sciences",
        "period": periods[Math.floor(Math.random() * periods.length)]
    },
    {
        "prefix": "COS",
        "code": 110,
        "name": "Program Design: Introduction",
        "faculty": "Faculty of Engineering, Built Environment and Information Technology",
        "period": periods[Math.floor(Math.random() * periods.length)]
    },
    {
        "prefix": "BOT",
        "code": 161,
        "name": "Plant Biology",
        "faculty": "Faculty of Natural and Agricultural Sciences",
        "period": periods[Math.floor(Math.random() * periods.length)]
    },
    {
        "prefix": "FSK",
        "code": 176,
        "name": "Physics",
        "faculty": "Faculty of Natural and Agricultural Sciences",
        "period": periods[Math.floor(Math.random() * periods.length)]
    },
    {
        "prefix": "GLY",
        "code": 161,
        "name": "Historical geology",
        "faculty": "Faculty of Natural and Agricultural Sciences",
        "period": periods[Math.floor(Math.random() * periods.length)]
    },
    {
        "prefix": "WTW",
        "code": 168,
        "name": "Calculus",
        "faculty": "Faculty of Natural and Agricultural Sciences",
        "period": periods[Math.floor(Math.random() * periods.length)]
    },
    {
        "prefix": "WTW",
        "code": 146,
        "name": "Linear algebra",
        "faculty": "Faculty of Natural and Agricultural Sciences",
        "period": periods[Math.floor(Math.random() * periods.length)]
    },
    {
        "prefix": "INF",
        "code": 261,
        "name": "Informatics",
        "faculty": "Faculty of Engineering, Built Environment and Information Technology",
        "period": periods[Math.floor(Math.random() * periods.length)]
    },
    {
        "prefix": "WTW",
        "code": 115,
        "name": "Discrete structures",
        "faculty": "Faculty of Natural and Agricultural Sciences",
        "period": periods[Math.floor(Math.random() * periods.length)]
    }
];

export type ModuleInfo = {
    prefix: string;
    code: number;
    name: string;
    credits: string;
    period: string;
    prerequisites: Array<string>;
}

export const moduleInfo: ModuleInfo = {"prefix":"BES","code":220,"name":"Engineering statistics","credits":"8","period":"S2","prerequisites":[]};

export type PastPaper = {
    category: string;
    version: string;
    description: string;
    year: string;
    memo: string;
    url: string;
}

export const pastPapers: PastPaper[] = [
    {
        "category": "Exams",
        "version": "1",
        "description": "Antisemester Exam",
        "year": "2002",
        "memo": "yes",
        "url": "https://cdn.gradfast.com/BES220/bes210_Exam_2002_June%20MEMO%20-%201475871024373.pdf"
    },
    {
        "category": "Exams",
        "version": "1",
        "description": "Antisemester Exam",
        "year": "2003",
        "memo": "no",
        "url": "https://cdn.gradfast.com/BES220/bes210_Exam_2003_June%20-%201475871048231.pdf"
    },
    {
        "category": "Exams",
        "version": "1",
        "description": "Antisemester Exam",
        "year": "2004",
        "memo": "yes",
        "url": "https://cdn.gradfast.com/BES220/bes210_Exam_2004_June%20MEMO%20-%201475871066826.pdf"
    },
    {
        "category": "Exams",
        "version": "1",
        "description": "Supplementary Exam",
        "year": "2004",
        "memo": "yes",
        "url": "https://cdn.gradfast.com/BES220/bes210_Exam_2004_SUP%20MEMO%20-%201475871090209.pdf"
    },
    {
        "category": "Exams",
        "version": "1",
        "description": "Antisemester Exam",
        "year": "2005",
        "memo": "no",
        "url": "https://cdn.gradfast.com/BES220/bes210_Exam_2005_June%20-%201475871108261.pdf"
    },
    {
        "category": "Exams",
        "version": "1",
        "description": "Antisemester Exam",
        "year": "2007",
        "memo": "yes",
        "url": "https://cdn.gradfast.com/BES220/bes210_Exam_2007_June%20MEMO%20-%201475871120845.pdf"
    },
    {
        "category": "Exams",
        "version": "1",
        "description": "Supplementary Exam",
        "year": "2007",
        "memo": "yes",
        "url": "https://cdn.gradfast.com/BES220/bes210_Exam_2007_Sup+MEMO%20-%201475871136133.pdf"
    },
    {
        "category": "Exams",
        "version": "1",
        "description": "Supplementary Exam",
        "year": "2008",
        "memo": "yes",
        "url": "https://cdn.gradfast.com/BES220/bes210_Exam_2008_Sup%20MEMO%20-%201475871148422.pdf"
    },
    {
        "category": "Exams",
        "version": "1",
        "description": "Exam",
        "year": "2010",
        "memo": "no",
        "url": "https://cdn.gradfast.com/BES220/bes220_Exam_2010_Nov%20-%201475871164084.pdf"
    },
    {
        "category": "Exams",
        "version": "1",
        "description": "Exam",
        "year": "2011",
        "memo": "no",
        "url": "https://cdn.gradfast.com/BES220/bes221_Exam_2011_Nov%20-%201475871187742.pdf"
    },
    {
        "category": "Exams",
        "version": "1",
        "description": "Supplementary Exam",
        "year": "2011",
        "memo": "no",
        "url": "https://cdn.gradfast.com/BES220/bes221_Exam_2011_Sup%20-%201475871204655.pdf"
    },
    {
        "category": "Semester Tests",
        "version": "1",
        "description": "Sick Test",
        "year": "2010",
        "memo": "no",
        "url": "https://cdn.gradfast.com/BES220/Bes220_SickTest_2010%20-%201475871251276.pdf"
    },
    {
        "category": "Semester Tests",
        "version": "1",
        "description": "Sick Test",
        "year": "2011",
        "memo": "yes",
        "url": "https://cdn.gradfast.com/BES220/Bes220_SickTest_2011%20MEMO%20-%201475871267147.pdf"
    },
    {
        "category": "Semester Tests",
        "version": "1",
        "description": "Semester Test 1",
        "year": "2011",
        "memo": "yes",
        "url": "https://cdn.gradfast.com/BES220/Bes220_ST1_2011%20MEMO%20-%201475871282738.pdf"
    },
    {
        "category": "Semester Tests",
        "version": "1",
        "description": "Semester Test 1",
        "year": "2014",
        "memo": "yes",
        "url": "https://cdn.gradfast.com/BES220/Bes220_ST1_2014Memo%20-%201475871305830.pdf"
    },
    {
        "category": "Semester Tests",
        "version": "1",
        "description": "Semester Test 2",
        "year": "2009",
        "memo": "no",
        "url": "https://cdn.gradfast.com/BES220/Bes220_ST2_2009Oct%20-%201475871330096.pdf"
    },
    {
        "category": "Semester Tests",
        "version": "1",
        "description": "Semester Test 2",
        "year": "2011",
        "memo": "yes",
        "url": "https://cdn.gradfast.com/BES220/Bes220_ST2_2011Memo%20-%201475871342850.pdf"
    }
];