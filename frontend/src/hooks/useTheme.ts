import { useCallback, useEffect, useState } from "react";

export type ThemeChoice = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "repoguide.theme";

function readStored(): ThemeChoice {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" || stored === "system"
    ? stored
    : "system";
}

function readSystem(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeChoice>(readStored);
  const [systemPref, setSystemPref] = useState<ResolvedTheme>(readSystem);

  // Derived during render, so no cascading render is needed to resolve it.
  const resolved: ResolvedTheme = theme === "system" ? systemPref : theme;

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (event: MediaQueryListEvent) =>
      setSystemPref(event.matches ? "dark" : "light");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolved === "dark");
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme, resolved]);

  const setTheme = useCallback((next: ThemeChoice) => setThemeState(next), []);

  /** Cycles light → dark → system, which is all the top bar button needs. */
  const cycleTheme = useCallback(
    () =>
      setThemeState((current) =>
        current === "light" ? "dark" : current === "dark" ? "system" : "light",
      ),
    [],
  );

  return { theme, resolved, setTheme, cycleTheme };
}
