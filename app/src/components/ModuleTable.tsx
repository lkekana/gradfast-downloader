// @/components/ModulesTable.tsx

import { Info } from "lucide-react";
import { Link } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { getPastPaperCounts } from "@/lib/api";
import { facultyAbbreviation, cachedPastPapers } from "@/lib/data";
import type { Module } from "@/lib/types";
import useDownload from "@/stores/downloadStore";
import { useModuleSelection } from "@/stores/selectionStore";

interface ModulesTableProps {
	filteredModules: Module[];
	onClearFilters?: () => void;
}

const checkboxClass = "w-4 h-4 rounded";

export default function ModulesTable({
	filteredModules,
	onClearFilters,
}: ModulesTableProps) {
	const { isDownloadActive } = useDownload();
	const {selectedModules, selectAllVisible, clearSelection, toggleModule} = useModuleSelection();
	const allSelected =
		filteredModules.length > 0 &&
		selectedModules.size === filteredModules.length;

	const handleSelectAllChange = (checked: boolean) => {
		if (checked) {
			selectAllVisible(filteredModules);
		} else {
			clearSelection();
		}
	};

	return (
		<div className="flex-1 overflow-auto rounded-md border">
			<Table>
				<TableHeader className="sticky top-0 bg-background z-10">
					<TableRow>
						<TableHead className="w-12">
						<div className="flex items-center justify-center h-full">
							<Checkbox
								checked={allSelected}
								onCheckedChange={handleSelectAllChange}
								disabled={isDownloadActive}
								className={checkboxClass}
							/>
							</div>
						</TableHead>
						<TableHead>Module</TableHead>
						<TableHead>Name</TableHead>
						<TableHead>Faculty</TableHead>
						<TableHead>Period</TableHead>
						<TableHead className="text-right">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{filteredModules.map((mod) => {
						const id = `${mod.code.prefix}${mod.code.number}`;
						const isSelected = selectedModules.has(mod);

						// TODO: Remember this will require async state management (needs caching & loading skeletons)
						const pastPapers = cachedPastPapers[id] || [];
						const pastPaperCounts = getPastPaperCounts(pastPapers);

						return (
							<TableRow
								key={id}
								className={`cursor-pointer transition-colors ${
									isSelected
										? "bg-primary/5 hover:bg-primary/10"
										: "hover:bg-muted/50"
								} ${isDownloadActive ? "opacity-75 cursor-not-allowed" : ""}`}
								onClick={() => toggleModule(mod)}
							>
								<TableCell
								className="w-12" onClick={(e) => e.stopPropagation()}>
								<div className="flex items-center justify-center h-full">
									<Checkbox
										checked={isSelected}
										onCheckedChange={() => toggleModule(mod)}
										disabled={isDownloadActive}
										className={checkboxClass}
									/>
									</div>
								</TableCell>
								<TableCell className="font-mono font-medium">
									{mod.code.prefix}
									{mod.code.number}
								</TableCell>
								<TableCell className="max-w-xs truncate" title={mod.name}>
									{mod.name}
								</TableCell>
								<TableCell>
									{mod.faculty ? (
										<Badge variant="outline" className="text-xs">
											{mod.faculty}
										</Badge>
									) : (
										<span className="text-muted-foreground text-xs">—</span>
									)}
								</TableCell>
								<TableCell>
									{mod.period ? (
										<Badge variant="secondary" className="text-xs">
											{mod.period}
										</Badge>
									) : (
										<span className="text-muted-foreground text-xs">—</span>
									)}
								</TableCell>
								<TableCell
									className="text-right"
									onClick={(e) => e.stopPropagation()}
								>
									<HoverCard openDelay={200} closeDelay={100}>
										<HoverCardTrigger asChild>
											<Button variant="ghost" size="sm" className="gap-1">
												<Link
													to={`/modules/${id}`}
													className="flex items-center gap-1"
												>
													Details
													<Info className="w-3 h-3 opacity-50" />
												</Link>
											</Button>
										</HoverCardTrigger>
										<HoverCardContent className={`w-80 p-3 ${isDownloadActive ? "opacity-0" : ""}`}>
											<div className="space-y-2">
												<div className="flex items-center justify-end">
													<h4 className="font-medium text-base px-2">
														{mod.code.prefix}
														{mod.code.number}
													</h4>
													<Badge variant="outline" className="text-xs">
														{facultyAbbreviation(mod.faculty)}
													</Badge>
												</div>
												<p className="text-sm text-muted-foreground">
													{mod.name}
												</p>

												<div className="pt-2 border-t text-left">
													<p className="text-xs font-medium text-muted-foreground mb-2">
														Available Past Papers
													</p>
													<div className="grid grid-cols-2 gap-2 text-xs">
														<div className="flex items-center gap-1">
															<span className="text-muted-foreground">
																📝 Exams:
															</span>
															<span className="font-medium">
																{pastPaperCounts.exams}
															</span>
														</div>
														<div className="flex items-center gap-1">
															<span className="text-muted-foreground">
																🧪 Sem. Tests:
															</span>
															<span className="font-medium">
																{pastPaperCounts.semesterTests}
															</span>
														</div>
														<div className="flex items-center gap-1">
															<span className="text-muted-foreground">
																✏️ Class Tests:
															</span>
															<span className="font-medium">
																{pastPaperCounts.classTests}
															</span>
														</div>
														<div className="flex items-center gap-1">
															<span className="text-muted-foreground">
																🔬 Practicals:
															</span>
															<span className="font-medium">
																{pastPaperCounts.practicals}
															</span>
														</div>
														<div className="flex items-center gap-1 col-span-2">
															<span className="text-muted-foreground">
																📚 Tutorials:
															</span>
															<span className="font-medium">
																{pastPaperCounts.tutorials}
															</span>
														</div>
														<div className="flex items-center gap-1">
															<span className="text-muted-foreground">
																📄 Other:
															</span>
															<span className="font-medium">
																{pastPaperCounts.other}
															</span>
														</div>
													</div>
												</div>

												<div className="pt-2 flex justify-end">
													<Button size="sm" variant="secondary" asChild>
														<Link
															to={`/modules/${id}`}
															className="flex items-center gap-1"
														>
															View more
															<Info className="w-3 h-3 opacity-50" />
														</Link>
													</Button>
												</div>
											</div>
										</HoverCardContent>
									</HoverCard>
								</TableCell>
							</TableRow>
						);
					})}
					{filteredModules.length === 0 && (
						<TableRow>
							<TableCell
								colSpan={6}
								className="text-center text-muted-foreground py-12"
							>
								<div className="flex flex-col items-center gap-2">
									<Info className="w-8 h-8 opacity-30" />
									<p>No modules match your filters</p>
									{onClearFilters && (
										<Button variant="link" size="sm" onClick={onClearFilters}>
											Clear all filters
										</Button>
									)}
								</div>
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
}
