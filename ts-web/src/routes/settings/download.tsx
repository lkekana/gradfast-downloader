import { createFileRoute } from '@tanstack/react-router'
import SettingsPage from '@/routes/settings/-ui';

export const Route = createFileRoute('/settings/download')({
    component: () => <SettingsPage activeTab="download" />,
})
