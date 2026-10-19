import {
	createFileRoute,
	stripSearchParams,
	useNavigate,
} from "@tanstack/react-router";
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
import { periods } from "@/lib/data";
import useDownload from "@/stores/downloadStore";
import { useFilterStore, useModuleFilters } from "@/stores/filterStore";
import { useModuleSelection } from "@/stores/selectionStore";

type ModuleSearch = {
	q: string;
	periods: string[];
	faculties: string[];
	prefixes: string[];
};

export const homeDefaultSearchState: ModuleSearch = {
	q: "",
	periods: [],
	faculties: [],
	prefixes: [],
};

export const Route = createFileRoute("/")({
	component: ModulesPage,
	loaderDeps: ({ search: { q, periods, faculties, prefixes } }) => ({
		q,
		periods,
		faculties,
		prefixes,
	}),
	loader: ({ deps: { q, periods, faculties, prefixes } }) => {
		useFilterStore.setState({
			searchQuery: q,
			periodFilter: periods,
			facultyFilter: faculties,
			prefixFilter: prefixes,
		});
	},
	validateSearch: (search: Record<string, unknown>): ModuleSearch => {
		// validate and parse the search params into a typed state
		return {
			q: (search?.q as string) || "",
			periods: Array.isArray(search?.periods) ? search.periods.map(String) : [],
			faculties: Array.isArray(search?.faculties)
				? search.faculties.map(String)
				: [],
			prefixes: Array.isArray(search?.prefixes)
				? search.prefixes.map(String)
				: [],
		};
	},
	search: {
		middlewares: [stripSearchParams(homeDefaultSearchState)],
	},
});

function ModulesPage() {
	const navigate = useNavigate({ from: Route.fullPath });
	const filters = useModuleFilters();
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
						// onChange={(e) => filters.setSearchQuery(e.target.value)}
						onChange={(e) => {
							filters.setSearchQuery(e.target.value);
							navigate({
								search: (prev) => ({
									...prev,
									q: e.target.value,
								}),
							});
						}}
						disabled={isDownloadActive}
					/>

					<FilterDropdown
						singularLabel="period"
						pluralLabel="periods"
						items={periods}
						filteredItems={filters.periodFilter}
						// setFilteredItems={filters.setPeriodFilter}
						setFilteredItems={(newPeriods) => {
							filters.setPeriodFilter(newPeriods);
							navigate({
								search: (prev) => ({
									...prev,
									periods:
										typeof newPeriods === "function"
											? newPeriods(filters.periodFilter)
											: newPeriods,
								}),
							});
						}}
						isDownloading={isDownloadActive}
						isFilterActive={isFilterActive}
						getFilterLabel={getFilterLabel}
					/>

					<FilterDropdown
						singularLabel="faculty"
						pluralLabel="faculties"
						items={uniqueFaculties}
						filteredItems={filters.facultyFilter}
						// setFilteredItems={filters.setFacultyFilter}
						setFilteredItems={(newFaculties) => {
							filters.setFacultyFilter(newFaculties);
							navigate({
								search: (prev) => ({
									...prev,
									faculties:
										typeof newFaculties === "function"
											? newFaculties(filters.facultyFilter)
											: newFaculties,
								}),
							});
						}}
						isDownloading={isDownloadActive}
						isFilterActive={isFilterActive}
						getFilterLabel={getFilterLabel}
					/>

					<FilterDropdown
						singularLabel="prefix"
						pluralLabel="prefixes"
						items={uniquePrefixes}
						filteredItems={filters.prefixFilter}
						// setFilteredItems={filters.setPrefixFilter}
						setFilteredItems={(newPrefixes) => {
							filters.setPrefixFilter(newPrefixes);
							navigate({
								search: (prev) => ({
									...prev,
									prefixes:
										typeof newPrefixes === "function"
											? newPrefixes(filters.prefixFilter)
											: newPrefixes,
								}),
							});
						}}
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
							// onClick={filters.clearAllFilters}
							onClick={() => {
								filters.clearAllFilters();
								navigate({
									search: () => homeDefaultSearchState,
								});
							}}
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
								<Button variant="outline" size="sm" disabled={isDownloadActive}>
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
					<FilterSummaryBar isDownloading={isDownloadActive} />
				)}

				{/* Module Table */}
				<ModulesTable />

				{/* Sticky Download UI - Dynamic State */}
				{selectedCount > 0 && (
					<>
						{downloadState === "downloading" && <DownloadProgressBar />}

						{downloadState === "paused" && <DownloadPaused />}

						{downloadState === "error" && <DownloadError />}

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
