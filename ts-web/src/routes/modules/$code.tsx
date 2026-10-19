import { getModuleInfoOptions, getPastPapersOptions, useApiStore, useModuleInfo, useModulePastPapers } from "@/stores/apiStore";
import { createFileRoute, getRouteApi, Navigate } from "@tanstack/react-router";
import ModulePageSkeleton from "@/routes/modules/-skeleton";
import ModulePage from "@/routes/modules/-module";
import { getServerModuleData } from "#/lib/data.functions";
import { useQuery } from "@tanstack/react-query";
import { homeDefaultSearchState } from "..";

export const Route = createFileRoute("/modules/$code")({
	loader: async ({ params }) => {
		const match = params.code?.match(/^([a-zA-Z]+)(\d+)$/);
		if (!match) throw new Error("Invalid module code");
		const prefix = match[1];
		const number = parseInt(match[2], 10);

		return await getServerModuleData({
			data: { prefix, number },
		});
	},
	component: ModulePageWrapper,
});

function ModulePageWrapper() {
	const serverData = Route.useLoaderData();
	const { code } = Route.useParams();
	const apiFetch = useApiStore((state) => state.apiFetch);

	// code will be in form "abc1234", we want to split into "abc" and "1234" where there can be any number of letters and digits, but letters always come first
	const match = code?.match(/^([a-zA-Z]+)(\d+)$/);
	const isValid = match !== null && match !== undefined;
	const prefix = match ? match[1] : "";
	const number = match ? parseInt(match[2], 10) : 0;

	// const {
	// 	data: module,
	// 	isPending: isModulePending,
	// 	isError: isModuleError,
	// } = useModuleInfo({ prefix, number }, { enabled: isValid });
	// const { data: pastPapers, isPending: isPapersPending } = useModulePastPapers(
	// 	{
	// 		prefix,
	// 		number,
	// 	},
	// 	{ enabled: isValid },
	// );
	// console.log(pastPapers);

	if (!isValid) {
		// return <Navigate to="/404" replace />;
		return <Navigate from={Route.fullPath} to="/" replace search={homeDefaultSearchState}/>;
	}

	// if (isModulePending || isPapersPending) {
	// 	return <ModulePageSkeleton />;
	// }

	// if (isModuleError || !module) {
	// 	// If the API confirms it doesn't exist, or network failed
	// 	// return <Navigate to="/404" replace />;
	// 	return <Navigate to="/" replace />;
	// }

	// const moduleInfo = getModuleInfo(module.code);

	// if (!moduleInfo) {
	// 	return (
	// 		<div className="p-4 text-center text-muted-foreground">
	// 			Module details missing from local cache.
	// 		</div>
	// 	);
	// }

	// Use initialData to seed the cache instantly on the client
	const { data: module } = useQuery({
		...getModuleInfoOptions({ prefix, number }, apiFetch),
		initialData: serverData.moduleInfo, // Seeds cache synchronously!
	  });
	  
	  const { data: pastPapers } = useQuery({
		...getPastPapersOptions({ prefix, number }, apiFetch),
		initialData: serverData.pastPapers, // Seeds cache synchronously!
	  });

	if (!module || !pastPapers) return <ModulePageSkeleton />;


	return (
		<ModulePage
			module={module}
			moduleInfo={serverData.moduleInfo}
			pastPapers={pastPapers}
		/>
	);
}
