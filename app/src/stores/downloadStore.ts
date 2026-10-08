import { create } from "zustand";
import { useConnection, useConnectionStore } from "@/stores/connectionStore";
import { useSelectionStore } from "@/stores/selectionStore";
import { type NamingPattern, useSettingsStore } from "./useSettingsStore";
import type { Module, PastPaper } from "@/lib/types";
import { getPaperAvailabilityOptions, getPastPapersOptions, useApiStore } from "./apiStore";
import pLimit from "p-limit";
import mime from "mime";
import { queryClient } from "@/lib/queryClient";
import { toast } from "sonner";

type DownloadStateStatus = "idle" | "downloading" | "paused" | "error";
export type ModuleStatus = "pending" | "preparing" | "downloading" | "completed" | "failed";
export type PastPaperDownloadItem = {
	paper: PastPaper;
	available: boolean;
	downloaded: boolean;
};

export interface ModuleProgressState {
	module: Module;
	dirHandle: FileSystemDirectoryHandle;
	status: ModuleStatus;
	papers: PastPaperDownloadItem[]; // Track progress for each past paper
	progress: number; // 0 to 100 for this specific module
}

interface DownloadState {
	status: DownloadStateStatus;
	moduleProgress: ModuleProgressState[];
	abortController: AbortController | null;

	prepareModuleForDownload: (moduleCode: { prefix: string; number: number }) => Promise<PastPaperDownloadItem[]>;
	addTask: (module: Module, dirHandle: FileSystemDirectoryHandle, papers?: PastPaper[]) => void;
	processQueue: () => Promise<void>;
	startSimulation: () => void;
	handleDownload: () => Promise<void>;
	startSpecificDownload: (module: Module, dirHandle: FileSystemDirectoryHandle, papers?: PastPaper[]) => void;
	handlePause: () => void;
	handleResume: () => void;
	handleCancel: () => void;
}

function getExtensionFromMime(contentType: string): string | null {
	// mime.getExtension automatically strips charset metadata if present
	return mime.getExtension(contentType);
}

function constructDefaultFilename(moduleID: string, paper: PastPaper, contentType: string): string {
	const urlFileName = new URL(paper.url).pathname.split("/").pop();
	if (!urlFileName) {
		const extension = getExtensionFromMime(contentType) || "pdf";
		return `${moduleID} - ${paper.year} - ${paper.description} ${paper.memo === "yes" ? "MEMO" : ""}.${extension}`.trim();
	} else {
		return decodeURIComponent(urlFileName);
	}
}

function getFileName(pattern: NamingPattern, module: Module, paper: PastPaper, contentType: string): string {
	if (pattern === "default") {
		return constructDefaultFilename(`${module.code.prefix}${module.code.number}`, paper, contentType);
	}
	const replacements: Record<string, string> = {
		"{code}": `${module.code.prefix}${module.code.number}`,
		"{name}": module.name,
		"{year}": paper.year,
		"{type}": paper.description,
	};

	let fileName = pattern as string;
	for (const [key, value] of Object.entries(replacements)) {
		fileName = fileName.replace(new RegExp(key, "g"), value);
	}

	const extension = getExtensionFromMime("application/pdf") || "pdf";
	if (!fileName.endsWith(`.${extension}`)) {
		fileName += `.${extension}`;
	}

	return fileName;
}

// Interval kept outside state so it doesn't trigger re-renders
let downloadInterval: ReturnType<typeof setInterval> | null = null;

