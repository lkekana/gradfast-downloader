import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
	DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
	facultyAbbreviation,
	Module,
	modules,
	periodAbbreviation,
	periods,
} from "@/data";
import { Download, Filter, Settings, Wifi, WifiOff, Info } from "lucide-react";
import { Link } from "react-router";
import useConnection from "@/hooks/useConnection";
import { Toast } from "@/components/ui/toast";

// Extended module type with past papers info
type ModuleWithPapers = Module & {
	faculty?: string;
	period?: string;
	credits?: number;
	pastPapers?: {
		exams: number;
		semesterTests: number;
		classTests: number;
		practicals: number;
		tutorials: number;
	};
};

export default function ModulesPage() {
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [searchQuery, setSearchQuery] = useState("");
	const [prefixFilter, setPrefixFilter] = useState<string[]>([]);
	const [facultyFilter, setFacultyFilter] = useState<string[]>([]);
	const [periodFilter, setPeriodFilter] = useState<string[]>([]);
	const {
		isOnline,
		isConnected,
		isReconnecting,
		reconnectError,
		attemptReconnect,
	} = useConnection();

	// Download simulation state
	const [isDownloading, setIsDownloading] = useState(false);
	const [downloadProgress, setDownloadProgress] = useState(0);

	// Derived data
	const uniquePrefixes = useMemo(
		() => [...new Set(modules.map((m) => m.prefix))].sort(),
		[modules],
	);

	const uniqueFaculties = useMemo(
		() => [...new Set(modules.map((m) => m.faculty).filter(Boolean))].sort(),
		[modules],
	);

	const filteredModules = useMemo(() => {
		console.log("Filters:", {
			searchQuery,
			prefixFilter,
			facultyFilter,
			periodFilter,
		});
		return modules
			.filter((mod: ModuleWithPapers) => {
				const matchesSearch =
					`${mod.prefix}${mod.code} ${mod.name} ${mod.faculty || ""}`
						.toLowerCase()
						.includes(searchQuery.toLowerCase());
				const matchesPrefix =
					prefixFilter.length === 0 || prefixFilter.includes(mod.prefix);
				const matchesFaculty =
					facultyFilter.length === 0 ||
					(mod.faculty && facultyFilter.includes(mod.faculty));
				const matchesPeriod =
					periodFilter.length === 0 ||
					(mod.period && periodFilter.includes(mod.period));
				return (
					matchesSearch && matchesPrefix && matchesFaculty && matchesPeriod
				);
			})
			.sort((a, b) => {
				if (a.prefix === b.prefix) return a.code - b.code;
				return a.prefix.localeCompare(b.prefix);
			});
	}, [searchQuery, prefixFilter, facultyFilter, periodFilter]);

	// Selection handlers
	const toggleModule = (id: string) => {
		if (isDownloading) return; // Prevent selection during download
		setSelectedIds((prev) => {
			const next = new Set(prev);
			next.has(id) ? next.delete(id) : next.add(id);
			return next;
		});
	};

	const selectAllVisible = () => {
		if (isDownloading) return;
		setSelectedIds(new Set(filteredModules.map((m) => `${m.prefix}${m.code}`)));
	};

	const clearSelection = () => {
		if (isDownloading) return;
		setSelectedIds(new Set());
	};

	const selectByPrefix = (prefix: string) => {
		if (isDownloading) return;
		setSelectedIds(
			new Set(
				modules
					.filter((m) => m.prefix === prefix)
					.map((m) => `${m.prefix}${m.code}`),
			),
		);
	};

	const selectByFaculty = (faculty: string) => {
		if (isDownloading) return;
		setSelectedIds(
			new Set(
				modules
					.filter((m) => m.faculty === faculty)
					.map((m) => `${m.prefix}${m.code}`),
			),
		);
	};

	const selectByPeriod = (period: string) => {
		if (isDownloading) return;
		setSelectedIds(
			new Set(
				modules
					.filter((m) => m.period === period)
					.map((m) => `${m.prefix}${m.code}`),
			),
		);
	};

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

	// Generate chip data for active filters
	const getActiveFilterChips = () => {
		const chips: {
			id: string;
			label: string;
			type: "period" | "faculty" | "prefix";
			value: string;
		}[] = [];

		// Period chips
		periodFilter.forEach((period) => {
			chips.push({
				id: `period-${period}`,
				label: `Period: ${periodAbbreviation(period)}`,
				type: "period",
				value: period,
			});
		});

		// Faculty chips
		facultyFilter.forEach((faculty) => {
			chips.push({
				id: `faculty-${faculty}`,
				label: `Faculty: ${facultyAbbreviation(faculty)}`,
				type: "faculty",
				value: faculty,
			});
		});

		// Prefix chips
		prefixFilter.forEach((prefix) => {
			chips.push({
				id: `prefix-${prefix}`,
				label: `Prefix: ${prefix}*`,
				type: "prefix",
				value: prefix,
			});
		});

		return chips;
	};

	// Remove a specific filter chip
	const removeFilterChip = (chip: {
		type: "period" | "faculty" | "prefix";
		value: string;
	}) => {
		switch (chip.type) {
			case "period":
				setPeriodFilter((prev) => prev.filter((p) => p !== chip.value));
				break;
			case "faculty":
				setFacultyFilter((prev) => prev.filter((f) => f !== chip.value));
				break;
			case "prefix":
				setPrefixFilter((prev) => prev.filter((p) => p !== chip.value));
				break;
		}
	};

	// Clear all filters
	const clearAllFilters = () => {
		setPeriodFilter([]);
		setFacultyFilter([]);
		setPrefixFilter([]);
	};

	// Simulated download with progress
	const handleDownload = () => {
		if (!isOnline || !isConnected || isDownloading) return;

		setIsDownloading(true);
		setDownloadProgress(0);

		// Simulate progress
		const interval = setInterval(() => {
			setDownloadProgress((prev) => {
				if (prev >= 100) {
					clearInterval(interval);
					setTimeout(() => {
						setIsDownloading(false);
						setDownloadProgress(0);
						clearSelection(); // Reset after "completion"
					}, 500);
					return 100;
				}
				return prev + (Math.random() * 15) / selectedIds.size; // Random increment for realism
			});
		}, 200);
	};

	const canDownload =
		isOnline && isConnected && !isDownloading && selectedIds.size > 0;

	// Helper: Format paper counts for hover preview
	const formatPaperSummary = (papers?: ModuleWithPapers["pastPapers"]) => {
		if (!papers) return "No past papers available";
		const items = [
			papers.exams > 0 &&
				`📝 ${papers.exams} exam${papers.exams > 1 ? "s" : ""}`,
			papers.semesterTests > 0 &&
				`🧪 ${papers.semesterTests} semester test${papers.semesterTests > 1 ? "s" : ""}`,
			papers.classTests > 0 &&
				`✏️ ${papers.classTests} class test${papers.classTests > 1 ? "s" : ""}`,
			papers.practicals > 0 &&
				`🔬 ${papers.practicals} practical${papers.practicals > 1 ? "s" : ""}`,
			papers.tutorials > 0 &&
				`📚 ${papers.tutorials} tutorial${papers.tutorials > 1 ? "s" : ""}`,
		].filter(Boolean);
		return items.length > 0 ? items.join(" • ") : "No past papers available";
	};

	return (
		<TooltipProvider>
			<div className="flex flex-col h-screen bg-background">
				{/* Header */}
				<header className="border-b bg-card px-4 py-3 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<h1 className="text-2xl font-semibold">📚 Gradfast Downloader</h1>

						{/* Internet Status - Always shown */}
						<Tooltip>
							<TooltipTrigger asChild>
								<div className="flex items-center gap-1.5 ml-2 cursor-help">
									{isOnline ? (
										<Wifi className="w-4 h-4 text-green-500" />
									) : (
										<WifiOff className="w-4 h-4 text-red-500" />
									)}
									<span className="text-xs text-muted-foreground">
										{isOnline ? "Online" : "Offline"}
									</span>
								</div>
							</TooltipTrigger>
							<TooltipContent>
								<p>
									{isOnline
										? "You are connected to the internet"
										: "No internet connection – some features disabled"}
								</p>
							</TooltipContent>
						</Tooltip>

						{/* Server Connection Status - Only shown when online */}
						{isOnline && (
							<Tooltip>
								<TooltipTrigger asChild>
									<button
										onClick={
											isConnected || isReconnecting
												? undefined
												: attemptReconnect
										}
										disabled={isReconnecting}
										className={`flex items-center gap-1.5 transition-opacity ${
											!isConnected && !isReconnecting
												? "cursor-pointer hover:opacity-80 active:scale-95"
												: "cursor-default"
										}`}
										aria-label={
											isConnected ? "Connected to server" : "Click to reconnect"
										}
									>
										<div className="relative">
											<div
												className={`w-2 h-2 rounded-full transition-colors ${
													isConnected
														? "bg-green-500"
														: isReconnecting
															? "bg-yellow-500 animate-pulse"
															: "bg-red-500"
												}`}
											/>
											{isConnected && (
												<span className="absolute inset-0 rounded-full animate-ping bg-green-400 opacity-75" />
											)}
											{isReconnecting && (
												<span className="absolute inset-0 flex items-center justify-center">
													<span className="w-1.5 h-1.5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
												</span>
											)}
										</div>
										<span
											className={`text-xs ${
												isConnected
													? "text-muted-foreground"
													: isReconnecting
														? "text-yellow-600 font-medium"
														: "text-red-500 font-medium"
											}`}
										>
											{isReconnecting
												? "Connecting…"
												: isConnected
													? "Server connected"
													: "Disconnected"}
										</span>
									</button>
								</TooltipTrigger>
								<TooltipContent side="bottom" className="max-w-xs">
									{isConnected && <p>✅ Connected to past papers server</p>}
									{isReconnecting && <p>🔄 Attempting to reconnect…</p>}
									{!isConnected && !isReconnecting && (
										<div>
											<p className="font-medium mb-1">
												🔌 Not connected to server
											</p>
											<p className="text-xs text-muted-foreground">
												Click the status indicator above to retry connection
											</p>
										</div>
									)}
									{reconnectError && (
										<p className="text-red-500 text-xs mt-1">
											⚠️ {reconnectError}
										</p>
									)}
								</TooltipContent>
							</Tooltip>
						)}
					</div>

					{/* Settings Menu */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon">
								<Settings className="w-4 h-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							{/* <DropdownMenuItem>Settings</DropdownMenuItem> */}
							<DropdownMenuItem asChild>
								<Link to="/settings" className="w-full h-full">
									Settings
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem>Check for updates</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem className="text-muted-foreground">
								v1.0.0
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</header>

				{/* Main Content */}
				<main className="flex-1 p-4 overflow-hidden flex flex-col">
					{/* Selection Toolbar */}
					<div className="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b">
						<Input
							placeholder="Search modules..."
							className="w-64"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							disabled={isDownloading}
						/>

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant={
										isFilterActive(periodFilter, periods.length)
											? "default"
											: "outline"
									}
									size="sm"
									disabled={isDownloading}
									className={
										isFilterActive(periodFilter, periods.length)
											? "border-primary"
											: ""
									}
								>
									<Filter className="w-4 h-4 mr-1" />
									{/* Filter by period */}
									{getFilterLabel(
										periodFilter.length,
										periods.length,
										"periods",
										"period",
									)}
									{isFilterActive(periodFilter, periods.length) && (
										<Badge
											variant="secondary"
											className="ml-2 h-5 px-1.5 text-[10px]"
										>
											{periodFilter.length}
										</Badge>
									)}
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-56">
								<div className="p-3">
									<p className="text-sm font-medium text-muted-foreground mb-2">
										Period
									</p>
									{/* <DropdownMenuItem onClick={() => setPeriodFilter(null)} className="text-sm"> */}
									<DropdownMenuCheckboxItem
										checked={periodFilter.length === 0}
										onCheckedChange={(checked) => {
											if (checked) setPeriodFilter([]);
										}}
										className="text-sm"
									>
										All periods
									</DropdownMenuCheckboxItem>
									{periods.map((period) => (
										<DropdownMenuCheckboxItem
											key={period}
											onCheckedChange={(checked) => {
												setPeriodFilter(
													(prev) =>
														checked
															? [...prev, period] // Add to filter
															: prev.filter((p) => p !== period), // Remove from filter
												);
											}}
											checked={periodFilter.includes(period)}
											className={`text-sm`}
										>
											{period}
										</DropdownMenuCheckboxItem>
									))}
								</div>
							</DropdownMenuContent>
						</DropdownMenu>

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								{/* <Button variant="outline" size="sm" disabled={isDownloading}> */}
								<Button
									variant={
										isFilterActive(facultyFilter, uniqueFaculties.length)
											? "default"
											: "outline"
									}
									size="sm"
									disabled={isDownloading}
									className={
										isFilterActive(facultyFilter, uniqueFaculties.length)
											? "border-primary"
											: ""
									}
								>
									<Filter className="w-4 h-4 mr-1" />
									{/* Filter by faculty */}
									{getFilterLabel(
										facultyFilter.length,
										uniqueFaculties.length,
										"faculties",
										"faculty",
									)}
									{isFilterActive(facultyFilter, uniqueFaculties.length) && (
										<Badge
											variant="secondary"
											className="ml-2 h-5 px-1.5 text-[10px]"
										>
											{facultyFilter.length}
										</Badge>
									)}
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-56">
								<div className="p-3">
									<p className="text-sm font-medium text-muted-foreground mb-2">
										Faculty
									</p>
									{/* <DropdownMenuItem onClick={() => setFacultyFilter(null)} className="text-sm"> */}
									<DropdownMenuCheckboxItem
										checked={facultyFilter.length === 0}
										onCheckedChange={(checked) => {
											if (checked) setFacultyFilter([]);
										}}
										className="text-sm"
									>
										All faculties
									</DropdownMenuCheckboxItem>
									{uniqueFaculties.map((faculty) => (
										<DropdownMenuCheckboxItem
											key={faculty}
											onCheckedChange={(checked) => {
												setFacultyFilter(
													(prev) =>
														checked
															? [...prev, faculty] // Add to filter
															: prev.filter((f) => f !== faculty), // Remove from filter
												);
											}}
											checked={facultyFilter.includes(faculty)}
											className="text-sm"
										>
											{faculty}
										</DropdownMenuCheckboxItem>
									))}
								</div>
							</DropdownMenuContent>
						</DropdownMenu>

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								{/* <Button variant="outline" size="sm" disabled={isDownloading}> */}
								<Button
									variant={
										isFilterActive(prefixFilter, uniquePrefixes.length)
											? "default"
											: "outline"
									}
									size="sm"
									disabled={isDownloading}
									className={
										isFilterActive(prefixFilter, uniquePrefixes.length)
											? "border-primary"
											: ""
									}
								>
									<Filter className="w-4 h-4 mr-1" />
									{/* Filter by prefix */}
									{getFilterLabel(
										prefixFilter.length,
										uniquePrefixes.length,
										"prefixes",
										"prefix",
									)}
									{isFilterActive(prefixFilter, uniquePrefixes.length) && (
										<Badge
											variant="secondary"
											className="ml-2 h-5 px-1.5 text-[10px]"
										>
											{prefixFilter.length}
										</Badge>
									)}
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-56">
								<div className="p-3">
									<p className="text-sm font-medium text-muted-foreground mb-2">
										Prefix
									</p>
									{/* <DropdownMenuItem onClick={() => setPrefixFilter(null)} className="text-sm"> */}
									<DropdownMenuCheckboxItem
										checked={prefixFilter.length === 0}
										onCheckedChange={(checked) => {
											if (checked) setPrefixFilter([]);
										}}
										className="text-sm"
									>
										All prefixes
									</DropdownMenuCheckboxItem>
									{uniquePrefixes.map((prefix) => (
										<DropdownMenuCheckboxItem
											key={prefix}
											onCheckedChange={(checked) => {
												setPrefixFilter(
													(prev) =>
														checked
															? [...prev, prefix] // Add to filter
															: prev.filter((p) => p !== prefix), // Remove from filter
												);
											}}
											checked={prefixFilter.includes(prefix)}
											className="text-sm font-mono"
										>
											{prefix}*
										</DropdownMenuCheckboxItem>
									))}
								</div>
							</DropdownMenuContent>
						</DropdownMenu>

						{/* Show only when any filter is active
{(prefixFilter.length > 0 || facultyFilter.length > 0 || periodFilter.length > 0) && (
  <Button 
    variant="ghost" 
    size="sm" 
    onClick={() => {
      setPrefixFilter([]);
      setFacultyFilter([]);
      setPeriodFilter([]);
    }}
    disabled={isDownloading}
    className="text-muted-foreground hover:text-foreground"
  >
    Clear all filters
  </Button>
)} */}

						<div className="flex items-center gap-2 ml-auto">
							<Button
								variant="outline"
								size="sm"
								onClick={selectAllVisible}
								disabled={isDownloading}
							>
								Select all
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={clearSelection}
								disabled={isDownloading}
							>
								Clear
							</Button>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="outline" size="sm" disabled={isDownloading}>
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
					{getActiveFilterChips().length > 0 && (
						<div className="flex flex-wrap items-center gap-2 mb-4 animate-in fade-in slide-in-from-top-1">
							<span className="text-xs font-medium text-muted-foreground mr-1">
								Active filters:
							</span>

							{getActiveFilterChips().map((chip) => (
								<button
									onClick={(e) => {
										e.stopPropagation();
										removeFilterChip(chip);
									}}
									className="ml-1 rounded-full p-0.5 hover:bg-muted focus:outline-none focus:ring-1 focus:ring-ring"
									aria-label={`Remove ${chip.label} filter`}
								>
									<Badge
										key={chip.id}
										variant="secondary"
										className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium cursor-pointer hover:bg-secondary/80 transition-colors group"
									>
										{chip.label}

										<span className="text-[10px] leading-none">×</span>
									</Badge>
								</button>
							))}

							{/* Clear all button - only show if 2+ chips */}
							{getActiveFilterChips().length > 1 && (
								<Button
									variant="ghost"
									size="sm"
									onClick={clearAllFilters}
									disabled={isDownloading}
									className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
								>
									Clear all
								</Button>
							)}
						</div>
					)}

					{/* Module Table */}
					<div className="flex-1 overflow-auto rounded-md border">
						<Table>
							<TableHeader className="sticky top-0 bg-background z-10">
								<TableRow>
									<TableHead className="w-12">
										<Checkbox
											checked={
												filteredModules.length > 0 &&
												filteredModules.every((m) =>
													selectedIds.has(`${m.prefix}${m.code}`),
												)
											}
											onCheckedChange={(checked) =>
												checked ? selectAllVisible() : clearSelection()
											}
											disabled={isDownloading}
										/>
									</TableHead>
									<TableHead>Module</TableHead>
									<TableHead>Name</TableHead>
									<TableHead>Faculty</TableHead>
									<TableHead>Period</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredModules.map((mod: ModuleWithPapers) => {
									const id = `${mod.prefix}${mod.code}`;
									const isSelected = selectedIds.has(id);

									return (
										<TableRow
											key={id}
											className={`cursor-pointer transition-colors ${
												isSelected
													? "bg-primary/5 hover:bg-primary/10"
													: "hover:bg-muted/50"
											} ${isDownloading ? "opacity-50 cursor-not-allowed" : ""}`}
											onClick={() => toggleModule(id)}
										>
											<TableCell onClick={(e) => e.stopPropagation()}>
												<Checkbox
													checked={isSelected}
													onCheckedChange={() => toggleModule(id)}
													disabled={isDownloading}
												/>
											</TableCell>
											<TableCell className="font-mono font-medium">
												{mod.prefix}
												{mod.code}
											</TableCell>
											<TableCell className="max-w-xs truncate" title={mod.name}>
												{mod.name}
											</TableCell>
											<TableCell>
												{mod.faculty ? (
													<Badge variant="outline" className="text-xs">
														{mod.faculty}
													</Badge>
												) : (
													<span className="text-muted-foreground text-xs">
														—
													</span>
												)}
											</TableCell>
											<TableCell>
												{mod.period ? (
													<Badge variant="secondary" className="text-xs">
														{mod.period}
													</Badge>
												) : (
													<span className="text-muted-foreground text-xs">
														—
													</span>
												)}
											</TableCell>
											<TableCell
												className="text-right"
												onClick={(e) => e.stopPropagation()}
											>
												<HoverCard openDelay={200} closeDelay={100}>
													<HoverCardTrigger asChild>
														<Button variant="ghost" size="sm" className="gap-1">
															<Link
																to={`/modules/${id}`}
																className="flex items-center gap-1"
															>
																Details
																<Info className="w-3 h-3 opacity-50" />
															</Link>
														</Button>
													</HoverCardTrigger>
													<HoverCardContent className="w-80 p-3">
														<div className="space-y-2">
															<div className="flex items-center justify-end">
																<h4 className="font-medium text-base px-2">
																	{mod.prefix}
																	{mod.code}
																</h4>
																<Badge variant="outline" className="text-xs">
																	{facultyAbbreviation(mod.faculty)}
																</Badge>
															</div>
															<p className="text-sm text-muted-foreground">
																{mod.name}
															</p>

															<div className="pt-2 border-t text-left">
																<p className="text-xs font-medium text-muted-foreground mb-2">
																	Available Past Papers
																</p>
																<div className="grid grid-cols-2 gap-2 text-xs">
																	<div className="flex items-center gap-1">
																		<span className="text-muted-foreground">
																			📝 Exams:
																		</span>
																		<span className="font-medium">
																			{mod.pastPapers?.exams ?? 0}
																		</span>
																	</div>
																	<div className="flex items-center gap-1">
																		<span className="text-muted-foreground">
																			🧪 Sem. Tests:
																		</span>
																		<span className="font-medium">
																			{mod.pastPapers?.semesterTests ?? 0}
																		</span>
																	</div>
																	<div className="flex items-center gap-1">
																		<span className="text-muted-foreground">
																			✏️ Class Tests:
																		</span>
																		<span className="font-medium">
																			{mod.pastPapers?.classTests ?? 0}
																		</span>
																	</div>
																	<div className="flex items-center gap-1">
																		<span className="text-muted-foreground">
																			🔬 Practicals:
																		</span>
																		<span className="font-medium">
																			{mod.pastPapers?.practicals ?? 0}
																		</span>
																	</div>
																	<div className="flex items-center gap-1 col-span-2">
																		<span className="text-muted-foreground">
																			📚 Tutorials:
																		</span>
																		<span className="font-medium">
																			{mod.pastPapers?.tutorials ?? 0}
																		</span>
																	</div>
																</div>
															</div>

															<div className="pt-2 flex justify-end">
																<Button size="sm" variant="secondary" asChild>
																	{/* <a href={`/modules/${id}`}>View all papers</a> */}
																	<Link
																		to={`/modules/${id}`}
																		className="flex items-center gap-1"
																	>
																		View more
																		<Info className="w-3 h-3 opacity-50" />
																	</Link>
																</Button>
															</div>
														</div>
													</HoverCardContent>
												</HoverCard>
											</TableCell>
										</TableRow>
									);
								})}
								{filteredModules.length === 0 && (
									<TableRow>
										<TableCell
											colSpan={6}
											className="text-center text-muted-foreground py-12"
										>
											<div className="flex flex-col items-center gap-2">
												<Info className="w-8 h-8 opacity-30" />
												<p>No modules match your filters</p>
												<Button
													variant="link"
													size="sm"
													onClick={() => {
														setSearchQuery("");
														setPrefixFilter([]);
														setFacultyFilter([]);
														setPeriodFilter([]);
													}}
												>
													Clear all filters
												</Button>
											</div>
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</div>

					{/* Sticky Download Bar - Dynamic State */}
					{selectedIds.size > 0 && !isDownloading && (
						<div className="sticky bottom-0 mt-4 p-3 bg-card border rounded-lg shadow-lg flex items-center justify-between animate-in slide-in-from-bottom-2">
							<div>
								<span className="font-medium">{selectedIds.size}</span>
								<span className="text-muted-foreground ml-1">
									module{selectedIds.size !== 1 ? "s" : ""} selected
								</span>
								{getActiveFilterChips().length > 0 && (
									<Badge variant="outline" className="ml-4 text-[10px]">
										{getActiveFilterChips().length} filter
										{getActiveFilterChips().length !== 1 ? "s" : ""} active
									</Badge>
								)}
							</div>

							<Tooltip>
								<TooltipTrigger asChild>
									<span className="w-full sm:w-auto">
										<Button
											onClick={handleDownload}
											className="gap-2"
											disabled={!canDownload}
										>
											<Download className="w-4 h-4" />
											Download Selected
										</Button>
									</span>
								</TooltipTrigger>
								{!canDownload && (
									<TooltipContent side="top" className="max-w-xs">
										{!isOnline && (
											<p>🌐 You need an internet connection to download</p>
										)}
										{!isConnected && (
											<p>
												🔌 Not connected to the server – check your settings
											</p>
										)}
										{isDownloading && <p>⏳ Download in progress…</p>}
										{selectedIds.size === 0 && (
											<p>📭 Select at least one module to download</p>
										)}
									</TooltipContent>
								)}
							</Tooltip>
						</div>
					)}

					{/* Download Progress Bar */}
					{isDownloading && (
						<div className="sticky bottom-0 mt-4 p-4 bg-card border rounded-lg shadow-lg space-y-3 animate-in slide-in-from-bottom-2">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
									<span className="font-medium">Downloading modules…</span>
								</div>
								<span className="text-sm font-mono text-muted-foreground">
									{Math.min(100, Math.round(downloadProgress))}%
								</span>
							</div>
							<Progress value={downloadProgress} className="h-2" />
							{/* One p aligns left, the other aligns right. */}
							<div className="flex justify-between text-xs text-muted-foreground">
								<p className="text-xs text-muted-foreground">
									{selectedIds.size} module{selectedIds.size !== 1 ? "s" : ""} •
									Est. time:{" "}
									{Math.max(1, Math.round((100 - downloadProgress) / 20))}s
									remaining
								</p>
								<p className="text-xs text-muted-foreground text-right">
									Saving to:{" "}
									<span className="font-mono">/downloads/past-papers/</span>
								</p>
							</div>
						</div>
					)}
				</main>
			</div>
		</TooltipProvider>
	);
}
