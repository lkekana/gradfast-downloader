import { ClientOnly } from "@tanstack/react-router";
import { Wifi, WifiOff } from "lucide-react";
import ConnectionDot from "@/components/ConnectionDot";
import MiniDownloadCard from "@/components/MiniDownloadCard";
import SettingsDropdown from "@/components/SettingsDropdown";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useConnection } from "@/stores/connectionStore";
import { Skeleton } from "./ui/skeleton";

export function ModulesToolbar() {
	return (
		<header className="border-b bg-card px-4 py-3 flex items-center justify-between">
			<div className="flex items-center gap-4">
				<h1 className="text-2xl font-semibold mr-2">📚 Gradfast Downloader</h1>

				<ClientOnly fallback={<ToolbarConnectionSkeleton />}>
					<ToolbarConnectionStatus />
				</ClientOnly>
			</div>

			<div className="flex items-center">
				<MiniDownloadCard />
				<SettingsDropdown />
			</div>
		</header>
	);
}

function ToolbarConnectionStatus() {
	const {
		isOnline,
		isConnected,
		isReconnecting,
		attemptReconnect,
		reconnectError,
	} = useConnection();

	return (
		<>
			<Tooltip>
				<TooltipTrigger asChild>
					<div className="flex items-center gap-1.5 cursor-help">
						{isOnline ? (
							<Wifi className="w-4 h-4 text-green-500" />
						) : (
							<WifiOff className="w-4 h-4 text-red-500" />
						)}
						<span className="text-xs text-muted-foreground whitespace-nowrap">
							{isOnline ? "Online" : "Offline"}
						</span>
					</div>
				</TooltipTrigger>
				<TooltipContent>
					<p>
						{isOnline ? "Internet connection active" : "No internet connection"}
					</p>
				</TooltipContent>
			</Tooltip>

			{isOnline && (
				<Tooltip>
					<TooltipTrigger asChild>
						<button
							type="button"
							onClick={() => (isConnected ? undefined : attemptReconnect())}
							disabled={isReconnecting}
							className={`flex items-center gap-1.5 transition-opacity ${
								!isConnected && !isReconnecting
									? "cursor-pointer hover:opacity-80 active:scale-95"
									: "cursor-default"
							}`}
							aria-label={
								isConnected ? "Connected to server" : "Click to reconnect"
							}
						>
							<ConnectionDot
								state={
									isConnected
										? "online"
										: isReconnecting
											? "connecting"
											: "offline"
								}
							/>
							<span
								className={`text-xs whitespace-nowrap ${
									isConnected
										? "text-muted-foreground"
										: isReconnecting
											? "text-yellow-600"
											: "text-red-500"
								}`}
							>
								{isReconnecting
									? "Connecting…"
									: isConnected
										? "Connected"
										: "Disconnected"}
							</span>
						</button>
					</TooltipTrigger>
					<TooltipContent side="bottom" className="max-w-xs">
						{isConnected && <p>Connected to Gradfast</p>}
						{isReconnecting && <p>Attempting to reconnect…</p>}
						{!isConnected && !isReconnecting && (
							<div>
								<p className="font-medium my-1">
									🔌 Click to reconnect to server
								</p>
							</div>
						)}
						{reconnectError && (
							<p className="text-red-500 text-xs mt-1">⚠️ {reconnectError}</p>
						)}
					</TooltipContent>
				</Tooltip>
			)}
		</>
	);
}

function ToolbarConnectionSkeleton() {
	return (
		<>
			{/* Internet Status Skeleton */}
			<div className="flex items-center gap-1.5">
				<Skeleton className="h-4 w-4 rounded-full" />
				<Skeleton className="h-3 w-12" />
			</div>

			{/* Server Connection Skeleton */}
			<div className="flex items-center gap-1.5">
				<Skeleton className="h-2.5 w-2.5 rounded-full" />
				<Skeleton className="h-3 w-16" />
			</div>
		</>
	);
}
