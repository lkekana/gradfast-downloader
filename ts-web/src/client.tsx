// src/client.tsx
import { StartClient } from "@tanstack/react-start/client";
import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { useConnectionStore } from "./stores/connectionStore";

// Client-only connection management
if (typeof window !== "undefined") {
	const setIsOnline = useConnectionStore.getState().setIsOnline;
	setIsOnline(navigator.onLine);
}
const handleOnline = () => {
	const state = useConnectionStore.getState();
	state.setIsOnline(true);
	if (!state.isConnected) setTimeout(() => state.attemptReconnect(), 1000);
};

const handleOffline = () => {
	const state = useConnectionStore.getState();
	state.setIsOnline(false);
	state.setIsConnected(false);
};

// Native window listeners attached once on app load
if (typeof window !== "undefined") {
	window.addEventListener("online", handleOnline);
	window.addEventListener("offline", handleOffline);
}

hydrateRoot(
	document,
	<StrictMode>
		<StartClient />
	</StrictMode>,
);
