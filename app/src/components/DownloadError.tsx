import { AlertCircle, CircleStop } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DownloadContainer } from "./DownloadContainer";
import useDownload from "@/stores/downloadStore";
import { useConnectionStore } from "@/stores/connectionStore";

interface DownloadErrorProps {
	className?: string;
}

export function DownloadError({
	className,
}: DownloadErrorProps) {
	const reconnectError = useConnectionStore((s) => s.reconnectError);
	const { handleRetry, handleCancel } = useDownload();
	return (
		<DownloadContainer className={`border-red-500/50 ${className}`}>
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<AlertCircle className="w-4 h-4 text-red-500" />
					<p className="text-sm text-red-600">{reconnectError}</p>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline" size="sm" onClick={handleRetry}>
						Retry
					</Button>
					<Button variant="ghost" size="sm" onClick={handleCancel}>
						<CircleStop className="w-3 h-3" />
						Cancel
					</Button>
				</div>
			</div>
		</DownloadContainer>
	);
}
