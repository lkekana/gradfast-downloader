import { create } from "zustand";
import { getGFModulesOptions, useApiStore } from "./apiStore";
import { queryClient } from "@/lib/queryClient";
import { toast } from "sonner";

interface ConnectionState {
	isOnline: boolean;
	isConnected: boolean;
	isReconnecting: boolean;
	reconnectError: string | null;

	setIsOnline: (val: boolean) => void;
	setIsConnected: (val: boolean) => void;
	setIsReconnecting: (val: boolean) => void;
	setReconnectError: (val: string | null) => void;
	attemptReconnect: () => Promise<void>;
}

export const useConnectionStore = create<ConnectionState>((set, get) => ({
	// isOnline: typeof window !== "undefined" ? navigator.onLine : false,
	isOnline: false,
	isConnected: false,
	isReconnecting: false,
	reconnectError: null,

	setIsOnline: (val) => set({ isOnline: val }),
	setIsConnected: (val) => set({ isConnected: val }),
	setIsReconnecting: (val) => set({ isReconnecting: val }),
	setReconnectError: (val) => set({ reconnectError: val }),

	attemptReconnect: async () => {
		// alert("Attempting to reconnect...");
		const { isOnline, isConnected, isReconnecting } = get();
		if (isConnected) return;
		if (isReconnecting || !isOnline) return;
		// if (isLoading || isFetching || isPending) return;

		set({ isReconnecting: true, reconnectError: null });

		try {
			// get the modules from the API to check if the connection is successful
			const apiFetch = useApiStore.getState().apiFetch;
			const options = getGFModulesOptions(apiFetch);
			await queryClient.refetchQueries(options);

			set({ isConnected: true, reconnectError: null });
			// toast({
			// 	title: "✅ Connected to server",
			// 	description: "Ready to download your modules!",
			// 	variant: "default",
			// });
		} catch (error) {
			console.error("Reconnect attempt failed:", error);
			set({
				reconnectError: "Failed to connect. Check your network settings.",
			});
			toast.error("Connection failed", { position: "top-center" });
			// Auto-clear error after 5 seconds
			setTimeout(() => get().setReconnectError(null), 5000);
		} finally {
			set({ isReconnecting: false });
		}
	},
}));

export function useConnection() {
	const isOnline = useConnectionStore((state) => state.isOnline);
	const setIsOnline = useConnectionStore((state) => state.setIsOnline);
	const isConnected = useConnectionStore((state) => state.isConnected);
	const setIsConnected = useConnectionStore((state) => state.setIsConnected);
	const isReconnecting = useConnectionStore((state) => state.isReconnecting);
	const setIsReconnecting = useConnectionStore(
		(state) => state.setIsReconnecting,
	);
	const reconnectError = useConnectionStore((state) => state.reconnectError);
	const setReconnectError = useConnectionStore(
		(state) => state.setReconnectError,
	);
	const attemptReconnect = useConnectionStore(
		(state) => state.attemptReconnect,
	);

	return {
		isOnline,
		setIsOnline,
		isConnected,
		setIsConnected,
		isReconnecting,
		setIsReconnecting,
		reconnectError,
		setReconnectError,
		attemptReconnect,
	};
}
