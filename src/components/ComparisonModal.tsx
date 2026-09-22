"use client";

import { useState, useRef, useEffect, useCallback, MouseEvent, TouchEvent } from "react";
import {
  X,
  Download,
  Sparkles,
  Columns,
  Sliders,
  Eye,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Check,
  Image as ImageIcon,
} from "lucide-react";
import { ImageFileItem } from "@/types";
import { formatBytes, downloadFile, getBaseFileName } from "@/lib/converter";

interface ComparisonModalProps {
  item: ImageFileItem;
  onClose: () => void;
}

type ViewMode = "slider" | "side-by-side" | "hold";

export function ComparisonModal({ item, onClose }: ComparisonModalProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("slider");
  const [sliderPosition, setSliderPosition] = useState(50); // percentage 0 - 100
  const [isDragging, setIsDragging] = useState(false);
  const [isHoldingOriginal, setIsHoldingOriginal] = useState(false);
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Original image source (fallback to converted if original is missing)
  const originalSrc = item.originalPreviewUrl || item.convertedUrl || "";
  const convertedSrc = item.convertedUrl || item.originalPreviewUrl || "";

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        setSliderPosition((p) => Math.max(0, p - 5));
      } else if (e.key === "ArrowRight") {
        setSliderPosition((p) => Math.min(100, p + 5));
      } else if (e.code === "Space" && !e.repeat) {
        setIsHoldingOriginal(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsHoldingOriginal(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
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
    if (item.convertedUrl) {
      downloadFile(item.convertedUrl, `${getBaseFileName(item.name)}.webp`);
    }
  };

  const handleZoomIn = () => setZoom((z) => Math.min(3, z + 0.25));
  const handleZoomOut = () => setZoom((z) => Math.max(0.5, z - 0.25));
  const handleResetZoom = () => setZoom(1);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-sm select-none animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl bg-white dark:bg-[#101522] border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchEnd={handleMouseUp}
      >
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-white dark:bg-[#101522]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-100 truncate" title={item.name}>
                {item.name}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                Inspect image quality and compression comparison
              </p>
            </div>
          </div>

          {/* View Mode Selector Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs">
            <button
              onClick={() => setViewMode("slider")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all ${
                viewMode === "slider"
                  ? "bg-white dark:bg-[#1b2236] text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
              title="Interactive Split Slider"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Split Slider</span>
            </button>

            <button
              onClick={() => setViewMode("side-by-side")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all ${
                viewMode === "side-by-side"
                  ? "bg-white dark:bg-[#1b2236] text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
              title="Side by Side"
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Side by Side</span>
            </button>

            <button
              onClick={() => setViewMode("hold")}
              onMouseDown={() => setIsHoldingOriginal(true)}
              onMouseUp={() => setIsHoldingOriginal(false)}
              onMouseLeave={() => setIsHoldingOriginal(false)}
              onTouchStart={() => setIsHoldingOriginal(true)}
              onTouchEnd={() => setIsHoldingOriginal(false)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all ${
                viewMode === "hold"
                  ? "bg-white dark:bg-[#1b2236] text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
              title="Hold to Peek Original"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Hold to Peek</span>
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {item.convertedUrl && (
              <button
                onClick={handleDownload}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download WebP</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewport Canvas Area */}
        <div className="relative flex-1 min-h-[320px] sm:min-h-[440px] max-h-[560px] bg-slate-950 flex items-center justify-center p-3 sm:p-6 overflow-hidden">
          {/* Zoom Controls Overlay */}
          <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1 bg-black/70 backdrop-blur-md px-2 py-1 rounded-xl border border-white/10 text-white text-xs">
            <button
              onClick={handleZoomOut}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1 text-[11px] font-mono">{Math.round(zoom * 100)}%</span>
            <button
              onClick={handleZoomIn}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            {zoom !== 1 && (
              <button
                onClick={handleResetZoom}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors ml-1 text-slate-300"
                title="Reset Zoom (100%)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* VIEW MODE 1: Split Slider */}
          {viewMode === "slider" && (
            <div
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              className="relative w-full h-full flex items-center justify-center cursor-ew-resize select-none"
            >
              {/* Converted Image (Underneath / Full Width) */}
              <div
                className="relative max-w-full max-h-full flex items-center justify-center transition-transform duration-100"
                style={{ transform: `scale(${zoom})` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={convertedSrc}
                  alt="Converted WebP"
                  className="max-h-[400px] sm:max-h-[480px] w-auto object-contain rounded shadow-lg pointer-events-none"
                  draggable={false}
                />

                {/* Original Image (Clipped overlay on top) */}
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
                    className="w-full h-full object-contain rounded pointer-events-none"
                    draggable={false}
                  />
                </div>

                {/* Divider Bar & Handle */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_rgba(0,0,0,0.8)] z-10 pointer-events-none"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white text-indigo-600 shadow-xl flex items-center justify-center border-2 border-indigo-600 text-xs font-bold pointer-events-auto cursor-grab active:cursor-grabbing">
                    ↔
                  </div>
                </div>
              </div>

              {/* Float Labels */}
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white text-[11px] font-semibold border border-white/10 pointer-events-none z-10">
                Original ({item.originalFormat})
              </div>
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-indigo-600/90 backdrop-blur-md text-white text-[11px] font-semibold border border-indigo-400/30 pointer-events-none z-10">
                WebP Output
              </div>
            </div>
          )}

          {/* VIEW MODE 2: Side by Side */}
          {viewMode === "side-by-side" && (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full h-full items-center justify-center p-2"
              style={{ transform: `scale(${zoom})` }}
            >
              {/* Left: Original */}
              <div className="relative flex flex-col items-center justify-center bg-black/40 rounded-xl p-3 border border-white/10 h-full max-h-[460px]">
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 text-white text-[10px] font-bold z-10">
                  Original ({item.originalFormat})
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={originalSrc}
                  alt="Original"
                  className="max-h-[380px] w-auto object-contain rounded shadow"
                />
                <span className="text-[11px] text-slate-400 mt-2 font-mono">
                  {formatBytes(item.originalSize)} • {item.originalWidth}×{item.originalHeight}px
                </span>
              </div>

              {/* Right: WebP */}
              <div className="relative flex flex-col items-center justify-center bg-black/40 rounded-xl p-3 border border-indigo-500/30 h-full max-h-[460px]">
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-indigo-600 text-white text-[10px] font-bold z-10">
                  WebP Output
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={convertedSrc}
                  alt="Converted WebP"
                  className="max-h-[380px] w-auto object-contain rounded shadow"
                />
                <span className="text-[11px] text-indigo-400 mt-2 font-mono">
                  {item.convertedSize ? formatBytes(item.convertedSize) : "N/A"} •{" "}
                  {item.convertedWidth || item.originalWidth}×{item.convertedHeight || item.originalHeight}px
                </span>
              </div>
            </div>
          )}

          {/* VIEW MODE 3: Hold to Peek */}
          {viewMode === "hold" && (
            <div
              className="relative w-full h-full flex flex-col items-center justify-center select-none"
              onMouseDown={() => setIsHoldingOriginal(true)}
              onMouseUp={() => setIsHoldingOriginal(false)}
              onTouchStart={() => setIsHoldingOriginal(true)}
              onTouchEnd={() => setIsHoldingOriginal(false)}
            >
              <div
                className="relative max-w-full max-h-full flex items-center justify-center transition-transform duration-100"
                style={{ transform: `scale(${zoom})` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={isHoldingOriginal ? originalSrc : convertedSrc}
                  alt="Preview"
                  className="max-h-[420px] w-auto object-contain rounded shadow-lg"
                  draggable={false}
                />
              </div>

              <div className="absolute top-3 inset-x-0 flex justify-center pointer-events-none">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all shadow-md ${
                    isHoldingOriginal
                      ? "bg-amber-500 text-black animate-pulse"
                      : "bg-indigo-600 text-white"
                  }`}
                >
                  {isHoldingOriginal
                    ? `Showing: ORIGINAL (${item.originalFormat})`
                    : "Showing: WEBP (Click & hold or press Space to view original)"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer / Detailed Statistics */}
        <div className="p-3 sm:p-5 bg-slate-50 dark:bg-[#0c101b] border-t border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-2 sm:gap-4 text-center">
          <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white dark:bg-[#13192a] border border-slate-200/80 dark:border-slate-800">
            <span className="text-[10px] sm:text-[11px] font-medium text-slate-400 block uppercase">
              Original Size
            </span>
            <span className="text-xs sm:text-base font-bold text-slate-800 dark:text-slate-200">
              {formatBytes(item.originalSize)}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 block mt-0.5 truncate">
              {item.originalWidth} × {item.originalHeight} px
            </span>
          </div>

          <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white dark:bg-[#13192a] border border-slate-200/80 dark:border-slate-800">
            <span className="text-[10px] sm:text-[11px] font-medium text-slate-400 block uppercase">
              WebP Size
            </span>
            <span className="text-xs sm:text-base font-bold text-indigo-600 dark:text-indigo-400">
              {item.convertedSize ? formatBytes(item.convertedSize) : "N/A"}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 block mt-0.5 truncate">
              {item.convertedWidth || item.originalWidth} × {item.convertedHeight || item.originalHeight} px
            </span>
          </div>

          <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60">
            <span className="text-[10px] sm:text-[11px] font-medium text-emerald-600 dark:text-emerald-400 block uppercase">
              Space Saved
            </span>
            <span className="text-xs sm:text-base font-bold text-emerald-600 dark:text-emerald-300">
              {item.savingsPercentage !== undefined && item.savingsPercentage > 0
                ? `-${item.savingsPercentage}%`
                : "Optimized"}
            </span>
            <span className="text-[10px] sm:text-xs text-emerald-600/80 dark:text-emerald-400/80 block mt-0.5 truncate">
              {item.convertedSize
                ? `${formatBytes(Math.max(0, item.originalSize - item.convertedSize))} saved`
                : ""}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
