import { createContext, useContext, useState, useEffect } from "react";
import {
  getCurrentTheme,
  isDarkModeEnabled,
  applyTheme,
  toggleTheme as toggleThemeUtil,
} from "@/utils/themeUtils";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize theme on mount
  useEffect(() => {
    try {
      // Get the current theme (respects localStorage > system preference > light)
      const theme = getCurrentTheme();
      const isDark = theme === "dark";

      // Update state
      setIsDarkMode(isDark);

      // Apply theme to DOM
      applyTheme(theme);

      console.log(
        `🎨 ThemeProvider initialized - Mode: ${
          isDark ? "🌙 DARK" : "☀️ LIGHT"
        }`
      );

      setIsInitialized(true);
    } catch (error) {
      console.error("Error initializing theme:", error);
      // Fallback to light mode
      setIsDarkMode(false);
      applyTheme("light");
      setIsInitialized(true);
    }
  }, []);

  // Watch for system theme changes and sync if user hasn't explicitly chosen
  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme");
      // Only react to system changes if no explicit preference saved
      if (!saved) {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handler = (e) => {
          const newTheme = e.matches ? "dark" : "light";
          applyTheme(newTheme);
          setIsDarkMode(newTheme === "dark");
        };

        // Attach listener (modern + legacy)
        if (mediaQuery.addEventListener) {
          mediaQuery.addEventListener("change", handler);
        } else if (mediaQuery.addListener) {
          mediaQuery.addListener(handler);
        }

        return () => {
          if (mediaQuery.removeEventListener) {
            mediaQuery.removeEventListener("change", handler);
          } else if (mediaQuery.removeListener) {
            mediaQuery.removeListener(handler);
          }
        };
      }
    } catch (err) {
      console.error("Error watching system theme changes:", err);
    }
  }, []);

  // Handle theme toggle
  const toggleTheme = () => {
    try {
      const newTheme = toggleThemeUtil();
      const isDark = newTheme === "dark";

      console.log(`🔄 Theme toggled to: ${isDark ? "🌙 DARK" : "☀️ LIGHT"}`);

      setIsDarkMode(isDark);
    } catch (error) {
      console.error("Error toggling theme:", error);
    }
  };

  const value = {
    isDarkMode,
    toggleTheme,
    isInitialized,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
