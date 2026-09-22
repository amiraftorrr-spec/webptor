"use client";

import React from "react";
import { ConversionOptions } from "@/types";
import { XpButton } from "./XpButton";
import { xpAudio } from "@/lib/xp-sound";

interface XpConversionSettingsProps {
  options: ConversionOptions;
  onChange: (options: ConversionOptions) => void;
  autoConvert: boolean;
  onAutoConvertChange: (val: boolean) => void;
  disabled?: boolean;
}

const QUALITY_PRESETS = [
  { label: "Max Compress", value: 60, icon: "⚡" },
  { label: "Balanced (80%)", value: 80, icon: "⚖️" },
  { label: "High Quality (92%)", value: 92, icon: "💎" },
  { label: "Lossless (100%)", value: 100, icon: "🔒" },
];

export function XpConversionSettings({
  options,
  onChange,
  autoConvert,
  onAutoConvertChange,
  disabled = false,
}: XpConversionSettingsProps) {
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...options, quality: parseInt(e.target.value, 10) });
  };

  const handlePresetClick = (val: number) => {
    xpAudio.playClickSound();
    onChange({ ...options, quality: val });
  };

  return (
    <fieldset className="xp-groupbox w-full select-none text-[12px] font-sans">
      <legend className="xp-legend font-bold text-[#00138c]">
        WebP Compression &amp; Quality Settings
      </legend>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-1">
        {/* Quality Trackbar Slider */}
        <div className="flex-1 w-full space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-black font-medium flex items-center gap-1.5">
              <span>Quality Level:</span>
              <strong className="text-[#0055ea] font-bold">{options.quality}%</strong>
            </label>
            <span className="text-[10px] text-gray-500">
              {options.quality === 100 ? "Lossless" : options.quality < 70 ? "Smallest file" : "Optimized"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] text-gray-600">Low (10%)</span>
            <input
              type="range"
              min="10"
              max="100"
              step="1"
              value={options.quality}
              disabled={disabled}
              onChange={handleSliderChange}
              className="xp-slider flex-1"
            />
            <span className="text-[10px] text-gray-600">Max (100%)</span>
          </div>
        </div>

        {/* Quality Presets & Auto-convert toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          {QUALITY_PRESETS.map((preset) => {
            const isActive = options.quality === preset.value;
            return (
              <XpButton
                key={preset.value}
                disabled={disabled}
                onClick={() => handlePresetClick(preset.value)}
                variant={isActive ? "primary" : "default"}
                className={`text-[11px] py-1 px-2.5 ${
                  isActive ? "ring-1 ring-[#0055ea] font-bold" : ""
                }`}
              >
                <span>{preset.icon}</span> {preset.label}
              </XpButton>
            );
          })}

          <label className="flex items-center gap-1.5 ml-2 cursor-pointer text-[11px] text-black font-medium">
            <input
              type="checkbox"
              checked={autoConvert}
              onChange={(e) => {
                xpAudio.playClickSound();
                onAutoConvertChange(e.target.checked);
              }}
              className="accent-[#0055ea]"
            />
            <span>Auto-convert</span>
          </label>
        </div>
      </div>
    </fieldset>
  );
}
