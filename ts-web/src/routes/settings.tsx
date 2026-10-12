import {
	ArrowLeft,
	BookOpen,
	Check,
	Database,
	FileArchive,
	FileText,
	// FolderOpen,
	HardDrive,
	Layers,
	// LoaderCircle,
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
import { useMemo, useState } from "react";
import { Combobox, ComboboxItem } from "@/components/Combobox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
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
import {
	type ModuleRole,
	type NamingPattern,
	type PaperType,
	useSettingsStore,
} from "@/stores/useSettingsStore";
import { useConnection } from "@/stores/connectionStore";
import { useTheme } from "@/stores/themeStore";
import MiniDownloadCard from "@/components/MiniDownloadCard";
import { toast } from "sonner";

import { createFileRoute, useRouter } from '@tanstack/react-router'

export const Route = createFileRoute('/settings')({ component: SettingsPage })


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
const namingPatterns: { id: NamingPattern; label: string; example: string }[] =
	[
		{
			id: "default",
			label: "DEFAULT: {code}_{year}_{type}_{timestamp?}.pdf",
			example: "COS101_Exam_2007_Sup+MEMO - 1423492357235.pdf",
		},
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

const paperTypes: { id: PaperType; label: string; icon: string }[] = [
	{ id: "exams", label: "Examinations", icon: "📝" },
	{ id: "semesterTests", label: "Semester Tests", icon: "🧪" },
	{ id: "classTests", label: "Class Tests", icon: "✏️" },
	{ id: "practicals", label: "Practicals", icon: "🔬" },
	{ id: "tutorials", label: "Tutorials", icon: "📚" },
	{ id: "other", label: "Other", icon: "📄" },
];

const moduleRoles: { id: ModuleRole; label: string; description: string }[] = [
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
	const {
		isOnline,
		isConnected,
		isReconnecting,
		attemptReconnect,
		reconnectError,
	} = useConnection();

	const { themeSetting, setThemeSetting } = useTheme();
	const [programmeSearchQuery, setProgrammeSearchQuery] = useState("");
	const [isSaving, setIsSaving] = useState<boolean>(false);
	const [showSaveSuccess, setShowSaveSuccess] = useState<boolean>(false);
	const [activeTab, setActiveTab] = useState<string>("general");

	const programmeSelectionMode = useSettingsStore(
		(state) => state.programmeSelectionMode,
	);
	const programmeID = useSettingsStore((state) => state.programmeID);
	const academicLevel = useSettingsStore((state) => state.academicLevel);
	const faculty = useSettingsStore((state) => state.faculty);
	const department = useSettingsStore((state) => state.department);
	const year = useSettingsStore((state) => state.year);
	// const destinationFolder = useSettingsStore((state) => state.destinationFolder);
	const moduleSubfolders = useSettingsStore((state) => state.moduleSubfolders);
	const zipMultipleFiles = useSettingsStore((state) => state.zipMultipleFiles);
	const namingPattern = useSettingsStore((state) => state.namingPattern);
	const parallelDownloads = useSettingsStore(
		(state) => state.parallelDownloads,
	);
	const retryAttempts = useSettingsStore((state) => state.retryAttempts);
	const includeModuleRoles = useSettingsStore(
		(state) => state.includeModuleRoles,
	);
	// const nqfLevelRange = useSettingsStore((state) => state.nqfLevelRange);
	// const creditsRange = useSettingsStore((state) => state.creditsRange);
	// const preferredLanguages = useSettingsStore((state) => state.preferredLanguages);
	// const preferredPeriods = useSettingsStore((state) => state.preferredPeriods);
	const includePaperTypes = useSettingsStore(
		(state) => state.includePaperTypes,
	);
	const yearRange = useSettingsStore((state) => state.yearRange);
	// const preferMostRecent = useSettingsStore((state) => state.preferMostRecent);
	const includeMetadata = useSettingsStore((state) => state.includeMetadata);
	const includeModuleContent = useSettingsStore(
		(state) => state.includeModuleContent,
	);
	const includePrerequisites = useSettingsStore(
		(state) => state.includePrerequisites,
	);
	const includeCurriculumStructure = useSettingsStore(
		(state) => state.includeCurriculumStructure,
	);
	const autoSyncProgrammeData = useSettingsStore(
		(state) => state.autoSyncProgrammeData,
	);
	const cacheDurationHours = useSettingsStore(
		(state) => state.cacheDurationHours,
	);
	const autoSelectModules = useSettingsStore(
		(state) => state.autoSelectModules,
	);
	const checkForUpdates = useSettingsStore((state) => state.checkForUpdates);

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
		return faculty
			? departments[faculty as keyof typeof departments] || []
			: [];
	}, [faculty]);

	// Filtered programmes based on hierarchical selection
	const hierarchicalProgrammes = useMemo(() => {
		return programmes.filter((p) => {
			if (p.level !== academicLevel) return false;
			if (faculty && p.faculty !== faculty) return false;
			if (department && p.department !== department) return false;
			return true;
		});
	}, [academicLevel, faculty, department]);

	const handleSave = async () => {
		setIsSaving(true);

		// Simulate network delay for UX
		await new Promise((resolve) => setTimeout(resolve, 800));

		setIsSaving(false);
		setShowSaveSuccess(true);
		toast.success("Settings saved", {
			description: "Your preferences have been updated successfully.",
		});
		setTimeout(() => setShowSaveSuccess(false), 3000);
	};

	const handleReset = () => {
		useSettingsStore.getState().resetSettings(); // Resets to defaults and clears localStorage
		toast.info("Settings reset", {
			description: "All settings have been reset to defaults.",
		});
	};

	const toggleModuleRole = (role: ModuleRole) => {
		useSettingsStore.getState().updateSettings({
			includeModuleRoles: {
				...includeModuleRoles,
				[role]: !includeModuleRoles[role],
			},
		});
	};

	const togglePaperType = (type: PaperType) => {
		useSettingsStore.getState().updateSettings({
			includePaperTypes: {
				...includePaperTypes,
				[type]: !includePaperTypes[type],
			},
		});
	};

	// const selectedPattern = namingPatterns.find((p) => p.id === namingPattern);

	const router = useRouter();

	const handleBack = () => {
		router.history.back(); // Go back to the previous page
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
							<ArrowLeft className="w-4 h-4 text-muted-foreground" />
						</Button>
						<h1 className="text-2xl font-semibold flex items-center gap-2">
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
											// isConnected || isReconnecting
											() => (isConnected ? undefined : attemptReconnect())
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
									{isConnected && <p>Connected to past papers server</p>}
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
						<MiniDownloadCard />
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
					<TabsList className="grid w-full grid-cols-3">
						<TabsTrigger value="general">General</TabsTrigger>
						{/* <TabsTrigger value="programme" disabled>Programme</TabsTrigger> */}
						<TabsTrigger value="download">Download</TabsTrigger>
						{/* <TabsTrigger value="filters">Filters</TabsTrigger> */}
						<TabsTrigger value="papers">Papers</TabsTrigger>
						{/* <TabsTrigger value="advanced">Advanced</TabsTrigger> */}
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

						<Card className="opacity-50 pointer-events-none cursor-not-allowed select-none">
							<CardHeader>
								<CardTitle>Auto-Selection (Coming Soon)</CardTitle>
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
										onCheckedChange={(checked) =>
											useSettingsStore.getState().updateSettings({
												autoSelectModules: checked,
											})
										}
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
										onCheckedChange={(checked) =>
											useSettingsStore.getState().updateSettings({
												checkForUpdates: checked,
											})
										}
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
										onClick={() =>
											useSettingsStore
												.getState()
												.updateSettings({ programmeSelectionMode: "search" })
										}
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
										onClick={() =>
											useSettingsStore.getState().updateSettings({
												programmeSelectionMode: "hierarchical",
											})
										}
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
											value={programmeID}
											onValueChange={(v) =>
												useSettingsStore
													.getState()
													.updateSettings({ programmeID: v })
											}
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
												// onValueChange={(v) => {
												// 	setAcademicLevel(v as "undergrad" | "postgrad");
												// 	setfaculty("");
												// 	setdepartment("");
												// }}
												onValueChange={(v) => {
													useSettingsStore.getState().updateSettings({
														academicLevel: v as "undergrad" | "postgrad",
														faculty: "",
														department: "",
													});
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
												value={faculty}
												// onValueChange={(v) => {
												// 	setfaculty(v);
												// 	setdepartment("");
												// }}
												onValueChange={(v) => {
													useSettingsStore.getState().updateSettings({
														faculty: v,
														department: "",
													});
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
												value={department}
												onValueChange={(v) =>
													useSettingsStore.getState().updateSettings({
														department: v,
													})
												}
												disabled={!faculty}
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
											// value={selectedProgrammeId}
											// onValueChange={setSelectedProgrammeId}
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
									<Select
										value={year}
										onValueChange={(v) =>
											useSettingsStore.getState().updateSettings({ year: v })
										}
									>
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
								{/* <div className="space-y-2">
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

								<Separator /> */}

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
										// onCheckedChange={setModuleSubfolders}
										onCheckedChange={(checked) =>
											useSettingsStore.getState().updateSettings({
												moduleSubfolders: checked,
											})
										}
									/>
								</div>

								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<Label className="text-base flex items-center gap-2">
											<FileArchive className="w-4 h-4" />
											Zip multiple files
										</Label>
										<p className="text-sm text-muted-foreground">
											Download a single ZIP file instead of multiple individual
											files.
											<br />
											Note: This is enabled by default on non-Chromium browsers
											(Firefox, Safari, etc)
										</p>
									</div>
									<Switch
										checked={zipMultipleFiles}
										onCheckedChange={(checked) =>
											useSettingsStore.getState().updateSettings({
												zipMultipleFiles: checked,
											})
										}
									/>
								</div>

								<div className="space-y-2">
									<Label>File Naming Pattern</Label>
									<Select
										value={namingPattern}
										onValueChange={(v) =>
											useSettingsStore.getState().updateSettings({
												namingPattern: v as NamingPattern,
											})
										}
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
										onValueChange={([val]) =>
											useSettingsStore.getState().updateSettings({
												parallelDownloads: val,
											})
										}
										min={1}
										max={5}
										step={1}
										className="py-2"
									/>
									<div className="flex justify-between text-xs text-muted-foreground">
										<span>1 (reliable)</span>
										<span>5 (fast)</span>
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
										onValueChange={([val]) =>
											useSettingsStore.getState().updateSettings({
												retryAttempts: val,
											})
										}
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
									onValueChange={(val) =>
										useSettingsStore.getState().updateSettings({
											yearRange: val as [number, number],
										})
									}
									min={2000}
									max={new Date().getFullYear()}
									step={1}
									className="py-2"
								/>
								<div className="flex justify-between text-xs text-muted-foreground">
									<span>2000</span>
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
											onCheckedChange={(checked) =>
												useSettingsStore.getState().updateSettings({
													includeMetadata: checked,
												})
											}
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
											onCheckedChange={(checked) =>
												useSettingsStore.getState().updateSettings({
													includeModuleContent: checked,
												})
											}
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
											onCheckedChange={(checked) =>
												useSettingsStore.getState().updateSettings({
													includePrerequisites: checked,
												})
											}
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
											onCheckedChange={(checked) =>
												useSettingsStore.getState().updateSettings({
													includeCurriculumStructure: checked,
												})
											}
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
										onCheckedChange={(checked) =>
											useSettingsStore.getState().updateSettings({
												autoSyncProgrammeData: checked,
											})
										}
									/>
								</div>

								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<Label className="text-base">Cache Duration</Label>
										<Badge variant="secondary">{cacheDurationHours}h</Badge>
									</div>
									<Slider
										value={[cacheDurationHours]}
										onValueChange={([val]) =>
											useSettingsStore.getState().updateSettings({
												cacheDurationHours: val,
											})
										}
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
												toast.success("Copied!", {
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
				{/* <p className="text-center text-xs text-muted-foreground pb-4"> */}
				{/* Programme data syncs when connected to server • Last saved:{" "}
					{localStorage.getItem("pastpapers-settings")
						? JSON.parse(
								localStorage.getItem("pastpapers-settings")!,
							)?.lastSaved?.slice(0, 16)
						: "Never"} */}
				{/* Settings Last saved:{" "}
					{localStorage.getItem("pastpapers-settings")
						? JSON.parse(
								localStorage.getItem("pastpapers-settings")!,
							)?.lastSaved?.slice(0, 16)
						: "Never"} */}
				{/* </p> */}
			</div>
		</TooltipProvider>
	);
}
