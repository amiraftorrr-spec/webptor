"use client";

import { useState, useRef, useEffect, MouseEvent, TouchEvent } from "react";
import { X, Download, ArrowRight, Sparkles, Image as ImageIcon } from "lucide-react";
import { ImageFileItem } from "@/types";
import { formatBytes, downloadFile, getBaseFileName } from "@/lib/converter";

interface ComparisonModalProps {
  item: ImageFileItem;
  onClose: () => void;
}

export function ComparisonModal({ item, onClose }: ComparisonModalProps) {
  const [sliderPosition, setSliderPosition] = useState(50); // percentage 0 - 100
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
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
    if (item.convertedUrl) {
      downloadFile(item.convertedUrl, `${getBaseFileName(item.name)}.webp`);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-white dark:bg-[#101522] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-800 dark:text-slate-100 truncate max-w-md">
                {item.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Slide back and forth to inspect visual fidelity
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {item.convertedUrl && (
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download WebP</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Comparison Image Container */}
        <div className="relative flex-1 min-h-[300px] sm:min-h-[420px] bg-slate-950/90 overflow-hidden flex items-center justify-center select-none">
          <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            className="relative w-full h-full max-h-[500px] flex items-center justify-center cursor-ew-resize"
          >
            {/* Background WebP Image (Right / Base) */}
            <div className="absolute inset-0 flex items-center justify-center p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.convertedUrl || item.originalPreviewUrl}
                alt="Converted WebP"
                className="max-h-full max-w-full object-contain pointer-events-none"
              />
            </div>

            {/* Foreground Original Image (Left / Clipped) */}
            <div
              className="absolute inset-0 flex items-center justify-center p-4 overflow-hidden pointer-events-none"
              style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
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
              className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg pointer-events-auto"
              style={{ left: `${sliderPosition}%` }}
              onMouseDown={handleMouseDown}
              onTouchStart={handleMouseDown}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white text-indigo-600 shadow-xl flex items-center justify-center border-2 border-indigo-500 cursor-grab active:cursor-grabbing text-xs font-bold select-none">
                ↔
              </div>
            </div>

            {/* Labels overlay */}
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold border border-white/10 pointer-events-none">
              Original ({item.originalFormat})
            </div>
            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-indigo-600/80 backdrop-blur-md text-white text-[11px] font-semibold border border-indigo-400/20 pointer-events-none">
              WebP Output
            </div>
          </div>
        </div>

        {/* Modal Footer / Detailed Statistics */}
        <div className="p-4 sm:p-6 bg-slate-50 dark:bg-[#0c101b] border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-3 rounded-2xl bg-white dark:bg-[#13192a] border border-slate-200/80 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 block uppercase">Original Size</span>
            <span className="text-base font-bold text-slate-800 dark:text-slate-200">
              {formatBytes(item.originalSize)}
            </span>
            <span className="text-xs text-slate-400 block mt-0.5">
              {item.originalWidth} × {item.originalHeight} px
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-white dark:bg-[#13192a] border border-slate-200/80 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 block uppercase">WebP Size</span>
            <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">
              {item.convertedSize ? formatBytes(item.convertedSize) : "N/A"}
            </span>
            <span className="text-xs text-slate-400 block mt-0.5">
              {item.convertedWidth || item.originalWidth} × {item.convertedHeight || item.originalHeight} px
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60">
            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 block uppercase">Space Saved</span>
            <span className="text-base font-bold text-emerald-600 dark:text-emerald-300">
              {item.savingsPercentage !== undefined && item.savingsPercentage > 0
                ? `-${item.savingsPercentage}% Reduction`
                : "Optimized"}
            </span>
            <span className="text-xs text-emerald-600/80 dark:text-emerald-400/80 block mt-0.5">
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
