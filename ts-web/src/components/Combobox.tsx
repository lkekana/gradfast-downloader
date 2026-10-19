import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// --- Context ---
type ComboboxContextType = {
	value: string;
	onValueChange: (value: string) => void;
	open: boolean;
	setOpen: (open: boolean) => void;
	searchValue: string;
	onSearchChange: (value: string) => void;
};

const ComboboxContext = React.createContext<ComboboxContextType | null>(null);

const useCombobox = () => {
	const context = React.useContext(ComboboxContext);
	if (!context) {
		throw new Error("useCombobox must be used within a Combobox");
	}
	return context;
};

// --- Sub-components ---

type ComboboxItemProps = React.ComponentPropsWithoutRef<typeof CommandItem> & {
	value: string;
};

export const ComboboxItem = React.forwardRef<
	React.ElementRef<typeof CommandItem>,
	ComboboxItemProps
>(({ className, value, children, ...props }, ref) => {
	const { onValueChange, setOpen, value: selectedValue } = useCombobox();

	return (
		<CommandItem
			ref={ref}
			value={value}
			onSelect={() => {
				onValueChange(value === selectedValue ? "" : value);
				setOpen(false);
			}}
			className={cn("cursor-pointer", className)}
			{...props}
		>
			<Check
				className={cn(
					"mr-2 h-4 w-4 shrink-0",
					selectedValue === value ? "opacity-100" : "opacity-0",
				)}
			/>
			{children}
		</CommandItem>
	);
});
ComboboxItem.displayName = "ComboboxItem";

export const ComboboxEmpty = React.forwardRef<
	React.ElementRef<typeof CommandEmpty>,
	React.ComponentPropsWithoutRef<typeof CommandEmpty>
>(({ className, ...props }, ref) => {
	return (
		<CommandEmpty
			ref={ref}
			className={cn("py-6 text-center text-sm", className)}
			{...props}
		/>
	);
});
ComboboxEmpty.displayName = "ComboboxEmpty";

// --- Root Component ---

type ComboboxProps = {
	value: string;
	onValueChange: (value: string) => void;
	searchValue: string;
	onSearchChange: (value: string) => void;
	placeholder?: string;
	className?: string;
	selectedLabel?: string; // Label to show in trigger when value is selected
	children?: React.ReactNode;
};

export function Combobox({
	value,
	onValueChange,
	searchValue,
	onSearchChange,
	placeholder = "Select...",
	className,
	selectedLabel,
	children,
}: ComboboxProps) {
	const [open, setOpen] = React.useState(false);

	// Determine if we should disable internal cmdk filtering
	// If onSearchChange is provided, we assume external filtering is happening
	const disableInternalFilter = !!onSearchChange;

	return (
		<ComboboxContext.Provider
			value={{
				value,
				onValueChange,
				open,
				setOpen,
				searchValue,
				onSearchChange,
			}}
		>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						role="combobox"
						aria-expanded={open}
						className={cn("w-full justify-between", className)}
					>
						<span className="truncate">
							{selectedLabel || value ? selectedLabel || value : placeholder}
						</span>
						<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-[--radix-popover-trigger-width] p-0">
					<Command
						value={searchValue}
						onValueChange={onSearchChange}
						filter={(_value, _search) => (disableInternalFilter ? 1 : 0)}
					>
						<CommandInput placeholder={placeholder} className="h-9" />
						<CommandList>{children}</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
		</ComboboxContext.Provider>
	);
}
