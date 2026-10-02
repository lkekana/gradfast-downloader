import {
	ArrowLeft,
	BookOpen,
	Calendar,
	Clock,
	Download,
	FileText,
	GraduationCap,
	Languages,
	Link2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getPastPaperCounts } from "@/lib/api";
import { facultyAbbreviation, periodAbbreviation } from "@/lib/data";
import type { Module, ModuleInfo, PastPaper } from "@/lib/types";
import {
	Dialog,
	DialogContent,
	// DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
  } from "@/components/ui/dialog"
  import {
	Table,
	TableBody,
	// TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
  } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldGroup,
	FieldLabel,
	FieldTitle,
  } from "@/components/ui/field"
  import { useApiStore } from "../stores/apiStore";

interface ModulePageProps {
	module: Module;
	moduleInfo: ModuleInfo;
	pastPapers: PastPaper[];
	onBack?: () => void;
}

export default function ModulePage({
	module,
	moduleInfo,
	pastPapers,
	onBack,
}: ModulePageProps) {
	const nav = useNavigate();

	const moduleId = `${module.code.prefix}${module.code.number}`;
	const hasPapers = pastPapers.length > 0;

	const handleDownloadAll = () => {
		console.log(`Downloading all papers for ${moduleId}`);
	};

	const handleBack = () => {
		if (onBack) {
			onBack();
		} else {
			nav(-1); // Go back to the previous page
		}
	};

	const pastPaperCounts = useMemo(
		() => getPastPaperCounts(pastPapers),
		[pastPapers],
	);

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<header className="border-b bg-card px-4 py-3 sticky top-0 z-10">
				{/* <nav className="text-xs text-muted-foreground mb-2">
  <a href="/home" className="hover:underline">Modules</a>
  <span className="mx-1">/</span>
  <span className="font-medium text-foreground">{moduleId}</span>
</nav> */}
				<div className="flex items-center gap-3 max-w-6xl mx-auto">
					<Button
						variant="ghost"
						size="icon"
						onClick={handleBack}
						className="shrink-0"
					>
						<ArrowLeft className="w-4 h-4" />
					</Button>
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-2 flex-wrap">
							<h1 className="text-lg font-semibold font-mono">{moduleId}</h1>
							{module.faculty && (
								<Badge variant="outline" className="text-xs">
									{facultyAbbreviation(module.faculty)}
								</Badge>
							)}
							{module.period && (
								<Badge variant="secondary" className="text-xs">
									{module.period}
								</Badge>
							)}
						</div>
						<p className="text-sm text-muted-foreground truncate">
							{module.name}
						</p>
					</div>
					{hasPapers && (
						<Button size="sm" onClick={handleDownloadAll} className="gap-1">
							<Download className="w-4 h-4" />
							Download All
						</Button>
					)}
				</div>
			</header>

			{/* Content */}
			<main className="max-w-6xl mx-auto p-4 space-y-6">
				{/* Quick Stats */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
					<Card>
						<CardContent className="p-4 flex items-center gap-3">
							<BookOpen className="w-5 h-5 text-muted-foreground" />
							<div>
								<p className="text-xs text-muted-foreground">Credits</p>
								<p className="font-semibold">{moduleInfo.credits ?? "—"}</p>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-4 flex items-center gap-3">
							<GraduationCap className="w-5 h-5 text-muted-foreground" />
							<div>
								<p className="text-xs text-muted-foreground">NQF Level</p>
								<p className="font-semibold">{moduleInfo.nqfLevel ?? "—"}</p>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-4 flex items-center gap-3">
							<Calendar className="w-5 h-5 text-muted-foreground" />
							<div>
								<p className="text-xs text-muted-foreground">Period</p>
								<p className="font-semibold">{module.period}</p>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-4 flex items-center gap-3">
							<Clock className="w-5 h-5 text-muted-foreground" />
							<div>
								<p className="text-xs text-muted-foreground">Contact Time</p>
								<p className="font-semibold text-sm">
									{moduleInfo.contactTime ?? "—"}
								</p>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Main Content Tabs */}
				<Tabs defaultValue="overview" className="space-y-4">
					<TabsList className="grid w-full grid-cols-3">
						<TabsTrigger value="overview">Overview</TabsTrigger>
						<TabsTrigger value="papers">Past Papers</TabsTrigger>
						<TabsTrigger value="details">Details</TabsTrigger>
					</TabsList>

					{/* Overview Tab */}
					<TabsContent value="overview" className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Module Description</CardTitle>
								<CardDescription>Content and learning outcomes</CardDescription>
							</CardHeader>
							<CardContent className="prose prose-sm dark:prose-invert max-w-none">
								{moduleInfo.content ? (
									<div className="whitespace-pre-wrap text-sm leading-relaxed">
										{moduleInfo.content}
									</div>
								) : (
									<p className="text-muted-foreground text-sm italic">
										No description available for this module.
									</p>
								)}
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="text-lg flex items-center gap-2">
									<Link2 className="w-4 h-4" />
									Prerequisites
								</CardTitle>
							</CardHeader>
							<CardContent>
								{/* <p className="text-sm text-muted-foreground">
										{moduleInfo.prerequisites}
									</p> */}
								{Array.isArray(moduleInfo.prerequisites) ? (
									<ul className="list-disc list-inside text-sm">
										{moduleInfo.prerequisites.map((prereq, index) => (
											<li key={prereq}>{prereq}</li>
										))}
									</ul>
								) : (
									<p className="text-sm text-muted-foreground">
										{moduleInfo.prerequisites}
									</p>
								)}
							</CardContent>
						</Card>
					</TabsContent>

					{/* Past Papers Tab */}
					<TabsContent value="papers" className="space-y-4">
						<Card>
							<CardHeader>
								<div className="flex items-center justify-between">
									<div>
										<CardTitle className="text-lg">
											Available Past Papers
										</CardTitle>
										<CardDescription>
											{hasPapers
												? "Download or view past assessment materials"
												: "No past papers available yet"}
										</CardDescription>
									</div>
									{/* {hasPapers && (
										<Button
											variant="outline"
											size="sm"
											onClick={handleDownloadAll}
										>
											<Download className="w-4 h-4 mr-1" />
											Download All
										</Button>
									)} */}
								</div>
							</CardHeader>
							<CardContent>
								{hasPapers ? (
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										{pastPaperCounts.exams > 0 && (
											<PaperCategory
												title="Examinations"
												icon="📝"
												count={pastPaperCounts.exams}
												moduleId={moduleId}
												type="exam"
												papers={pastPapers.filter((p) => p.category === "Exams" || p.category === "Exam" || p.category === "Exam Opportunities")}
											/>
										)}
										{pastPaperCounts.semesterTests > 0 && (
											<PaperCategory
												title="Semester Tests"
												icon="🧪"
												count={pastPaperCounts.semesterTests}
												moduleId={moduleId}
												type="semester"
												papers={pastPapers.filter((p) => p.category === "Semester Tests" || p.category === "Semester Test")}
											/>
										)}
										{pastPaperCounts.classTests > 0 && (
											<PaperCategory
												title="Class Tests"
												icon="✏️"
												count={pastPaperCounts.classTests}
												moduleId={moduleId}
												type="class"
												papers={pastPapers.filter((p) => p.category === "Class Tests")}
											/>
										)}
										{pastPaperCounts.practicals > 0 && (
											<PaperCategory
												title="Practicals"
												icon="🔬"
												count={pastPaperCounts.practicals}
												moduleId={moduleId}
												type="practical"
												papers={pastPapers.filter((p) => p.category === "Practical Tests")}
											/>
										)}
										{pastPaperCounts.tutorials > 0 && (
											<PaperCategory
												title="Tutorials"
												icon="📚"
												count={pastPaperCounts.tutorials}
												moduleId={moduleId}
												type="tutorial"
												papers={pastPapers.filter((p) => p.category === "Tutorials" || p.category === "Tutorial Tests")}
											/>
										)}
										{pastPaperCounts.other > 0 && (
											<PaperCategory
												title="Other"
												icon="📄"
												count={pastPaperCounts.other}
												moduleId={moduleId}
												type="other"
												papers={pastPapers.filter((p) => !["Exams", "Exam", "Semester Tests", "Exam Opportunities", "Semester Test", "Class Tests", "Tutorials", "Tutorial Tests", "Practical Tests"].includes(p.category))}
											/>
										)}
									</div>
								) : (
									<div className="text-center py-8 text-muted-foreground">
										<FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
										<p>
											No past papers have been uploaded for this module yet.
										</p>
										<p className="text-xs mt-1">
											Check back later or contact your faculty.
										</p>
									</div>
								)}
							</CardContent>
						</Card>
					</TabsContent>

					{/* Details Tab */}
					<TabsContent value="details" className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Module Information</CardTitle>
								<CardDescription>
									Administrative and academic details
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<DetailRow label="Full Code" value={moduleId} />
								<DetailRow label="Name" value={module.name} />
								{module.faculty && (
									<DetailRow label="Faculty" value={module.faculty} />
								)}
								{moduleInfo.qualification && (
									<DetailRow
										label="Qualification"
										value={moduleInfo.qualification}
									/>
								)}
								<DetailRow
									label="Credits"
									value={moduleInfo.credits.toString() ?? "—"}
								/>
								<DetailRow
									label="NQF Level"
									value={moduleInfo.nqfLevel.toString() ?? "—"}
								/>
								{moduleInfo.language && (
									<DetailRow
										label="Language"
										value={moduleInfo.language}
										icon={<Languages className="w-4 h-4" />}
									/>
								)}
								{moduleInfo.contactTime && (
									<DetailRow
										label="Contact Time"
										value={moduleInfo.contactTime}
										icon={<Clock className="w-4 h-4" />}
									/>
								)}
								{module.period && (
									<DetailRow
										label="Academic Period"
										value={periodAbbreviation(module.period)}
										icon={<Calendar className="w-4 h-4" />}
									/>
								)}
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</main>
		</div>
	);
}

