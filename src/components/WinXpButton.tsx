"use client";

import React from "react";
import { useTheme } from "@/context/ThemeContext";
import { XpIcon } from "@/components/winxp/XpIcon";

export function WinXpButton() {
  const { isXpMode, toggleXpMode } = useTheme();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    toggleXpMode();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={isXpMode}
      title={isXpMode ? "Switch back to Modern Theme" : "Experience webptor in Windows XP Theme!"}
      className={`group relative inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 shadow-sm select-none cursor-pointer active:scale-95 ${
        isXpMode
          ? "bg-gradient-to-b from-[#245edb] to-[#1941a5] text-white border-2 border-[#ffaa00] shadow-md shadow-blue-500/30 ring-2 ring-[#0055ea]/40"
          : "bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:border-blue-500/60 dark:hover:border-blue-400/60 hover:shadow-md hover:shadow-blue-500/10"
      }`}
    >
      {/* 4-Color Windows Flag Icon */}
      <div className="flex-shrink-0 transition-transform group-hover:scale-110">
        <XpIcon name="windows-flag" size={18} />
      </div>

      {/* Button Label */}
      <span className="font-sans tracking-wide">
        {isXpMode ? "Win XP (Active)" : "Win XP"}
      </span>

      {/* Retro Indicator Dot / Badge */}
      <span
        className={`w-2 h-2 rounded-full transition-colors ${
          isXpMode ? "bg-[#38b000] shadow-[0_0_6px_#38b000] animate-pulse" : "bg-slate-400/60"
        }`}
      />
    </button>
  );
}
