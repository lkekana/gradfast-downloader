// src/hooks/useModuleFilters.ts
import { useCallback, useMemo, useState } from "react";
import {
	facultyAbbreviation,
	modules as initialModules,
	periodAbbreviation,
} from "@/lib/data";
import type { Module } from "@/lib/types";

export interface FilterState {
	searchQuery: string;
	prefixFilter: string[];
	facultyFilter: string[];
	periodFilter: string[];
}

export interface FilterActions {
	setSearchQuery: (query: string) => void;
	setPrefixFilter: (
		prefixes: string[] | ((prev: string[]) => string[]),
	) => void;
	setFacultyFilter: (
		faculties: string[] | ((prev: string[]) => string[]),
	) => void;
	setPeriodFilter: (periods: string[] | ((prev: string[]) => string[])) => void;
	clearAllFilters: () => void;
	filterChips: {
		id: string;
		label: string;
		type: "period" | "faculty" | "prefix";
		value: string;
	}[];
	removeFilterChip: (chip: {
		type: "period" | "faculty" | "prefix";
		value: string;
	}) => void;
}

export interface FilterDerived {
	filteredModules: Module[];
	uniquePrefixes: string[];
	uniqueFaculties: string[];
	activeFilterCount: number;
}

export function useModuleFilters(
	modules: Module[] = initialModules,
): FilterState & FilterActions & FilterDerived {
	const [searchQuery, setSearchQuery] = useState("");
	const [prefixFilter, setPrefixFilter] = useState<string[]>([]);
	const [facultyFilter, setFacultyFilter] = useState<string[]>([]);
	const [periodFilter, setPeriodFilter] = useState<string[]>([]);

	// Derived data
	const uniquePrefixes = useMemo(
		() => [...new Set(modules.map((m) => m.code.prefix))].sort(),
		[modules],
	);

	const uniqueFaculties = useMemo(
		() => [...new Set(modules.map((m) => m.faculty).filter(Boolean))].sort(),
		[modules],
	);

	const filteredModules = useMemo(() => {
		console.log("Filters:", {
			searchQuery,
			prefixFilter,
			facultyFilter,
			periodFilter,
		});
		return modules
			.filter((mod: Module) => {
				const matchesSearch =
					`${mod.code.prefix}${mod.code} ${mod.name} ${mod.faculty || ""}`
						.toLowerCase()
						.includes(searchQuery.toLowerCase());
				const matchesPrefix =
					prefixFilter.length === 0 || prefixFilter.includes(mod.code.prefix);
				const matchesFaculty =
					facultyFilter.length === 0 ||
					(mod.faculty && facultyFilter.includes(mod.faculty));
				const matchesPeriod =
					periodFilter.length === 0 ||
					(mod.period && periodFilter.includes(mod.period));
				return (
					matchesSearch && matchesPrefix && matchesFaculty && matchesPeriod
				);
			})
			.sort((a, b) => {
				if (a.code.prefix === b.code.prefix)
					return a.code.number - b.code.number;
				return a.code.prefix.localeCompare(b.code.prefix);
			});
	}, [searchQuery, prefixFilter, facultyFilter, periodFilter]);

	// Generate chip data for active filters
	const filterChips = useMemo(() => {
		const chips: {
			id: string;
			label: string;
			type: "period" | "faculty" | "prefix";
			value: string;
		}[] = [];

		// Period chips
		periodFilter.forEach((period) => {
			chips.push({
				id: `period-${period}`,
				label: `Period: ${periodAbbreviation(period)}`,
				type: "period",
				value: period,
			});
		});

		// Faculty chips
		facultyFilter.forEach((faculty) => {
			chips.push({
				id: `faculty-${faculty}`,
				label: `Faculty: ${facultyAbbreviation(faculty)}`,
				type: "faculty",
				value: faculty,
			});
		});

		// Prefix chips
		prefixFilter.forEach((prefix) => {
			chips.push({
				id: `prefix-${prefix}`,
				label: `Prefix: ${prefix}*`,
				type: "prefix",
				value: prefix,
			});
		});

		return chips;
	}, [prefixFilter, facultyFilter, periodFilter]);

	const activeFilterCount = filterChips.length;

	// Remove a specific filter chip
	const removeFilterChip = useCallback(
		(chip: { type: "period" | "faculty" | "prefix"; value: string }) => {
			switch (chip.type) {
				case "period":
					setPeriodFilter((prev) => prev.filter((p) => p !== chip.value));
					break;
				case "faculty":
					setFacultyFilter((prev) => prev.filter((f) => f !== chip.value));
					break;
				case "prefix":
					setPrefixFilter((prev) => prev.filter((p) => p !== chip.value));
					break;
			}
		},
		[],
	);

	// Clear all filters
	const clearAllFilters = () => {
		setPeriodFilter([]);
		setFacultyFilter([]);
		setPrefixFilter([]);
	};

	return {
		// State
		searchQuery,
		setSearchQuery,

		prefixFilter,
		setPrefixFilter,

		facultyFilter,
		setFacultyFilter,

		periodFilter,
		setPeriodFilter,

		filterChips,

		// Actions
		clearAllFilters,
		removeFilterChip,

		// Derived
		filteredModules,
		uniquePrefixes,
		uniqueFaculties,
		activeFilterCount,
	};
}
