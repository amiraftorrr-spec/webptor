"use client";

import React, { useState, useEffect } from "react";
import { XpIcon } from "./XpIcon";
import { xpAudio } from "@/lib/xp-sound";

interface XpRunModalProps {
  onClose: () => void;
  onExecute: (cmd: string) => void;
}

export function XpRunModal({ onClose, onExecute }: XpRunModalProps) {
  const [command, setCommand] = useState("webptor");

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    xpAudio.playClickSound();
    onExecute(command.trim());
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 select-none text-[12px] font-sans"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[400px] bg-[#ece9d8] border-2 border-[#0055ea] rounded-t-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Titlebar */}
        <div className="xp-titlebar flex items-center justify-between px-2 py-1 select-none">
          <div className="flex items-center gap-1.5">
            <XpIcon name="windows-flag" size={16} />
            <span className="text-white font-bold text-xs tracking-wide text-shadow-xp">
              Run
            </span>
          </div>
          <button
            type="button"
            className="xp-win-btn xp-win-btn-close"
            title="Close"
            onClick={() => {
              xpAudio.playClickSound();
              onClose();
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div className="flex items-start gap-3">
            <XpIcon name="folder-open" size={36} className="flex-shrink-0 mt-1" />
            <p className="text-[11px] text-gray-800 leading-normal">
              Type the name of a program, folder, document, or Internet resource, and Windows will open it for you.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <label htmlFor="xp-run-cmd" className="text-[11px] text-gray-800 font-medium whitespace-nowrap">
              Open:
            </label>
            <input
              id="xp-run-cmd"
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              autoFocus
              className="flex-1 px-2 py-1 bg-white border border-[#7f9db9] rounded-[2px] text-xs font-sans text-black focus:outline-none focus:ring-1 focus:ring-[#0055ea]"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-[#d4d0c8] flex items-center justify-end gap-2">
            <button
              type="submit"
              className="xp-btn xp-btn-primary px-4 py-1 text-xs"
            >
              OK
            </button>
            <button
              type="button"
              onClick={() => {
                xpAudio.playClickSound();
                onClose();
              }}
              className="xp-btn px-4 py-1 text-xs"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
