import { createFileRoute } from "@tanstack/react-router";
import SettingsPage from "@/routes/settings/-ui";

export const Route = createFileRoute("/settings/papers")({
	component: () => <SettingsPage activeTab="papers" />,
});
