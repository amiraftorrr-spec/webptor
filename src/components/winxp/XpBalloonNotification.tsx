"use client";

import React, { useEffect, useState } from "react";
import { XpIcon } from "./XpIcon";
import { xpAudio } from "@/lib/xp-sound";

interface XpBalloonNotificationProps {
  title: string;
  message: string;
  icon?: "info" | "security" | "webptor";
  onClose?: () => void;
  autoCloseMs?: number;
  playSound?: boolean;
}

export function XpBalloonNotification({
  title,
  message,
  icon = "webptor",
  onClose,
  autoCloseMs = 9000,
  playSound = false,
}: XpBalloonNotificationProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (playSound) {
      xpAudio.playBalloonSound();
    }
    if (autoCloseMs > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        onClose?.();
      }, autoCloseMs);
      return () => clearTimeout(timer);
    }
  }, [autoCloseMs, onClose, playSound]);

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-[38px] right-3 z-50 max-w-[280px] bg-[#ffffe1] border border-black rounded-[4px] shadow-xl p-2.5 select-none text-[11px] font-sans animate-in fade-in slide-in-from-bottom-2 duration-200"
    >
      {/* Downward triangle tail pointing to tray */}
      <div
        className="absolute -bottom-[7px] right-8 w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[7px] border-t-black"
      />
      <div
        className="absolute -bottom-[6px] right-[33px] w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#ffffe1]"
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-1 mb-1">
        <div className="flex items-center gap-1.5 font-bold text-black text-[11px]">
          <XpIcon name={icon === "security" ? "security" : "webptor"} size={16} />
          <span>{title}</span>
        </div>
        <button
          type="button"
          onClick={() => {
            xpAudio.playClickSound();
            setVisible(false);
            onClose?.();
          }}
          className="text-gray-500 hover:text-black hover:bg-gray-200 rounded px-1 text-[10px] font-bold leading-none"
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <p className="text-gray-800 text-[10.5px] leading-snug">
        {message}
      </p>
    </div>
  );
}
