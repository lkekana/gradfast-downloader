import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { downloadPath } from "@/lib/api";

export type AcademicLevel = "undergrad" | "postgrad";
export type NamingPattern = "default" | "code-year-type" | "name-year-type" | "code-name-year" | "faculty-code-year";
export type PaperType = "exams" | "semesterTests" | "classTests" | "practicals" | "tutorials" | "other";
export type ModuleRole = "fundamental" | "core" | "elective";

export interface SettingsState {
	// ========== PROGRAMME SELECTION ==========
	programmeSelectionMode: "search" | "hierarchical";
	programmeID: string;
	academicLevel: AcademicLevel;
	faculty: string;
	department: string;
	year: string;

	// ========== DOWNLOAD PREFERENCES ==========
	destinationFolder: string;
	moduleSubfolders: boolean;
	zipMultipleFiles: boolean;
	namingPattern: string;
	parallelDownloads: number;
	retryAttempts: number;

	// ========== CONTENT FILTERS ==========
	includeModuleRoles: Record<ModuleRole, boolean>;
	nqfLevelRange: [number, number];
	creditsRange: [number, number];
	preferredLanguages: string[];
	preferredPeriods: string[];

	// ========== PAPER TYPE PREFERENCES ==========
	includePaperTypes: Record<PaperType, boolean>;
	yearRange: [number, number];
	preferMostRecent: boolean;

	// ========== METADATA & SYNC ==========
	includeMetadata: boolean;
	includeModuleContent: boolean;
	includePrerequisites: boolean;
	includeCurriculumStructure: boolean;
	autoSyncProgrammeData: boolean;
	cacheDurationHours: number;

	autoSelectModules: boolean;
	checkForUpdates: boolean;
}

const defaultSettings: SettingsState = {
	programmeSelectionMode: "search",
	programmeID: "",
	academicLevel: "undergrad",
	faculty: "",
	department: "",
	year: "",

	destinationFolder: downloadPath,
	moduleSubfolders: true,
	zipMultipleFiles: false,
	namingPattern: "default",
	parallelDownloads: 3,
	retryAttempts: 3,

	includeModuleRoles: { fundamental: true, core: true, elective: false },
	nqfLevelRange: [5, 10],
	creditsRange: [0, 60],
	preferredLanguages: ["English"],
	preferredPeriods: ["Semester 1", "Semester 2", "Year"],

	includePaperTypes: {
		exams: true,
		semesterTests: true,
		classTests: true,
		practicals: true,
		tutorials: true,
		other: true,
	},
	yearRange: [2010, new Date().getFullYear()],
	preferMostRecent: true,

	includeMetadata: true,
	includeModuleContent: true,
	includePrerequisites: true,
	includeCurriculumStructure: false,
	autoSyncProgrammeData: true,
	cacheDurationHours: 24,

	autoSelectModules: true,
	checkForUpdates: true,
};

interface SettingsActions {
	updateSettings: (partial: Partial<SettingsState>) => void;
	resetSettings: () => void;
}

export const useSettingsStore = create<SettingsState & SettingsActions>()(
	persist(
		(set) => ({
			...defaultSettings,
			updateSettings: (partial) => set((state) => ({ ...state, ...partial })),
			resetSettings: () => set(defaultSettings),
		}),
		{
			name: "pastpapers-settings", // localStorage key
			storage: createJSONStorage(() => localStorage),
		},
	),
);
