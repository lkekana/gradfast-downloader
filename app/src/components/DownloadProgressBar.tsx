import { Pause, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DownloadContainer } from "./DownloadContainer";
import { useModuleSelection } from "@/stores/selectionStore";
import useDownload from "@/stores/downloadStore";

interface DownloadProgressBarProps {
	downloadPath: string;
	className?: string;
}

export default function DownloadProgressBar({
	downloadPath,
	className,
}: DownloadProgressBarProps) {
	const { selectedCount } = useModuleSelection();
	const { currentModule, currentModuleIndex, downloadProgress, handleCancel, handlePause} = useDownload();
	const remainingSeconds = Math.max(
		1,
		Math.round((100 - downloadProgress) / 20),
	);
	const progressValue = Math.min(100, Math.round(downloadProgress));

	return (
		<DownloadContainer className={`space-y-3 ${className}`}>
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
					<span className="font-medium">Downloading modules…</span>
				</div>
				<div className="flex items-center gap-2">
					<span className="text-sm font-mono text-muted-foreground pr-4">
						{progressValue}%
					</span>
					<Button
						variant="ghost"
						size="icon"
						onClick={handlePause}
						title="Pause download"
						className="h-8 w-8"
					>
						<Pause className="w-4 h-4" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						onClick={handleCancel}
						title="Cancel download"
						className="h-8 w-8"
					>
						<X className="w-4 h-4" />
					</Button>
				</div>
			</div>

			<Progress value={downloadProgress} className="h-2" />

			<div className="flex justify-between text-xs text-muted-foreground">
				<p>
					{selectedCount} module{selectedCount !== 1 ? "s" : ""} • Est. time:{" "}
					{remainingSeconds}s remaining
				</p>
				<p className="text-right">
					Saving to: <span className="font-mono">{downloadPath}</span>
				</p>
			</div>
		</DownloadContainer>
	);
}
