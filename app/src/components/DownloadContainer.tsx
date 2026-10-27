interface DownloadContainerProps {
	children: React.ReactNode;
	className?: string;
}

export function DownloadContainer({
	children,
	className = "",
}: DownloadContainerProps) {
	return (
		<div
			className={`sticky bottom-0 mt-4 p-4 bg-card border rounded-lg shadow-lg animate-in slide-in-from-bottom-2 ${className}`}
		>
			{children}
		</div>
	);
}
