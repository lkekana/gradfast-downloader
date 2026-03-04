import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const useConnection = () => {
	// const [isOnline, setIsOnline] = useState(navigator.onLine);
	const [isOnline, setIsOnline] = useState(Math.random() > 0.5);
	const [isConnected, setIsConnected] = useState(false);
	const [isReconnecting, setIsReconnecting] = useState(false);
	const [reconnectError, setReconnectError] = useState<string | null>(null);
	const { toast } = useToast();

	const attemptReconnect = async () => {
		if (isReconnecting || !isOnline) return;

		setIsReconnecting(true);
		setReconnectError(null);

		try {
			// Simulate network request
			await new Promise((resolve, reject) => {
				setTimeout(() => {
					// 80% success rate for demo
					Math.random() > 0.2
						? resolve(true)
						: reject(new Error("Connection timeout"));
				}, 1500);
			});

			setIsConnected(true);
			toast({
				title: "✅ Connected to server",
				description: "Ready to download your modules!",
				variant: "default",
			});
			setReconnectError(null);

		} catch (error) {
			setReconnectError("Failed to connect. Check your network settings.");
			toast({ title: "❌ Connection failed", variant: "destructive" });
			// Auto-clear error after 5 seconds
			setTimeout(() => setReconnectError(null), 5000);
		} finally {
			setIsReconnecting(false);
		}
	};

	// Auto-reconnect when coming back online
	useEffect(() => {
		if (isOnline && !isConnected && !isReconnecting) {
			const timer = setTimeout(() => {
				attemptReconnect();
			}, 2000);
			return () => clearTimeout(timer);
		}
	}, [isOnline, isConnected]);

	// useEffect(() => {
	//     const handleOnline = () => {
	//       setIsOnline(true);
	//       if (!isConnected) {
	//         setTimeout(attemptReconnect, 1000);
	//       }
	//     };

	//     const handleOffline = () => {
	//       setIsOnline(false);
	//       setIsConnected(false);
	//     };

	//     window.addEventListener('online', handleOnline);
	//     window.addEventListener('offline', handleOffline);

	//     return () => {
	//       window.removeEventListener('online', handleOnline);
	//       window.removeEventListener('offline', handleOffline);
	//     };
	//   }, [isConnected]);

	// // Initialize online state properly on mount
	// useEffect(() => {
	// setIsOnline(navigator.onLine);
	// }, []);

	return {
		isOnline,
		isConnected,
		isReconnecting,
		reconnectError,
		attemptReconnect,
	};
};

export default useConnection;
