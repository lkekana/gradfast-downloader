import { Navigate, Route, Routes, useParams } from "react-router";
import ModulePageSkeleton from "./pages/ModuleSkeleton";
import ModulesPage from "./pages/ModulesPage";
import ModulePage from "./pages/Module";
import SettingsPage from "./pages/Settings.tsx";
import Test from "./pages/test.tsx";
import { useModuleInfo, useModulePastPapers } from "./stores/apiStore";
import { getModuleInfo } from "./lib/data";

function ModulePageWrapper() {
	const { code } = useParams<{ code: string }>();

	// code will be in form "abc1234", we want to split into "abc" and "1234" where there can be any number of letters and digits, but letters always come first
	const match = code?.match(/^([a-zA-Z]+)(\d+)$/);
	const isValid = match !== null && match !== undefined;
	const prefix = match ? match[1] : "";
	const number = match ? parseInt(match[2], 10) : 0;

	const {
		data: module,
		isPending: isModulePending,
		isError: isModuleError,
	} = useModuleInfo({ prefix, number }, { enabled: isValid });
	const { data: pastPapers, isPending: isPapersPending } = useModulePastPapers(
		{
			prefix,
			number,
		},
		{ enabled: isValid },
	);
	console.log(pastPapers);

	if (!isValid) {
		return <Navigate to="/404" replace />;
	}

	if (isModulePending || isPapersPending) {
		return <ModulePageSkeleton />;
	}

	if (isModuleError || !module) {
		// If the API confirms it doesn't exist, or network failed
		return <Navigate to="/404" replace />;
	}

	const moduleInfo = getModuleInfo(module.code);

	if (!moduleInfo) {
		return (
			<div className="p-4 text-center text-muted-foreground">
				Module details missing from local cache.
			</div>
		);
	}

	return (
		<ModulePage
			module={module}
			moduleInfo={moduleInfo}
			pastPapers={pastPapers || []}
		/>
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
					{/* <Route path="/test" element={<Test />} /> */}
				</Routes>
			</main>
		</div>
	);
}
