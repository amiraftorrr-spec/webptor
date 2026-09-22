"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { xpAudio } from "@/lib/xp-sound";

export type ThemeMode = "light" | "dark" | "win-xp";

interface ThemeContextType {
  theme: ThemeMode;
  isXpMode: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggleXpMode: () => void;
  toggleDarkLight: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("theme");
      if (stored === "win-xp" || stored === "xp") {
        setThemeState("win-xp");
        document.documentElement.classList.remove("dark");
        document.documentElement.classList.add("win-xp");
      } else if (stored === "light") {
        setThemeState("light");
        document.documentElement.classList.remove("dark", "win-xp");
      } else {
        setThemeState("dark");
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("win-xp");
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const setTheme = (nextTheme: ThemeMode) => {
    setThemeState(nextTheme);
    try {
      localStorage.setItem("theme", nextTheme);
    } catch {}

    if (typeof document !== "undefined") {
      if (nextTheme === "win-xp") {
        document.documentElement.classList.remove("dark");
        document.documentElement.classList.add("win-xp");
        try {
          xpAudio.playStartupSound();
        } catch {}
      } else if (nextTheme === "dark") {
        document.documentElement.classList.remove("win-xp");
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark", "win-xp");
      }
    }
  };

  const toggleXpMode = () => {
    if (theme === "win-xp") {
      // Revert to dark by default
      setTheme("dark");
    } else {
      setTheme("win-xp");
    }
  };

  const toggleDarkLight = () => {
    if (theme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isXpMode: theme === "win-xp",
        setTheme,
        toggleXpMode,
        toggleDarkLight,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
