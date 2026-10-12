import { Filter } from "lucide-react";
import type React from "react";
import titleCase from "voca/title_case";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FilterDropdownProps {
	singularLabel: string;
	pluralLabel: string;
	items: string[];
	filteredItems: string[];
	setFilteredItems: React.Dispatch<React.SetStateAction<string[]>>;
	isDownloading: boolean;
	isFilterActive: (filter: string[], totalItems: number) => boolean;
	getFilterLabel: (
		selectedCount: number,
		totalCount: number,
		pluralLabel: string,
		singularLabel: string,
	) => string;
	renderItem?: (item: string) => React.ReactNode;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
	singularLabel,
	pluralLabel,
	items,
	filteredItems,
	setFilteredItems,
	isDownloading,
	isFilterActive,
	getFilterLabel,
	renderItem,
}) => {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant={
						isFilterActive(filteredItems, items.length) ? "default" : "outline"
					}
					size="sm"
					disabled={isDownloading}
					className={
						isFilterActive(filteredItems, items.length) ? "border-primary" : ""
					}
				>
					<Filter className="w-4 h-4 mr-1" />
					{getFilterLabel(
						filteredItems.length,
						items.length,
						pluralLabel,
						singularLabel,
					)}
					{isFilterActive(filteredItems, items.length) && (
						<Badge variant="secondary" className="ml-2 h-5 px-1.5 text-[10px]">
							{filteredItems.length}
						</Badge>
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56">
				<div className="p-3">
					<p className="text-sm font-medium text-muted-foreground mb-2">
						{titleCase(singularLabel)}
					</p>
					<DropdownMenuCheckboxItem
						checked={filteredItems.length === 0}
						onCheckedChange={(checked) => {
							if (checked) setFilteredItems([]);
						}}
						className="text-sm"
					>
						All {pluralLabel}
					</DropdownMenuCheckboxItem>
					{items.map((item) => (
						<DropdownMenuCheckboxItem
							key={item}
							onCheckedChange={(checked) => {
								setFilteredItems(
									(prev) =>
										checked
											? [...prev, item] // Add to filter
											: prev.filter((i) => i !== item), // Remove from filter
								);
							}}
							checked={filteredItems.includes(item)}
							className="text-sm"
						>
							{renderItem ? renderItem(item) : item}
						</DropdownMenuCheckboxItem>
					))}
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default FilterDropdown;
