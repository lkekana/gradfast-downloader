import { create } from "zustand";
import { useEffect } from "react";
import type { Module } from "@/lib/types";
import { cachedModules as modules } from "@/lib/data";

interface SelectionState {
	selectedIds: Set<string>;
	isDisabled: boolean;

	setDisabled: (val: boolean) => void;
	toggleModule: (id: string) => void;
	selectAllVisible: (visibleModules: Module[]) => void;
	clearSelection: () => void;
	selectByPrefix: (prefix: string, modules: Module[]) => void;
	selectByFaculty: (faculty: string, modules: Module[]) => void;
	selectByPeriod: (period: string, modules: Module[]) => void;
}

export const useSelectionStore = create<SelectionState>((set, get) => ({
	selectedIds: new Set<string>(),
	isDisabled: false,

	setDisabled: (val) => set({ isDisabled: val }),

	toggleModule: (id) =>
		set((state) => {
			if (state.isDisabled) return {};
			const next = new Set(state.selectedIds);
			next.has(id) ? next.delete(id) : next.add(id);
			return { selectedIds: next };
		}),

	selectAllVisible: (visibleModules) =>
		set((state) => {
			if (state.isDisabled) return {};
			return {
				selectedIds: new Set(
					visibleModules.map((m) => `${m.code.prefix}${m.code.number}`),
				),
			};
		}),

	clearSelection: () => set({ selectedIds: new Set() }),

	selectByPrefix: (prefix) =>
		set((state) => {
			if (state.isDisabled) return {};
			return {
				selectedIds: new Set(
					modules
						.filter((m) => m.code.prefix === prefix)
						.map((m) => `${m.code.prefix}${m.code.number}`),
				),
			};
		}),

	selectByFaculty: (faculty) =>
		set((state) => {
			if (state.isDisabled) return {};
			return {
				selectedIds: new Set(
					modules
						.filter((m) => m.faculty === faculty)
						.map((m) => `${m.code.prefix}${m.code.number}`),
				),
			};
		}),

	selectByPeriod: (period) =>
		set((state) => {
			if (state.isDisabled) return {};
			return {
				selectedIds: new Set(
					modules
						.filter((m) => m.period === period)
						.map((m) => `${m.code.prefix}${m.code.number}`),
				),
			};
		}),
}));

export function useModuleSelection(isDisabled: boolean = false) {
	const store = useSelectionStore();

	// Sync the isDisabled prop to the global store
	useEffect(() => {
		if (isDisabled !== store.isDisabled) {
			store.setDisabled(isDisabled);
		}
	}, [isDisabled, store.isDisabled, store.setDisabled]);

	return {
		selectedIds: store.selectedIds,
		isSelected: (id: string) => store.selectedIds.has(id),
		toggleModule: store.toggleModule,
		selectAllVisible: store.selectAllVisible,
		clearSelection: store.clearSelection,
		selectByPrefix: (prefix: string) => store.selectByPrefix(prefix, modules),
		selectByFaculty: (faculty: string) =>
			store.selectByFaculty(faculty, modules),
		selectByPeriod: (period: string) => store.selectByPeriod(period, modules),
		selectionCount: store.selectedIds.size,
		isDisabled: store.isDisabled,
	};
}
