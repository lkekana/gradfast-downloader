import {
	ArrowLeft,
	BookOpen,
	Check,
	Database,
	FileText,
	FolderOpen,
	HardDrive,
	Layers,
	Monitor,
	Moon,
	RefreshCcw,
	RefreshCw,
	Save,
	Settings2,
	Sun,
	Wifi,
	WifiOff,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Combobox, ComboboxItem } from "@/components/combobox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import useConnection from "@/hooks/useConnection";
import { useTheme } from "@/hooks/useTheme";
import { downloadPath } from "@/lib/api";

const programmes = [
	{
		id: "bsc-cs",
		name: "BSc Computer Science",
		code: "BSCS",
		faculty: "SCI",
		department: "Computer Science",
		level: "undergrad",
		nqfLevel: 7,
		totalCredits: 360,
	},
	{
		id: "bsc-eng",
		name: "BSc Engineering",
		code: "BSCE",
		faculty: "ENG",
		department: "Engineering",
		level: "undergrad",
		nqfLevel: 7,
		totalCredits: 420,
	},
	{
		id: "bcom",
		name: "BCom Commerce",
		code: "BCOM",
		faculty: "COM",
		department: "Commerce",
		level: "undergrad",
		nqfLevel: 7,
		totalCredits: 360,
	},
	{
		id: "ba",
		name: "BA Humanities",
		code: "BAHU",
		faculty: "HUM",
		department: "Humanities",
		level: "undergrad",
		nqfLevel: 7,
		totalCredits: 360,
	},
	{
		id: "msc-cs",
		name: "MSc Computer Science",
		code: "MSCS",
		faculty: "SCI",
		department: "Computer Science",
		level: "postgrad",
		nqfLevel: 9,
		totalCredits: 180,
	},
	{
		id: "phd-cs",
		name: "PhD Computer Science",
		code: "PHDC",
		faculty: "SCI",
		department: "Computer Science",
		level: "postgrad",
		nqfLevel: 10,
		totalCredits: 360,
	},
];

const faculties = ["SCI", "ENG", "COM", "HUM", "LAW", "EDU", "HEA"];
const departments = {
	SCI: ["Computer Science", "Mathematics", "Physics", "Chemistry", "Biology"],
	ENG: [
		"Engineering",
		"Civil Engineering",
		"Electrical Engineering",
		"Mechanical Engineering",
	],
	COM: ["Commerce", "Economics", "Accounting", "Business Management"],
	HUM: ["Humanities", "History", "Philosophy", "Languages", "Psychology"],
	LAW: ["Law", "Jurisprudence"],
	EDU: ["Education", "Curriculum Studies"],
	HEA: ["Health Sciences", "Medicine", "Nursing"],
};

const years = ["1", "2", "3", "4", "Honours", "Masters", "PhD"];
const namingPatterns = [
	{
		id: "code-year-type",
		label: "{code}_{year}_{type}.pdf",
		example: "COS101_2024_exam.pdf",
	},
	{
		id: "name-year-type",
		label: "{name}_{year}_{type}.pdf",
		example: "Intro to CS_2024_exam.pdf",
	},
	{
		id: "code-name-year",
		label: "{code}_{name}_{year}.pdf",
		example: "COS101_Intro to CS_2024.pdf",
	},
	{
		id: "faculty-code-year",
		label: "{faculty}/{code}/{year}_{type}.pdf",
		example: "SCI/COS101/2024_exam.pdf",
	},
];

const paperTypes = [
	{ id: "exams", label: "Examinations", icon: "📝" },
	{ id: "semesterTests", label: "Semester Tests", icon: "🧪" },
	{ id: "classTests", label: "Class Tests", icon: "✏️" },
	{ id: "practicals", label: "Practicals", icon: "🔬" },
	{ id: "tutorials", label: "Tutorials", icon: "📚" },
];

const moduleRoles = [
	{
		id: "fundamental",
		label: "Fundamental",
		description: "Core foundation modules",
	},
	{
		id: "core",
		label: "Core",
		description: "Required for programme completion",
	},
	{ id: "elective", label: "Elective", description: "Optional choice modules" },
];

