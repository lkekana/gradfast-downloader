import { Wifi, WifiOff } from "lucide-react";
import React from "react";
import useConnection from "@/hooks/useConnection";
import SettingsDropdown from "./SettingsDropdown";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export function ModulesToolbar() {
	const {
		isOnline,
		isConnected,
		isReconnecting,
		attemptReconnect,
		reconnectError,
	} = useConnection();

	return (
		<header className="border-b bg-card px-4 py-3 flex items-center justify-between">
			<div className="flex items-center gap-3">
				<h1 className="text-2xl font-semibold">📚 Gradfast Downloader</h1>

				{/* Internet Status - Always shown */}
				<Tooltip>
					<TooltipTrigger asChild>
						<div className="flex items-center gap-1.5 ml-2 cursor-help">
							{isOnline ? (
								<Wifi className="w-4 h-4 text-green-500" />
							) : (
								<WifiOff className="w-4 h-4 text-red-500" />
							)}
							<span className="text-xs text-muted-foreground">
								{isOnline ? "Online" : "Offline"}
							</span>
						</div>
					</TooltipTrigger>
					<TooltipContent>
						<p>
							{isOnline
								? "You are connected to the internet"
								: "No internet connection – some features disabled"}
						</p>
					</TooltipContent>
				</Tooltip>

				{/* Server Connection Status - Only shown when online */}
				{isOnline && (
					<Tooltip>
						<TooltipTrigger asChild>
							<button
								type="button"
								onClick={
									isConnected || isReconnecting ? undefined : attemptReconnect
								}
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
								<div className="relative">
									<div
										className={`w-2 h-2 rounded-full transition-colors ${
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
									{isReconnecting && (
										<span className="absolute inset-0 flex items-center justify-center">
											<span className="w-1.5 h-1.5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
										</span>
									)}
								</div>
								<span
									className={`text-xs ${
										isConnected
											? "text-muted-foreground"
											: isReconnecting
												? "text-yellow-600 font-medium"
												: "text-red-500 font-medium"
									}`}
								>
									{isReconnecting
										? "Connecting…"
										: isConnected
											? "Server connected"
											: "Disconnected"}
								</span>
							</button>
						</TooltipTrigger>
						<TooltipContent side="bottom" className="max-w-xs">
							{isConnected && <p>✅ Connected to past papers server</p>}
							{isReconnecting && <p>🔄 Attempting to reconnect…</p>}
							{!isConnected && !isReconnecting && (
								<div>
									<p className="font-medium mb-1">🔌 Not connected to server</p>
									<p className="text-xs text-muted-foreground">
										Click the status indicator above to retry connection
									</p>
								</div>
							)}
							{reconnectError && (
								<p className="text-red-500 text-xs mt-1">⚠️ {reconnectError}</p>
							)}
						</TooltipContent>
					</Tooltip>
				)}
			</div>

			<SettingsDropdown />
		</header>
	);
}
