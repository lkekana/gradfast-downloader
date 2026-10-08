import { Filter, Settings } from "lucide-react";
import React from "react";
import { Link } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const IconClasses = "w-8 h-8 text-muted-foreground !size-6";

const SettingsDropdown: React.FC = () => {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="sm">
					<Settings className={`${IconClasses}`} />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem asChild>
					<Link to="/settings" className="w-full h-full">
						Settings
					</Link>
				</DropdownMenuItem>
				{/* <DropdownMenuItem disabled>Check for updates</DropdownMenuItem>
				<DropdownMenuSeparator /> */}
				<DropdownMenuItem className="text-muted-foreground">
					v1.0.0
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default SettingsDropdown;
