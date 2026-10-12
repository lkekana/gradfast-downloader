import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./index.css";
import App from "./App.tsx";
import { QueryClientProvider } from "@tanstack/react-query";
import { ConnectionManager } from "./components/ConnectionManager.tsx";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "./lib/queryClient.ts";
import { Toaster } from "sonner";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<BrowserRouter>
			<QueryClientProvider client={queryClient}>
				<TooltipProvider>
					<ConnectionManager />
					<Toaster />
					<App />
				</TooltipProvider>
			</QueryClientProvider>
		</BrowserRouter>
	</StrictMode>,
);
