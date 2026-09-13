"use client";

import { Zap, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0a0d14] py-6 text-xs text-slate-500 dark:text-slate-400">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Zap className="w-3 h-3 fill-white" />
          </div>
          <span className="font-bold text-slate-800 dark:text-slate-200">
            webptor
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <span>made by</span>
          <span className="text-slate-800 dark:text-slate-200 font-semibold">amir aftor</span>
        </div>
      </div>
    </footer>
  );
}
