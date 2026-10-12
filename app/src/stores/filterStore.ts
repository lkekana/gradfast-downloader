import { create } from "zustand";
import { useMemo } from "react";
import {
	cachedModules as modules,
	facultyAbbreviation,
	periodAbbreviation,
} from "@/lib/data";
import type { Module } from "@/lib/types";

interface FilterState {
	searchQuery: string;
	prefixFilter: string[];
	facultyFilter: string[];
	periodFilter: string[];

	setSearchQuery: (query: string) => void;
	setPrefixFilter: (
		prefixes: string[] | ((prev: string[]) => string[]),
	) => void;
	setFacultyFilter: (
		faculties: string[] | ((prev: string[]) => string[]),
	) => void;
	setPeriodFilter: (periods: string[] | ((prev: string[]) => string[])) => void;
	clearAllFilters: () => void;
	removeFilterChip: (chip: {
		type: "period" | "faculty" | "prefix";
		value: string;
	}) => void;
}

export const useFilterStore = create<FilterState>((set) => ({
	searchQuery: "",
	prefixFilter: [],
	facultyFilter: [],
	periodFilter: [],

	setSearchQuery: (query) => set({ searchQuery: query }),

	setPrefixFilter: (prefixes) =>
		set((state) => ({
			prefixFilter:
				typeof prefixes === "function"
					? prefixes(state.prefixFilter)
					: prefixes,
		})),

	setFacultyFilter: (faculties) =>
		set((state) => ({
			facultyFilter:
				typeof faculties === "function"
					? faculties(state.facultyFilter)
					: faculties,
		})),

	setPeriodFilter: (periods) =>
		set((state) => ({
			periodFilter:
				typeof periods === "function" ? periods(state.periodFilter) : periods,
		})),

	clearAllFilters: () =>
		set({
			searchQuery: "",
			prefixFilter: [],
			facultyFilter: [],
			periodFilter: [],
		}),

	removeFilterChip: (chip) =>
		set((state) => {
			if (chip.type === "period")
				return {
					periodFilter: state.periodFilter.filter((p) => p !== chip.value),
				};
			if (chip.type === "faculty")
				return {
					facultyFilter: state.facultyFilter.filter((f) => f !== chip.value),
				};
			if (chip.type === "prefix")
				return {
					prefixFilter: state.prefixFilter.filter((p) => p !== chip.value),
				};
			return {};
		}),
}));

export function useModuleFilters() {
	const searchQuery = useFilterStore((state) => state.searchQuery);
	const setSearchQuery = useFilterStore((state) => state.setSearchQuery);
	const prefixFilter = useFilterStore((state) => state.prefixFilter);
	const setPrefixFilter = useFilterStore((state) => state.setPrefixFilter);
	const facultyFilter = useFilterStore((state) => state.facultyFilter);
	const setFacultyFilter = useFilterStore((state) => state.setFacultyFilter);
	const periodFilter = useFilterStore((state) => state.periodFilter);
	const setPeriodFilter = useFilterStore((state) => state.setPeriodFilter);
	const clearAllFilters = useFilterStore((state) => state.clearAllFilters);
	const removeFilterChip = useFilterStore((state) => state.removeFilterChip);

	// Derived data
	const uniquePrefixes = useMemo(
		() => [...new Set(modules.map((m) => m.code.prefix))].sort(),
		[],
	);

	const uniqueFaculties = useMemo(
		() => [...new Set(modules.map((m) => m.faculty).filter(Boolean))].sort(),
		[],
	);

	const filteredModules = useMemo(() => {
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

	return {
		searchQuery: searchQuery,
		setSearchQuery: setSearchQuery,
		prefixFilter: prefixFilter,
		setPrefixFilter: setPrefixFilter,
		facultyFilter: facultyFilter,
		setFacultyFilter: setFacultyFilter,
		periodFilter: periodFilter,
		setPeriodFilter: setPeriodFilter,
		filterChips,
		clearAllFilters: clearAllFilters,
		removeFilterChip: removeFilterChip,
		filteredModules,
		uniquePrefixes,
		uniqueFaculties,
		activeFilterCount: filterChips.length,
	};
}
