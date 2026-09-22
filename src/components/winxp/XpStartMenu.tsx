"use client";

import React, { useRef, useEffect } from "react";
import { XpIcon } from "./XpIcon";
import { xpAudio } from "@/lib/xp-sound";

interface XpStartMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFilePicker: () => void;
  onOpenAbout: () => void;
  onToggleModern: () => void;
}

export function XpStartMenu({
  isOpen,
  onClose,
  onOpenFilePicker,
  onOpenAbout,
  onToggleModern,
}: XpStartMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
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
    cb();
  };

  return (
    <div
      ref={menuRef}
      className="fixed bottom-[30px] left-0 z-50 w-[380px] max-w-[95vw] bg-[#0055ea] rounded-t-lg shadow-2xl border-2 border-[#0055ea] overflow-hidden select-none animate-in fade-in slide-in-from-bottom-2 duration-150 text-[12px] font-sans"
    >
      {/* Start Menu Header */}
      <div className="bg-gradient-to-r from-[#0055ea] via-[#246adb] to-[#3f88f2] px-3 py-2 flex items-center gap-3 border-b-2 border-[#e5a01a]">
        {/* User Avatar */}
        <div className="w-11 h-11 rounded-sm bg-white p-0.5 border border-[#1941a5] shadow-md flex items-center justify-center overflow-hidden">
          <div className="w-full h-full bg-gradient-to-tr from-[#3b82f6] to-[#60a5fa] flex items-center justify-center text-white font-bold text-base">
            ⚡
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-white font-bold text-sm tracking-wide text-shadow-xp">
            Amir Aftor
          </span>
          <span className="text-[#a5c8ff] text-[10px]">webptor Administrator</span>
        </div>
      </div>

      {/* Start Menu Body (2 Columns) */}
      <div className="grid grid-cols-2 bg-white min-h-[340px]">
        {/* Left Column (White Background - Programs) */}
        <div className="bg-white p-2 flex flex-col justify-between border-r border-[#95bdee]">
          <div className="space-y-1">
            {/* webptor Converter */}
            <button
              type="button"
              onClick={() => handleAction(onOpenFilePicker)}
              className="w-full flex items-center gap-2.5 p-1.5 rounded hover:bg-[#316ac5] hover:text-white text-left group"
            >
              <XpIcon name="webptor" size={30} />
              <div>
                <span className="font-bold block text-[11px]">webptor Converter</span>
                <span className="text-[10px] text-gray-500 group-hover:text-gray-200">
                  Convert images to WebP
                </span>
              </div>
            </button>

            {/* Internet Explorer */}
            <button
              type="button"
              onClick={() => handleAction(onOpenAbout)}
              className="w-full flex items-center gap-2.5 p-1.5 rounded hover:bg-[#316ac5] hover:text-white text-left group"
            >
              <XpIcon name="internet-explorer" size={30} />
              <div>
                <span className="font-bold block text-[11px]">Internet</span>
                <span className="text-[10px] text-gray-500 group-hover:text-gray-200">
                  Internet Explorer
                </span>
              </div>
            </button>

            <div className="my-1 border-t border-[#d4d0c8]" />

            {/* My Pictures shortcut */}
            <button
              type="button"
              onClick={() => handleAction(onOpenFilePicker)}
              className="w-full flex items-center gap-2.5 p-1.5 rounded hover:bg-[#316ac5] hover:text-white text-left group"
            >
              <XpIcon name="my-pictures" size={24} />
              <span className="text-[11px]">Choose Image Files</span>
            </button>

            {/* Switch to Modern Mode */}
            <button
              type="button"
              onClick={() => handleAction(onToggleModern)}
              className="w-full flex items-center gap-2.5 p-1.5 rounded hover:bg-[#316ac5] hover:text-white text-left group"
            >
              <span className="text-base">🚀</span>
              <span className="text-[11px] font-semibold text-indigo-600 group-hover:text-white">
                Switch to Modern Theme
              </span>
            </button>
          </div>

          {/* All Programs bar */}
          <div className="pt-2 border-t border-[#d4d0c8]">
            <button
              type="button"
              onClick={() => handleAction(onOpenAbout)}
              className="w-full flex items-center justify-center gap-2 py-1 px-2 font-bold text-[11px] hover:bg-[#316ac5] hover:text-white rounded"
            >
              <span>All Programs</span>
              <span className="text-[#38821d] text-xs font-black">▶</span>
            </button>
          </div>
        </div>

        {/* Right Column (Light Blue Background - System Folders) */}
        <div className="bg-[#d3e5fa] p-2 space-y-1 text-[#00138c]">
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
            onClick={() => handleAction(onOpenAbout)}
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
            <span className="text-sm">⚙️</span>
            <span>Control Panel</span>
          </button>

          <button
            type="button"
            onClick={() => handleAction(onOpenAbout)}
            className="w-full flex items-center gap-2 p-1.5 rounded hover:bg-[#316ac5] hover:text-white text-left group text-[11px]"
          >
            <span className="text-sm">❓</span>
            <span>Help and Support</span>
          </button>

          <button
            type="button"
            onClick={() => handleAction(onOpenAbout)}
            className="w-full flex items-center gap-2 p-1.5 rounded hover:bg-[#316ac5] hover:text-white text-left group text-[11px]"
          >
            <span className="text-sm">🔍</span>
            <span>Search</span>
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
          onClick={() => handleAction(onToggleModern)}
          className="flex items-center gap-1.5 text-white hover:brightness-125 text-[11px] font-medium"
        >
          <XpIcon name="shutdown" size={18} />
          <span>Turn Off / Modern</span>
        </button>
      </div>
    </div>
  );
}
