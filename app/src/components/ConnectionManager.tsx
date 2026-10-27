import { useEffect } from "react";
import { useConnection } from "@/stores/connectionStore";
import { useModules } from "@/stores/apiStore";

export function ConnectionManager() {
	const { error: apiError } = useModules();
	const {
		isConnected,
		setIsConnected,
		setReconnectError,
		isOnline,
		isReconnecting,
		attemptReconnect,
	} = useConnection();

	// Sync React Query apiError to Zustand store
	useEffect(() => {
		if (apiError !== null) {
			setIsConnected(false);
			setReconnectError("Failed to connect. Check your network settings.");
		}
	}, [apiError, setIsConnected, setReconnectError]);

	// Auto-reconnect when coming back online
	useEffect(() => {
		if (isOnline && !isConnected && !isReconnecting) {
			const timer = setTimeout(attemptReconnect, 2000);
			return () => clearTimeout(timer);
		}
	}, [isOnline, isConnected, isReconnecting, attemptReconnect]);

	return null; // Headless component, renders nothing!
}
