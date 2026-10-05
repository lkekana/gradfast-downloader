import { create } from "zustand";
import { toast } from "@/hooks/use-toast";
import { useConnection, useConnectionStore } from "@/stores/connectionStore";
import { useSelectionStore } from "@/stores/selectionStore";
import type { Module, PastPaper } from "@/lib/types";
import { useApiStore } from "./apiStore";

type DownloadStateStatus = "idle" | "downloading" | "paused" | "error";
export type ModuleStatus = "pending" | "preparing" | "downloading" | "completed" | "failed";
export type PastPaperDownloadItem = {
	paper: PastPaper;
	available: boolean;
	downloaded: boolean;
};

export interface ModuleProgressState {
	module: Module;
	status: ModuleStatus;
	papers: PastPaperDownloadItem[]; // Track progress for each past paper
	progress: number; // 0 to 100 for this specific module
}

interface DownloadState {
	status: DownloadStateStatus;
	moduleProgress: ModuleProgressState[];

	startSimulation: () => void;
	handleDownload: () => void;
	handlePause: () => void;
	handleRetry: () => void;
	handleCancel: () => void;
}

// Interval kept outside state so it doesn't trigger re-renders
let downloadInterval: ReturnType<typeof setInterval> | null = null;

export const useDownloadStore = create<DownloadState>((set, get) => ({
	status: "idle",
	moduleProgress: [],

	// Realistic download simulation with pause/resume support
	startSimulation: () => {
		if (downloadInterval) clearInterval(downloadInterval);

		const { moduleProgress } = get();
		const allDone = moduleProgress.every(
			(m) => m.status === "completed" || m.status === "failed"
		);
		if (allDone && moduleProgress.length > 0) return;

		const modulesToDownload = useSelectionStore.getState().selectedModules;

		// Base speed: ~5 seconds for full download at 100%
		// Adjust increment based on number of selected modules for realism
		const baseIncrement = 5; // % per tick
		const moduleCount = modulesToDownload.size || 1; // Avoid division by zero
		const speedFactor = Math.max(0.5, Math.min(2, 3 / moduleCount)); // More modules = slower per-item

		const prepareModuleForDownload = useApiStore.getState().prepareModuleForDownload;

		downloadInterval = setInterval(async () => {
				const state = get();
				// Only proceed if still in downloading state
				if (state.status !== "downloading") {
					if (downloadInterval) clearInterval(downloadInterval);
					downloadInterval = null;
					return;
				}

				// Check for completion
				const activeIndex = state.moduleProgress.findIndex(
					(m) => m.status === "pending" || m.status === "preparing" || m.status === "downloading"
				);

				if (activeIndex === -1) {
					if (downloadInterval) clearInterval(downloadInterval);
					downloadInterval = null;

					const failedCount = state.moduleProgress.filter(
						(m) => m.status === "failed"
					).length;
					toast({
						title:
							failedCount > 0
								? `🎉 Download complete (${failedCount} failed)`
								: "🎉 Download complete",
						// description: `Your selected modules have been downloaded to ${downloadPath}`,
						variant: "default",
					});

					// Small delay before resetting to show 100%
					setTimeout(() => {
						useSelectionStore.getState().clearSelection();
						set({ status: "idle", moduleProgress: [] });
					}, 400);

					return;
				}

				const current = state.moduleProgress[activeIndex];
				const newModuleProgress = [...state.moduleProgress];

				let currentPapers = current.papers;
				// Initialize papers for this module if not already done
				if (currentPapers.length === 0) {
					// const papers = await prepareModuleForDownload(current.module.code);
					// currentPapers = papers.map((paper) => ({
					// 	paper,
					// 	available: Math.random() < 0.9, // 90% chance the paper is available
					// 	downloaded: false,
					// }));
					prepareModuleForDownload(current.module.code).then((papers) => {
						currentPapers = papers;
					});
				}

				// Add variable increment for realism (network fluctuation simulation)
				// const fluctuation = 0.7 + Math.random() * 0.6; // 0.7x to 1.3x speed
				// const increment = baseIncrement * speedFactor * fluctuation;
				// const nextProgress = Math.min(100, state.progress + increment);
				// const index = Math.floor(nextProgress / 100 * modulesToDownload.size);

				if (current.status === "pending") {
					set((state) => {
						const newModuleProgress = [...state.moduleProgress];
						newModuleProgress[activeIndex] = { ...current, status: "preparing" };
						return { moduleProgress: newModuleProgress };
					});

					try {
						const papers = await prepareModuleForDownload(current.module.code);
						alert(JSON.stringify(papers, null, 2));
						const currentState = get();
						const currentMod = currentState.moduleProgress[activeIndex];
						if (!currentMod || currentMod.status !== "preparing") return;

						const currentPapers = papers.map((paper) => ({
							...paper,
							available: Math.random() < 0.9, // 90% chance the paper is available
						}));

						// Simulate a random failure 10% of the time when starting a module
						const failed = Math.random() < 0.1;

						set((state) => {
							const newModuleProgress = [...state.moduleProgress];
							const mod = newModuleProgress[activeIndex];
							if (mod.status !== "preparing") return {}; // Double-check inside set

							newModuleProgress[activeIndex] = {
								...mod,
								status: failed ? "failed" : "downloading",
								progress: failed ? 100 : 0,
								papers: currentPapers,
							};
							return { moduleProgress: newModuleProgress };
						});
					} catch (error) {
						console.error("Error preparing module for download:", error);
						set((state) => {
							const newModuleProgress = [...state.moduleProgress];
							const mod = newModuleProgress[activeIndex];
							if (mod.status !== "preparing") return {};

							newModuleProgress[activeIndex] = {
								...mod,
								status: "failed",
								progress: 100,
							};
							return { moduleProgress: newModuleProgress };
						});
					}
					return; // Skip progress increment logic until fetching is complete
				}

				if (current.status === "downloading") {
					const fluctuation = 0.7 + Math.random() * 0.6;
					const increment = baseIncrement * speedFactor * fluctuation;
					// const nextProgress = Math.min(100, current.progress + increment);
					// const nextProgress = Math.min(100, (current.papers.filter(p => p.downloaded).length / current.papers.length) * 100 + increment);
					set((state) => {
						const current = state.moduleProgress[activeIndex]; // Re-read current state
						if (!current || current.status !== "downloading") return {};
						const currentProgress = current.progress ?? 0;
						const nextProgress = Math.min(100, currentProgress + increment);
						// console.log(`Module ${current.module.code.prefix}${current.module.code.number}: nextProgress=${nextProgress}`);
						const newStatus = nextProgress >= 100 ? "completed" : "downloading";

						const newModuleProgress = [...state.moduleProgress];
						// newModuleProgress[activeIndex] = {
						// 	...current,
						// 	status: newStatus,
						// 	progress: nextProgress,
						// };
						newModuleProgress[activeIndex] = {
							...current,
							status: newStatus,
							progress: nextProgress,
							papers: current.papers.map((p, index) => {
								if (p.downloaded || !p.available) return p; // Skip if already downloaded or unavailable
								// Simulate download completion based on progress
								const paperProgressThreshold = current.papers.length > 0 
									? ((index + 1) / current.papers.length) * 100 
									: 100;
								console.log(`Module ${current.module.code.prefix}${current.module.code.number} - Paper ${index + 1}: nextProgress=${nextProgress}, threshold=${paperProgressThreshold}`);
								if (nextProgress >= paperProgressThreshold) {
									return { ...p, downloaded: true };
								}
								return p;
							}),
						};
						return { moduleProgress: newModuleProgress };
					});
				}

				return { moduleProgress: newModuleProgress };
		}, 200); // Update every 200ms for smooth progress bar
	},

	handleDownload: () => {
		const { status, startSimulation } = get();
		const { isOnline, isConnected } = useConnectionStore.getState();
		const selectedCount = useSelectionStore.getState().selectedModules.size;

		if (status !== "idle" && status !== "paused") return;
		if (!isOnline || !isConnected || selectedCount === 0) {
			if (!isOnline || !isConnected) set({ status: "error" });
			return;
		}

		// if (Math.random() < 0.5) {
		// 	// Simulate a random failure 50% of the time to test error handling
		// 	set({ status: "error" });
		// 	return;
		// }

		if (status === "idle") {
			const selectedModules = Array.from(
				useSelectionStore.getState().selectedModules
			);
			const modulesToDownload = selectedModules.map((m) => ({
				module: m,
				status: "pending" as const,
				progress: 0,
				papers: [],
			}));
			set({ status: "downloading", moduleProgress: modulesToDownload });
		} else {
			set({ status: "downloading" });
		}
		startSimulation();
	},

	handlePause: () => {
		const { status } = get();
		if (status !== "downloading") return;
		if (downloadInterval) {
			clearInterval(downloadInterval);
			downloadInterval = null;
		}
		set({ status: "paused" });
	},

	handleRetry: () => {
		const { isOnline, isConnected } = useConnectionStore.getState();
		if (!isOnline || !isConnected) return;
		if (downloadInterval) {
			clearInterval(downloadInterval);
			downloadInterval = null;
		}
		// Reset failed modules back to pending to retry them
		const { moduleProgress } = get();
		const resetProgress = moduleProgress.map((m) =>
			m.status === "failed"
				? { ...m, status: "pending" as const, progress: 0, papers: [] } // Reset papers so they re-evaluate availability
				: m
		);

		set({ status: "idle", moduleProgress: resetProgress });
		get().handleDownload();
	},

	handleCancel: () => {
		if (downloadInterval) {
			clearInterval(downloadInterval);
			downloadInterval = null;
		}
		set({ status: "idle", moduleProgress: [] });
	},
}));

