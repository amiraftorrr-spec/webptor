"use client";

import React, { useState, useEffect } from "react";
import { XpIcon } from "./XpIcon";
import { XpStartMenu } from "./XpStartMenu";
import { XpVolumePopup } from "./XpVolumePopup";
import { xpAudio } from "@/lib/xp-sound";

interface XpTaskbarProps {
  onOpenFilePicker: () => void;
  onOpenAbout: () => void;
  onToggleModern: () => void;
  onOpenRun: () => void;
  onOpenTurnOff: () => void;
  onOpenApp?: (app: string) => void;
  queueCount: number;
  // Window states
  isMainMinimized: boolean;
  onToggleMinimizeMain: () => void;
  isAboutOpen: boolean;
  onToggleAboutWindow: () => void;
  isComparingOpen: boolean;
  onToggleComparingWindow: () => void;
  isRunOpen: boolean;
  onToggleRunWindow: () => void;
}

export function XpTaskbar({
  onOpenFilePicker,
  onOpenAbout,
  onToggleModern,
  onOpenRun,
  onOpenTurnOff,
  onOpenApp,
  queueCount,
  isMainMinimized,
  onToggleMinimizeMain,
  isAboutOpen,
  onToggleAboutWindow,
  isComparingOpen,
  onToggleComparingWindow,
  isRunOpen,
  onToggleRunWindow,
}: XpTaskbarProps) {
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [volumePopupOpen, setVolumePopupOpen] = useState(false);
  const [timeString, setTimeString] = useState<string>("");
  const [dateString, setDateString] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })
      );
      setDateString(
        now.toLocaleDateString(undefined, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleStartMenu = () => {
    xpAudio.playClickSound();
    setStartMenuOpen((prev) => !prev);
    setVolumePopupOpen(false);
  };

  const handleShowDesktop = () => {
    xpAudio.playClickSound();
    onToggleMinimizeMain();
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
        onOpenRun={onOpenRun}
        onOpenTurnOff={onOpenTurnOff}
        onOpenApp={onOpenApp}
      />

      {/* Volume Popup */}
      <XpVolumePopup
        isOpen={volumePopupOpen}
        onClose={() => setVolumePopupOpen(false)}
      />

      {/* Taskbar Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-[30px] z-40 bg-gradient-to-b from-[#245edb] via-[#3f8cf3] to-[#1941a5] border-t-2 border-[#4282f6] shadow-lg flex items-center justify-between select-none text-[11px] font-sans">
        {/* Left: Start Button & Quick Launch & Tasks */}
        <div className="flex items-center h-full flex-1 overflow-hidden">
          {/* Iconic XP Start Button */}
          <button
            type="button"
            onClick={toggleStartMenu}
            className={`h-full px-3.5 flex items-center gap-2 rounded-r-xl shadow-md transition-none select-none cursor-pointer flex-shrink-0 ${
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
          <div className="hidden sm:flex items-center gap-1.5 px-2 border-r border-[#1941a5]/60 flex-shrink-0">
            {/* Show Desktop */}
            <button
              type="button"
              onClick={handleShowDesktop}
              title="Show Desktop"
              className="p-0.5 hover:brightness-125"
            >
              <div className="w-4 h-4 bg-white border border-[#0f346b] rounded-xs flex items-center justify-center text-[9px]">
                🗔
              </div>
            </button>
            <button
              type="button"
              onClick={() => {
                xpAudio.playClickSound();
                onOpenApp?.("ie");
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
          </div>

          {/* Running Taskbar Windows */}
          <div className="flex items-center px-1.5 gap-1.5 overflow-x-auto no-scrollbar flex-1">
            {/* Main Application Window */}
            <button
              type="button"
              onClick={() => {
                xpAudio.playClickSound();
                onToggleMinimizeMain();
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-white rounded-[3px] border shadow-inner max-w-[190px] sm:max-w-[220px] truncate cursor-pointer transition-none ${
                !isMainMinimized
                  ? "bg-gradient-to-b from-[#1941a5] to-[#255fd9] border-[#0f2e73] shadow-inner font-bold"
                  : "bg-gradient-to-b from-[#3a7af5] to-[#245edb] border-[#1e52bf] opacity-85 hover:opacity-100"
              }`}
            >
              <XpIcon name="webptor" size={14} className="flex-shrink-0" />
              <span className="truncate text-[11px] text-shadow-xp">
                webptor {queueCount > 0 ? `(${queueCount})` : "- WebP Converter"}
              </span>
            </button>

            {/* System Properties / About */}
            {isAboutOpen && (
              <button
                type="button"
                onClick={() => {
                  xpAudio.playClickSound();
                  onToggleAboutWindow();
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-b from-[#1941a5] to-[#255fd9] text-white rounded-[3px] border border-[#0f2e73] shadow-inner max-w-[180px] truncate cursor-pointer font-bold"
              >
                <XpIcon name="my-computer" size={14} className="flex-shrink-0" />
                <span className="truncate text-[11px] text-shadow-xp">
                  System Properties
                </span>
              </button>
            )}

            {/* Picture and Fax Viewer */}
            {isComparingOpen && (
              <button
                type="button"
                onClick={() => {
                  xpAudio.playClickSound();
                  onToggleComparingWindow();
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-b from-[#1941a5] to-[#255fd9] text-white rounded-[3px] border border-[#0f2e73] shadow-inner max-w-[180px] truncate cursor-pointer font-bold"
              >
                <XpIcon name="camera" size={14} className="flex-shrink-0" />
                <span className="truncate text-[11px] text-shadow-xp">
                  Picture and Fax Viewer
                </span>
              </button>
            )}

            {/* Run Dialog */}
            {isRunOpen && (
              <button
                type="button"
                onClick={() => {
                  xpAudio.playClickSound();
                  onToggleRunWindow();
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-b from-[#1941a5] to-[#255fd9] text-white rounded-[3px] border border-[#0f2e73] shadow-inner max-w-[120px] truncate cursor-pointer font-bold"
              >
                <XpIcon name="windows-flag" size={14} className="flex-shrink-0" />
                <span className="truncate text-[11px] text-shadow-xp">
                  Run
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Right: System Tray / Notification Area */}
        <div className="h-full flex items-center gap-2 px-2.5 sm:px-3 bg-gradient-to-b from-[#0c3182] to-[#1242a8] border-l-2 border-[#194bbd] text-white flex-shrink-0">
          <div className="flex items-center gap-1.5 opacity-90">
            <button
              type="button"
              onClick={() => {
                xpAudio.playClickSound();
                setVolumePopupOpen((prev) => !prev);
              }}
              title="Volume Control"
              className="hover:opacity-100 hover:scale-110 transition-transform cursor-pointer"
            >
              <XpIcon name="sound" size={15} />
            </button>
            <button
              type="button"
              onClick={() => {
                xpAudio.playDingSound();
              }}
              title="Local Intranet Connection (100.0 Mbps)"
              className="hidden sm:inline-block hover:opacity-100 cursor-pointer"
            >
              <XpIcon name="network" size={15} />
            </button>
            <button
              type="button"
              onClick={() => {
                xpAudio.playDingSound();
              }}
              title="Windows Security Center - 100% In-Browser Private"
              className="hidden sm:inline-block hover:opacity-100 cursor-pointer"
            >
              <XpIcon name="security" size={14} />
            </button>
          </div>

          <div className="h-3 w-[1px] bg-[#1d5ac6] mx-0.5" />

          {/* Live Clock with Date Tooltip */}
          <span
            title={dateString}
            className="font-mono text-[11px] font-semibold tracking-wider text-shadow-xp cursor-default"
          >
            {timeString || "12:00 PM"}
          </span>
        </div>
      </div>
    </>
  );
}
