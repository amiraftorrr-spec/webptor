"use client";

import React, { useState, useEffect } from "react";
import { XpIcon } from "./XpIcon";
import { xpAudio } from "@/lib/xp-sound";

interface XpAboutModalProps {
  onClose: () => void;
}

export function XpAboutModal({ onClose }: XpAboutModalProps) {
  const [activeTab, setActiveTab] = useState<"general" | "features">("general");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 select-none text-[12px] font-sans"
      onClick={() => {
        xpAudio.playClickSound();
        onClose();
      }}
    >
      <div
        className="relative w-full max-w-[440px] bg-[#ece9d8] border-2 border-[#0055ea] rounded-t-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Titlebar */}
        <div className="xp-titlebar flex items-center justify-between px-2 py-1 select-none">
          <div className="flex items-center gap-2">
            <XpIcon name="my-computer" size={16} />
            <span className="text-white font-bold text-xs tracking-wide text-shadow-xp">
              System Properties &amp; About webptor
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

        {/* Tab Headers */}
        <div className="px-3 pt-3 flex items-center gap-1 border-b border-[#919b9c]">
          <button
            type="button"
            onClick={() => {
              xpAudio.playClickSound();
              setActiveTab("general");
            }}
            className={`px-3 py-1.5 rounded-t-[3px] border-t-2 border-x-2 text-[11px] font-sans ${
              activeTab === "general"
                ? "bg-[#ece9d8] border-[#fff] border-b-[#ece9d8] -mb-[2px] font-bold z-10"
                : "bg-[#d8d4c8] border-[#919b9c] text-gray-700"
            }`}
          >
            General
          </button>
          <button
            type="button"
            onClick={() => {
              xpAudio.playClickSound();
              setActiveTab("features");
            }}
            className={`px-3 py-1.5 rounded-t-[3px] border-t-2 border-x-2 text-[11px] font-sans ${
              activeTab === "features"
                ? "bg-[#ece9d8] border-[#fff] border-b-[#ece9d8] -mb-[2px] font-bold z-10"
                : "bg-[#d8d4c8] border-[#919b9c] text-gray-700"
            }`}
          >
            Capabilities
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 bg-[#ece9d8] min-h-[220px]">
          {activeTab === "general" ? (
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <XpIcon name="my-computer" size={48} className="flex-shrink-0" />
                <div className="space-y-1 text-[#333]">
                  <h4 className="font-bold text-black text-sm">Microsoft Windows XP</h4>
                  <p className="text-[11px]">Professional</p>
                  <p className="text-[11px] text-gray-600">webptor Edition (Build 2026)</p>
                  <p className="text-[11px] text-gray-600">Service Pack 3</p>
                </div>
              </div>

              <div className="border-t border-[#d4d0c8] pt-2 grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-gray-600 block">Registered to:</span>
                  <strong className="text-black block">Amir Aftor</strong>
                  <span className="text-gray-500 text-[10px]">webptor Creator</span>
                </div>
                <div>
                  <span className="text-gray-600 block">Engine:</span>
                  <strong className="text-black block">Next.js &amp; HTML5 Canvas</strong>
                  <span className="text-gray-500 text-[10px]">100% Client-side Processing</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5 text-[11px] text-[#333]">
              <div className="flex items-center gap-2 font-bold text-black">
                <XpIcon name="webptor" size={20} />
                <span>webptor WebP Converter Features:</span>
              </div>
              <ul className="list-disc pl-5 space-y-1">
                <li>Zero server upload: 100% private in-browser conversions.</li>
                <li>Support for PNG, JPG, JPEG, GIF, BMP, SVG, AVIF, HEIC, TIFF, ICO.</li>
                <li>Batch processing &amp; instant one-click ZIP download.</li>
                <li>Interactive side-by-side visual comparison preview.</li>
                <li>Authentic Windows XP Luna retro interface.</li>
              </ul>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-[#ece9d8] px-4 py-2.5 border-t border-[#d4d0c8] flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              xpAudio.playClickSound();
              onClose();
            }}
            className="xp-btn xp-btn-primary min-w-[75px] text-xs py-1"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
