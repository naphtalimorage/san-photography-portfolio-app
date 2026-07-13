import {useState, useEffect} from "react";
import {ThemeProviderContext} from "../context/ThemeContext.tsx";
import * as React from "react";

type Theme = "dark" | "light" | "system";

export type ThemeProviderStates = {
    theme: Theme;
    setTheme: (theme: Theme) => void;
};

type ThemeProviderProps = {
    children: React.ReactNode;
    defaultTheme?: Theme;
    storageKey?: string;
}
export const ThemeProvider = (
    {
        children,
        defaultTheme = "system",
        storageKey = "vite-ui-theme"
    }: ThemeProviderProps
) => {

    const [theme, setThemeState] = useState<Theme>( () => {
        return(
            localStorage.getItem(storageKey) as Theme
        ) ?? defaultTheme;
    });

    useEffect( () => {
        const root = document.documentElement;
        const media = window.matchMedia("(prefers-color-scheme: dark)");

        const applyTheme = (theme: Theme) => {
            root.classList.remove("light", "dark");

            if(theme === "system") {
                root.classList.add(media.matches ? "dark" : "light");
            } else{
                root.classList.add(theme);
            }
        }

        applyTheme(theme);

        if(theme === "system"){
            const handleChange = () => applyTheme("system");
            media.addEventListener("change", handleChange);
            return () => {
                media.removeEventListener("change", handleChange);
            }
        };
    }, [theme]);

    const value: ThemeProviderStates = {
        theme,
        setTheme: (theme: Theme) => {
            localStorage.setItem(storageKey, theme);
            setThemeState(theme);
        }
    }

    return(
        <ThemeProviderContext.Provider value={value}>
            {children}
        </ThemeProviderContext.Provider>
    )
};
