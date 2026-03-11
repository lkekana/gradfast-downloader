import { AlertCircle, CircleStop } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DownloadContainer } from "./DownloadContainer";

interface DownloadErrorProps {
	error: string;
	onRetry: () => void;
	onCancel: () => void;
	className?: string;
}

export function DownloadError({
	error,
	onRetry,
	onCancel,
	className,
}: DownloadErrorProps) {
	return (
		<DownloadContainer className={`border-red-500/50 ${className}`}>
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<AlertCircle className="w-4 h-4 text-red-500" />
					<p className="text-sm text-red-600">{error}</p>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline" size="sm" onClick={onRetry}>
						Retry
					</Button>
					<Button variant="ghost" size="sm" onClick={onCancel}>
						<CircleStop className="w-3 h-3" />
						Cancel
					</Button>
				</div>
			</div>
		</DownloadContainer>
	);
}
