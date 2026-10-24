"use client";

import React, { useState } from "react";
import { ImageFileItem } from "@/types";
import { formatBytes } from "@/lib/converter";
import { XpIcon } from "./XpIcon";
import { xpAudio } from "@/lib/xp-sound";

interface XpExplorerSidebarProps {
  items: ImageFileItem[];
  selectedItem: ImageFileItem | null;
  onOpenFilePicker: () => void;
  onConvertAll: () => void;
  onDownloadZip: () => void;
  onClearAll: () => void;
  onOpenAbout: () => void;
  onCompareItem: (item: ImageFileItem) => void;
  isConvertingAll: boolean;
  className?: string;
}

export function XpExplorerSidebar({
  items,
  selectedItem,
  onOpenFilePicker,
  onConvertAll,
  onDownloadZip,
  onClearAll,
  onOpenAbout,
  onCompareItem,
  isConvertingAll,
  className = "",
}: XpExplorerSidebarProps) {
  const [pictureTasksOpen, setPictureTasksOpen] = useState(true);
  const [folderTasksOpen, setFolderTasksOpen] = useState(true);
  const [otherPlacesOpen, setOtherPlacesOpen] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(true);

  const completedCount = items.filter((i) => i.status === "completed").length;
  const targetItem = selectedItem || items[0] || null;

  return (
    <aside
      className={`w-[220px] flex-shrink-0 bg-gradient-to-b from-[#7ba2e7] via-[#6375d6] to-[#7ba2e7] p-2 space-y-3 overflow-y-auto select-none text-[11px] font-sans ${className}`}
    >
      {/* 1. Picture Tasks Section */}
      <div className="rounded-[3px] overflow-hidden bg-[#d3e5fa] shadow-sm border border-white/60">
        <button
          type="button"
          onClick={() => {
            xpAudio.playClickSound();
            setPictureTasksOpen(!pictureTasksOpen);
          }}
          className="w-full flex items-center justify-between px-2.5 py-1 bg-gradient-to-r from-[#215dc6] to-[#4682e8] text-white font-bold cursor-pointer hover:brightness-110"
        >
          <span className="text-shadow-xp">Picture Tasks</span>
          <span className="text-[10px] transform transition-transform">
            {pictureTasksOpen ? "▲" : "▼"}
          </span>
        </button>

        {pictureTasksOpen && (
          <div className="p-2 space-y-1.5 bg-[#d3e5fa]">
            <button
              type="button"
              disabled={items.length === 0 || isConvertingAll}
              onClick={() => {
                xpAudio.playClickSound();
                onConvertAll();
              }}
              className="w-full text-left flex items-center gap-2 text-[#00138c] hover:underline hover:text-[#0055ea] disabled:opacity-40 disabled:hover:no-underline"
            >
              <XpIcon name="webptor" size={16} />
              <span>Convert All to WebP</span>
            </button>

            <button
              type="button"
              disabled={completedCount === 0}
              onClick={() => {
                xpAudio.playClickSound();
                onDownloadZip();
              }}
              className="w-full text-left flex items-center gap-2 text-[#00138c] hover:underline hover:text-[#0055ea] disabled:opacity-40 disabled:hover:no-underline"
            >
              <XpIcon name="zip" size={16} />
              <span>Save All as (.ZIP)</span>
            </button>

            {targetItem && (
              <button
                type="button"
                onClick={() => {
                  xpAudio.playClickSound();
                  onCompareItem(targetItem);
                }}
                className="w-full text-left flex items-center gap-2 text-[#00138c] hover:underline hover:text-[#0055ea]"
              >
                <XpIcon name="camera" size={16} />
                <span>Picture &amp; Fax Viewer</span>
              </button>
            )}

            {items.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  xpAudio.playClickSound();
                  onClearAll();
                }}
                className="w-full text-left flex items-center gap-2 text-[#a80000] hover:underline hover:text-red-700"
              >
                <XpIcon name="recycle-bin-empty" size={16} />
                <span>Empty Queue</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* 2. File and Folder Tasks */}
      <div className="rounded-[3px] overflow-hidden bg-[#d3e5fa] shadow-sm border border-white/60">
        <button
          type="button"
          onClick={() => {
            xpAudio.playClickSound();
            setFolderTasksOpen(!folderTasksOpen);
          }}
          className="w-full flex items-center justify-between px-2.5 py-1 bg-gradient-to-r from-[#215dc6] to-[#4682e8] text-white font-bold cursor-pointer hover:brightness-110"
        >
          <span className="text-shadow-xp">File and Folder Tasks</span>
          <span className="text-[10px] transform transition-transform">
            {folderTasksOpen ? "▲" : "▼"}
          </span>
        </button>

        {folderTasksOpen && (
          <div className="p-2 space-y-1.5 bg-[#d3e5fa]">
            <button
              type="button"
              onClick={() => {
                xpAudio.playClickSound();
                onOpenFilePicker();
              }}
              className="w-full text-left flex items-center gap-2 text-[#00138c] hover:underline hover:text-[#0055ea]"
            >
              <XpIcon name="folder-open" size={16} />
              <span>Select pictures...</span>
            </button>

            <button
              type="button"
              onClick={() => {
                xpAudio.playClickSound();
                onOpenFilePicker();
              }}
              className="w-full text-left flex items-center gap-2 text-[#00138c] hover:underline hover:text-[#0055ea]"
            >
              <XpIcon name="my-pictures" size={16} />
              <span>Import from Computer</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. Other Places */}
      <div className="rounded-[3px] overflow-hidden bg-[#d3e5fa] shadow-sm border border-white/60">
        <button
          type="button"
          onClick={() => {
            xpAudio.playClickSound();
            setOtherPlacesOpen(!otherPlacesOpen);
          }}
          className="w-full flex items-center justify-between px-2.5 py-1 bg-gradient-to-r from-[#215dc6] to-[#4682e8] text-white font-bold cursor-pointer hover:brightness-110"
        >
          <span className="text-shadow-xp">Other Places</span>
          <span className="text-[10px] transform transition-transform">
            {otherPlacesOpen ? "▲" : "▼"}
          </span>
        </button>

        {otherPlacesOpen && (
          <div className="p-2 space-y-1.5 bg-[#d3e5fa]">
            <button
              type="button"
              onClick={() => {
                xpAudio.playClickSound();
                onOpenFilePicker();
              }}
              className="w-full text-left flex items-center gap-2 text-[#00138c] hover:underline hover:text-[#0055ea]"
            >
              <XpIcon name="my-pictures" size={16} />
              <span>My Pictures</span>
            </button>

            <button
              type="button"
              onClick={() => {
                xpAudio.playClickSound();
                onOpenFilePicker();
              }}
              className="w-full text-left flex items-center gap-2 text-[#00138c] hover:underline hover:text-[#0055ea]"
            >
              <XpIcon name="my-documents" size={16} />
              <span>My Documents</span>
            </button>

            <button
              type="button"
              onClick={() => {
                xpAudio.playClickSound();
                onOpenAbout();
              }}
              className="w-full text-left flex items-center gap-2 text-[#00138c] hover:underline hover:text-[#0055ea]"
            >
              <XpIcon name="my-computer" size={16} />
              <span>My Computer</span>
            </button>
          </div>
        )}
      </div>

      {/* 4. Details Section */}
      <div className="rounded-[3px] overflow-hidden bg-[#d3e5fa] shadow-sm border border-white/60">
        <button
          type="button"
          onClick={() => {
            xpAudio.playClickSound();
            setDetailsOpen(!detailsOpen);
          }}
          className="w-full flex items-center justify-between px-2.5 py-1 bg-gradient-to-r from-[#215dc6] to-[#4682e8] text-white font-bold cursor-pointer hover:brightness-110"
        >
          <span className="text-shadow-xp">Details</span>
          <span className="text-[10px] transform transition-transform">
            {detailsOpen ? "▲" : "▼"}
          </span>
        </button>

        {detailsOpen && (
          <div className="p-2 space-y-1 bg-[#d3e5fa] text-[10px] text-gray-800">
            {targetItem ? (
              <div className="space-y-1">
                {targetItem.originalPreviewUrl && (
                  <div className="w-full h-20 bg-white border border-[#7f9db9] rounded flex items-center justify-center overflow-hidden mb-1.5 p-0.5">
                    <img
                      src={targetItem.convertedUrl || targetItem.originalPreviewUrl}
                      alt={targetItem.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                )}
                <p className="font-bold text-black truncate" title={targetItem.name}>
                  {targetItem.name}
                </p>
                <p>Format: <strong className="uppercase">{targetItem.originalFormat}</strong></p>
                {targetItem.originalWidth > 0 && (
                  <p>Dimensions: {targetItem.originalWidth}x{targetItem.originalHeight}</p>
                )}
                <p>Original: {formatBytes(targetItem.originalSize)}</p>
                {targetItem.convertedSize && (
                  <>
                    <p className="text-[#0055ea] font-bold">WebP: {formatBytes(targetItem.convertedSize)}</p>
                    {targetItem.savingsPercentage !== undefined && (
                      <p className="text-[#1b7a24] font-bold">Savings: -{targetItem.savingsPercentage}%</p>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                <p className="font-bold text-black">webptor Image Suite</p>
                <p>Folder: My Pictures</p>
                <p>Status: Ready</p>
                <p className="text-gray-600 mt-2">100% Client-side image converter for high performance.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
