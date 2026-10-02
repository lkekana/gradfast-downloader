import { create } from "zustand";

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

interface ThemeState {
	themeSetting: ThemeSetting;
	setThemeSetting: (setting: ThemeSetting) => void;
	actualTheme: Theme;
}

// 1. Initialize state synchronously
let initialSetting: ThemeSetting = "system";
if (typeof window !== "undefined") {
	try {
		const item = localStorage.getItem(LOCAL_STORAGE_KEY);
		if (item === "light" || item === "dark" || item === "system") {
			initialSetting = item;
		}
	} catch {}
}

// 2. Apply IMMEDIATELY before React even hydrates! (Zero FOUC)
applyTheme(initialSetting);

export const useThemeStore = create<ThemeState>((set) => ({
	themeSetting: initialSetting,
	actualTheme: resolveTheme(initialSetting),

	setThemeSetting: (setting) => {
		applyTheme(setting);
		set({ themeSetting: setting, actualTheme: resolveTheme(setting) });
	},
}));

// Apply if OS theme changes while in "system" mode
if (typeof window !== "undefined") {
	window.matchMedia(COLOR_SCHEME_QUERY).addEventListener("change", () => {
		const state = useThemeStore.getState();
		if (state.themeSetting === "system") {
			applyTheme("system");
			useThemeStore.setState({ actualTheme: resolveTheme("system") });
		}
	});
}

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
