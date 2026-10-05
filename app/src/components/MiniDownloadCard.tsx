import { LoaderCircle, Info, Pause, AlertCircle } from "lucide-react";
import React from "react";
import { Link } from "react-router";
import { Button } from "./ui/button";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "./ui/hover-card";
import useDownload from "@/stores/downloadStore";
import { CircularProgress } from "./ui/circular-progress";

interface MiniDownloadCardProps {
    className?: string;
}

const IconClasses = "w-4 h-4 text-muted-foreground";

const MiniDownloadCard: React.FC<MiniDownloadCardProps> = ({ className }) => {
    const {downloadState, downloadProgress} = useDownload();
	return (
        downloadState === "idle" ? null : (
		<HoverCard openDelay={200} closeDelay={100}>
			<HoverCardTrigger asChild className={className}>
                {downloadState === "downloading" ? (
                <CircularProgress
                    className="h-8"
                    value={downloadProgress}
                    max={100}
                    size={32}
                    strokeWidth={4}
                />
                ) : (
                <Button
                    variant="ghost"
                    size="sm"
                    // onClick={() => {}}
                    className="gap-2"
                >
                {downloadState === "paused" && (
                    <Pause className={`${IconClasses} animate-pulse`} />
                )}
                {downloadState === "error" && (
                    <AlertCircle className={`${IconClasses}`} />
                )}
                </Button>
                )}

			</HoverCardTrigger>
			<HoverCardContent>
			</HoverCardContent>
		</HoverCard>
        )
	);
};

export default MiniDownloadCard;
