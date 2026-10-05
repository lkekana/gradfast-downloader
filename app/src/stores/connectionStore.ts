import { create } from "zustand";
import { toast } from "@/hooks/use-toast";
import type { DefinedUseQueryResult } from "@tanstack/react-query";
import { getModulesOptions, useApiStore } from "./apiStore";
import { queryClient } from "@/lib/queryClient";

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
	isOnline: typeof window !== "undefined" ? navigator.onLine : false,
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
			const options = getModulesOptions(apiFetch);
			await queryClient.query(options);

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
			toast({ title: "❌ Connection failed", variant: "destructive" });
			// Auto-clear error after 5 seconds
			setTimeout(() => get().setReconnectError(null), 5000);
		} finally {
			set({ isReconnecting: false });
		}
	},
}));

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

// Native window listeners attached once on app load (No React required!)
if (typeof window !== "undefined") {
	window.addEventListener("online", handleOnline);
	window.addEventListener("offline", handleOffline);
}

export function useConnection() {
	const isOnline = useConnectionStore((state) => state.isOnline);
	const setIsOnline = useConnectionStore((state) => state.setIsOnline);
	const isConnected = useConnectionStore((state) => state.isConnected);
	const setIsConnected = useConnectionStore((state) => state.setIsConnected);
	const isReconnecting = useConnectionStore((state) => state.isReconnecting);
	const setIsReconnecting = useConnectionStore((state) => state.setIsReconnecting);
	const reconnectError = useConnectionStore((state) => state.reconnectError);
	const setReconnectError = useConnectionStore((state) => state.setReconnectError);
	const attemptReconnect = useConnectionStore((state) => state.attemptReconnect);

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