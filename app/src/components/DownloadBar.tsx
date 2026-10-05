import { Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { DownloadContainer } from "./DownloadContainer";
import { useConnection } from "@/stores/connectionStore";
import useDownload from "@/stores/downloadStore";
import { useModuleSelection } from "@/stores/selectionStore";

interface DownloadBarProps {
	// activeFilterCount?: number;
	className?: string;
}

export default function DownloadBar({
	// activeFilterCount = 0,
	className,
}: DownloadBarProps) {
	const { isOnline, isConnected } = useConnection();
	const { selectedCount } = useModuleSelection();
	const { handleDownload, canDownload } = useDownload();

	return (
		<DownloadContainer
			className={`flex items-center justify-between ${className}`}
		>
			<div>
				<span className="font-medium">{selectedCount}</span>
				<span className="text-muted-foreground ml-1">
					module{selectedCount !== 1 ? "s" : ""} selected
				</span>
				{/* {activeFilterCount > 0 && (
					<Badge variant="outline" className="ml-4 text-[10px]">
						{activeFilterCount} filter{activeFilterCount !== 1 ? "s" : ""}{" "}
						active
					</Badge>
				)} */}
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
						{!isOnline && <p>🌐 You need an internet connection to download</p>}
						{!isConnected && (
							<p>🔌 Not connected to the server – check your settings</p>
						)}
						{selectedCount === 0 && (
							<p>📭 Select at least one module to download</p>
						)}
					</TooltipContent>
				)}
			</Tooltip>
		</DownloadContainer>
	);
}
