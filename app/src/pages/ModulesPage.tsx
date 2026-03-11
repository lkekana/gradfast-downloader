
import { useEffect, useRef, useState } from "react";
import DownloadBar from "@/components/DownloadBar";
import { DownloadError } from "@/components/DownloadError";
import DownloadPaused from "@/components/DownloadPaused";
import DownloadProgressBar from "@/components/DownloadProgressBar";
import FilterDropdown from "@/components/FilterDropdown";
import FilterSummaryBar from "@/components/FilterSummaryBar";
import { ModulesToolbar } from "@/components/ModulesPageToolbar";
import ModulesTable from "@/components/ModuleTable";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
	TooltipProvider,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import useConnection from "@/hooks/useConnection";
import { useModuleFilters } from "@/hooks/useModuleFilters";
import { useModuleSelection } from "@/hooks/useModuleSelection";
import { downloadPath } from "@/lib/api";
import {
	modules,
	periods,
} from "@/lib/data";

export default function ModulesPage() {
	const {
		isOnline,
		isConnected,
		// isReconnecting,
		reconnectError,
		// attemptReconnect,
	} = useConnection();
	const { toast } = useToast();
	const filters = useModuleFilters();
	const {
		filteredModules,
		uniquePrefixes,
		uniqueFaculties,
		activeFilterCount,
	} = filters;

	// Unified download state management
	const [downloadState, setDownloadState] = useState<
		"idle" | "downloading" | "paused" | "error"
	>("idle");
	const [downloadProgress, setDownloadProgress] = useState(0);
	// Selection handlers - block when actively downloading
	const isDownloadActive = downloadState === "downloading";

	const {
		selectedIds,
		toggleModule,
		selectAllVisible,
		clearSelection,
		selectByPrefix,
		// selectByFaculty,
		// selectByPeriod,
		// selectionCount,
	} = useModuleSelection(modules, isDownloadActive);

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

	// Helper: Generate label text for filter buttons
	const getFilterLabel = (
		activeCount: number,
		total: number,
		label: string,
		singular: string,
	) => {
		if (activeCount === 0 || activeCount === total) {
			return `Filter by ${label}`;
		}
		return `${activeCount} ${activeCount === 1 ? singular : label} selected`;
	};

	// Helper: Determine if a filter is "active" (not showing all)
	const isFilterActive = (filterArray: string[], totalOptions: number) => {
		return filterArray.length > 0 && filterArray.length < totalOptions;
	};

	// Helper: Format paper counts for hover preview
	// const formatPaperSummary = (papers?: ModuleWithPapers["pastPapers"]) => {
	// 	if (!papers) return "No past papers available";
	// 	const items = [
	// 		papers.exams > 0 &&
	// 			`📝 ${papers.exams} exam${papers.exams > 1 ? "s" : ""}`,
	// 		papers.semesterTests > 0 &&
	// 			`🧪 ${papers.semesterTests} semester test${papers.semesterTests > 1 ? "s" : ""}`,
	// 		papers.classTests > 0 &&
	// 			`✏️ ${papers.classTests} class test${papers.classTests > 1 ? "s" : ""}`,
	// 		papers.practicals > 0 &&
	// 			`🔬 ${papers.practicals} practical${papers.practicals > 1 ? "s" : ""}`,
	// 		papers.tutorials > 0 &&
	// 			`📚 ${papers.tutorials} tutorial${papers.tutorials > 1 ? "s" : ""}`,
	// 	].filter(Boolean);
	// 	return items.length > 0 ? items.join(" • ") : "No past papers available";
	// };

	return (
		<TooltipProvider>
			<div className="flex flex-col h-screen bg-background">
				<ModulesToolbar />

				{/* Main Content */}
				<main className="flex-1 p-4 overflow-hidden flex flex-col">
					{/* Selection Toolbar */}
					<div className="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b">
						<Input
							placeholder="Search modules..."
							className="w-64"
							value={filters.searchQuery}
							onChange={(e) => filters.setSearchQuery(e.target.value)}
							disabled={isDownloadActive}
						/>

						<FilterDropdown
							singularLabel="period"
							pluralLabel="periods"
							items={periods}
							filteredItems={filters.periodFilter}
							setFilteredItems={filters.setPeriodFilter}
							isDownloading={isDownloadActive}
							isFilterActive={isFilterActive}
							getFilterLabel={getFilterLabel}
						/>

						<FilterDropdown
							singularLabel="faculty"
							pluralLabel="faculties"
							items={uniqueFaculties}
							filteredItems={filters.facultyFilter}
							setFilteredItems={filters.setFacultyFilter}
							isDownloading={isDownloadActive}
							isFilterActive={isFilterActive}
							getFilterLabel={getFilterLabel}
						/>

						<FilterDropdown
							singularLabel="prefix"
							pluralLabel="prefixes"
							items={uniquePrefixes}
							filteredItems={filters.prefixFilter}
							setFilteredItems={filters.setPrefixFilter}
							isDownloading={isDownloadActive}
							isFilterActive={isFilterActive}
							getFilterLabel={getFilterLabel}
							renderItem={(prefix) => <>{prefix}*</>}
						/>

						{/* Show only when any filter is active */}
						{activeFilterCount > 0 && (
							<Button
								variant="ghost"
								size="sm"
								onClick={filters.clearAllFilters}
								disabled={isDownloadActive}
								className="text-muted-foreground hover:text-foreground"
							>
								Clear all filters
							</Button>
						)}

						{/* Show only when a search query is entered */}
						{/* {filters.searchQuery && (
							<Button
								variant="ghost"
								size="sm"
								onClick={() => filters.setSearchQuery("")}
								disabled={isDownloadActive}
								className="text-muted-foreground hover:text-foreground"
							>
								Clear search
							</Button>
						)} */}

						<div className="flex items-center gap-2 ml-auto">
							<Button
								variant="outline"
								size="sm"
								onClick={() => selectAllVisible(filteredModules)} // could've also been `selectAllVisible.bind(null, filteredModules)`
								disabled={isDownloadActive}
							>
								Select all
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={clearSelection}
								disabled={isDownloadActive}
							>
								Clear
							</Button>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="outline"
										size="sm"
										disabled={isDownloadActive}
									>
										Select by prefix
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent>
									{uniquePrefixes.map((prefix) => (
										<DropdownMenuItem
											key={prefix}
											onClick={() => selectByPrefix(prefix)}
											className="font-mono text-xs"
										>
											{prefix}* modules
										</DropdownMenuItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>

					{/* Filter Summary Bar - Shows active filters as removable chips */}
					{activeFilterCount > 0 && (
						<FilterSummaryBar
							filterChips={filters.filterChips}
							removeFilterChip={filters.removeFilterChip}
							activeFilterCount={activeFilterCount}
							clearAllFilters={filters.clearAllFilters}
							isDownloading={isDownloadActive}
						/>
					)}

					{/* Module Table */}
					<ModulesTable
						filteredModules={filteredModules}
						selectedIds={selectedIds}
						toggleModule={toggleModule}
						selectAllVisible={() => selectAllVisible(filteredModules)} // could've also been `selectAllVisible.bind(null, filteredModules)`
						clearSelection={clearSelection}
						isDownloading={isDownloadActive}
						onClearFilters={() => {
							filters.clearAllFilters();
							filters.setSearchQuery("");
							// setPrefixFilter([]);
							// setFacultyFilter([]);
							// setPeriodFilter([]);
						}}
					/>

					{/* Sticky Download UI - Dynamic State */}
					{selectedIds.size > 0 && (
						<>
							{downloadState === "downloading" && (
								<DownloadProgressBar
									downloadProgress={downloadProgress}
									selectedCount={selectedIds.size}
									downloadPath={downloadPath}
									onPause={handlePause}
									onCancel={handleCancel}
								/>
							)}

							{downloadState === "paused" && (
								<DownloadPaused
									downloadProgress={downloadProgress}
									selectedCount={selectedIds.size}
									downloadPath={downloadPath}
									onResume={handleDownload}
									onCancel={handleCancel}
								/>
							)}

							{downloadState === "error" && (
								<DownloadError
									error={reconnectError || "Connection lost during download"}
									onRetry={handleRetry}
									onCancel={handleCancel}
								/>
							)}

							{downloadState === "idle" && (
								<DownloadBar
									selectedCount={selectedIds.size}
									activeFilterCount={activeFilterCount}
									canDownload={canDownload}
									isOnline={isOnline}
									isConnected={isConnected}
									onDownload={handleDownload}
								/>
							)}
						</>
					)}
				</main>
			</div>
		</TooltipProvider>
	);
}
