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

const SettingsDropdown: React.FC = () => {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon">
					<Settings className="w-4 h-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem asChild>
					<Link to="/settings" className="w-full h-full">
						Settings
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem>Check for updates</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem className="text-muted-foreground">
					v1.0.0
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default SettingsDropdown;
