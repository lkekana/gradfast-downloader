import { LoaderCircle, Pause, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { Progress } from "@/components/ui/progress";
import useDownload from "@/stores/downloadStore";
import { CircularProgress } from "@/components/ui/circular-progress";

const IconClasses = "w-4 h-4 text-muted-foreground";

const MiniDownloadCard: React.FC = () => {
	const {
		downloadState,
		downloadProgress,
		moduleProgress,
		failedCount,
	} = useDownload();

	if (downloadState === "idle" && moduleProgress.length === 0) return null;

	return (
		<HoverCard openDelay={200} closeDelay={100}>
			<HoverCardTrigger>
				{downloadState === "downloading" ? (
					<CircularProgress
						className="h-8"
						value={downloadProgress}
						max={100}
						size={32}
						strokeWidth={4}
					/>
				) : (
					<Button variant="ghost" size="sm" className="gap-2 px-2">
						{downloadState === "paused" && (
							<Pause className={`${IconClasses} animate-pulse`} />
						)}
						{downloadState === "error" && (
							<AlertCircle className={`${IconClasses} text-destructive`} />
						)}
						{downloadState === "idle" && moduleProgress.length > 0 && (
							<CheckCircle2 className={`${IconClasses} text-green-500`} />
						)}
					</Button>
				)}
			</HoverCardTrigger>
			<HoverCardContent className="w-80 p-0" align="end">
				{/* Header with Overall Progress */}
				<div className="p-4 border-b">
					<div className="flex items-center justify-between mb-2">
						<h4 className="text-sm font-semibold">
							{downloadState === "downloading" && "Downloading..."}
							{downloadState === "paused" && "Paused"}
							{downloadState === "error" && "Connection Error"}
							{downloadState === "idle" && "Completed"}
						</h4>
						<span className="text-xs text-muted-foreground">
							{Math.round(downloadProgress)}%
						</span>
					</div>
					<Progress value={downloadProgress} className="h-2" />
					{failedCount > 0 && (
						<p className="text-xs text-destructive mt-2 flex items-center gap-1">
							<XCircle className="w-3 h-3" />
							{failedCount} module{failedCount !== 1 ? "s" : ""} failed
						</p>
					)}
				</div>

				{/* Scrollable Module List */}
				<div className="max-h-64 overflow-y-auto p-2 space-y-2">
					{moduleProgress.map((mp, index) => {
                        const progressValue = mp.papers.filter((p) => p.downloaded).length / mp.papers.length * 100;
						const downloadedPapersCount = mp.papers.filter((p) => p.downloaded).length;
						const totalPapersCount = mp.papers.length;
						const unavailablePapersCount = mp.papers.filter((p) => p.available === false).length;
                        return (
						<div
							key={`${mp.module.code.prefix}${mp.module.code.number}-${index}`}
							className="flex items-center gap-3 p-2 rounded-md hover:bg-accent/50 transition-colors"
						>
							<div className="w-8 h-8 flex items-center justify-center">
								{mp.status === "completed" && (
									<CheckCircle2 className="w-5 h-5 text-green-500" />
								)}
								{mp.status === "failed" && (
									<XCircle className="w-5 h-5 text-destructive" />
								)}
								{mp.status === "downloading" && (
									<LoaderCircle className="w-5 h-5 text-primary animate-spin" />
								)}
								{mp.status === "pending" && (
									<div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
								)}
							</div>
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium truncate">
									{mp.module.code.prefix}
									{mp.module.code.number}
								</p>
								<p className="text-xs text-muted-foreground truncate">
									{mp.status === "completed" && "Completed"}
									{mp.status === "failed" && "Failed"}
									{/* {mp.status === "downloading" && `${Math.round(mp.progress)}%`} */}
									{mp.status === "downloading" && `${downloadedPapersCount}/${totalPapersCount}${unavailablePapersCount > 0 ? ` (${unavailablePapersCount} unavailable)` : ""}`}
									{mp.status === "pending" && "Pending"}
								</p>
								{mp.status === "downloading" && (
									// <Progress value={mp.progress} className="h-1 mt-1" />
                                    <Progress value={progressValue} className="h-1 mt-1" />
								)}
							</div>
						</div>
                        )
                    })}
				</div>
			</HoverCardContent>
		</HoverCard>
	);
};

export default MiniDownloadCard;