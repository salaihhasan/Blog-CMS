import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

const read = (): Theme => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

/**
 * Applies the theme to <html data-theme="…"> so the CSS variable overrides in
 * each stylesheet can take over. Falls back to the OS preference until the
 * admin picks a side (PRD §41).
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(read);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggle = useCallback(
    () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    []
  );

  return { theme, toggle };
}

/** Sets the attribute before first paint so there is no light-mode flash. */
export const initTheme = () => {
  document.documentElement.setAttribute("data-theme", read());
};
