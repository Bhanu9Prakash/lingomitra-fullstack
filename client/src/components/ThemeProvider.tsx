import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { updateThemeColor } from "../theme-color";

type Theme = "dark" | "light";

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

// Create a context with a default value to avoid undefined checks
const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {}
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Safe initial state that doesn't rely on browser API during rendering
  const [theme, setTheme] = useState<Theme>("light");
  
  // Use useEffect to handle browser APIs safely after mounting
  useEffect(() => {
    // Check for saved theme from localStorage
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    if (savedTheme && (savedTheme === "dark" || savedTheme === "light")) {
      setTheme(savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      // Check for system preference
      setTheme("dark");
    }
  }, []);

  // Apply theme changes
  useEffect(() => {
    // Apply dark-theme class to body for CSS variables
    if (theme === "dark") {
      document.body.classList.add("dark-theme");
      document.documentElement.classList.add("dark");
    } else {
      document.body.classList.remove("dark-theme");
      document.documentElement.classList.remove("dark");
    }
    
    // Update the theme-color meta tag and PWA manifest
    updateThemeColor(theme);
    
    // Save to localStorage
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === "dark" ? "light" : "dark");
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  return context;
}
