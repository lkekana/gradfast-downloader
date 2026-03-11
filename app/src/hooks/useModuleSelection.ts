// hooks/useModuleSelection.ts
import { type SetStateAction, useState } from "react";
import type { Module } from "@/lib/types";

export function useModuleSelection(
	modules: Module[], // Full module list for "select by" actions
	isDisabled: boolean = false, // Prevent changes during downloads
) {
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

	const safeSelect = (updater: SetStateAction<Set<string>>) => {
		if (isDisabled) return;
		setSelectedIds(updater);
	};

	return {
		selectedIds,
		isSelected: (id: string) => selectedIds.has(id),
		toggleModule: (id: string) =>
			safeSelect((prev) => {
				const next = new Set(prev);
				next.has(id) ? next.delete(id) : next.add(id);
				return next;
			}),
		selectAllVisible: (visibleModules: Module[]) =>
			safeSelect(
				new Set(visibleModules.map((m) => `${m.code.prefix}${m.code.number}`)),
			),
		clearSelection: () => safeSelect(new Set()),
		selectByPrefix: (prefix: string) =>
			safeSelect(
				new Set(
					modules
						.filter((m) => m.code.prefix === prefix)
						.map((m) => `${m.code.prefix}${m.code.number}`),
				),
			),
		selectByFaculty: (faculty: string) =>
			safeSelect(
				new Set(
					modules
						.filter((m) => m.faculty === faculty)
						.map((m) => `${m.code.prefix}${m.code.number}`),
				),
			),
		selectByPeriod: (period: string) =>
			safeSelect(
				new Set(
					modules
						.filter((m) => m.period === period)
						.map((m) => `${m.code.prefix}${m.code.number}`),
				),
			),
		// Expose count for UI decisions
		selectionCount: selectedIds.size,
	};
}
