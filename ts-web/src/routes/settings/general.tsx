import { createFileRoute } from "@tanstack/react-router";
import SettingsPage from "@/routes/settings/-ui";

export const Route = createFileRoute("/settings/general")({
	component: () => <SettingsPage activeTab="general" />,
});
