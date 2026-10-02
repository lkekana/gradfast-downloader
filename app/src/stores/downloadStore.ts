import { create } from "zustand";
import { toast } from "@/hooks/use-toast"; // Imported directly as you noted!
import { useConnectionStore } from "@/stores/connectionStore";
import { useSelectionStore } from "@/stores/selectionStore";

type DownloadStateStatus = "idle" | "downloading" | "paused" | "error";

interface DownloadState {
	status: DownloadStateStatus;
	progress: number;

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

	// Realistic download simulation with pause/resume support
	startSimulation: () => {
		if (downloadInterval) clearInterval(downloadInterval);

		const { progress } = get();
		if (progress >= 100) return set({ progress: 100 });
		if (progress > 0) set({ progress: progress });

		// Base speed: ~5 seconds for full download at 100%
		// Adjust increment based on number of selected modules for realism
		const baseIncrement = 2; // % per tick
		const moduleCount = useSelectionStore.getState().selectedIds.size || 1;
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
				return { progress: nextProgress };
			});
		}, 200); // Update every 200ms for smooth progress bar
	},

	handleDownload: () => {
		const { status, startSimulation } = get();
		const { isOnline, isConnected } = useConnectionStore.getState();
		const { selectedIds } = useSelectionStore.getState();

		if (status !== "idle" && status !== "paused") return;
		if (!isOnline || !isConnected || selectedIds.size === 0) {
			if (!isOnline || !isConnected) set({ status: "error" });
			return;
		}

		if (Math.random() < 0.5) {
			// Simulate a random failure 50% of the time to test error handling
			set({ status: "error" });
			return;
		}

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

// THIN WRAPPER: Preserves your exact original API (minus the arguments, since it reads from stores now)
export default function useDownload() {
	const store = useDownloadStore();
	const { isOnline, isConnected } = useConnectionStore();
	const { selectedIds } = useSelectionStore();

	return {
		downloadState: store.status,
		downloadProgress: store.progress,
		canDownload:
			isOnline &&
			isConnected &&
			store.status === "idle" &&
			selectedIds.size > 0,
		handleDownload: store.handleDownload,
		handlePause: store.handlePause,
		handleRetry: store.handleRetry,
		handleCancel: store.handleCancel,
		isDownloadActive: store.status === "downloading",
	};
}
