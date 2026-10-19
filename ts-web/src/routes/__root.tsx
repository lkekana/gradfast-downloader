import {
	ClientOnly,
	HeadContent,
	Scripts,
	createRootRoute,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";

import appCss from "../styles.css?url";
import { ConnectionManager } from "#/components/ConnectionManager";
import { queryClient } from "#/lib/queryClient";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { dehydrate, HydrationBoundary, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { syncThemeOnClient } from "#/stores/themeStore";
import { useEffect } from "react";
import { getStaticModulesOptions } from "#/stores/apiStore";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Gradfast Downloader",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
			{ rel: "icon", href: "/favicon.png" },
		],
	}),
	shellComponent: RootDocument,
	loader: async () => {
		await queryClient.query(getStaticModulesOptions());
		return {
			dehydratedState: dehydrate(queryClient),
		};
	},
});

function RootDocument({ children }: { children: React.ReactNode }) {
	const { dehydratedState } = Route.useLoaderData();
	
	useEffect(() => {
		syncThemeOnClient();
	}, []);

	return (
		<html lang="en">
			<head>
				<HeadContent />
				{/** biome-ignore lint/security/noDangerouslySetInnerHtml: This is necessary to set the theme before the page renders to avoid a flash of unstyled content. */}
				<script dangerouslySetInnerHTML={{ __html: `
					(function() {
					try {
						const theme = localStorage.getItem('theme');
						const isDark = theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
						if (isDark) document.documentElement.classList.add('dark');
					} catch (e) {}
					})();
				`}} />
			</head>
			<body>
				<QueryClientProvider client={queryClient}>
				<HydrationBoundary state={dehydratedState}>
					<TooltipProvider>
						<ClientOnly>
							<ConnectionManager />
						</ClientOnly>
						<Toaster />
						{children}
					</TooltipProvider>
				</HydrationBoundary>
				</QueryClientProvider>
				<TanStackDevtools
					config={{
						position: "bottom-right",
					}}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}
