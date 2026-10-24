"use client";

import React, { useEffect } from "react";
import { XpIcon } from "./XpIcon";
import { xpAudio } from "@/lib/xp-sound";

interface XpTurnOffModalProps {
  onClose: () => void;
  onTurnOff: () => void;
}

export function XpTurnOffModal({ onClose, onTurnOff }: XpTurnOffModalProps) {
  useEffect(() => {
    xpAudio.playDingSound();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleTurnOffClick = () => {
    xpAudio.playShutdownSound();
    setTimeout(() => {
      onTurnOff();
    }, 1200);
  };

  const handleRestartClick = () => {
    xpAudio.playShutdownSound();
    setTimeout(() => {
      window.location.reload();
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-grayscale transition-all duration-700 select-none text-[12px] font-sans"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[420px] bg-gradient-to-r from-[#003c96] via-[#0055ea] to-[#003c96] p-1 rounded-t-lg shadow-2xl border border-white/40 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 text-white border-b border-blue-400/40">
          <span className="font-bold text-sm tracking-wide text-shadow-xp">
            Turn off computer
          </span>
          <div className="w-8 h-8 rounded-sm overflow-hidden flex items-center justify-center">
            <XpIcon name="windows-flag" size={24} />
          </div>
        </div>

        {/* Center Options */}
        <div className="bg-gradient-to-b from-[#0a2f7c] to-[#001f5c] py-6 px-4 flex items-center justify-around">
          {/* Stand By */}
          <button
            type="button"
            onClick={() => {
              xpAudio.playClickSound();
              onClose();
            }}
            className="flex flex-col items-center gap-2 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-md bg-gradient-to-b from-[#ffbb33] to-[#e68a00] p-1 border-2 border-white/60 shadow-lg group-hover:brightness-125 active:scale-95 flex items-center justify-center text-white text-lg">
              🌙
            </div>
            <span className="text-white text-xs font-semibold group-hover:underline text-shadow-xp">
              Stand By
            </span>
          </button>

          {/* Turn Off (Modern Theme) */}
          <button
            type="button"
            onClick={handleTurnOffClick}
            className="flex flex-col items-center gap-2 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-md bg-gradient-to-b from-[#ff4444] to-[#cc0000] p-1 border-2 border-white/60 shadow-lg group-hover:brightness-125 active:scale-95 flex items-center justify-center">
              <XpIcon name="shutdown" size={26} />
            </div>
            <span className="text-white text-xs font-semibold group-hover:underline text-shadow-xp">
              Turn Off
            </span>
          </button>

          {/* Restart */}
          <button
            type="button"
            onClick={handleRestartClick}
            className="flex flex-col items-center gap-2 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-md bg-gradient-to-b from-[#33cc33] to-[#1f7a1f] p-1 border-2 border-white/60 shadow-lg group-hover:brightness-125 active:scale-95 flex items-center justify-center text-white text-lg font-bold">
              ↻
            </div>
            <span className="text-white text-xs font-semibold group-hover:underline text-shadow-xp">
              Restart
            </span>
          </button>
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-[#003c96] to-[#0055ea] px-4 py-2 flex justify-end">
          <button
            type="button"
            onClick={() => {
              xpAudio.playClickSound();
              onClose();
            }}
            className="xp-btn text-xs px-4 py-1 font-medium bg-[#ece9d8]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
