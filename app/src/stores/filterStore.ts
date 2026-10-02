import { create } from "zustand";
import { useMemo } from "react";
import { facultyAbbreviation, periodAbbreviation } from "@/lib/data";
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

// THIN WRAPPER: Preserves your exact original API
export function useModuleFilters(modules: Module[]) {
	const store = useFilterStore();

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
		return modules
			.filter((mod: Module) => {
				const matchesSearch =
					`${mod.code.prefix}${mod.code} ${mod.name} ${mod.faculty || ""}`
						.toLowerCase()
						.includes(store.searchQuery.toLowerCase());
				const matchesPrefix =
					store.prefixFilter.length === 0 ||
					store.prefixFilter.includes(mod.code.prefix);
				const matchesFaculty =
					store.facultyFilter.length === 0 ||
					(mod.faculty && store.facultyFilter.includes(mod.faculty));
				const matchesPeriod =
					store.periodFilter.length === 0 ||
					(mod.period && store.periodFilter.includes(mod.period));
				return (
					matchesSearch && matchesPrefix && matchesFaculty && matchesPeriod
				);
			})
			.sort((a, b) => {
				if (a.code.prefix === b.code.prefix)
					return a.code.number - b.code.number;
				return a.code.prefix.localeCompare(b.code.prefix);
			});
	}, [
		store.searchQuery,
		store.prefixFilter,
		store.facultyFilter,
		store.periodFilter,
		modules,
	]);

	const filterChips = useMemo(() => {
		const chips: {
			id: string;
			label: string;
			type: "period" | "faculty" | "prefix";
			value: string;
		}[] = [];
		// Period chips
		store.periodFilter.forEach((period) => {
			chips.push({
				id: `period-${period}`,
				label: `Period: ${periodAbbreviation(period)}`,
				type: "period",
				value: period,
			});
		});

		// Faculty chips
		store.facultyFilter.forEach((faculty) => {
			chips.push({
				id: `faculty-${faculty}`,
				label: `Faculty: ${facultyAbbreviation(faculty)}`,
				type: "faculty",
				value: faculty,
			});
		});

		// Prefix chips
		store.prefixFilter.forEach((prefix) => {
			chips.push({
				id: `prefix-${prefix}`,
				label: `Prefix: ${prefix}*`,
				type: "prefix",
				value: prefix,
			});
		});

		return chips;
	}, [store.prefixFilter, store.facultyFilter, store.periodFilter]);

	return {
		searchQuery: store.searchQuery,
		setSearchQuery: store.setSearchQuery,
		prefixFilter: store.prefixFilter,
		setPrefixFilter: store.setPrefixFilter,
		facultyFilter: store.facultyFilter,
		setFacultyFilter: store.setFacultyFilter,
		periodFilter: store.periodFilter,
		setPeriodFilter: store.setPeriodFilter,
		filterChips,
		clearAllFilters: store.clearAllFilters,
		removeFilterChip: store.removeFilterChip,
		filteredModules,
		uniquePrefixes,
		uniqueFaculties,
		activeFilterCount: filterChips.length,
	};
}
