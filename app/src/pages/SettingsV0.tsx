import {
	AlertCircle,
	Check,
	FolderOpen,
	Info,
	RefreshCw,
	Save,
	Settings2,
	Wifi,
	WifiOff,
} from "lucide-react";
import { useEffect, useState } from "react";
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
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useModules } from "@/stores/apiStore";
import { useConnectionStore } from "@/stores/connectionStore";

// Mock data - replace with your actual programme/year data
const programmes = [
	{ id: "bsc-cs", name: "BSc Computer Science", faculties: ["SCI"] },
	{ id: "bsc-eng", name: "BSc Engineering", faculties: ["ENG"] },
	{ id: "bcom", name: "BCom Commerce", faculties: ["COM"] },
	{ id: "ba", name: "BA Humanities", faculties: ["HUM"] },
];

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
];

export default function SettingsPageV0() {
	const { toast } = useToast();
	const {
		isOnline,
		isConnected,
		isReconnecting,
		attemptReconnect,
		reconnectError,
	} = useConnection();

	// Form state
	const [programme, setProgramme] = useState<string>("");
	const [year, setYear] = useState<string>("");
	const [destinationFolder, setDestinationFolder] = useState<string>(
		"/downloads/past-papers/",
	);
	const [namingPattern, setNamingPattern] = useState<string>("code-year-type");
	const [parallelDownloads, setParallelDownloads] = useState<number>(3);
	const [retryAttempts, setRetryAttempts] = useState<number>(3);
	const [autoSelectModules, setAutoSelectModules] = useState<boolean>(true);
	const [checkForUpdates, setCheckForUpdates] = useState<boolean>(true);
	const [includeMetadata, setIncludeMetadata] = useState<boolean>(true);

	// UI state
	const [isSaving, setIsSaving] = useState<boolean>(false);
	const [showSaveSuccess, setShowSaveSuccess] = useState<boolean>(false);

	// Load saved settings on mount
	useEffect(() => {
		const saved = localStorage.getItem("pastpapers-settings");
		if (saved) {
			try {
				const parsed = JSON.parse(saved);
				setProgramme(parsed.programme || "");
				setYear(parsed.year || "");
				setDestinationFolder(
					parsed.destinationFolder || "/downloads/past-papers/",
				);
				setNamingPattern(parsed.namingPattern || "code-year-type");
				setParallelDownloads(parsed.parallelDownloads || 3);
				setRetryAttempts(parsed.retryAttempts || 3);
				setAutoSelectModules(parsed.autoSelectModules ?? true);
				setCheckForUpdates(parsed.checkForUpdates ?? true);
				setIncludeMetadata(parsed.includeMetadata ?? true);
			} catch (e) {
				console.error("Failed to load settings:", e);
			}
		}
	}, []);

	const handleSave = async () => {
		setIsSaving(true);

		// Simulate save delay
		await new Promise((resolve) => setTimeout(resolve, 800));

		const settings = {
			programme,
			year,
			destinationFolder,
			namingPattern,
			parallelDownloads,
			retryAttempts,
			autoSelectModules,
			checkForUpdates,
			includeMetadata,
			lastSaved: new Date().toISOString(),
		};

		localStorage.setItem("pastpapers-settings", JSON.stringify(settings));

		setIsSaving(false);
		setShowSaveSuccess(true);

		toast({
			title: "Settings saved",
			description: "Your preferences have been updated successfully.",
			variant: "default",
		});

		setTimeout(() => setShowSaveSuccess(false), 3000);
	};

	const handleReset = () => {
		setProgramme("");
		setYear("");
		setDestinationFolder("/downloads/past-papers/");
		setNamingPattern("code-year-type");
		setParallelDownloads(3);
		setRetryAttempts(3);
		setAutoSelectModules(true);
		setCheckForUpdates(true);
		setIncludeMetadata(true);

		toast({
			title: "Settings reset",
			description: "All settings have been reset to defaults.",
			variant: "destructive",
		});
	};

	const handleBrowseFolder = () => {
		// In a real app, this would use the File System Access API or electron.dialog
		toast({
			title: "Folder picker",
			description: "Native folder picker would open here.",
		});
	};

	// const selectedPattern = namingPatterns.find((p) => p.id === namingPattern);

	return (
		<TooltipProvider>
			<div className="max-w-3xl mx-auto p-4 md:p-6 space-y-6">
				{/* Connection Status Card */}
				<Card className="border-primary/20">
					<CardHeader className="pb-3">
						<div className="flex items-center justify-between">
							<div>
								<CardTitle className="flex items-center gap-2">
									<Settings2 className="w-5 h-5" />
									Connection Status
								</CardTitle>
								<CardDescription>
									Server and network connectivity
								</CardDescription>
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
													// 	? undefined
													// 	: attemptReconnect
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
					</CardHeader>
					{!isConnected && isOnline && (
						<CardContent className="pt-0">
							<div className="flex items-start gap-2 p-3 rounded-md bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
								<AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
								<p className="text-sm text-yellow-800 dark:text-yellow-200">
									Not connected to the server. Downloads will be unavailable
									until connection is restored.
								</p>
							</div>
						</CardContent>
					)}
				</Card>

				{/* Programme & Year */}
				<Card>
					<CardHeader>
						<CardTitle>Programme & Year</CardTitle>
						<CardDescription>
							Auto-select modules for your degree programme
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="programme">Academic Programme</Label>
								<Select value={programme} onValueChange={setProgramme}>
									<SelectTrigger id="programme">
										<SelectValue placeholder="Select your programme" />
									</SelectTrigger>
									<SelectContent>
										{programmes.map((prog) => (
											<SelectItem key={prog.id} value={prog.id}>
												{prog.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<p className="text-xs text-muted-foreground">
									Used to pre-select relevant modules on the home page
								</p>
							</div>

							<div className="space-y-2">
								<Label htmlFor="year">Current Year</Label>
								<Select value={year} onValueChange={setYear}>
									<SelectTrigger id="year">
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
									Helps filter modules by academic level
								</p>
							</div>
						</div>

						<Separator />

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label className="text-base">Auto-select modules</Label>
								<p className="text-sm text-muted-foreground">
									Automatically select modules matching your programme & year
								</p>
							</div>
							<Switch
								checked={autoSelectModules}
								onCheckedChange={setAutoSelectModules}
								disabled={!programme || !year}
							/>
						</div>
					</CardContent>
				</Card>

				{/* Download Preferences */}
				<Card>
					<CardHeader>
						<CardTitle>Download Preferences</CardTitle>
						<CardDescription>Customize how files are saved</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{/* Destination Folder */}
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

						{/* File Naming Pattern */}
						<div className="space-y-2">
							<Label>File Naming Pattern</Label>
							<Select value={namingPattern} onValueChange={setNamingPattern}>
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

						<Separator />

						{/* Additional Options */}
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label className="text-base flex items-center gap-2">
										Include metadata files
										<Tooltip>
											<TooltipTrigger asChild>
												<Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
											</TooltipTrigger>
											<TooltipContent className="max-w-xs">
												<p>
													Download accompanying .json files with module info,
													paper details, and timestamps
												</p>
											</TooltipContent>
										</Tooltip>
									</Label>
									<p className="text-sm text-muted-foreground">
										Helpful for offline reference and cataloging
									</p>
								</div>
								<Switch
									checked={includeMetadata}
									onCheckedChange={setIncludeMetadata}
								/>
							</div>

							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label className="text-base">Check for updates</Label>
									<p className="text-sm text-muted-foreground">
										Automatically check for new past papers on startup
									</p>
								</div>
								<Switch
									checked={checkForUpdates}
									onCheckedChange={setCheckForUpdates}
								/>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Advanced Settings */}
				<Card>
					<CardHeader>
						<CardTitle>Advanced</CardTitle>
						<CardDescription>Fine-tune download behavior</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						{/* Parallel Downloads */}
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
								<span>1 (slow, reliable)</span>
								<span>10 (fast, may trigger rate limits)</span>
							</div>
							<p className="text-xs text-muted-foreground">
								Higher values speed up bulk downloads but may be throttled by
								the server
							</p>
						</div>

						<Separator />

						{/* Retry Attempts */}
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

				{/* Action Buttons */}
				<div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
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

				{/* Footer note */}
				<p className="text-center text-xs text-muted-foreground pb-4">
					Programme data syncs when connected to server.
				</p>
			</div>
		</TooltipProvider>
	);
}
