"use client";

import { Sliders } from "lucide-react";
import { ConversionOptions } from "@/types";

interface ConversionSettingsProps {
  options: ConversionOptions;
  onChange: (options: ConversionOptions) => void;
  autoConvert: boolean;
  onAutoConvertChange: (val: boolean) => void;
  disabled?: boolean;
}

const QUALITY_PRESETS = [
  { label: "Max Compress", value: 60, icon: "⚡" },
  { label: "Balanced", value: 80, icon: "⚖️" },
  { label: "High Quality", value: 92, icon: "💎" },
  { label: "Lossless", value: 100, icon: "🔒" },
];

export function ConversionSettings({
  options,
  onChange,
  autoConvert,
  onAutoConvertChange,
  disabled = false,
}: ConversionSettingsProps) {
  const handleQualityChange = (val: number) => {
    onChange({ ...options, quality: val });
  };

  return (
    <div className="w-full bg-white dark:bg-[#101522] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm transition-all">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Quality Label */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              WebP Quality
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Output: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{options.quality}%</span>
            </p>
          </div>
        </div>

        {/* Quality Presets */}
        <div className="flex items-center gap-2 flex-wrap">
          {QUALITY_PRESETS.map((preset) => {
            const isActive = options.quality === preset.value;
            return (
              <button
                key={preset.value}
                type="button"
                disabled={disabled}
                onClick={() => handleQualityChange(preset.value)}
                className={`text-xs px-3 py-2 rounded-xl font-medium transition-all flex items-center gap-1.5 border ${
                  isActive
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-500/20 font-semibold"
                    : "bg-slate-50 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800"
                }`}
              >
                <span>{preset.icon}</span>
                <span>{preset.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
