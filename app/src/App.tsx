import { Route, Routes, useParams } from "react-router";
import { Toaster } from "@/components/ui/toaster";
import { modules } from "./data.ts";
import ModulesPage from "./pages/ModulesPage.tsx";
import { ModuleDetail } from "./pages/module.tsx";
import SettingsPage from "./pages/settings.tsx";

function ModulePageWrapper() {
  const { code } = useParams<{ code: string }>();
  // code will be in form "abc1234", we want to split into "abc" and "1234" where there can be any number of letters and digits, but letters always come first
  const match = code?.match(/^([a-zA-Z]+)(\d+)$/);
  if (!match) {
    return null;
  }
  const [prefix,number] = [match[1], parseInt(match[2], 10)];
  const module = modules.find(m => m.prefix.toLowerCase() === prefix.toLowerCase() && m.code === number);
  return module ? <ModuleDetail module={module} /> : null;
}

export default function App() {
  return (
    <div className="app-root">
      {/* optional shared header/nav */}
      <header>{/* ... */}</header>

      <main>
      <Routes>
				<Route path="/" element={<ModulesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/modules/:code" element={<ModulePageWrapper />} />
			</Routes>
      </main>

      <Toaster />
    </div>
  );
}
