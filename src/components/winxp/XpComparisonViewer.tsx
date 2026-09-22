"use client";

import React, { useState, useRef, useEffect, MouseEvent, TouchEvent } from "react";
import { XpIcon } from "./XpIcon";
import { ImageFileItem } from "@/types";
import { formatBytes, downloadFile, getBaseFileName } from "@/lib/converter";
import { xpAudio } from "@/lib/xp-sound";

interface XpComparisonViewerProps {
  item: ImageFileItem;
  onClose: () => void;
}

export function XpComparisonViewer({ item, onClose }: XpComparisonViewerProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        xpAudio.playClickSound();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleDownload = () => {
    xpAudio.playClickSound();
    if (item.convertedUrl) {
      downloadFile(item.convertedUrl, `${getBaseFileName(item.name)}.webp`);
    }
  };

  const handleRotateCw = () => {
    xpAudio.playClickSound();
    setRotation((r) => (r + 90) % 360);
  };

  const handleRotateCcw = () => {
    xpAudio.playClickSound();
    setRotation((r) => (r - 90 + 360) % 360);
  };

  const handleZoomIn = () => {
    xpAudio.playClickSound();
    setZoom((z) => Math.min(3, z + 0.25));
  };

  const handleZoomOut = () => {
    xpAudio.playClickSound();
    setZoom((z) => Math.max(0.5, z - 0.25));
  };

  const handleResetZoom = () => {
    xpAudio.playClickSound();
    setZoom(1);
    setRotation(0);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs select-none"
      onClick={() => {
        xpAudio.playClickSound();
        onClose();
      }}
    >
      {/* Windows Picture and Fax Viewer Frame */}
      <div
        className="relative w-full max-w-4xl bg-[#ece9d8] border-2 border-[#0055ea] rounded-t-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Luna Titlebar */}
        <div className="xp-titlebar flex items-center justify-between px-2 py-1 select-none">
          <div className="flex items-center gap-2">
            <XpIcon name="image-file" size={16} />
            <span className="text-white font-bold text-xs tracking-wide text-shadow-xp truncate max-w-[300px] sm:max-w-md">
              Windows Picture and Fax Viewer - {item.name}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              className="xp-win-btn xp-win-btn-min"
              title="Minimize"
              onClick={() => xpAudio.playClickSound()}
            >
              _
            </button>
            <button
              type="button"
              className="xp-win-btn xp-win-btn-max"
              title="Maximize"
              onClick={() => xpAudio.playClickSound()}
            >
              □
            </button>
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
        </div>

        {/* Info Strip */}
        <div className="bg-[#f0ede0] px-4 py-1.5 border-b border-[#d4d0c8] flex flex-wrap items-center justify-between text-[11px] text-[#333]">
          <div>
            <strong>Original:</strong> {formatBytes(item.originalSize)} ({item.originalFormat})
            {item.convertedSize && (
              <>
                <span className="mx-2 text-[#999]">|</span>
                <strong>WebP:</strong> <span className="text-[#00138c] font-bold">{formatBytes(item.convertedSize)}</span>
                <span className="ml-2 font-bold text-[#1b7a24]">(-{item.savingsPercentage}%)</span>
              </>
            )}
          </div>
          <div className="text-[10px] text-gray-500">
            Drag the slider to compare original with WebP
          </div>
        </div>

        {/* Image Canvas Area */}
        <div className="relative flex-1 min-h-[300px] sm:min-h-[420px] bg-[#525252] overflow-hidden flex items-center justify-center p-2">
          <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            className="relative w-full h-full max-h-[500px] flex items-center justify-center cursor-ew-resize select-none overflow-hidden"
          >
            {/* Background WebP Image */}
            <div
              className="absolute inset-0 flex items-center justify-center p-2 transition-transform duration-100"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.convertedUrl || item.originalPreviewUrl}
                alt="Converted WebP"
                className="max-h-full max-w-full object-contain pointer-events-none"
              />
            </div>

            {/* Foreground Original Clipped Image */}
            <div
              className="absolute inset-0 flex items-center justify-center p-2 overflow-hidden pointer-events-none transition-transform duration-100"
              style={{
                clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.originalPreviewUrl}
                alt="Original"
                className="max-h-full max-w-full object-contain pointer-events-none"
              />
            </div>

            {/* Draggable Divider Line */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-[#0055ea] shadow-xl pointer-events-auto"
              style={{ left: `${sliderPosition}%` }}
              onMouseDown={handleMouseDown}
              onTouchStart={handleMouseDown}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded-[3px] bg-gradient-to-b from-[#ffffff] to-[#ece9d8] border border-[#003c74] text-black text-[10px] font-bold shadow-md cursor-grab active:cursor-grabbing select-none">
                ◄►
              </div>
            </div>

            {/* Badges */}
            <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-sans pointer-events-none">
              Original: {item.originalFormat}
            </div>
            <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-[#0055ea]/90 text-white text-[10px] font-sans pointer-events-none">
              WebP Output
            </div>
          </div>
        </div>

        {/* XP Viewer Bottom Toolbar */}
        <div className="bg-[#ece9d8] p-2 border-t border-[#d4d0c8] flex items-center justify-center gap-1.5 sm:gap-3 flex-wrap">
          {/* Zoom In */}
          <button
            type="button"
            onClick={handleZoomIn}
            className="xp-btn text-xs px-2.5 py-1 flex items-center gap-1"
            title="Zoom In"
          >
            <span>🔍+</span>
            <span className="hidden sm:inline">Zoom In</span>
          </button>

          {/* Zoom Out */}
          <button
            type="button"
            onClick={handleZoomOut}
            className="xp-btn text-xs px-2.5 py-1 flex items-center gap-1"
            title="Zoom Out"
          >
            <span>🔍-</span>
            <span className="hidden sm:inline">Zoom Out</span>
          </button>

          {/* Reset Zoom */}
          <button
            type="button"
            onClick={handleResetZoom}
            className="xp-btn text-xs px-2.5 py-1"
            title="Actual Size"
          >
            100%
          </button>

          <div className="h-5 w-[1px] bg-[#b5b1a1] mx-1" />

          {/* Rotate CCW */}
          <button
            type="button"
            onClick={handleRotateCcw}
            className="xp-btn text-xs px-2.5 py-1"
            title="Rotate Counterclockwise"
          >
            ↺
          </button>

          {/* Rotate CW */}
          <button
            type="button"
            onClick={handleRotateCw}
            className="xp-btn text-xs px-2.5 py-1"
            title="Rotate Clockwise"
          >
            ↻
          </button>

          <div className="h-5 w-[1px] bg-[#b5b1a1] mx-1" />

          {/* Save / Download */}
          {item.convertedUrl && (
            <button
              type="button"
              onClick={handleDownload}
              className="xp-btn xp-btn-primary font-bold text-xs px-3 py-1 flex items-center gap-1.5"
            >
              <XpIcon name="floppy" size={14} />
              <span>Save WebP</span>
            </button>
          )}

          {/* Close */}
          <button
            type="button"
            onClick={() => {
              xpAudio.playClickSound();
              onClose();
            }}
            className="xp-btn text-xs px-3 py-1"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
