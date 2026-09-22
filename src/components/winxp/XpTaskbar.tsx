"use client";

import React, { useState, useEffect } from "react";
import { XpIcon } from "./XpIcon";
import { XpStartMenu } from "./XpStartMenu";
import { xpAudio } from "@/lib/xp-sound";

interface XpTaskbarProps {
  onOpenFilePicker: () => void;
  onOpenAbout: () => void;
  onToggleModern: () => void;
  queueCount: number;
}

export function XpTaskbar({
  onOpenFilePicker,
  onOpenAbout,
  onToggleModern,
  queueCount,
}: XpTaskbarProps) {
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [timeString, setTimeString] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleStartMenu = () => {
    xpAudio.playClickSound();
    setStartMenuOpen((prev) => !prev);
  };

  return (
    <>
      {/* Start Menu Popup */}
      <XpStartMenu
        isOpen={startMenuOpen}
        onClose={() => setStartMenuOpen(false)}
        onOpenFilePicker={onOpenFilePicker}
        onOpenAbout={onOpenAbout}
        onToggleModern={onToggleModern}
      />

      {/* Taskbar Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-[30px] z-40 bg-gradient-to-b from-[#245edb] via-[#3f8cf3] to-[#1941a5] border-t-2 border-[#4282f6] shadow-lg flex items-center justify-between select-none text-[11px] font-sans">
        {/* Left: Start Button & Quick Launch */}
        <div className="flex items-center h-full">
          {/* Iconic XP Start Button */}
          <button
            type="button"
            onClick={toggleStartMenu}
            className={`h-full px-3.5 flex items-center gap-2 rounded-r-xl shadow-md transition-none select-none cursor-pointer ${
              startMenuOpen
                ? "bg-gradient-to-b from-[#286016] via-[#3c891e] to-[#245613] shadow-inner brightness-90"
                : "bg-gradient-to-b from-[#38821d] via-[#52b12c] to-[#296813] hover:brightness-110 active:brightness-90"
            }`}
            style={{
              clipPath: "polygon(0 0, 88% 0, 100% 50%, 88% 100%, 0 100%)",
              paddingRight: "22px",
            }}
          >
            <XpIcon name="windows-flag" size={18} />
            <span className="text-white font-black italic tracking-wide text-xs text-shadow-xp pr-1">
              start
            </span>
          </button>

          {/* Quick Launch Icons */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 border-r border-[#1941a5]/60">
            <button
              type="button"
              onClick={() => {
                xpAudio.playClickSound();
                onOpenAbout();
              }}
              title="Internet Explorer"
              className="p-0.5 hover:brightness-125"
            >
              <XpIcon name="internet-explorer" size={16} />
            </button>
            <button
              type="button"
              onClick={() => {
                xpAudio.playClickSound();
                onOpenFilePicker();
              }}
              title="My Pictures"
              className="p-0.5 hover:brightness-125"
            >
              <XpIcon name="my-pictures" size={16} />
            </button>
            <button
              type="button"
              onClick={() => {
                xpAudio.playClickSound();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              title="webptor Converter"
              className="p-0.5 hover:brightness-125"
            >
              <XpIcon name="webptor" size={16} />
            </button>
          </div>

          {/* Active Running Task */}
          <div className="flex items-center px-2">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-b from-[#1b439c] to-[#2b5fd9] text-white rounded-[3px] border border-[#0f2e73] shadow-inner max-w-[220px]">
              <XpIcon name="webptor" size={14} />
              <span className="font-semibold truncate text-[11px] text-shadow-xp">
                webptor {queueCount > 0 ? `(${queueCount} items)` : "- WebP Converter"}
              </span>
            </div>
          </div>
        </div>

        {/* Right: System Tray / Notification Area */}
        <div className="h-full flex items-center gap-2 px-3 bg-gradient-to-b from-[#0c3182] to-[#1242a8] border-l-2 border-[#194bbd] text-white">
          <div className="flex items-center gap-1.5 opacity-90">
            <XpIcon name="sound" size={14} className="hover:opacity-100 cursor-pointer" />
            <XpIcon name="network" size={14} className="hover:opacity-100 cursor-pointer" />
            <XpIcon name="webptor" size={13} className="hover:opacity-100 cursor-pointer" />
          </div>

          <div className="h-3 w-[1px] bg-[#1d5ac6] mx-0.5" />

          {/* Live Clock */}
          <span className="font-mono text-[11px] font-semibold tracking-wider text-shadow-xp">
            {timeString || "12:00 PM"}
          </span>
        </div>
      </div>
    </>
  );
}
