"use client";

import React, { useRef, useEffect, useState } from "react";
import { XpIcon } from "./XpIcon";
import { xpAudio } from "@/lib/xp-sound";

interface XpStartMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFilePicker: () => void;
  onOpenAbout: () => void;
  onToggleModern: () => void;
  onOpenRun: () => void;
  onOpenTurnOff: () => void;
  onOpenApp?: (app: string) => void;
}

export function XpStartMenu({
  isOpen,
  onClose,
  onOpenFilePicker,
  onOpenAbout,
  onToggleModern,
  onOpenRun,
  onOpenTurnOff,
  onOpenApp,
}: XpStartMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [allProgramsOpen, setAllProgramsOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
        setAllProgramsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAction = (cb: () => void) => {
    xpAudio.playClickSound();
    onClose();
    setAllProgramsOpen(false);
    cb();
  };

  return (
    <div
      ref={menuRef}
      className="fixed bottom-[30px] left-0 z-50 w-[400px] max-w-[95vw] bg-[#0055ea] rounded-t-lg shadow-2xl border-2 border-[#0055ea] overflow-visible select-none animate-in fade-in slide-in-from-bottom-2 duration-150 text-[12px] font-sans"
    >
      {/* Start Menu Header */}
      <div className="bg-gradient-to-r from-[#0055ea] via-[#246adb] to-[#3f88f2] px-3.5 py-2.5 flex items-center gap-3 border-b-2 border-[#e5a01a] rounded-t-md">
        {/* User Avatar */}
        <div className="w-12 h-12 rounded-[4px] bg-white p-0.5 border-2 border-white shadow-md flex items-center justify-center overflow-hidden flex-shrink-0">
          <div className="w-full h-full bg-gradient-to-tr from-[#ff9900] via-[#ff5500] to-[#ffaa00] flex items-center justify-center text-white font-bold text-xl shadow-inner">
            ⚡
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-white font-bold text-sm tracking-wide text-shadow-xp">
            Amir Aftor
          </span>
          <span className="text-[#cce2ff] text-[10.5px]">webptor Administrator</span>
        </div>
      </div>

      {/* Start Menu Body (2 Columns) */}
      <div className="grid grid-cols-2 bg-white min-h-[350px] relative">
        {/* Left Column (White Background - Programs) */}
        <div className="bg-white p-2 flex flex-col justify-between border-r border-[#95bdee]">
          <div className="space-y-0.5">
            {/* webptor Converter */}
            <button
              type="button"
              onClick={() => handleAction(onOpenFilePicker)}
              className="w-full flex items-center gap-2.5 p-1.5 rounded hover:bg-[#316ac5] hover:text-white text-left group"
            >
              <XpIcon name="webptor" size={30} />
              <div className="truncate">
                <span className="font-bold block text-[11px] truncate">webptor Converter</span>
                <span className="text-[10px] text-gray-500 group-hover:text-gray-200">
                  Fast WebP processing
                </span>
              </div>
            </button>

            {/* Internet Explorer */}
            <button
              type="button"
              onClick={() => handleAction(() => onOpenApp?.("ie"))}
              className="w-full flex items-center gap-2.5 p-1.5 rounded hover:bg-[#316ac5] hover:text-white text-left group"
            >
              <XpIcon name="internet-explorer" size={30} />
              <div className="truncate">
                <span className="font-bold block text-[11px] truncate">Internet</span>
                <span className="text-[10px] text-gray-500 group-hover:text-gray-200">
                  Internet Explorer
                </span>
              </div>
            </button>

            {/* Paint */}
            <button
              type="button"
              onClick={() => handleAction(() => onOpenApp?.("paint"))}
              className="w-full flex items-center gap-2.5 p-1.5 rounded hover:bg-[#316ac5] hover:text-white text-left group"
            >
              <XpIcon name="paint" size={26} />
              <div className="truncate">
                <span className="font-bold block text-[11px] truncate">Paint</span>
                <span className="text-[10px] text-gray-500 group-hover:text-gray-200">
                  Image editor
                </span>
              </div>
            </button>

            {/* Notepad */}
            <button
              type="button"
              onClick={() => handleAction(() => onOpenApp?.("notepad"))}
              className="w-full flex items-center gap-2.5 p-1.5 rounded hover:bg-[#316ac5] hover:text-white text-left group"
            >
              <XpIcon name="notepad" size={26} />
              <div className="truncate">
                <span className="font-bold block text-[11px] truncate">Notepad</span>
                <span className="text-[10px] text-gray-500 group-hover:text-gray-200">
                  Text editor
                </span>
              </div>
            </button>

            <div className="my-1 border-t border-[#d4d0c8]" />

            {/* My Pictures shortcut */}
            <button
              type="button"
              onClick={() => handleAction(onOpenFilePicker)}
              className="w-full flex items-center gap-2 p-1.5 rounded hover:bg-[#316ac5] hover:text-white text-left group"
            >
              <XpIcon name="my-pictures" size={22} />
              <span className="text-[11px]">Select Pictures...</span>
            </button>

            {/* Switch to Modern Mode */}
            <button
              type="button"
              onClick={() => handleAction(onToggleModern)}
              className="w-full flex items-center gap-2 p-1.5 rounded hover:bg-[#316ac5] hover:text-white text-left group"
            >
              <span className="text-sm">🚀</span>
              <span className="text-[11px] font-bold text-indigo-600 group-hover:text-white">
                Modern Theme
              </span>
            </button>
          </div>

          {/* All Programs bar with flyout */}
          <div className="pt-2 border-t border-[#d4d0c8] relative">
            <button
              type="button"
              onClick={() => {
                xpAudio.playClickSound();
                setAllProgramsOpen(!allProgramsOpen);
              }}
              className="w-full flex items-center justify-center gap-2 py-1 px-2 font-bold text-[11px] hover:bg-[#316ac5] hover:text-white rounded"
            >
              <span>All Programs</span>
              <span className="text-[#38821d] text-xs font-black">▶</span>
            </button>

            {allProgramsOpen && (
              <div className="absolute left-full bottom-0 w-44 bg-white border border-[#7f9db9] shadow-xl p-1 space-y-0.5 z-50 text-[11px]">
                <button
                  type="button"
                  onClick={() => handleAction(() => onOpenApp?.("ie"))}
                  className="w-full flex items-center gap-2 p-1 hover:bg-[#316ac5] hover:text-white text-left rounded-[2px]"
                >
                  <XpIcon name="internet-explorer" size={18} />
                  <span>Internet Explorer</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAction(() => onOpenApp?.("paint"))}
                  className="w-full flex items-center gap-2 p-1 hover:bg-[#316ac5] hover:text-white text-left rounded-[2px]"
                >
                  <XpIcon name="paint" size={18} />
                  <span>Paint</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAction(() => onOpenApp?.("notepad"))}
                  className="w-full flex items-center gap-2 p-1 hover:bg-[#316ac5] hover:text-white text-left rounded-[2px]"
                >
                  <XpIcon name="notepad" size={18} />
                  <span>Notepad</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAction(() => onOpenApp?.("minesweeper"))}
                  className="w-full flex items-center gap-2 p-1 hover:bg-[#316ac5] hover:text-white text-left rounded-[2px]"
                >
                  <XpIcon name="minesweeper" size={18} />
                  <span>Minesweeper</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAction(() => onOpenApp?.("winamp"))}
                  className="w-full flex items-center gap-2 p-1 hover:bg-[#316ac5] hover:text-white text-left rounded-[2px]"
                >
                  <XpIcon name="winamp" size={18} />
                  <span>Winamp</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Light Blue Background - System Folders) */}
        <div className="bg-[#d3e5fa] p-2 space-y-0.5 text-[#00138c]">
          <button
            type="button"
            onClick={() => handleAction(onOpenFilePicker)}
            className="w-full flex items-center gap-2 p-1.5 rounded hover:bg-[#316ac5] hover:text-white text-left group font-bold text-[11px]"
          >
            <XpIcon name="my-documents" size={20} />
            <span>My Documents</span>
          </button>

          <button
            type="button"
            onClick={() => handleAction(onOpenFilePicker)}
            className="w-full flex items-center gap-2 p-1.5 rounded hover:bg-[#316ac5] hover:text-white text-left group font-bold text-[11px]"
          >
            <XpIcon name="my-pictures" size={20} />
            <span>My Pictures</span>
          </button>

          <button
            type="button"
            onClick={() => handleAction(() => onOpenAbout())}
            className="w-full flex items-center gap-2 p-1.5 rounded hover:bg-[#316ac5] hover:text-white text-left group font-bold text-[11px]"
          >
            <XpIcon name="my-computer" size={20} />
            <span>My Computer</span>
          </button>

          <div className="my-1 border-t border-[#95bdee]" />

          <button
            type="button"
            onClick={() => handleAction(onOpenAbout)}
            className="w-full flex items-center gap-2 p-1.5 rounded hover:bg-[#316ac5] hover:text-white text-left group text-[11px]"
          >
            <XpIcon name="control-panel" size={18} />
            <span>Control Panel</span>
          </button>

          <button
            type="button"
            onClick={() => handleAction(onOpenAbout)}
            className="w-full flex items-center gap-2 p-1.5 rounded hover:bg-[#316ac5] hover:text-white text-left group text-[11px]"
          >
            <XpIcon name="help" size={18} />
            <span>Help and Support</span>
          </button>

          <button
            type="button"
            onClick={() => handleAction(onOpenAbout)}
            className="w-full flex items-center gap-2 p-1.5 rounded hover:bg-[#316ac5] hover:text-white text-left group text-[11px]"
          >
            <XpIcon name="search" size={18} />
            <span>Search</span>
          </button>

          <button
            type="button"
            onClick={() => handleAction(onOpenRun)}
            className="w-full flex items-center gap-2 p-1.5 rounded hover:bg-[#316ac5] hover:text-white text-left group text-[11px]"
          >
            <XpIcon name="folder-open" size={18} />
            <span>Run...</span>
          </button>
        </div>
      </div>

      {/* Start Menu Footer Bar (Log Off & Turn Off) */}
      <div className="bg-gradient-to-r from-[#0055ea] via-[#246adb] to-[#3f88f2] px-3 py-2 flex items-center justify-end gap-3 border-t border-[#316ac5]">
        <button
          type="button"
          onClick={() => handleAction(onToggleModern)}
          className="flex items-center gap-1.5 text-white hover:brightness-125 text-[11px] font-medium"
        >
          <XpIcon name="logoff" size={18} />
          <span>Log Off</span>
        </button>

        <button
          type="button"
          onClick={() => handleAction(onOpenTurnOff)}
          className="flex items-center gap-1.5 text-white hover:brightness-125 text-[11px] font-medium"
        >
          <XpIcon name="shutdown" size={18} />
          <span>Turn Off Computer</span>
        </button>
      </div>
    </div>
  );
}
