import React from "react";

interface XpProgressBarProps {
  progress?: number; // 0 to 100
  isIndeterminate?: boolean;
  className?: string;
  showPercent?: boolean;
}

export function XpProgressBar({
  progress = 0,
  isIndeterminate = false,
  className = "",
  showPercent = false,
}: XpProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(progress)));

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Sunken Beveled Track */}
      <div className="xp-progress-track relative w-full h-[18px] bg-white rounded-[2px] p-[2px] overflow-hidden">
        {isIndeterminate ? (
          /* Marquee 3-block moving animation */
          <div className="xp-progress-indeterminate-marquee h-full flex gap-[2px]" />
        ) : (
          /* Segmented candy green fill */
          <div
            className="xp-progress-fill h-full rounded-[1px] transition-all duration-200"
            style={{ width: `${clamped}%` }}
          />
        )}
      </div>

      {showPercent && (
        <span className="text-[11px] font-sans font-medium text-black min-w-[32px] text-right">
          {clamped}%
        </span>
      )}
    </div>
  );
}
