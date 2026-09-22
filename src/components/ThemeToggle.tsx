"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleDarkLight, isXpMode } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isXpMode) {
    return null;
  }

  return (
    <button
      onClick={toggleDarkLight}
      aria-label="Toggle Dark / Light mode"
      title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-900 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4 transition-transform hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 transition-transform hover:-rotate-12" />
      )}
    </button>
  );
}

