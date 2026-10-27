import { useQuery } from "@tanstack/react-query";
import { create } from "zustand";
import type { Module } from "@/lib/types";
import { getStaticModulesOptions } from "@/stores/apiStore";
import { useDownloadStore } from "@/stores/downloadStore";

interface SelectionState {
	selectedModules: Set<Module>;
	toggleModule: (module: Module) => void;
	selectAllVisible: (visibleModules: Module[]) => void;
	clearSelection: () => void;
	selectByPrefix: (prefix: string, modules: Module[]) => void;
	selectByFaculty: (faculty: string, modules: Module[]) => void;
	selectByPeriod: (period: string, modules: Module[]) => void;
}

export const useSelectionStore = create<SelectionState>((set, _get) => ({
	selectedModules: new Set<Module>(),
	toggleModule: (module) =>
		set((state) => {
			const isDownloadActive =
				useDownloadStore.getState().status === "downloading";
			if (isDownloadActive) return {};
			const next = new Set(state.selectedModules);
			next.has(module) ? next.delete(module) : next.add(module);
			return { selectedModules: next };
		}),

	selectAllVisible: (visibleModules) =>
		set(() => {
			const isDownloadActive =
				useDownloadStore.getState().status === "downloading";
			if (isDownloadActive) return {};
			return {
				selectedModules: new Set(visibleModules),
			};
		}),

	clearSelection: () => set({ selectedModules: new Set() }),

	selectByPrefix: (prefix, modules) =>
		set(() => {
			const isDownloadActive =
				useDownloadStore.getState().status === "downloading";
			if (isDownloadActive) return {};
			return {
				selectedModules: new Set(
					modules.filter((m) => m.code.prefix === prefix),
				),
			};
		}),

	selectByFaculty: (faculty, modules) =>
		set(() => {
			const isDownloadActive =
				useDownloadStore.getState().status === "downloading";
			if (isDownloadActive) return {};
			return {
				selectedModules: new Set(modules.filter((m) => m.faculty === faculty)),
			};
		}),

	selectByPeriod: (period, modules) =>
		set(() => {
			const isDownloadActive =
				useDownloadStore.getState().status === "downloading";
			if (isDownloadActive) return {};
			return {
				selectedModules: new Set(modules.filter((m) => m.period === period)),
			};
		}),
}));

export function useModuleSelection() {
	const selectedModules = useSelectionStore((state) => state.selectedModules);
	const toggleModule = useSelectionStore((state) => state.toggleModule);
	const selectAllVisible = useSelectionStore((state) => state.selectAllVisible);
	const clearSelection = useSelectionStore((state) => state.clearSelection);
	const selectByPrefix = useSelectionStore((state) => state.selectByPrefix);
	const selectByFaculty = useSelectionStore((state) => state.selectByFaculty);
	const selectByPeriod = useSelectionStore((state) => state.selectByPeriod);
	const { data: modules = [] } = useQuery(getStaticModulesOptions());

	return {
		selectedModules: selectedModules,
		isSelected: (module: Module) => selectedModules.has(module),
		toggleModule: toggleModule,
		selectAllVisible: selectAllVisible,
		clearSelection: clearSelection,
		selectByPrefix: (prefix: string) => selectByPrefix(prefix, modules),
		selectByFaculty: (faculty: string) => selectByFaculty(faculty, modules),
		selectByPeriod: (period: string) => selectByPeriod(period, modules),
		selectedCount: selectedModules.size,
	};
}