export const useDownloadStore = create<DownloadState>((set, get) => ({
	status: "idle",
	moduleProgress: [],
	abortController: null,

	prepareModuleForDownload: async (moduleCode) => {
		const apiFetch = useApiStore.getState().apiFetch;
		const options = getPastPapersOptions(moduleCode, apiFetch);
		const papers = await queryClient.query({
		  ...options,
		  staleTime: 0, // Force refetch to get the latest data
		});
		return papers.map((paper) => ({
			paper,
			downloaded: false,
			available: false,
		}));
	},

	addTask: (module, dirHandle, papers) => {
		set((state) => {
			const exists = state.moduleProgress.some(
				(m) =>
					m.module.code.prefix === module.code.prefix &&
					m.module.code.number === module.code.number &&
					m.status !== "completed" &&
					m.status !== "failed"
			);
			if (exists) return {};

			const initialPapers = papers
				? papers.map((p) => ({ paper: p, available: false, downloaded: false }))
				: [];

			return {
				moduleProgress: [
					...state.moduleProgress,
					{
						module,
						dirHandle,
						status: "pending",
						progress: 0,
						papers: initialPapers,
					},
				],
			};
		});
	},

	processQueue: async () => {
		console.log("Starting processQueue with status:", get().status);
		console.log("Current moduleProgress:", get().moduleProgress);
		if (get().moduleProgress.some((m) => m.status === "downloading" || m.status === "preparing")) return;

		while (get().status === "downloading") {
			const state = get();
			const currentIndex = state.moduleProgress.findIndex((m) => m.status === "pending");

			if (currentIndex === -1) {
				const failedCount = state.moduleProgress.filter((m) => m.status === "failed").length;
				setTimeout(() => {
					toast.success(failedCount > 0
						? `Download complete (${failedCount} failed)`
						: "Download complete", { position: "top-center" });
				}, 500);				set({ status: "idle" });
				setTimeout(() => {
					useSelectionStore.getState().clearSelection();
				}, 1000);
				return;
			}

			const current = state.moduleProgress[currentIndex];
			set((state) => {
				const newProgress = [...state.moduleProgress];
				newProgress[currentIndex] = { ...current, status: "preparing" };
				return { moduleProgress: newProgress };
			});

			try {
				let papersToProcess = current.papers.map((p) => p.paper);
				const isExplicitSelection = papersToProcess.length > 0;

				if (!isExplicitSelection) {
					const fetched = await get().prepareModuleForDownload(current.module.code);
					papersToProcess = fetched.map((p) => p.paper);

					const { includePaperTypes, yearRange } = useSettingsStore.getState();
					papersToProcess = papersToProcess.filter((paper) => {
						switch (paper.category.toLowerCase()) {
							case "exams":
							case "exam":
							case "exam opportunities":
								return includePaperTypes.exams;
							case "semester tests":
							case "semester test":
								return includePaperTypes.semesterTests;
							case "class tests":
								return includePaperTypes.classTests;
							case "practical tests":
								return includePaperTypes.practicals;
							case "tutorials": 
							case "tutorial tests": 
								return includePaperTypes.tutorials;
							default:
								return includePaperTypes.other;
						}
					});
					papersToProcess = papersToProcess.filter((paper) => {
						const year = parseInt(paper.year, 10);
						if (year < 2000 || Number.isNaN(year)) return true; // include papers with invalid years
						return year >= yearRange[0] && year <= yearRange[1];
					});
				}

				if (papersToProcess.length === 0) {
					alert(`No past papers found for ${current.module.code.prefix}${current.module.code.number} with the current filter settings.`);
					set((state) => {
						const newProgress = [...state.moduleProgress];
						newProgress[currentIndex] = { ...newProgress[currentIndex], status: "completed", progress: 100 };
						return { moduleProgress: newProgress };
					});
					continue;
				}

				const { parallelDownloads } = useSettingsStore.getState();
				const limit = pLimit(parallelDownloads || 3);
				const signal = get().abortController?.signal;

				const availabilityPromises = papersToProcess.map((paper) =>
					limit(async () => {
						try {
							const options = getPaperAvailabilityOptions(paper, useApiStore.getState().proxyFetch);
							const isAvailable = await queryClient.query(options);
							return { paper, available: isAvailable };
						} catch (err: any) {
							if (err.name === "AbortError") throw err;
							return { paper, available: false };
						}
					})
				);

				const results = await Promise.all(availabilityPromises);
				const papersWithAvailability = results.map((r) => ({
					paper: r.paper,
					available: r.available,
					downloaded: false,
				}));

				set((state) => {
					const newProgress = [...state.moduleProgress];
					newProgress[currentIndex] = {
						...newProgress[currentIndex],
						papers: papersWithAvailability,
						status: "downloading",
					};
					return { moduleProgress: newProgress };
				});

				const availablePapers = papersWithAvailability.filter((p) => p.available);
				if (availablePapers.length === 0) {
					set((state) => {
						const newProgress = [...state.moduleProgress];
						newProgress[currentIndex] = { ...newProgress[currentIndex], status: "completed", progress: 100 };
						return { moduleProgress: newProgress };
					});
					continue;
				}

				let destinationHandle = current.dirHandle;
				const { moduleSubfolders, namingPattern } = useSettingsStore.getState();

				if (moduleSubfolders) {
					// ensure the names are cleaned for filesystem compatibility (alphanumeric and spaces only)
					const cleanedModuleCode = `${current.module.code.prefix}${current.module.code.number}`.replace(/[^a-zA-Z0-9 ]/g, "").trim();
					const cleanedModuleName = current.module.name.replace(/[^a-zA-Z0-9 ]/g, "").trim();
					destinationHandle = await current.dirHandle.getDirectoryHandle(
						`${cleanedModuleCode} - ${cleanedModuleName}`,
						{ create: true }
					);
				}

				let completedCount = 0;

				const downloadPromises = availablePapers.map((item) =>
					limit(async () => {
						if (get().status !== "downloading") throw new Error("Paused");

						const blob = await (await useApiStore.getState().proxyFetch(item.paper.url, { signal })).blob();
						const fileName = getFileName(namingPattern, current.module, item.paper, blob.type);

						const fileHandle = await destinationHandle.getFileHandle(fileName, { create: true });
						const writableStream = await fileHandle.createWritable();
						await writableStream.write(blob);
						await writableStream.close();

						set((state) => {
							const newProgress = [...state.moduleProgress];
							const mod = newProgress[currentIndex];
							const newPapers = mod.papers.map((p) =>
								p.paper.url === item.paper.url ? { ...p, downloaded: true } : p
							);
							completedCount++;
							const progress = Math.round((completedCount / availablePapers.length) * 100);
							newProgress[currentIndex] = { ...mod, papers: newPapers, progress };
							return { moduleProgress: newProgress };
						});
					})
				);

				await Promise.all(downloadPromises);

				set((state) => {
					const newProgress = [...state.moduleProgress];
					newProgress[currentIndex] = { ...newProgress[currentIndex], status: "completed", progress: 100 };
					return { moduleProgress: newProgress };
				});
			} catch (err: any) {
				if (err.name === "AbortError" || err.message === "Paused") {
					console.log("Queue paused or aborted");
					set((state) => {
						const newProgress = [...state.moduleProgress];
						newProgress[currentIndex] = { ...newProgress[currentIndex], status: "pending" };
						return { moduleProgress: newProgress };
					});
					return;
				}
				console.error("Module failed", err);
				set((state) => {
					const newProgress = [...state.moduleProgress];
					newProgress[currentIndex] = { ...newProgress[currentIndex], status: "failed", progress: 100 };
					return { moduleProgress: newProgress };
				});
			}
		}
	},

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

		const prepareModuleForDownload = get().prepareModuleForDownload;

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
					setTimeout(() => {
						toast.success(failedCount > 0
							? `🎉 Download complete (${failedCount} failed)`
							: "🎉 Download complete", { position: "top-center" });
					}, 1000);

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
					await prepareModuleForDownload(current.module.code).then((papers) => {
						currentPapers = papers;
					});
				}

				if (current.status === "pending") {
					set((state) => {
						const newModuleProgress = [...state.moduleProgress];
						newModuleProgress[activeIndex] = { ...current, status: "preparing" };
						return { moduleProgress: newModuleProgress };
					});

					try {
						const papers = await prepareModuleForDownload(current.module.code);
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
					set((state) => {
						const current = state.moduleProgress[activeIndex]; // Re-read current state
						if (!current || current.status !== "downloading") return {};
						const currentProgress = current.progress ?? 0;
						const nextProgress = Math.min(100, currentProgress + increment);
						const newStatus = nextProgress >= 100 ? "completed" : "downloading";

						const newModuleProgress = [...state.moduleProgress];
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

	handleDownload: async () => {
		const { status } = get();
		const { isOnline, isConnected } = useConnectionStore.getState();
		const selectedModules = Array.from(useSelectionStore.getState().selectedModules);
		const selectedCount = selectedModules.length;

		if (status !== "idle" && status !== "paused") return;
		if (!isOnline || !isConnected || selectedCount === 0) {
			if (!isOnline || !isConnected) set({ status: "error" });
			return;
		}

		// startSimulation();
		try {
			const dirHandle = await window.showDirectoryPicker({ mode: "readwrite" });
			for (const module of selectedModules) {
				get().addTask(module, dirHandle);
			}
			set({ status: "downloading", abortController: new AbortController() });
			get().processQueue();
		} catch (err) {
			console.log("User cancelled directory picker", err);
		}
	},

	startSpecificDownload: async (module, dirHandle, papers) => {
		get().addTask(module, dirHandle, papers);
		if (get().status !== "downloading") {
			set({ status: "downloading", abortController: new AbortController() });
			get().processQueue();
		}
		alert("Specific download started for module: " + module.code.prefix + module.code.number);
	},

	handlePause: () => {
		const { status } = get();
		if (status === "downloading") {
			get().abortController?.abort();
			set({ status: "paused" });
			if (downloadInterval) {
				clearInterval(downloadInterval);
				downloadInterval = null;
			}
		}
	},

	handleResume: () => {
		const { isOnline, isConnected } = useConnectionStore.getState();
		if (!isOnline || !isConnected) return;
		if (get().status === "paused") {
			set({ status: "downloading", abortController: new AbortController() });
			get().processQueue();
			if (downloadInterval) {
				clearInterval(downloadInterval);
				downloadInterval = null;
			}
		}

	},

	handleCancel: () => {
		get().abortController?.abort();
		if (downloadInterval) {
			clearInterval(downloadInterval);
			downloadInterval = null;
		}
		set({ status: "idle", moduleProgress: [], abortController: null });
	},
}));

export default function useDownload() {
	const { isOnline, isConnected } = useConnection();
	const selectedCount = useSelectionStore((s) => s.selectedModules.size);
	const status = useDownloadStore((s) => s.status);
	const moduleProgress = useDownloadStore((s) => s.moduleProgress);
	const handleDownload = useDownloadStore((s) => s.handleDownload);
	const handlePause = useDownloadStore((s) => s.handlePause);
	const handleResume = useDownloadStore((s) => s.handleResume);
	const handleCancel = useDownloadStore((s) => s.handleCancel);
	const startSpecificDownload = useDownloadStore((s) => s.startSpecificDownload);

	// Derived State
	const totalModules = moduleProgress.length;
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
		handleDownload,
		handlePause,
		handleResume,
		handleCancel,
		startSpecificDownload,
		isDownloadActive: status !== "idle",
		currentModule,
		currentModuleIndex,
	};
}
