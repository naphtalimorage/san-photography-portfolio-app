// Ensures the correct theme class is applied before React renders.
// Prevents light flash (FOUC) on initial load.

export function initThemeOnClient() {
  try {
    const storageKey = "ryan-portfolio-theme";
    const defaultTheme: "dark" | "light" | "system" = "system";

    const theme = (localStorage.getItem(storageKey) as "dark" | "light" | "system" | null) || defaultTheme;

    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    const resolved =
      theme === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : theme;

    root.classList.add(resolved);
  } catch {
    // noop
  }
}

