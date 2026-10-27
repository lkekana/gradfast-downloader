import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/settings/")({
	beforeLoad: ({ location }) => {
		if (location.pathname === "/settings") {
			throw Route.redirect({ to: "/settings/general", replace: true });
		}
	},
});
