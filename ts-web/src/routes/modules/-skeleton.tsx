// ModulePageSkeleton.tsx
/** biome-ignore-all lint/suspicious/noArrayIndexKey: This is a skeleton component, so using index as key is acceptable. */

import { useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ModulePageSkeletonProps {
	onBack?: () => void;
}

export default function ModulePageSkeleton({
	onBack,
}: ModulePageSkeletonProps) {
	const router = useRouter();

	const handleBack = () => {
		if (onBack) onBack();
		else router.history.back();
	};

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<header className="border-b bg-card px-4 py-3 sticky top-0 z-10">
				<div className="flex items-center gap-3 max-w-6xl mx-auto">
					<Button
						variant="ghost"
						size="icon"
						onClick={handleBack}
						className="shrink-0"
						disabled
					>
						<ArrowLeft className="w-4 h-4" />
					</Button>
					<div className="flex-1 min-w-0 space-y-2">
						<div className="flex items-center gap-2 flex-wrap">
							<Skeleton className="h-5 w-24" /> {/* Module code */}
							<Skeleton className="h-4 w-16 rounded" /> {/* Faculty badge */}
							<Skeleton className="h-4 w-20 rounded" /> {/* Period badge */}
						</div>
						<Skeleton className="h-4 w-3/4" /> {/* Module name */}
					</div>
					<Skeleton className="h-8 w-24 rounded-md" />{" "}
					{/* Download All button */}
				</div>
			</header>

			{/* Content */}
			<main className="max-w-6xl mx-auto p-4 space-y-6">
				{/* Quick Stats */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
					{[...Array(4)].map((_, i) => (
						<Card key={i}>
							<CardContent className="p-4 flex items-center gap-3">
								<Skeleton className="w-5 h-5 rounded-full" />
								<div className="space-y-2">
									<Skeleton className="h-3 w-12" /> {/* Label */}
									<Skeleton className="h-4 w-8" /> {/* Value */}
								</div>
							</CardContent>
						</Card>
					))}
				</div>

				{/* Main Content Tabs */}
				<Tabs defaultValue="overview" className="space-y-4">
					<TabsList className="grid w-full grid-cols-3">
						<TabsTrigger value="overview" disabled>
							Overview
						</TabsTrigger>
						<TabsTrigger value="papers" disabled>
							Past Papers
						</TabsTrigger>
						<TabsTrigger value="details" disabled>
							Details
						</TabsTrigger>
					</TabsList>

					{/* Overview Tab */}
					<TabsContent value="overview" className="space-y-4">
						<Card>
							<CardHeader>
								<Skeleton className="h-5 w-40" /> {/* CardTitle */}
								<Skeleton className="h-4 w-48" /> {/* CardDescription */}
							</CardHeader>
							<CardContent className="space-y-2">
								{[...Array(4)].map((_, i) => (
									<Skeleton key={i} className="h-4 w-full" />
								))}
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<Skeleton className="h-5 w-32" />
							</CardHeader>
							<CardContent>
								<Skeleton className="h-4 w-full" />
							</CardContent>
						</Card>
					</TabsContent>

					{/* Past Papers Tab */}
					<TabsContent value="papers" className="space-y-4">
						<Card>
							<CardHeader>
								<div className="flex items-center justify-between">
									<div className="space-y-2">
										<Skeleton className="h-5 w-40" />
										<Skeleton className="h-4 w-64" />
									</div>
									<Skeleton className="h-8 w-24 rounded-md" />
								</div>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{[...Array(4)].map((_, i) => (
										<div key={i} className="border rounded-lg p-4 space-y-3">
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-2">
													<Skeleton className="w-4 h-4 rounded" />
													<Skeleton className="h-4 w-24" />
												</div>
												<Skeleton className="h-4 w-6 rounded-full" />
											</div>
											<div className="space-y-2">
												{[...Array(3)].map((_, j) => (
													<Skeleton key={j} className="h-8 w-full rounded" />
												))}
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					{/* Details Tab */}
					<TabsContent value="details" className="space-y-4">
						<Card>
							<CardHeader>
								<Skeleton className="h-5 w-40" />
								<Skeleton className="h-4 w-48" />
							</CardHeader>
							<CardContent className="space-y-4">
								{[...Array(8)].map((_, i) => (
									<div
										key={i}
										className="flex items-start justify-between py-2 border-b last:border-0"
									>
										<Skeleton className="h-4 w-24" />
										<Skeleton className="h-4 w-32" />
									</div>
								))}
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</main>
		</div>
	);
}
