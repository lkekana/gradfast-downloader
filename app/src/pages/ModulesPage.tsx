
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
import { useToast } from "@/hooks/use-toast";
import { downloadPath } from "@/lib/api";
import {
	cachedModules,
	periods,
} from "@/lib/data";
import { useModuleSelection } from "@/stores/selectionStore";
import { useModuleFilters } from "@/stores/filterStore";
import useDownload from "@/stores/downloadStore";

export default function ModulesPage() {
	const { toast } = useToast();
	const filters = useModuleFilters(cachedModules);
	const {
		filteredModules,
		uniquePrefixes,
		uniqueFaculties,
		activeFilterCount,
	} = filters;
	const { isDownloadActive, downloadState } = useDownload();
	const {
		selectAllVisible,
		clearSelection,
		selectByPrefix,
		// selectByFaculty,
		// selectByPeriod,
		selectedCount,
	} = useModuleSelection();

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
						onClearFilters={() => {
							filters.clearAllFilters();
							filters.setSearchQuery("");
							// setPrefixFilter([]);
							// setFacultyFilter([]);
							// setPeriodFilter([]);
						}}
					/>

					{/* Sticky Download UI - Dynamic State */}
					{selectedCount > 0 && (
						<>
							{downloadState === "downloading" && (
								<DownloadProgressBar
									// downloadPath={downloadPath}
								/>
							)}

							{downloadState === "paused" && (
								<DownloadPaused
									// downloadPath={downloadPath}
								/>
							)}

							{downloadState === "error" && (
								<DownloadError
								/>
							)}

							{downloadState === "idle" && (
								<DownloadBar
									// activeFilterCount={activeFilterCount}
								/>
							)}
						</>
					)}
				</main>
			</div>
	);
}
