import { create } from "zustand";

export type Theme = "light" | "dark";
export type ThemeSetting = Theme | "system";

export const COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)";
export const LOCAL_STORAGE_KEY = "theme";
const DEFAULT_THEME: Theme = "light"; 

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

interface ThemeState {
	themeSetting: ThemeSetting;
	setThemeSetting: (setting: ThemeSetting) => void;
	actualTheme: Theme;
}

export const useThemeStore = create<ThemeState>((set) => ({
	themeSetting: "system",
	actualTheme: DEFAULT_THEME,

	setThemeSetting: (setting) => {
		applyTheme(setting);
		set({ themeSetting: setting, actualTheme: resolveTheme(setting) });
	},
}));

export const useTheme = () => {
	const themeSetting = useThemeStore((state) => state.themeSetting);
	const setThemeSetting = useThemeStore((state) => state.setThemeSetting);
	const actualTheme = useThemeStore((state) => state.actualTheme);

	return {
		themeSetting: themeSetting,
		setThemeSetting: setThemeSetting,
		actualTheme: actualTheme,
		isDark: actualTheme === "dark",
		isLight: actualTheme === "light",
	};
};

export const syncThemeOnClient = () => {
	if (typeof window === "undefined") return;
	try {
		const item = localStorage.getItem(LOCAL_STORAGE_KEY);
		let validSetting: ThemeSetting = "system";
		if (item === "light" || item === "dark" || item === "system") {
			validSetting = item;
		}
		
		const resolved = resolveTheme(validSetting);
		
		// Update DOM
		const root = window.document.documentElement;
		root.classList.remove("light", "dark");
		root.classList.add(resolved);
		
		// Update store
		useThemeStore.setState({
			themeSetting: validSetting,
			actualTheme: resolved,
		});
	} catch (e) {
		console.warn("Failed to sync theme on client", e);
	}
};
