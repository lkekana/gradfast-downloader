import { useEffect, useState } from "react";
import { Route, Routes, useParams } from "react-router";
import { Toaster } from "@/components/ui/toaster";
import { getModuleInfo, getModulePastPapers } from "./lib/api.ts";
import { modules } from "./lib/data.ts";
import type { ModuleInfo, PastPaper } from "./lib/types.ts";
import ModulePageSkeleton from "./pages/ModuleSkeleton.tsx";
import ModulesPage from "./pages/ModulesPage.tsx";
import ModulePage from "./pages/module.tsx";
import SettingsPage from "./pages/settings.tsx";

function ModulePageWrapper() {
	const { code } = useParams<{ code: string }>();
	const [moduleInfo, setModuleInfo] = useState<ModuleInfo | null>(null);
	const [pastPapers, setPastPapers] = useState<PastPaper[] | null>(null);
	// code will be in form "abc1234", we want to split into "abc" and "1234" where there can be any number of letters and digits, but letters always come first
	const match = code?.match(/^([a-zA-Z]+)(\d+)$/);
	if (!match) {
		return null;
	}
	const [prefix, number] = [match[1], parseInt(match[2], 10)];
	const module = modules.find(
		(m) =>
			m.code.prefix.toLowerCase() === prefix.toLowerCase() &&
			m.code.number === number,
	);

	useEffect(() => {
		if (module) {
			// Fetch module info and past papers in parallel
			Promise.all([
				getModuleInfo(module.code),
				getModulePastPapers(module.code),
			]).then(([info, papers]) => {
				setModuleInfo(info);
				setPastPapers(papers);
			});
		}
	}, [module]);
	return module && moduleInfo !== null && pastPapers !== null ? (
		<ModulePage
			module={module}
			moduleInfo={moduleInfo}
			pastPapers={pastPapers}
		/>
	) : (
		<ModulePageSkeleton />
	);
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
