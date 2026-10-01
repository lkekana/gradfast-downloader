import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./index.css";
import App from "./App.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CookieProvider } from "./contexts/cookies.tsx";
import { ConnectionProvider } from "./contexts/connection.tsx";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<BrowserRouter>
			<QueryClientProvider client={queryClient}>
				<CookieProvider>
					<ConnectionProvider>
					<App />
					</ConnectionProvider>
				</CookieProvider>
			</QueryClientProvider>
		</BrowserRouter>
	</StrictMode>,
);
