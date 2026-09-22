"use client";

import React, { useState, useRef, useEffect, useCallback, MouseEvent, TouchEvent } from "react";
import { XpIcon } from "./XpIcon";
import { ImageFileItem } from "@/types";
import { formatBytes, downloadFile, getBaseFileName } from "@/lib/converter";
import { xpAudio } from "@/lib/xp-sound";

interface XpComparisonViewerProps {
  item: ImageFileItem;
  onClose: () => void;
}

type XpViewMode = "slider" | "side-by-side";

export function XpComparisonViewer({ item, onClose }: XpComparisonViewerProps) {
  const [viewMode, setViewMode] = useState<XpViewMode>("slider");
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const originalSrc = item.originalPreviewUrl || item.convertedUrl || "";
  const convertedSrc = item.convertedUrl || item.originalPreviewUrl || "";

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        xpAudio.playClickSound();
        onClose();
      } else if (e.key === "ArrowLeft") {
        setSliderPosition((p) => Math.max(0, p - 5));
      } else if (e.key === "ArrowRight") {
        setSliderPosition((p) => Math.min(100, p + 5));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const updateSliderFromClientX = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width <= 0) return;
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    updateSliderFromClientX(e.clientX);
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      updateSliderFromClientX(e.clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      setIsDragging(true);
      updateSliderFromClientX(e.touches[0].clientX);
    }
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (isDragging && e.touches.length > 0) {
      updateSliderFromClientX(e.touches[0].clientX);
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
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/60 backdrop-blur-xs select-none"
      onClick={() => {
        xpAudio.playClickSound();
        onClose();
      }}
    >
      {/* Windows Picture and Fax Viewer Frame */}
      <div
        className="relative w-full max-w-4xl bg-[#ece9d8] border-2 border-[#0055ea] rounded-t-lg shadow-2xl overflow-hidden flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchEnd={handleMouseUp}
      >
        {/* Luna Titlebar */}
        <div className="xp-titlebar flex items-center justify-between px-2 py-1 select-none">
          <div className="flex items-center gap-2">
            <XpIcon name="image-file" size={16} />
            <span className="text-white font-bold text-xs tracking-wide text-shadow-xp truncate max-w-[280px] sm:max-w-md">
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
        <div className="bg-[#f0ede0] px-3 sm:px-4 py-1.5 border-b border-[#d4d0c8] flex flex-wrap items-center justify-between text-[11px] text-[#333] gap-2">
          <div className="truncate">
            <strong>Original:</strong> {formatBytes(item.originalSize)} ({item.originalFormat})
            {item.convertedSize && (
              <>
                <span className="mx-2 text-[#999]">|</span>
                <strong>WebP:</strong> <span className="text-[#00138c] font-bold">{formatBytes(item.convertedSize)}</span>
                <span className="ml-2 font-bold text-[#1b7a24]">(-{item.savingsPercentage}%)</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1 text-[11px]">
            <button
              type="button"
              onClick={() => {
                xpAudio.playClickSound();
                setViewMode("slider");
              }}
              className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                viewMode === "slider"
                  ? "bg-[#0055ea] text-white border-[#003c74]"
                  : "bg-white text-black border-[#7f9db9]"
              }`}
            >
              Split View
            </button>
            <button
              type="button"
              onClick={() => {
                xpAudio.playClickSound();
                setViewMode("side-by-side");
              }}
              className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                viewMode === "side-by-side"
                  ? "bg-[#0055ea] text-white border-[#003c74]"
                  : "bg-white text-black border-[#7f9db9]"
              }`}
            >
              2-Up (Side by Side)
            </button>
          </div>
        </div>

        {/* Image Canvas Area */}
        <div className="relative flex-1 min-h-[300px] sm:min-h-[420px] max-h-[540px] bg-[#525252] overflow-hidden flex items-center justify-center p-3">
          {viewMode === "slider" ? (
            <div
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              className="relative w-full h-full flex items-center justify-center cursor-ew-resize select-none overflow-hidden"
            >
              {/* Image Group Container */}
              <div
                className="relative max-w-full max-h-full flex items-center justify-center transition-transform duration-100"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                }}
              >
                {/* Background WebP Image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={convertedSrc}
                  alt="Converted WebP"
                  className="max-h-[360px] sm:max-h-[440px] w-auto object-contain pointer-events-none shadow-md"
                  draggable={false}
                />

                {/* Foreground Original Clipped Image */}
                <div
                  className="absolute inset-0 overflow-hidden pointer-events-none"
                  style={{
                    clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={originalSrc}
                    alt="Original"
                    className="w-full h-full object-contain pointer-events-none"
                    draggable={false}
                  />
                </div>

                {/* Draggable Divider Line */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-[#0055ea] shadow-lg pointer-events-none z-10"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded-[3px] bg-gradient-to-b from-[#ffffff] to-[#ece9d8] border border-[#003c74] text-black text-[9px] font-bold shadow-md cursor-grab active:cursor-grabbing pointer-events-auto select-none">
                    ◄►
                  </div>
                </div>
              </div>

              {/* Badges */}
              <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/75 text-white text-[10px] font-sans pointer-events-none z-10 border border-white/20">
                Original: {item.originalFormat}
              </div>
              <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-[#0055ea]/90 text-white text-[10px] font-sans pointer-events-none z-10 border border-blue-300/30">
                WebP Output
              </div>
            </div>
          ) : (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full h-full items-center justify-center p-2"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
              }}
            >
              <div className="relative flex flex-col items-center justify-center bg-black/30 rounded p-2 border border-gray-600 h-full max-h-[420px]">
                <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/80 text-white text-[9px]">
                  Original ({item.originalFormat})
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={originalSrc}
                  alt="Original"
                  className="max-h-[340px] w-auto object-contain"
                />
              </div>

              <div className="relative flex flex-col items-center justify-center bg-black/30 rounded p-2 border border-[#0055ea] h-full max-h-[420px]">
                <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-[#0055ea] text-white text-[9px]">
                  WebP Output
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={convertedSrc}
                  alt="Converted WebP"
                  className="max-h-[340px] w-auto object-contain"
                />
              </div>
            </div>
          )}
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
            {Math.round(zoom * 100)}%
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
              title="Save Converted WebP to Disk"
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
            className="xp-btn text-xs px-3 py-1 text-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
