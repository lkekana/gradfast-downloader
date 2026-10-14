import { Wifi, WifiOff } from "lucide-react";
import SettingsDropdown from "./SettingsDropdown";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { useConnection } from "@/stores/connectionStore";
import MiniDownloadCard from "./MiniDownloadCard";
import { ClientOnly } from "@tanstack/react-router";
import ConnectionDot from "./ConnectionDot";

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
							{/* <div className="relative shrink-0 w-2 h-2">
								<div
									className={`w-full h-full rounded-full transition-colors ${
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
							</div> */}
							<ConnectionDot
  state={isConnected ? "online" : isReconnecting ? "connecting" : "offline"}
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

export function ModulesToolbar() {
	return (
		<header className="border-b bg-card px-4 py-3 flex items-center justify-between">
			<div className="flex items-center gap-4">
				<h1 className="text-2xl font-semibold mr-2">📚 Gradfast Downloader</h1>

				<ClientOnly>
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
