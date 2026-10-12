import { delay } from "jsr:@std/async/delay";

type PaperCategory =
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

type MemoStatus = "yes" | "no" | "partial";

interface PastPaper {
	category: PaperCategory;
	version: string; // e.g., "1", "2", "A", "B"
	description: string;
	year: string; // e.g., "2005", "0", "00"
	memo: MemoStatus;
	url: string;
}


type PartialModuleInfo = {
  module_id: string;
  code: string;
  qualification: string;
  faculty: string;
  content: string;
  nqf_level: number;
  prerequisites: string;
  contact_time: string;
  language: string;
  period: string;
};

type ModuleWithInfo = {
  id: string;
  name: string;
  code_prefix: string;
  code_number: string;
  credits: number;
  most_recent_year: number;
  module_info: PartialModuleInfo | null;
};

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

const supabaseURL = Deno.env.get("SUPABASE_URL");
if (!supabaseURL) {
  throw new Error("SUPABASE_URL environment variable is not set");
}
const supabaseKey = Deno.env.get("SUPABASE_KEY");
if (!supabaseKey) {
  throw new Error("SUPABASE_KEY environment variable is not set");
}

if (import.meta.main) {  
  // read file at ../app/src/assets/catalog.json and print it
  // file is a JSON file with each key being a module code and the value being an array of past paper objects, each with a category, version, description, year, memo, and url
  const data = await Deno.readTextFile("../app/src/assets/catalog.json");
  // console.log(data);

  
  // // for each module in the catalog, print key
  // const catalog = JSON.parse(data);
  // for (const moduleCode in catalog) {
  //   console.log(moduleCode);
  // }
  
  // // for each module in the catalog, create a set for PastPaper attributes (excl. url)
  // const uniqueCategories = new Set<string>();
  // const uniqueVersions = new Set<string>();
  // const uniqueDescriptions = new Set<string>();
  // const uniqueYears = new Set<string>();
  // const uniqueMemos = new Set<string>();
  // for (const moduleCode in catalog) {
  //   const pastPapers: PastPaper[] = catalog[moduleCode];
  //   for (const paper of pastPapers) {
  //     uniqueCategories.add(paper.category);
  //     uniqueVersions.add(paper.version);
  //     uniqueDescriptions.add(paper.description);
  //     uniqueYears.add(paper.year);
  //     uniqueMemos.add(paper.memo);
  //   }
  // }

  // console.log("Unique Categories:", Array.from(uniqueCategories).sort());
  // console.log("Unique Versions:", Array.from(uniqueVersions).sort());
  // console.log("Unique Descriptions:", Array.from(uniqueDescriptions).sort());
  // console.log("Unique Years:", Array.from(uniqueYears).sort());
  // console.log("Unique Memos:", Array.from(uniqueMemos).sort());

  // // for each module in the catalog, print the number of past papers per category
  // for (const moduleCode in catalog) {
  //   const categoryCounts: Record<string, number> = {};
  //   for (const paper of catalog[moduleCode]) {
  //     categoryCounts[paper.category] = (categoryCounts[paper.category] || 0) + 1;
  //   }
  //   console.log(`Module ${moduleCode} category counts:`, categoryCounts);
  // }

  // for each module in the catalog, create a string array of keys
  // then separate the keys into prefix and number, where prefix is the letters and number is the digits, then sort by prefix and number
  const moduleCodes = Object.keys(JSON.parse(data)).map((code) => {
    const match = code.match(/^([a-zA-Z]+)(\d+)$/);
    if (!match) {
      return null;
    }
    const [prefix, number] = [match[1], parseInt(match[2], 10)];
    return { prefix, number, code };
  }).filter((x) => x !== null).sort((a, b) => {
    if (a.prefix === b.prefix) {
      return a.number - b.number;
    }
    return a.prefix.localeCompare(b.prefix);
  }).map((x) => `${x.prefix} ${x.number}`);
  console.log("Module Codes:", moduleCodes.sort());

  // 
// const url = new URL(`${supabaseURL}/rest/v1/module_info`);
//  url.searchParams.append("select", "*");
// //  url.searchParams.append("code", "in.(COS 110,COS 151)");
//   url.searchParams.append("code", `in.(${moduleCodes.join(",")})`);
//   console.log(url.toString());
//  const response = await fetch(
//     url.toString(),
    // {
    //   headers: {
    //     apikey: supabaseKey,
    //     Authorization: `Bearer ${supabaseKey}`,
    //   },
    // },
//   );
//   const moduleInfo = await response.json() as PartialModuleInfo[];
//   console.log("Module Info:", moduleInfo);
// await Deno.writeTextFile("../app/src/assets/module_info.json", JSON.stringify(moduleInfo, null, 2));

  const info: ModuleInfo[] = [];
  for (const moduleCode of moduleCodes) {
    const url = new URL(`${supabaseURL}/rest/v1/modules`);
    url.searchParams.append("select", "*,module_info(*)");
    const [prefix, number] = moduleCode.split(" ");
    url.searchParams.append("code_prefix", `eq.${prefix}`);
    url.searchParams.append("code_number", `eq.${number}`);
    console.log(url.toString());
    const response = await fetch(
      url.toString(),
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      },
    );
    const result = await response.json() as ModuleWithInfo[];
    console.log(`Module Info for ${moduleCode}:`, result);
    if (result.length === 0) {
      console.warn(`No module info found for ${moduleCode}`);
      continue;
    }
    const moduleInfo = result[0];
    if (moduleInfo.module_info === null) {
      console.warn(`No module_info found for ${moduleCode}`);
      continue;
    }

    const programmesURL = new URL(`${supabaseURL}/rest/v1/curriculums`);
    programmesURL.searchParams.append("select", "curriculum_name:name,...programmes!inner(programme_name:name,programme_code:code),modules!inner()");
    programmesURL.searchParams.append("programmes.year", "eq.2026");
    programmesURL.searchParams.append("modules.code_prefix", `eq.${prefix}`);
    programmesURL.searchParams.append("modules.code_number", `eq.${number}`);
    const associatedProgrammes = await fetch(
      programmesURL.toString(),
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      },
    ).then((res) => res.json()) as Array<{ curriculum_name: string; programme_name: string; programme_code: string }>;
    console.log(`Associated Programmes for ${moduleCode}:`, associatedProgrammes);

    info.push({
      code: {
        prefix: moduleInfo.code_prefix,
        number: parseInt(moduleInfo.code_number, 10),
      },
      name: moduleInfo.name,
      credits: moduleInfo.credits,
      associatedProgrammes: associatedProgrammes.map((p) => ({
        programmeName: p.programme_name,
        programmeCode: p.programme_code,
        curriculumName: p.curriculum_name,
      })),
      qualification: moduleInfo.module_info.qualification as "UPOnline" | "Postgraduate" | "Undergraduate",
      faculty: moduleInfo.module_info.faculty,
      content: moduleInfo.module_info.content,
      nqfLevel: moduleInfo.module_info.nqf_level,
      prerequisites: moduleInfo.module_info.prerequisites,
      contactTime: moduleInfo.module_info.contact_time,
      language: moduleInfo.module_info.language,
      period: moduleInfo.module_info.period,
    });
    delay(1000); // wait 1 second between requests to avoid rate limiting
  }

  console.log("All Module Info:", info);
  await Deno.writeTextFile("../app/src/assets/module_info.json", JSON.stringify(info, null, 2));
}