export default function SettingsPage() {
	const { toast } = useToast();
	const {
		isOnline,
		isConnected,
		isReconnecting,
		reconnectError,
		attemptReconnect,
	} = useConnection();
	const { themeSetting, setThemeSetting } = useTheme();

	// ========== PROGRAMME SELECTION ==========
	const [programmeSelectionMode, setProgrammeSelectionMode] = useState<
		"search" | "hierarchical"
	>("search");
	const [programmeSearchQuery, setProgrammeSearchQuery] = useState("");
	const [selectedProgrammeId, setSelectedProgrammeId] = useState<string>("");

	// Hierarchical selection state
	const [academicLevel, setAcademicLevel] = useState<"undergrad" | "postgrad">(
		"undergrad",
	);
	const [selectedFaculty, setSelectedFaculty] = useState<string>("");
	const [selectedDepartment, setSelectedDepartment] = useState<string>("");

	const [year, setYear] = useState<string>("");

	// ========== DOWNLOAD PREFERENCES ==========
	const [destinationFolder, setDestinationFolder] =
		useState<string>(downloadPath);
	const [moduleSubfolders, setModuleSubfolders] = useState<boolean>(true);
	const [namingPattern, setNamingPattern] = useState<string>("code-year-type");
	const [parallelDownloads, setParallelDownloads] = useState<number>(3);
	const [retryAttempts, setRetryAttempts] = useState<number>(3);

	// ========== CONTENT FILTERS ==========
	const [includeModuleRoles, setIncludeModuleRoles] = useState<{
		[key: string]: boolean;
	}>({
		fundamental: true,
		core: true,
		elective: false,
	});
	const [nqfLevelRange, setNqfLevelRange] = useState<[number, number]>([5, 10]);
	const [creditsRange, setCreditsRange] = useState<[number, number]>([0, 60]);
	const [preferredLanguages, setPreferredLanguages] = useState<string[]>([
		"English",
	]);
	const [preferredPeriods, setPreferredPeriods] = useState<string[]>([
		"Semester 1",
		"Semester 2",
		"Year",
	]);

	// ========== PAPER TYPE PREFERENCES ==========
	const [includePaperTypes, setIncludePaperTypes] = useState<{
		[key: string]: boolean;
	}>({
		exams: true,
		semesterTests: true,
		classTests: true,
		practicals: true,
		tutorials: true,
	});
	const [yearRange, setYearRange] = useState<[number, number]>([
		2020,
		new Date().getFullYear(),
	]);
	const [preferMostRecent, setPreferMostRecent] = useState<boolean>(true);

	// ========== METADATA & SYNC ==========
	const [includeMetadata, setIncludeMetadata] = useState<boolean>(true);
	const [includeModuleContent, setIncludeModuleContent] =
		useState<boolean>(true);
	const [includePrerequisites, setIncludePrerequisites] =
		useState<boolean>(true);
	const [includeCurriculumStructure, setIncludeCurriculumStructure] =
		useState<boolean>(false);
	const [autoSyncProgrammeData, setAutoSyncProgrammeData] =
		useState<boolean>(true);
	const [cacheDurationHours, setCacheDurationHours] = useState<number>(24);

	// ========== AUTO-SELECTION & UPDATES ==========
	const [autoSelectModules, setAutoSelectModules] = useState<boolean>(true);
	const [checkForUpdates, setCheckForUpdates] = useState<boolean>(true);

	// ========== UI STATE ==========
	const [isSaving, setIsSaving] = useState<boolean>(false);
	const [showSaveSuccess, setShowSaveSuccess] = useState<boolean>(false);
	const [activeTab, setActiveTab] = useState<string>("general");

	// Filtered programmes for combobox
	const filteredProgrammes = useMemo(() => {
		if (!programmeSearchQuery) return programmes;
		const query = programmeSearchQuery.toLowerCase();
		return programmes.filter(
			(p) =>
				p.name.toLowerCase().includes(query) ||
				p.code.toLowerCase().includes(query) ||
				p.department.toLowerCase().includes(query),
		);
	}, [programmeSearchQuery]);

	// Filtered departments based on faculty selection
	const availableDepartments = useMemo(() => {
		return selectedFaculty
			? departments[selectedFaculty as keyof typeof departments] || []
			: [];
	}, [selectedFaculty]);

	// Filtered programmes based on hierarchical selection
	const hierarchicalProgrammes = useMemo(() => {
		return programmes.filter((p) => {
			if (p.level !== academicLevel) return false;
			if (selectedFaculty && p.faculty !== selectedFaculty) return false;
			if (selectedDepartment && p.department !== selectedDepartment)
				return false;
			return true;
		});
	}, [academicLevel, selectedFaculty, selectedDepartment]);

	// Load saved settings on mount
	useEffect(() => {
		const saved = localStorage.getItem("pastpapers-settings");
		if (saved) {
			try {
				const parsed = JSON.parse(saved);
				// Theme
				setThemeSetting(parsed.theme || "system");
				// Programme selection
				setProgrammeSelectionMode(parsed.programmeSelectionMode || "search");
				setSelectedProgrammeId(parsed.programme || "");
				setAcademicLevel(parsed.academicLevel || "undergrad");
				setSelectedFaculty(parsed.faculty || "");
				setSelectedDepartment(parsed.department || "");
				setYear(parsed.year || "");
				// Download preferences
				setDestinationFolder(parsed.destinationFolder || downloadPath);
				setModuleSubfolders(parsed.moduleSubfolders ?? true);
				setNamingPattern(parsed.namingPattern || "code-year-type");
				setParallelDownloads(parsed.parallelDownloads || 3);
				setRetryAttempts(parsed.retryAttempts || 3);
				// Content filters
				setIncludeModuleRoles(
					parsed.includeModuleRoles || {
						fundamental: true,
						core: true,
						elective: false,
					},
				);
				setNqfLevelRange(parsed.nqfLevelRange || [5, 10]);
				setCreditsRange(parsed.creditsRange || [0, 60]);
				setPreferredLanguages(parsed.preferredLanguages || ["English"]);
				setPreferredPeriods(
					parsed.preferredPeriods || ["Semester 1", "Semester 2", "Year"],
				);
				// Paper preferences
				setIncludePaperTypes(
					parsed.includePaperTypes || {
						exams: true,
						semesterTests: true,
						classTests: true,
						practicals: true,
						tutorials: true,
					},
				);
				setYearRange(parsed.yearRange || [2020, new Date().getFullYear()]);
				setPreferMostRecent(parsed.preferMostRecent ?? true);
				// Metadata & sync
				setIncludeMetadata(parsed.includeMetadata ?? true);
				setIncludeModuleContent(parsed.includeModuleContent ?? true);
				setIncludePrerequisites(parsed.includePrerequisites ?? true);
				setIncludeCurriculumStructure(
					parsed.includeCurriculumStructure ?? false,
				);
				setAutoSyncProgrammeData(parsed.autoSyncProgrammeData ?? true);
				setCacheDurationHours(parsed.cacheDurationHours || 24);
				// Auto-selection
				setAutoSelectModules(parsed.autoSelectModules ?? true);
				setCheckForUpdates(parsed.checkForUpdates ?? true);
			} catch (e) {
				console.error("Failed to load settings:", e);
			}
		}
	}, []);

	const handleSave = async () => {
		setIsSaving(true);
		await new Promise((resolve) => setTimeout(resolve, 800));

		const settings = {
			// Theme & UI
			themeSetting,
			// Programme selection
			programmeSelectionMode,
			programme: selectedProgrammeId,
			academicLevel,
			faculty: selectedFaculty,
			department: selectedDepartment,
			year,
			// Download preferences
			destinationFolder,
			moduleSubfolders,
			namingPattern,
			parallelDownloads,
			retryAttempts,
			// Content filters
			includeModuleRoles,
			nqfLevelRange,
			creditsRange,
			preferredLanguages,
			preferredPeriods,
			// Paper preferences
			includePaperTypes,
			yearRange,
			preferMostRecent,
			// Metadata & sync
			includeMetadata,
			includeModuleContent,
			includePrerequisites,
			includeCurriculumStructure,
			autoSyncProgrammeData,
			cacheDurationHours,
			// Auto-selection
			autoSelectModules,
			checkForUpdates,
			lastSaved: new Date().toISOString(),
		};

		localStorage.setItem("pastpapers-settings", JSON.stringify(settings));
		setIsSaving(false);
		setShowSaveSuccess(true);
		toast({
			title: "Settings saved",
			description: "Your preferences have been updated successfully.",
		});
		setTimeout(() => setShowSaveSuccess(false), 3000);
	};

	const handleReset = () => {
		setThemeSetting("system");
		setProgrammeSelectionMode("search");
		setSelectedProgrammeId("");
		setAcademicLevel("undergrad");
		setSelectedFaculty("");
		setSelectedDepartment("");
		setYear("");
		setDestinationFolder("/downloads/past-papers/");
		setModuleSubfolders(true);
		setNamingPattern("code-year-type");
		setParallelDownloads(3);
		setRetryAttempts(3);
		setIncludeModuleRoles({ fundamental: true, core: true, elective: false });
		setNqfLevelRange([5, 10]);
		setCreditsRange([0, 60]);
		setPreferredLanguages(["English"]);
		setPreferredPeriods(["Semester 1", "Semester 2", "Year"]);
		setIncludePaperTypes({
			exams: true,
			semesterTests: true,
			classTests: true,
			practicals: true,
			tutorials: true,
		});
		setYearRange([2020, new Date().getFullYear()]);
		setPreferMostRecent(true);
		setIncludeMetadata(true);
		setIncludeModuleContent(true);
		setIncludePrerequisites(true);
		setIncludeCurriculumStructure(false);
		setAutoSyncProgrammeData(true);
		setCacheDurationHours(24);
		setAutoSelectModules(true);
		setCheckForUpdates(true);
		toast({
			title: "Settings reset",
			description: "All settings have been reset to defaults.",
			variant: "destructive",
		});
	};

	const handleBrowseFolder = () => {
		toast({
			title: "Folder picker",
			description: "Native folder picker would open here.",
		});
	};

	const toggleModuleRole = (role: string) => {
		setIncludeModuleRoles((prev) => ({ ...prev, [role]: !prev[role] }));
	};

	const togglePaperType = (type: string) => {
		setIncludePaperTypes((prev) => ({ ...prev, [type]: !prev[type] }));
	};

	// const selectedPattern = namingPatterns.find((p) => p.id === namingPattern);

	const nav = useNavigate();

	const handleBack = () => {
		nav(-1); // Go back to the previous page
	};

	return (
		<TooltipProvider>
			{/* Header */}
			<header className="border-b bg-card px-4 py-3 sticky top-0 z-10">
				{/* <nav className="text-xs text-muted-foreground mb-2">
<a href="/home" className="hover:underline">Modules</a>
<span className="mx-1">/</span>
<span className="font-medium text-foreground">{moduleId}</span>
</nav> */}
				{/* <div className="flex items-center gap-3 max-w-6xl mx-auto">
					
				</div> */}
				<div className="flex items-center justify-between gap-3 max-w-6xl mx-auto">
					<div className="flex items-center gap-4">
						<Button
							variant="ghost"
							size="icon"
							onClick={handleBack}
							className="shrink-0"
						>
							<ArrowLeft className="w-4 h-4" />
						</Button>
						<h1 className="text-2xl font-bold flex items-center gap-2">
							<Settings2 className="w-6 h-6" />
							Settings
						</h1>
						{/* <p className="text-muted-foreground">
							Customize your past papers experience
						</p> */}
					</div>
					<div className="flex items-center gap-2">
						<Tooltip>
							<TooltipTrigger asChild>
								<div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50">
									{isOnline ? (
										<Wifi className="w-4 h-4 text-green-500" />
									) : (
										<WifiOff className="w-4 h-4 text-red-500" />
									)}
									<span className="text-xs font-medium">
										{isOnline ? "Online" : "Offline"}
									</span>
								</div>
							</TooltipTrigger>
							<TooltipContent>
								<p>
									{isOnline
										? "Internet connection active"
										: "No internet connection"}
								</p>
							</TooltipContent>
						</Tooltip>
						{isOnline && (
							<Tooltip>
								<TooltipTrigger asChild>
									<button
										type="button"
										onClick={
											isConnected || isReconnecting
												? undefined
												: attemptReconnect
										}
										disabled={isReconnecting}
										className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors ${
											isConnected
												? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
												: isReconnecting
													? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
													: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 cursor-pointer hover:opacity-90"
										}`}
									>
										<div className="relative">
											<div
												className={`w-2 h-2 rounded-full ${
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
										</div>
										<span className="text-xs font-medium">
											{isReconnecting
												? "Connecting…"
												: isConnected
													? "Connected"
													: "Disconnected"}
										</span>
									</button>
								</TooltipTrigger>
								<TooltipContent side="bottom">
									{isConnected && <p>✅ Connected to past papers server</p>}
									{isReconnecting && <p>🔄 Attempting to reconnect…</p>}
									{!isConnected && !isReconnecting && (
										<p>🔌 Click to reconnect to server</p>
									)}
									{reconnectError && (
										<p className="text-red-500">⚠️ {reconnectError}</p>
									)}
								</TooltipContent>
							</Tooltip>
						)}
					</div>
				</div>
			</header>
			<div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
				{/* Header */}

				{/* Settings Tabs */}
				<Tabs
					value={activeTab}
					onValueChange={setActiveTab}
					className="space-y-4"
				>
					<TabsList className="grid w-full grid-cols-4 lg:grid-cols-6">
						<TabsTrigger value="general">General</TabsTrigger>
						<TabsTrigger value="programme">Programme</TabsTrigger>
						<TabsTrigger value="download">Download</TabsTrigger>
						<TabsTrigger value="filters">Filters</TabsTrigger>
						<TabsTrigger value="papers">Papers</TabsTrigger>
						<TabsTrigger value="advanced">Advanced</TabsTrigger>
					</TabsList>

					{/* General Tab */}
					<TabsContent value="general" className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle>Appearance</CardTitle>
								<CardDescription>Customize the look and feel</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<Label>Theme</Label>
									<div className="flex gap-2">
										<Button
											variant={themeSetting === "light" ? "default" : "outline"}
											size="sm"
											onClick={() => setThemeSetting("light")}
											className="gap-2"
										>
											<Sun className="w-4 h-4" /> Light
										</Button>
										<Button
											variant={themeSetting === "dark" ? "default" : "outline"}
											size="sm"
											onClick={() => setThemeSetting("dark")}
											className="gap-2"
										>
											<Moon className="w-4 h-4" /> Dark
										</Button>
										<Button
											variant={
												themeSetting === "system" ? "default" : "outline"
											}
											size="sm"
											onClick={() => setThemeSetting("system")}
											className="gap-2"
										>
											<Monitor className="w-4 h-4" /> System
										</Button>
									</div>
									<p className="text-xs text-muted-foreground">
										Choose your preferred color scheme. "System" follows your OS
										settings.
									</p>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Auto-Selection</CardTitle>
								<CardDescription>
									Automatically select modules for you
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<Label className="text-base">Auto-select modules</Label>
										<p className="text-sm text-muted-foreground">
											Automatically select modules matching your programme &
											year on the home page
										</p>
									</div>
									<Switch
										checked={autoSelectModules}
										onCheckedChange={setAutoSelectModules}
									/>
								</div>
								<Separator />
								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<Label className="text-base">Check for updates</Label>
										<p className="text-sm text-muted-foreground">
											Automatically check for new past papers on app startup
										</p>
									</div>
									<Switch
										checked={checkForUpdates}
										onCheckedChange={setCheckForUpdates}
									/>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					{/* Programme Tab */}
					<TabsContent value="programme" className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle>Programme Selection Method</CardTitle>
								<CardDescription>
									Choose how you want to find your programme
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex gap-2">
									<Button
										variant={
											programmeSelectionMode === "search"
												? "default"
												: "outline"
										}
										size="sm"
										onClick={() => setProgrammeSelectionMode("search")}
										className="gap-2"
									>
										<FileText className="w-4 h-4" /> Search
									</Button>
									<Button
										variant={
											programmeSelectionMode === "hierarchical"
												? "default"
												: "outline"
										}
										size="sm"
										onClick={() => setProgrammeSelectionMode("hierarchical")}
										className="gap-2"
									>
										<Layers className="w-4 h-4" /> Browse
									</Button>
								</div>
							</CardContent>
						</Card>

						{programmeSelectionMode === "search" ? (
							<Card>
								<CardHeader>
									<CardTitle>Search Programme</CardTitle>
									<CardDescription>
										Type to find your programme by name or code
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="space-y-2">
										<Label>Programme</Label>
										<Combobox
											value={selectedProgrammeId}
											onValueChange={setSelectedProgrammeId}
											searchValue={programmeSearchQuery}
											onSearchChange={setProgrammeSearchQuery}
											placeholder="Search programmes..."
											className="w-full"
										>
											{filteredProgrammes.map((prog) => (
												<ComboboxItem key={prog.id} value={prog.id}>
													<div className="flex flex-col">
														<span className="font-medium">{prog.name}</span>
														<span className="text-xs text-muted-foreground">
															{prog.code} • {prog.department} •{" "}
															{prog.level === "undergrad"
																? "Undergraduate"
																: "Postgraduate"}
														</span>
													</div>
												</ComboboxItem>
											))}
											{filteredProgrammes.length === 0 && (
												<div className="p-2 text-sm text-muted-foreground text-center">
													No programmes found
												</div>
											)}
										</Combobox>
									</div>
								</CardContent>
							</Card>
						) : (
							<Card>
								<CardHeader>
									<CardTitle>Browse Programmes</CardTitle>
									<CardDescription>
										Navigate through academic levels, faculties, and departments
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
										<div className="space-y-2">
											<Label>Academic Level</Label>
											<Select
												value={academicLevel}
												onValueChange={(v) => {
													setAcademicLevel(v as "undergrad" | "postgrad");
													setSelectedFaculty("");
													setSelectedDepartment("");
												}}
											>
												<SelectTrigger>
													<SelectValue placeholder="Select level" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="undergrad">
														Undergraduate
													</SelectItem>
													<SelectItem value="postgrad">Postgraduate</SelectItem>
												</SelectContent>
											</Select>
										</div>
										<div className="space-y-2">
											<Label>Faculty</Label>
											<Select
												value={selectedFaculty}
												onValueChange={(v) => {
													setSelectedFaculty(v);
													setSelectedDepartment("");
												}}
											>
												<SelectTrigger>
													<SelectValue placeholder="Select faculty" />
												</SelectTrigger>
												<SelectContent>
													{faculties.map((faculty) => (
														<SelectItem key={faculty} value={faculty}>
															{faculty}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
										<div className="space-y-2">
											<Label>Department</Label>
											<Select
												value={selectedDepartment}
												onValueChange={setSelectedDepartment}
												disabled={!selectedFaculty}
											>
												<SelectTrigger>
													<SelectValue placeholder="Select department" />
												</SelectTrigger>
												<SelectContent>
													{availableDepartments.map((dept) => (
														<SelectItem key={dept} value={dept}>
															{dept}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
									</div>
									{hierarchicalProgrammes.length > 0 && (
										<div className="space-y-2">
											<Label>Available Programmes</Label>
											<Select
												value={selectedProgrammeId}
												onValueChange={setSelectedProgrammeId}
											>
												<SelectTrigger>
													<SelectValue placeholder="Select your programme" />
												</SelectTrigger>
												<SelectContent>
													{hierarchicalProgrammes.map((prog) => (
														<SelectItem key={prog.id} value={prog.id}>
															<div className="flex flex-col">
																<span>{prog.name}</span>
																<span className="text-xs text-muted-foreground">
																	{prog.code}
																</span>
															</div>
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
									)}
								</CardContent>
							</Card>
						)}

						<Card>
							<CardHeader>
								<CardTitle>Academic Year</CardTitle>
								<CardDescription>Your current year of study</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									<Label>Year</Label>
									<Select value={year} onValueChange={setYear}>
										<SelectTrigger>
											<SelectValue placeholder="Select your year" />
										</SelectTrigger>
										<SelectContent>
											{years.map((y) => (
												<SelectItem key={y} value={y}>
													{y}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<p className="text-xs text-muted-foreground">
										Used to filter modules by academic level and pre-select
										relevant content
									</p>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					{/* Download Tab */}
					<TabsContent value="download" className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle>Storage & Organization</CardTitle>
								<CardDescription>Where and how files are saved</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="folder">Destination Folder</Label>
									<div className="flex gap-2">
										<Input
											id="folder"
											value={destinationFolder}
											onChange={(e) => setDestinationFolder(e.target.value)}
											placeholder="/downloads/past-papers/"
											className="font-mono text-sm"
										/>
										<Tooltip>
											<TooltipTrigger asChild>
												<Button
													variant="outline"
													size="icon"
													onClick={handleBrowseFolder}
												>
													<FolderOpen className="w-4 h-4" />
												</Button>
											</TooltipTrigger>
											<TooltipContent>
												<p>Browse for folder</p>
											</TooltipContent>
										</Tooltip>
									</div>
								</div>

								<Separator />

								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<Label className="text-base flex items-center gap-2">
											<Layers className="w-4 h-4" />
											Organize by module
										</Label>
										<p className="text-sm text-muted-foreground">
											Create a subfolder for each module within the destination
											folder
										</p>
									</div>
									<Switch
										checked={moduleSubfolders}
										onCheckedChange={setModuleSubfolders}
									/>
								</div>

								<div className="space-y-2">
									<Label>File Naming Pattern</Label>
									<Select
										value={namingPattern}
										onValueChange={setNamingPattern}
									>
										<SelectTrigger className="h-auto">
											<SelectValue placeholder="Select naming pattern" />
										</SelectTrigger>
										<SelectContent>
											{namingPatterns.map((pattern) => (
												<SelectItem key={pattern.id} value={pattern.id}>
													<div className="flex flex-col gap-1">
														<span className="font-mono text-sm">
															{pattern.label}
														</span>
														<span className="text-xs text-muted-foreground">
															Example: {pattern.example}
														</span>
													</div>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Performance</CardTitle>
								<CardDescription>
									Optimize download speed and reliability
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<Label className="text-base">Parallel Downloads</Label>
										<Badge variant="secondary" className="font-mono">
											{parallelDownloads} concurrent
										</Badge>
									</div>
									<Slider
										value={[parallelDownloads]}
										onValueChange={([val]) => setParallelDownloads(val)}
										min={1}
										max={10}
										step={1}
										className="py-2"
									/>
									<div className="flex justify-between text-xs text-muted-foreground">
										<span>1 (reliable)</span>
										<span>10 (fast)</span>
									</div>
									<p className="text-xs text-muted-foreground">
										Higher values speed up bulk downloads but may trigger server
										rate limits
									</p>
								</div>

								<Separator />

								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<Label className="text-base">Retry Attempts</Label>
										<Badge variant="secondary" className="font-mono">
											{retryAttempts} retries
										</Badge>
									</div>
									<Slider
										value={[retryAttempts]}
										onValueChange={([val]) => setRetryAttempts(val)}
										min={0}
										max={5}
										step={1}
										className="py-2"
									/>
									<p className="text-xs text-muted-foreground">
										Number of times to retry a failed download before giving up
									</p>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					{/* Filters Tab */}
					<TabsContent value="filters" className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle>Module Filters</CardTitle>
								<CardDescription>
									Which modules to include in selections
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-3">
									<Label className="text-base">Module Roles</Label>
									<p className="text-xs text-muted-foreground mb-2">
										Select which types of modules to include based on your
										curriculum
									</p>
									<div className="space-y-2">
										{moduleRoles.map((role) => (
											<div
												key={role.id}
												className="flex items-center justify-between p-3 border rounded-lg"
											>
												<div>
													<p className="font-medium text-sm">{role.label}</p>
													<p className="text-xs text-muted-foreground">
														{role.description}
													</p>
												</div>
												<Switch
													checked={includeModuleRoles[role.id]}
													onCheckedChange={() => toggleModuleRole(role.id)}
												/>
											</div>
										))}
									</div>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					{/* Papers Tab */}
					<TabsContent value="papers" className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle>Paper Types</CardTitle>
								<CardDescription>
									Which assessment types to download
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
									{paperTypes.map((type) => (
										<div
											key={type.id}
											className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors"
										>
											<div className="flex items-center gap-3">
												<span className="text-lg">{type.icon}</span>
												<div>
													<p className="font-medium text-sm">{type.label}</p>
												</div>
											</div>
											<Switch
												checked={includePaperTypes[type.id]}
												onCheckedChange={() => togglePaperType(type.id)}
											/>
										</div>
									))}
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Year Range</CardTitle>
								<CardDescription>
									Which years of past papers to include
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center justify-between">
									<Label className="text-base">Paper Years</Label>
									<Badge variant="secondary">
										{yearRange[0]}–{yearRange[1]}
									</Badge>
								</div>
								<Slider
									value={yearRange}
									onValueChange={(val) => setYearRange(val as [number, number])}
									min={2010}
									max={new Date().getFullYear()}
									step={1}
									className="py-2"
								/>
								<div className="flex justify-between text-xs text-muted-foreground">
									<span>2010</span>
									<span>{new Date().getFullYear()}</span>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					{/* Advanced Tab */}
					<TabsContent value="advanced" className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle>Metadata & Content</CardTitle>
								<CardDescription>
									Additional information to include with downloads
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<div className="space-y-0.5">
											<Label className="text-base flex items-center gap-2">
												<FileText className="w-4 h-4" />
												Include metadata files
											</Label>
											<p className="text-sm text-muted-foreground">
												Download accompanying .json files with module info and
												timestamps
											</p>
										</div>
										<Switch
											checked={includeMetadata}
											onCheckedChange={setIncludeMetadata}
										/>
									</div>

									<div className="flex items-center justify-between">
										<div className="space-y-0.5">
											<Label className="text-base flex items-center gap-2">
												<BookOpen className="w-4 h-4" />
												Include module content
											</Label>
											<p className="text-sm text-muted-foreground">
												Save module descriptions and learning outcomes
											</p>
										</div>
										<Switch
											checked={includeModuleContent}
											onCheckedChange={setIncludeModuleContent}
										/>
									</div>

									<div className="flex items-center justify-between">
										<div className="space-y-0.5">
											<Label className="text-base flex items-center gap-2">
												{/* <Link2 className="w-4 h-4" /> */}
												Include prerequisites
											</Label>
											<p className="text-sm text-muted-foreground">
												Save prerequisite information for each module
											</p>
										</div>
										<Switch
											checked={includePrerequisites}
											onCheckedChange={setIncludePrerequisites}
										/>
									</div>

									<div className="flex items-center justify-between">
										<div className="space-y-0.5">
											<Label className="text-base flex items-center gap-2">
												<Database className="w-4 h-4" />
												Include curriculum structure
											</Label>
											<p className="text-sm text-muted-foreground">
												Download curriculum/module relationship data
											</p>
										</div>
										<Switch
											checked={includeCurriculumStructure}
											onCheckedChange={setIncludeCurriculumStructure}
										/>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Data Sync & Cache</CardTitle>
								<CardDescription>
									Manage programme data synchronization
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<Label className="text-base flex items-center gap-2">
											<RefreshCcw className="w-4 h-4" />
											Auto-sync programme data
										</Label>
										<p className="text-sm text-muted-foreground">
											Automatically update programme and module data when
											connected
										</p>
									</div>
									<Switch
										checked={autoSyncProgrammeData}
										onCheckedChange={setAutoSyncProgrammeData}
									/>
								</div>

								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<Label className="text-base">Cache Duration</Label>
										<Badge variant="secondary">{cacheDurationHours}h</Badge>
									</div>
									<Slider
										value={[cacheDurationHours]}
										onValueChange={([val]) => setCacheDurationHours(val)}
										min={1}
										max={168}
										step={1}
										className="py-2"
									/>
									<div className="flex justify-between text-xs text-muted-foreground">
										<span>1 hour</span>
										<span>1 week</span>
									</div>
									<p className="text-xs text-muted-foreground">
										How long to cache programme data before checking for updates
									</p>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Storage Info</CardTitle>
								<CardDescription>Local settings storage</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
									<HardDrive className="w-5 h-5 text-muted-foreground" />
									<div className="flex-1">
										<p className="text-sm font-medium">
											Settings stored locally
										</p>
										<p className="text-xs text-muted-foreground">
											All preferences are saved to your browser's localStorage
										</p>
									</div>
									<Button
										variant="outline"
										size="sm"
										onClick={() => {
											const settings = localStorage.getItem(
												"pastpapers-settings",
											);
											if (settings) {
												navigator.clipboard.writeText(settings);
												toast({
													title: "Copied!",
													description: "Settings JSON copied to clipboard",
												});
											}
										}}
									>
										Export
									</Button>
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>

				{/* Action Buttons */}
				<div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t">
					<Button variant="outline" onClick={handleReset} disabled={isSaving}>
						Reset to Defaults
					</Button>
					<Button onClick={handleSave} disabled={isSaving} className="gap-2">
						{isSaving ? (
							<>
								<RefreshCw className="w-4 h-4 animate-spin" />
								Saving...
							</>
						) : showSaveSuccess ? (
							<>
								<Check className="w-4 h-4" />
								Saved!
							</>
						) : (
							<>
								<Save className="w-4 h-4" />
								Save Changes
							</>
						)}
					</Button>
				</div>

				{/* Footer */}
				<p className="text-center text-xs text-muted-foreground pb-4">
					Programme data syncs when connected to server • Last saved:{" "}
					{localStorage.getItem("pastpapers-settings")
						? JSON.parse(
								localStorage.getItem("pastpapers-settings")!,
							)?.lastSaved?.slice(0, 16)
						: "Never"}
				</p>
			</div>
		</TooltipProvider>
	);
}
