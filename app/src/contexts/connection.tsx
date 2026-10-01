import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useModules } from "@/contexts/cookies";

interface ConnectionContextType {
	isOnline: boolean;
	isConnected: boolean;
	isReconnecting: boolean;
	reconnectError: string | null;
	attemptReconnect: () => Promise<void>;
}

const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined);

export function ConnectionProvider({ children }: { children: React.ReactNode }) {
	const [isOnline, setIsOnline] = useState(typeof window !== "undefined" ? navigator.onLine : false);
	const [isConnected, setIsConnected] = useState(false);
	const [isReconnecting, setIsReconnecting] = useState(false);
	const [reconnectError, setReconnectError] = useState<string | null>(null);
	const { toast } = useToast();
	const { refetch: getAPIModules, error: apiError, isLoading, isFetching, isPending } = useModules(); //  wrapper for react-query's useQuery to fetch modules from the API

	const attemptReconnect = useCallback(async () => {
		alert("Attempting to reconnect...");
		if (isConnected) return;
		if (isReconnecting || !isOnline) return;
		if (isLoading || isFetching || isPending) return;

		setIsReconnecting(true);
		setReconnectError(null);

		try {
			// get the modules from the API to check if the connection is successful
			await getAPIModules();

			setIsConnected(true);
			toast({
				title: "✅ Connected to server",
				description: "Ready to download your modules!",
				variant: "default",
			});
			setReconnectError(null);
		} catch (error) {
			console.error("Reconnect attempt failed:", error);
			setReconnectError("Failed to connect. Check your network settings.");
			toast({ title: "❌ Connection failed", variant: "destructive" });
			// Auto-clear error after 5 seconds
			setTimeout(() => setReconnectError(null), 5000);
		} finally {
			setIsReconnecting(false);
		}
	}, [isOnline, isReconnecting, toast, getAPIModules, isLoading, isFetching, isPending, isConnected]);

	useEffect(() => {
		if (apiError !== null) {
			setIsConnected(false);
			setReconnectError("Failed to connect. Check your network settings.");
		}
	}, [apiError]);

	// Auto-reconnect when coming back online
	useEffect(() => {
		if (isOnline && !isConnected && !isReconnecting) {
			const timer = setTimeout(() => {
				attemptReconnect();
			}, 2000);
			return () => clearTimeout(timer);
		}
	}, [isOnline, isConnected, attemptReconnect, isReconnecting]);

	useEffect(() => {
	    const handleOnline = () => {
	      setIsOnline(true);
	      if (!isConnected) {
	        setTimeout(attemptReconnect, 1000);
	      }
	    };

	    const handleOffline = () => {
	      setIsOnline(false);
	      setIsConnected(false);
	    };

	    window.addEventListener('online', handleOnline);
	    window.addEventListener('offline', handleOffline);

	    return () => {
	      window.removeEventListener('online', handleOnline);
	      window.removeEventListener('offline', handleOffline);
	    };
	  }, [isConnected, attemptReconnect]);

	// // Initialize online state properly on mount
	useEffect(() => {
	setIsOnline(navigator.onLine);
	}, []);

	console.log("Connection status:", {
		isOnline,
		isConnected,
		isReconnecting,
		reconnectError,
	});
	const value = useMemo<ConnectionContextType>(
    () => ({
      isOnline,
      isConnected,
      isReconnecting,
      reconnectError,
      attemptReconnect,
    }),
    [isOnline, isConnected, isReconnecting, reconnectError, attemptReconnect],
  );
	return (
		<ConnectionContext.Provider value={value}>{children}</ConnectionContext.Provider>
	);
};

export const useConnection = () => {
	const context = useContext(ConnectionContext);
	if (context === undefined) {
		throw new Error("useConnection must be used within a ConnectionProvider");
	}
	return context;
};