export default function useDownload() {
	const { isOnline, isConnected } = useConnection();
	const selectedCount = useSelectionStore((s) => s.selectedModules.size);
	const status = useDownloadStore((s) => s.status);
	const moduleProgress = useDownloadStore((s) => s.moduleProgress);
	const handleDownload = useDownloadStore((s) => s.handleDownload);
	const handlePause = useDownloadStore((s) => s.handlePause);
	const handleRetry = useDownloadStore((s) => s.handleRetry);
	const handleCancel = useDownloadStore((s) => s.handleCancel);

	// Derived State
	const totalModules = moduleProgress.length;
	// const completedOrFailed = moduleProgress.filter(
	// 	(m) => m.status === "completed" || m.status === "failed"
	// ).length;
	// const overallProgress =
	// 	totalModules > 0 ? (completedOrFailed / totalModules) * 100 : 0;
	console.log("moduleProgress", moduleProgress);
	// const overallProgress = moduleProgress.reduce((acc, m) => acc + m.progress, 0) / (totalModules || 1);
	const overallProgress = moduleProgress.length > 0 
        ? (moduleProgress.reduce((acc, m) => acc + (m.progress || 0), 0) / totalModules) 
        : 0;

	const activeIndex = moduleProgress.findIndex(
		(m) => m.status === "downloading" || m.status === "pending" || m.status === "preparing"
	);
	const currentModule =
		activeIndex !== -1 ? moduleProgress[activeIndex].module : null;
	const currentModuleIndex = activeIndex !== -1 ? activeIndex : 0;
	const failedCount = moduleProgress.filter((m) => m.status === "failed").length;

	return {
		downloadState: status,
		downloadProgress: overallProgress,
		moduleProgress,
		failedCount,
		canDownload:
			isOnline &&
			isConnected &&
			status === "idle" &&
			selectedCount > 0,
		handleDownload: handleDownload,
		handlePause: handlePause,
		handleRetry: handleRetry,
		handleCancel: handleCancel,
		// isDownloadActive: status === "downloading",
		isDownloadActive: status !== "idle",
		currentModule,
		currentModuleIndex,
	};
}
