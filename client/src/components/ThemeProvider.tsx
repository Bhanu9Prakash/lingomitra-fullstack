import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { updateThemeColor } from "../theme-color";

type Theme = "dark" | "light";

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
});

function getInitialTheme(): Theme {
  try {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light" || savedTheme === "dark") return savedTheme;
  } catch { /* The theme remains usable when this browser blocks storage. */ }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    const dark = theme === "dark";
    document.body.classList.toggle("dark-theme", dark);
    document.documentElement.classList.toggle("dark", dark);
    updateThemeColor(theme);
    try { localStorage.setItem("theme", theme); } catch { /* Keep the chosen theme for this visit. */ }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme: () => setTheme((current) => current === "dark" ? "light" : "dark") }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
