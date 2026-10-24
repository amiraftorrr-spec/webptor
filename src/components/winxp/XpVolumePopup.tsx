"use client";

import React, { useRef, useEffect } from "react";
import { xpAudio } from "@/lib/xp-sound";

interface XpVolumePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function XpVolumePopup({ isOpen, onClose }: XpVolumePopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const [vol, setVol] = React.useState(Math.round(xpAudio.getVolume() * 100));
  const [muted, setMuted] = React.useState(xpAudio.getMuted());

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseInt(e.target.value, 10);
    setVol(newVol);
    xpAudio.setVolume(newVol / 100);
  };

  const handleMuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMuted = e.target.checked;
    setMuted(newMuted);
    xpAudio.setMuted(newMuted);
    if (!newMuted) {
      xpAudio.playClickSound();
    }
  };

  return (
    <div
      ref={popupRef}
      className="fixed bottom-[32px] right-2 z-50 w-24 bg-[#ece9d8] border-2 border-[#0055ea] rounded-t-md shadow-2xl p-2 select-none text-[11px] font-sans flex flex-col items-center gap-2"
    >
      <div className="w-full text-center pb-1 border-b border-[#d4d0c8] font-bold text-gray-800 text-[10px]">
        Volume
      </div>

      {/* Vertical Slider */}
      <div className="h-32 flex items-center justify-center py-2">
        <input
          type="range"
          min="0"
          max="100"
          value={muted ? 0 : vol}
          onChange={handleSliderChange}
          disabled={muted}
          className="xp-slider"
          style={{
            transform: "rotate(-90deg)",
            width: "90px",
          }}
        />
      </div>

      <div className="text-[10px] text-gray-700 font-mono">
        {muted ? "Muted" : `${vol}%`}
      </div>

      {/* Mute checkbox */}
      <label className="flex items-center gap-1.5 pt-1 border-t border-[#d4d0c8] text-[10px] cursor-pointer text-gray-800">
        <input
          type="checkbox"
          checked={muted}
          onChange={handleMuteChange}
          className="accent-[#0055ea]"
        />
        <span>Mute</span>
      </label>
    </div>
  );
}
