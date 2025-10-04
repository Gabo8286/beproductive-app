import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system" | "high-contrast";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isHighContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = "system",
}) => {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [isHighContrast, setHighContrast] = useState(false);

  // Get resolved theme (actual light/dark value)
  const getResolvedTheme = (): "light" | "dark" => {
    if (theme === "high-contrast") return "dark";
    if (theme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return theme as "light" | "dark";
  };

  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(() =>
    getResolvedTheme(),
  );

  // Load theme from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme;
    const storedContrast = localStorage.getItem("high-contrast") === "true";

    if (stored) {
      setThemeState(stored);
    }
    setHighContrast(storedContrast);
  }, []);

  // Update resolved theme when theme changes
  useEffect(() => {
    const newResolvedTheme = getResolvedTheme();
    setResolvedTheme(newResolvedTheme);

    // Update document classes
    const root = document.documentElement;
    root.classList.remove("light", "dark", "high-contrast");

    if (isHighContrast) {
      root.classList.add("high-contrast", "dark");
    } else {
      root.classList.add(newResolvedTheme);
    }

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        "content",
        newResolvedTheme === "dark" ? "#0a0a0a" : "#ffffff",
      );
    }
  }, [theme, isHighContrast]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        setResolvedTheme(mediaQuery.matches ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);

    // Reset high contrast if switching away from it
    if (newTheme !== "high-contrast" && isHighContrast) {
      setHighContrast(false);
      localStorage.setItem("high-contrast", "false");
    }
  };

  const toggleTheme = () => {
    const newTheme = resolvedTheme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };

  const setHighContrastMode = (enabled: boolean) => {
    setHighContrast(enabled);
    localStorage.setItem("high-contrast", enabled.toString());

    if (enabled) {
      setTheme("high-contrast");
    }
  };

  const value: ThemeContextType = {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    isHighContrast,
    setHighContrast: setHighContrastMode,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

// Prevent flash of unstyled content
export const preventFOUC = () => {
  const script = document.createElement("script");
  script.innerHTML = `
    (function() {
      const theme = localStorage.getItem('theme') || 'system';
      const isHighContrast = localStorage.getItem('high-contrast') === 'true';

      let resolvedTheme = theme;
      if (theme === 'system') {
        resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }

      document.documentElement.classList.remove('light', 'dark', 'high-contrast');

      if (isHighContrast) {
        document.documentElement.classList.add('high-contrast', 'dark');
      } else {
        document.documentElement.classList.add(resolvedTheme);
      }
    })();
  `;

  document.head.appendChild(script);
};
