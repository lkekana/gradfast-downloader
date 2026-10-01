import { useEffect } from "react";
import { useConnectionStore } from "@/stores/connectionStore";
import { useModules } from "@/stores/apiStore";

export function ConnectionManager() {
    const { error: apiError } = useModules();
    const isConnected = useConnectionStore((s) => s.isConnected);
    const setIsConnected = useConnectionStore((s) => s.setIsConnected);
    const setReconnectError = useConnectionStore((s) => s.setReconnectError);
    const isOnline = useConnectionStore((s) => s.isOnline);
    const isReconnecting = useConnectionStore((s) => s.isReconnecting);
    const attemptReconnect = useConnectionStore((s) => s.attemptReconnect);

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