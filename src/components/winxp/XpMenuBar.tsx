"use client";

import React, { useState, useRef, useEffect } from "react";
import { XpIcon } from "./XpIcon";
import { xpAudio } from "@/lib/xp-sound";

interface XpMenuBarProps {
  onOpenFilePicker: () => void;
  onConvertAll: () => void;
  onDownloadZip: () => void;
  onClearAll: () => void;
  onOpenAbout: () => void;
  onToggleModern: () => void;
  hasItems: boolean;
  hasCompleted: boolean;
}

export function XpMenuBar({
  onOpenFilePicker,
  onConvertAll,
  onDownloadZip,
  onClearAll,
  onOpenAbout,
  onToggleModern,
  hasItems,
  hasCompleted,
}: XpMenuBarProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuBarRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = (menu: string) => {
    xpAudio.playClickSound();
    setActiveMenu((prev) => (prev === menu ? null : menu));
  };

  const handleMenuHover = (menu: string) => {
    if (activeMenu !== null) {
      setActiveMenu(menu);
    }
  };

  const executeAction = (action: () => void) => {
    xpAudio.playClickSound();
    setActiveMenu(null);
    action();
  };

  return (
    <div ref={menuBarRef} className="w-full bg-[#ece9d8] border-b border-[#d4d0c8] select-none text-[12px] font-sans">
      {/* Top Text Menu Bar */}
      <div className="flex items-center px-2 py-0.5 border-b border-[#d4d0c8] relative">
        {/* File Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleMenu("file")}
            onMouseEnter={() => handleMenuHover("file")}
            className={`px-2 py-0.5 rounded-[2px] transition-none ${
              activeMenu === "file" ? "bg-[#316ac5] text-white" : "hover:bg-[#316ac5]/20 text-black"
            }`}
          >
            <span className="underline">F</span>ile
          </button>
          {activeMenu === "file" && (
            <div className="absolute top-full left-0 z-50 min-w-[200px] bg-[#fff] border border-[#7f9db9] shadow-md p-0.5 text-black">
              <button
                type="button"
                onClick={() => executeAction(onOpenFilePicker)}
                className="w-full text-left px-3 py-1 hover:bg-[#316ac5] hover:text-white flex items-center justify-between"
              >
                <span>Open Images...</span>
                <span className="text-[10px] text-gray-500">Ctrl+O</span>
              </button>
              <button
                type="button"
                disabled={!hasItems}
                onClick={() => executeAction(onConvertAll)}
                className="w-full text-left px-3 py-1 hover:bg-[#316ac5] hover:text-white flex items-center justify-between disabled:opacity-40"
              >
                <span>Convert All to WebP</span>
                <span className="text-[10px] text-gray-500">F5</span>
              </button>
              <button
                type="button"
                disabled={!hasCompleted}
                onClick={() => executeAction(onDownloadZip)}
                className="w-full text-left px-3 py-1 hover:bg-[#316ac5] hover:text-white flex items-center justify-between disabled:opacity-40"
              >
                <span>Save All as (.ZIP)...</span>
                <span className="text-[10px] text-gray-500">Ctrl+S</span>
              </button>
              <div className="my-1 border-t border-[#d4d0c8]" />
              <button
                type="button"
                onClick={() => executeAction(onToggleModern)}
                className="w-full text-left px-3 py-1 hover:bg-[#316ac5] hover:text-white flex items-center justify-between"
              >
                <span>Return to Modern UI</span>
              </button>
            </div>
          )}
        </div>

        {/* Edit Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleMenu("edit")}
            onMouseEnter={() => handleMenuHover("edit")}
            className={`px-2 py-0.5 rounded-[2px] transition-none ${
              activeMenu === "edit" ? "bg-[#316ac5] text-white" : "hover:bg-[#316ac5]/20 text-black"
            }`}
          >
            <span className="underline">E</span>dit
          </button>
          {activeMenu === "edit" && (
            <div className="absolute top-full left-0 z-50 min-w-[180px] bg-[#fff] border border-[#7f9db9] shadow-md p-0.5 text-black">
              <button
                type="button"
                disabled={!hasItems}
                onClick={() => executeAction(onClearAll)}
                className="w-full text-left px-3 py-1 hover:bg-[#316ac5] hover:text-white disabled:opacity-40"
              >
                Clear File Queue
              </button>
            </div>
          )}
        </div>

        {/* View Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleMenu("view")}
            onMouseEnter={() => handleMenuHover("view")}
            className={`px-2 py-0.5 rounded-[2px] transition-none ${
              activeMenu === "view" ? "bg-[#316ac5] text-white" : "hover:bg-[#316ac5]/20 text-black"
            }`}
          >
            <span className="underline">V</span>iew
          </button>
          {activeMenu === "view" && (
            <div className="absolute top-full left-0 z-50 min-w-[180px] bg-[#fff] border border-[#7f9db9] shadow-md p-0.5 text-black">
              <button
                type="button"
                onClick={() => executeAction(onToggleModern)}
                className="w-full text-left px-3 py-1 hover:bg-[#316ac5] hover:text-white"
              >
                Switch to Modern Theme
              </button>
            </div>
          )}
        </div>

        {/* Help Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleMenu("help")}
            onMouseEnter={() => handleMenuHover("help")}
            className={`px-2 py-0.5 rounded-[2px] transition-none ${
              activeMenu === "help" ? "bg-[#316ac5] text-white" : "hover:bg-[#316ac5]/20 text-black"
            }`}
          >
            <span className="underline">H</span>elp
          </button>
          {activeMenu === "help" && (
            <div className="absolute top-full left-0 z-50 min-w-[200px] bg-[#fff] border border-[#7f9db9] shadow-md p-0.5 text-black">
              <button
                type="button"
                onClick={() => executeAction(onOpenAbout)}
                className="w-full text-left px-3 py-1 hover:bg-[#316ac5] hover:text-white"
              >
                About webptor XP...
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Standard Explorer Toolbar */}
      <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-gradient-to-b from-[#f7f6f0] to-[#e6e2d3] border-b border-[#d4d0c8]">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => {
            xpAudio.playClickSound();
            onOpenFilePicker();
          }}
          className="flex items-center gap-1 px-2 py-1 rounded hover:bg-black/5 active:bg-black/10 text-[11px] font-sans text-[#333]"
          title="Open Files"
        >
          <div className="w-5 h-5 rounded-full bg-gradient-to-b from-[#7fe359] to-[#3a9616] border border-[#2b720f] flex items-center justify-center text-white text-[10px] font-bold shadow-xs">
            ◀
          </div>
          <span>Back</span>
        </button>

        {/* Forward */}
        <button
          type="button"
          disabled
          className="flex items-center gap-1 px-1.5 py-1 rounded opacity-40 text-[11px] font-sans text-[#333]"
        >
          <div className="w-5 h-5 rounded-full bg-gradient-to-b from-[#b4d6a5] to-[#78a865] border border-[#6b8c5e] flex items-center justify-center text-white text-[10px] font-bold">
            ▶
          </div>
        </button>

        <div className="h-5 w-[1px] bg-[#b5b1a1] mx-1" />

        {/* Open Folder Action */}
        <button
          type="button"
          onClick={() => {
            xpAudio.playClickSound();
            onOpenFilePicker();
          }}
          className="flex items-center gap-1 px-2 py-1 rounded hover:bg-black/5 active:bg-black/10 text-[11px] font-sans text-[#333]"
        >
          <XpIcon name="folder" size={16} />
          <span>Browse</span>
        </button>

        {/* Convert All Action */}
        <button
          type="button"
          disabled={!hasItems}
          onClick={() => {
            xpAudio.playClickSound();
            onConvertAll();
          }}
          className="flex items-center gap-1 px-2 py-1 rounded hover:bg-black/5 active:bg-black/10 text-[11px] font-sans text-[#333] disabled:opacity-40"
        >
          <XpIcon name="webptor" size={16} />
          <span>Convert All</span>
        </button>

        {/* Save ZIP Action */}
        <button
          type="button"
          disabled={!hasCompleted}
          onClick={() => {
            xpAudio.playClickSound();
            onDownloadZip();
          }}
          className="flex items-center gap-1 px-2 py-1 rounded hover:bg-black/5 active:bg-black/10 text-[11px] font-sans text-[#333] disabled:opacity-40"
        >
          <XpIcon name="zip" size={16} />
          <span>Save .ZIP</span>
        </button>

        {/* Modern Theme Switch */}
        <button
          type="button"
          onClick={() => {
            xpAudio.playClickSound();
            onToggleModern();
          }}
          className="ml-auto flex items-center gap-1.5 px-2.5 py-0.5 rounded-[3px] bg-[#0055ea] hover:bg-[#0047c4] text-white text-[11px] font-bold shadow-xs border border-[#002f8a]"
          title="Switch to Modern Web Interface"
        >
          <span>🚀 Modern Theme</span>
        </button>
      </div>

      {/* Explorer Address Bar */}
      <div className="flex items-center gap-2 px-2 py-1 bg-[#ece9d8]">
        <span className="text-[11px] text-[#555] font-medium">Address</span>
        <div className="flex-1 flex items-center bg-white border border-[#7f9db9] rounded-[1px] px-1.5 py-0.5 shadow-inner">
          <XpIcon name="my-pictures" size={14} className="mr-1.5" />
          <span className="text-[11px] font-mono text-black select-text">
            C:\Documents and Settings\Amir\My Pictures\webptor\
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            xpAudio.playClickSound();
            onOpenFilePicker();
          }}
          className="flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-gradient-to-b from-[#65c832] to-[#3a8b13] border border-[#265e0d] text-white text-[11px] font-bold shadow-xs hover:brightness-110 active:brightness-90"
        >
          <span>Go</span>
          <span className="text-[10px]">➔</span>
        </button>
      </div>
    </div>
  );
}
