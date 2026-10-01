import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./index.css";
import App from "./App.tsx";
import { ConnectionProvider } from "./contexts/connection.tsx";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<BrowserRouter>
			<App />
					<ConnectionProvider>
					<App />
					</ConnectionProvider>
		</BrowserRouter>
	</StrictMode>,
);
