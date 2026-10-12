import type React from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { useModuleFilters } from "@/stores/filterStore";

interface FilterSummaryBarProps {
	isDownloading: boolean;
}

const FilterSummaryBar: React.FC<FilterSummaryBarProps> = ({
	isDownloading,
}) => {
	const { filterChips, removeFilterChip, activeFilterCount, clearAllFilters } =
		useModuleFilters();
	return (
		<div className="flex flex-wrap items-center gap-2 mb-4 animate-in fade-in slide-in-from-top-1">
			<span className="text-xs font-medium text-muted-foreground mr-1">
				Active filters:
			</span>

			{filterChips.map((chip) => (
				<button
					type="button"
					key={chip.id}
					onClick={(e) => {
						e.stopPropagation();
						removeFilterChip(chip);
					}}
					className="ml-1 rounded-full p-0.5 hover:bg-muted focus:outline-none focus:ring-1 focus:ring-ring"
					aria-label={`Remove ${chip.label} filter`}
				>
					<Badge
						key={chip.id}
						variant="secondary"
						className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium cursor-pointer hover:bg-secondary/80 transition-colors group"
					>
						{chip.label}

						<span className="text-[10px] leading-none">×</span>
					</Badge>
				</button>
			))}

			{/* Clear all button - only show if 2+ chips */}
			{activeFilterCount > 1 && (
				<Button
					variant="ghost"
					size="sm"
					onClick={clearAllFilters}
					disabled={isDownloading}
					className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
				>
					Clear all
				</Button>
			)}
		</div>
	);
};

export default FilterSummaryBar;
