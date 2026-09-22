"use client";

import { useState } from "react";
import { Download, Trash2, SplitSquareVertical, AlertCircle, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { ImageFileItem } from "@/types";
import { formatBytes, downloadFile, getBaseFileName } from "@/lib/converter";

interface FileCardProps {
  item: ImageFileItem;
  onRemove: (id: string) => void;
  onCompare: (item: ImageFileItem) => void;
}

export function FileCard({ item, onRemove, onCompare }: FileCardProps) {
  const handleDownload = () => {
    if (item.convertedUrl) {
      downloadFile(item.convertedUrl, `${getBaseFileName(item.name)}.webp`);
    }
  };

  return (
    <div className="relative group bg-white dark:bg-[#101522] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center gap-3.5 sm:gap-4">
        {/* Image Thumbnail */}
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden flex-shrink-0 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.convertedUrl || item.originalPreviewUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0.5 right-0.5 px-1 py-0.2 rounded text-[9px] font-bold bg-black/70 text-white backdrop-blur-sm uppercase">
            {item.originalFormat}
          </div>
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate" title={item.name}>
              {item.name}
            </h4>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
            <span>Original: <strong className="text-slate-700 dark:text-slate-300">{formatBytes(item.originalSize)}</strong></span>
            
            {item.status === "completed" && item.convertedSize !== undefined && (
              <>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span>WebP: <strong className="text-indigo-600 dark:text-indigo-400">{formatBytes(item.convertedSize)}</strong></span>
                
                {item.savingsPercentage !== undefined && (
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[11px] font-bold ${
                      item.savingsPercentage > 0
                        ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {item.savingsPercentage > 0 ? `-${item.savingsPercentage}%` : "0%"}
                  </span>
                )}

                {item.conversionTimeMs !== undefined && (
                  <span className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60">
                    ⚡ {item.conversionTimeMs}ms
                  </span>
                )}
              </>
            )}

            {item.status === "error" && (
              <span className="inline-flex items-center gap-1 text-rose-500 font-medium text-xs">
                <AlertCircle className="w-3.5 h-3.5" />
                {item.errorMessage || "Conversion failed"}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {item.status === "converting" && (
            <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="hidden sm:inline">Processing...</span>
            </div>
          )}

          {item.status === "completed" && (
            <>
              {/* Compare Button */}
              <button
                onClick={() => onCompare(item)}
                className="p-2 sm:px-3 sm:py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 transition-all text-xs font-medium flex items-center gap-1.5"
                title="Compare with Original"
              >
                <SplitSquareVertical className="w-4 h-4" />
                <span className="hidden md:inline">Compare</span>
              </button>

              {/* Download Button */}
              <button
                onClick={handleDownload}
                className="p-2 sm:px-3.5 sm:py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-sm shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all flex items-center gap-1.5"
                title="Download WebP"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download</span>
              </button>
            </>
          )}

          {/* Remove Button */}
          <button
            onClick={() => onRemove(item.id)}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            aria-label="Remove item"
            title="Remove item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {item.status === "converting" && (
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${item.progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
