import { createContext } from "react";
import type { ThemeProviderStates } from "@/context/ThemeProvider.tsx";

const initialState: ThemeProviderStates = {
    theme: "system",
    setTheme: () => {},
};

export const ThemeProviderContext = createContext<ThemeProviderStates>(initialState);
