import { Ban, CircleStop, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DownloadContainer } from "./DownloadContainer";
import useDownload from "@/stores/downloadStore";
import { useModuleSelection } from "@/stores/selectionStore";

interface DownloadPausedProps {
	// downloadPath: string;
	className?: string;
}

export default function DownloadPaused({
	// downloadPath,
	className,
}: DownloadPausedProps) {
	const { selectedCount } = useModuleSelection();
	const {currentModule, currentModuleIndex, downloadProgress, handleRetry, handleCancel} = useDownload();
	const progressValue = Math.min(100, Math.round(downloadProgress));

	return (
		<DownloadContainer className={`space-y-3 ${className}`}>
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					{/* Paused indicator - static bars instead of spinner */}
					<div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center">
						<div className="flex gap-0.5">
							<div className="w-0.5 h-2 bg-primary rounded-sm" />
							<div className="w-0.5 h-2 bg-primary rounded-sm" />
						</div>
					</div>
					<span className="font-medium">Download paused</span>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={handleRetry}
						className="gap-1"
					>
						<Play className="w-3 h-3" />
						Resume
					</Button>
					<Button variant="ghost" size="sm" onClick={handleCancel}>
						<CircleStop className="w-3 h-3" />
						Cancel
					</Button>
				</div>
			</div>

			<Progress value={progressValue} className="h-2" />

			<div className="flex justify-between text-xs text-muted-foreground">
				<p>
					{/* Saving to: <span className="font-mono">{downloadPath}</span> */}
					{currentModule ? (
						<span className="font-medium">{`Paused at ${progressValue}% for ${selectedCount} module${selectedCount !== 1 ? "s" : ""}`}</span>
					) : (
						"Waiting to resume..."
					)}
				</p>
				<p className="text-right">
					{/* Saving to: <span className="font-mono">{downloadPath}</span> */}
					{currentModule ? (
						<span className="font-medium">{`Stopped on ${currentModule.code.prefix}${currentModule.code.number} (${currentModuleIndex + 1}/${selectedCount})`}</span>
					) : (
						"Waiting to resume..."
					)}
				</p>
			</div>
		</DownloadContainer>
	);
}
