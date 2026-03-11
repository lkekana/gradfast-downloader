import { useEffect, useMemo, useState } from "react";

export type Theme = "light" | "dark";
export type ThemeSetting = Theme | "system";

const COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)";
const LOCAL_STORAGE_KEY = "theme";

const getSystemTheme = (): Theme => {
	if (typeof window === "undefined") return "light"; // Default fallback
	return window.matchMedia(COLOR_SCHEME_QUERY).matches ? "dark" : "light";
};

const resolveTheme = (theme: ThemeSetting): Theme => {
	return theme === "system" ? getSystemTheme() : theme;
};

const applyTheme = (setting: ThemeSetting) => {
	if (typeof window === "undefined") return;

	try {
		const root = window.document.documentElement;
		const themeToApply = resolveTheme(setting);

		root.classList.remove("light", "dark");
		root.classList.add(themeToApply);

		localStorage.setItem(LOCAL_STORAGE_KEY, setting);
	} catch {
		// Ignore storage errors (private mode, quota exceeded, etc.)
	}
};

export const useTheme = () => {
	const [themeSetting, setThemeSetting] = useState<ThemeSetting>(() => {
		if (typeof window === "undefined") return "system";
		try {
			const item = localStorage.getItem(LOCAL_STORAGE_KEY);
			if (item === "light" || item === "dark" || item === "system") {
				return item;
			}
		} catch {
			// Ignore storage errors (private mode, quota exceeded, etc.)
		}
		return "system";
	});

	// Apply theme whenever themeSetting changes
	useEffect(() => {
		applyTheme(themeSetting);
	}, [themeSetting]);

	// If "system" setting, check system theme and apply
	useEffect(() => {
		if (typeof window === "undefined") return;
		if (themeSetting !== "system") return;

		const mediaQuery = window.matchMedia(COLOR_SCHEME_QUERY);
		const handleChange = () => applyTheme("system");

		// Add listener for system theme changes
		mediaQuery.addEventListener("change", handleChange);
		return () => mediaQuery.removeEventListener("change", handleChange);
	}, [themeSetting]);

	// Computed: the actual theme being applied (always "light" | "dark")
	const actualTheme = useMemo<Theme>(
		() => resolveTheme(themeSetting),
		[themeSetting],
	);

	return {
		themeSetting,
		setThemeSetting,
		actualTheme,
		isDark: actualTheme === "dark",
		isLight: actualTheme === "light",
	};
};
