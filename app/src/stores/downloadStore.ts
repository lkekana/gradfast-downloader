import { create } from "zustand";
import { toast } from "@/hooks/use-toast"; // Imported directly as you noted!
import { useConnection, useConnectionStore } from "@/stores/connectionStore";
import { useSelectionStore } from "@/stores/selectionStore";
import type { Module } from "@/lib/types";

type DownloadStateStatus = "idle" | "downloading" | "paused" | "error";

interface DownloadState {
	status: DownloadStateStatus;
	progress: number;
	currentModule: Module | null;
	currentModuleIndex: number;

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
	progress: 0,
	currentModule: null,
	currentModuleIndex: 0,

	// Realistic download simulation with pause/resume support
	startSimulation: () => {
		if (downloadInterval) clearInterval(downloadInterval);

		const { progress } = get();
		if (progress >= 100) return set({ progress: 100 });
		if (progress > 0) set({ progress: progress });

		const modulesToDownload = useSelectionStore.getState().selectedModules;

		// Base speed: ~5 seconds for full download at 100%
		// Adjust increment based on number of selected modules for realism
		// const baseIncrement = 2; // % per tick
		const baseIncrement = 1; // % per tick
		const moduleCount = modulesToDownload.size || 1; // Avoid division by zero
		const speedFactor = Math.max(0.5, Math.min(2, 3 / moduleCount)); // More modules = slower per-item

		downloadInterval = setInterval(() => {
			set((state) => {
				// Only proceed if still in downloading state
				if (state.status !== "downloading") {
					if (downloadInterval) clearInterval(downloadInterval);
					return {};
				}

				// Add variable increment for realism (network fluctuation simulation)
				const fluctuation = 0.7 + Math.random() * 0.6; // 0.7x to 1.3x speed
				const increment = baseIncrement * speedFactor * fluctuation;
				const nextProgress = Math.min(100, state.progress + increment);
				const index = Math.floor(nextProgress / 100 * modulesToDownload.size);

				// Check for completion
				if (nextProgress >= 100) {
					if (downloadInterval) clearInterval(downloadInterval);
					downloadInterval = null;

					toast({
						title: "🎉 Download(s) complete",
						// description: `Your selected modules have been downloaded to ${downloadPath}`,
						variant: "default",
					});

					// Small delay before resetting to show 100%
					setTimeout(() => {
						useSelectionStore.getState().clearSelection();
						set({ status: "idle", progress: 0 });
					}, 400);

					return { progress: 100 };
				}
				// return { progress: nextProgress, currentModule: Array.from(modulesToDownload)[Math.floor(nextProgress / 100 * modulesToDownload.size)]};
				return { progress: nextProgress, currentModuleIndex: index, currentModule: Array.from(modulesToDownload)[index] };
			});
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

		set({ status: "downloading" });
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
		set({ status: "idle", progress: 0 });
		get().handleDownload();
	},

	handleCancel: () => {
		if (downloadInterval) {
			clearInterval(downloadInterval);
			downloadInterval = null;
		}
		set({ status: "idle", progress: 0 });
	},
}));

export default function useDownload() {
	const { isOnline, isConnected } = useConnection();
	const selectedCount = useSelectionStore((s) => s.selectedModules.size);
	const status = useDownloadStore((s) => s.status);
	const progress = useDownloadStore((s) => s.progress);
	const handleDownload = useDownloadStore((s) => s.handleDownload);
	const handlePause = useDownloadStore((s) => s.handlePause);
	const handleRetry = useDownloadStore((s) => s.handleRetry);
	const handleCancel = useDownloadStore((s) => s.handleCancel);
	const currentModule = useDownloadStore((s) => s.currentModule);
	const currentModuleIndex = useDownloadStore((s) => s.currentModuleIndex);

	return {
		downloadState: status,
		downloadProgress: progress,
		canDownload:
			isOnline &&
			isConnected &&
			status === "idle" &&
			selectedCount > 0,
		handleDownload: handleDownload,
		handlePause: handlePause,
		handleRetry: handleRetry,
		handleCancel: handleCancel,
		isDownloadActive: status === "downloading",
		currentModule: currentModule,
		currentModuleIndex: currentModuleIndex,
	};
}