function PaperCategory({
	title,
	icon,
	count,
	moduleId,
	type,
	papers,
}: {
	title: string;
	icon: string;
	count: number;
	moduleId: string;
	type: string;
	papers: PastPaper[];
}) {
	const [selectedPapers, setSelectedPapers] = useState<PastPaper[]>(papers);
	// const [zipEnabled, setZipEnabled] = useState<boolean>(false);
	const handlePaperDownload = useApiStore((state) => state.handlePaperDownload);

	const toggleSelectAll = () => {
		if (selectedPapers.length === papers.length) {
			setSelectedPapers([]);
		} else {
			setSelectedPapers(papers);
		}
	};

	const selectPaper = (paper: PastPaper) => {
		if (selectedPapers.includes(paper)) {
			setSelectedPapers(selectedPapers.filter((p) => p !== paper));
		} else {
			setSelectedPapers([...selectedPapers, paper]);
		}
	};

	const downloadSelection = () => {
		selectedPapers.forEach((paper) => {
			handlePaperDownload(moduleId, paper);
		});
	};

	return (
		<div className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
			<div className="flex items-center justify-between mb-3">
				<div className="flex items-center gap-2">
					<span className="text-lg">{icon}</span>
					<h4 className="font-medium text-sm">{title}</h4>
				</div>
				<Badge variant="secondary" className="text-xs">
					{count}
				</Badge>
			</div>
			<div className="space-y-2">
				{papers.slice(0, 3).map((paper, i) => {
				return (
					<Button
						key={paper.url}
						variant="ghost"
						size="sm"
						className="w-full justify-start text-xs h-8"
						onClick={() => console.log(`View ${type} ${i + 1} for ${moduleId}`)}
					>
						<FileText className="w-3 h-3 mr-2 opacity-50" />
						{paper.year} - {paper.description} {paper.memo === "yes" && "(Memo)"}
					</Button>
				)
				})}
				
				<Dialog>
				<DialogTrigger><Button variant="link" size="sm" className="h-6 px-0 text-xs">
						View all {count} {title.toLowerCase()} →
					</Button></DialogTrigger>
				<DialogContent>
					<DialogHeader>
					<DialogTitle>{`All ${title} for ${moduleId}`}</DialogTitle>
					{/* <DialogDescription>
						This action cannot be undone. This will permanently delete your account
						and remove your data from our servers.
					</DialogDescription> */}
					</DialogHeader>
					<Table>
  {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
  <TableHeader>
    <TableRow>
	  <TableHead>Year</TableHead>
      <TableHead>Description</TableHead>
	  <TableHead>Has Memo?</TableHead>
      <TableHead><Checkbox checked={selectedPapers.length === papers.length} onCheckedChange={toggleSelectAll} /></TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
	{papers.map((paper) => {
					return (
						<TableRow key={paper.url}>
							<TableCell className="font-medium">{paper.year}</TableCell>
							<TableCell>{paper.description}</TableCell>
							<TableCell>{paper.memo}</TableCell>
							<TableCell>
								<Checkbox checked={selectedPapers.includes(paper)} onCheckedChange={() => selectPaper(paper)} />
							</TableCell>
						</TableRow>
					);
				})}
  </TableBody>
</Table>
{/* <FieldGroup>
<FieldLabel>
        <Field orientation="horizontal">
		  <Checkbox id="zip-checkbox" name="zip-checkbox" checked={zipEnabled} onCheckedChange={(checked) => setZipEnabled(checked === true)} />
          <FieldContent>
            <FieldTitle>Download as ZIP</FieldTitle>
            <FieldDescription>
			  Enable for single ZIP file download of all selected papers.
            </FieldDescription>
          </FieldContent>
        </Field>
      </FieldLabel>
    </FieldGroup> */}
<Button
  variant="default"
  disabled={selectedPapers.length === 0}
  size="sm"
  className="mt-4"
onClick={downloadSelection}
>
	  <Download className="w-4 h-4 mr-1" />	
{`Download selected ${title.toLowerCase()}`}
</Button>
				</DialogContent>
				</Dialog>
			</div>
		</div>
	);
}

function DetailRow({
	label,
	value,
	icon,
}: {
	label: string;
	value: string;
	icon?: React.ReactNode;
}) {
	return (
		<div className="flex items-start justify-between py-2 border-b last:border-0">
			<div className="flex items-center gap-2 text-sm text-muted-foreground">
				{icon}
				<span>{label}</span>
			</div>
			<span className="text-sm font-medium text-right max-w-[60%] break-words">
				{value}
			</span>
		</div>
	);
}
