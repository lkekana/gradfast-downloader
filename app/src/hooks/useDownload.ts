import { useCallback, useEffect, useRef, useState } from "react";
import { useToast } from "./use-toast";
import {useConnection} from "../contexts/connection";

const useDownload = (
	selectedIds: Set<string>,
	clearSelection: () => void,
) => {
	const {
		isOnline,
		isConnected,
		isReconnecting,
		reconnectError,
		attemptReconnect,
	} = useConnection();
	const { toast } = useToast();

	// Unified download state management
	const [downloadState, setDownloadState] = useState<
		"idle" | "downloading" | "paused" | "error"
	>("idle");
	const [downloadProgress, setDownloadProgress] = useState(0);

	// Refs for managing the download simulation
	const downloadIntervalRef = useRef<number | null>(null);
	const progressRef = useRef(0); // Track progress independently for pause/resume
	// Realistic download simulation with pause/resume support
	const startDownloadSimulation = (resumeFrom = 0) => {
		if (resumeFrom >= 100) {
			// Already complete
			setDownloadProgress(100);
			return;
		}

		if (resumeFrom > 0) {
			setDownloadProgress(resumeFrom);
		}

		// Clear any existing interval
		if (downloadIntervalRef.current) {
			clearInterval(downloadIntervalRef.current);
		}

		// Base speed: ~5 seconds for full download at 100%
		// Adjust increment based on number of selected modules for realism
		const baseIncrement = 2; // % per tick
		const moduleCount = selectedIds.size;
		const speedFactor = Math.max(0.5, Math.min(2, 3 / moduleCount)); // More modules = slower per-item

		const interval = setInterval(() => {
			// Only proceed if still in downloading state
			// if (downloadState !== "downloading") {
			// 	clearInterval(interval);
			// 	return;
			// }

			setDownloadProgress((prev) => {
				// Add variable increment for realism (network fluctuation simulation)
				const fluctuation = 0.7 + Math.random() * 0.6; // 0.7x to 1.3x speed
				const increment = baseIncrement * speedFactor * fluctuation;
				const nextProgress = Math.min(100, prev + increment);

				// Check for completion
				if (nextProgress >= 100) {
					clearInterval(interval);
					downloadIntervalRef.current = null;
					toast({
						title: "🎉 Download(s) complete",
						// description: `Your selected modules have been downloaded to ${downloadPath}`,
						variant: "default",
					});

					// Small delay before resetting to show 100%
					setTimeout(() => {
						setDownloadState("idle");
						setDownloadProgress(0);
						progressRef.current = 0;
						clearSelection();
					}, 400);

					return 100;
				}

				return nextProgress;
			});
		}, 200); // Update every 200ms for smooth progress bar

		downloadIntervalRef.current = interval;
	};

	// Main download handler - starts or resumes download
	const handleDownload = () => {
		// Validation: can only start if idle or paused, with valid conditions
		if (downloadState !== "idle" && downloadState !== "paused") return;
		if (!isOnline || !isConnected) {
			setDownloadState("error");
			return;
		}
		if (selectedIds.size === 0) return;

		if (Math.random() < 0.5) {
			// Simulate a random failure 50% of the time to test error handling
			setDownloadState("error");
			return;
		}

		// Transition to downloading state
		setDownloadState("downloading");

		// Start simulation from current progress (handles resume)
		startDownloadSimulation(progressRef.current);
	};

	// Pause the download - preserves progress for resume
	const handlePause = () => {
		if (downloadState !== "downloading") return;

		// Stop the interval but keep progress
		if (downloadIntervalRef.current) {
			clearInterval(downloadIntervalRef.current);
			downloadIntervalRef.current = null;
		}

		setDownloadState("paused");
		// progressRef already synced via useEffect, no need to update separately
	};

	// Retry after error
	const handleRetry = () => {
		if (!isOnline || !isConnected) return;
		setDownloadState("idle");
		setDownloadProgress(0);
		progressRef.current = 0;
		handleDownload();
	};

	// Cancel download completely
	const handleCancel = () => {
		if (downloadIntervalRef.current) {
			clearInterval(downloadIntervalRef.current);
			downloadIntervalRef.current = null;
		}
		setDownloadState("idle");
		setDownloadProgress(0);
		progressRef.current = 0;
	};

	// Derived: can we download?
	const canDownload =
		isOnline && isConnected && downloadState === "idle" && selectedIds.size > 0;

	// Cleanup interval on unmount
	useEffect(() => {
		return () => {
			if (downloadIntervalRef.current !== null) {
				clearInterval(downloadIntervalRef.current);
			}
		};
	}, []);

	// Sync progressRef with state for accurate pause/resume
	useEffect(() => {
		progressRef.current = downloadProgress;
	}, [downloadProgress]);

	// Selection handlers - block when actively downloading
	const isDownloadActive = downloadState === "downloading";

	return {
		downloadState,
		downloadProgress,
		canDownload,
		handleDownload,
		handlePause,
		handleRetry,
		handleCancel,
		isDownloadActive,
	};
};

export default useDownload;
