import { createContext, useEffect, useState } from "react";

export type Appearance = "light" | "dark";

export interface ThemeContextValue {
  appearance: Appearance;
  setAppearance: (appearance?: Appearance) => void;
}

const darkQuery = "(prefers-color-scheme: dark)";

const useThemeDetector = () => {
  const [isDarkTheme, setIsDarkTheme] = useState(() => window.matchMedia(darkQuery).matches);

  useEffect(() => {
    const mq = window.matchMedia(darkQuery);
    const listener = (e: MediaQueryListEvent) => setIsDarkTheme(e.matches);
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);

  return isDarkTheme;
};

const useSystemTheme = (): Appearance => (useThemeDetector() ? "dark" : "light");

/** @deprecated Use `useSystemTheme` — it is a hook and must follow the rules of hooks. */
const getSystemTheme = useSystemTheme;

const ThemeContext = createContext<ThemeContextValue>({
  appearance: "dark",
  setAppearance: () => {},
});

export { getSystemTheme, useSystemTheme, ThemeContext, useThemeDetector };
