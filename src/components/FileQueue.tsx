"use client";

import { useState } from "react";
import { Download, Play, Trash2, CheckCircle2, Sparkles, FolderArchive, Layers, ArrowDown } from "lucide-react";
import { ImageFileItem, BatchStats } from "@/types";
import { FileCard } from "./FileCard";
import { formatBytes } from "@/lib/converter";

interface FileQueueProps {
  items: ImageFileItem[];
  isConvertingAll: boolean;
  isZipping: boolean;
  zipProgress: number;
  onConvertAll: () => void;
  onDownloadAllZip: () => void;
  onClearAll: () => void;
  onRemoveItem: (id: string) => void;
  onCompareItem: (item: ImageFileItem) => void;
}

export function FileQueue({
  items,
  isConvertingAll,
  isZipping,
  zipProgress,
  onConvertAll,
  onDownloadAllZip,
  onClearAll,
  onRemoveItem,
  onCompareItem,
}: FileQueueProps) {
  if (items.length === 0) return null;

  // Calculate Batch Stats
  const completedItems = items.filter((i) => i.status === "completed" && i.convertedSize !== undefined);
  const totalOriginalSize = items.reduce((acc, curr) => acc + curr.originalSize, 0);
  const totalConvertedSize = completedItems.reduce((acc, curr) => acc + (curr.convertedSize || 0), 0);
  
  // Calculate savings on completed items
  const completedOriginalSize = completedItems.reduce((acc, curr) => acc + curr.originalSize, 0);
  const totalSavedBytes = Math.max(0, completedOriginalSize - totalConvertedSize);
  const overallSavingsPercentage =
    completedOriginalSize > 0 ? Math.round((totalSavedBytes / completedOriginalSize) * 100) : 0;

  const pendingCount = items.filter((i) => i.status === "idle" || i.status === "error").length;
  const isAllCompleted = completedItems.length === items.length && items.length > 0;

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-300">
      {/* Batch Overview & Actions Card */}
      <div className="bg-white dark:bg-[#101522] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Summary Stats */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div>
              <span className="text-xs text-slate-400 font-medium block">Queue</span>
              <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100 text-base">
                <Layers className="w-4 h-4 text-indigo-500" />
                <span>{items.length} {items.length === 1 ? "Image" : "Images"}</span>
              </div>
            </div>

            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

            <div>
              <span className="text-xs text-slate-400 font-medium block">Original Total</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
                {formatBytes(totalOriginalSize)}
              </span>
            </div>

            {completedItems.length > 0 && (
              <>
                <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

                <div>
                  <span className="text-xs text-slate-400 font-medium block">WebP Total</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                    {formatBytes(totalConvertedSize)}
                  </span>
                </div>

                <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

                <div>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium block">Total Saved</span>
                  <span className="inline-flex items-center gap-1 font-extrabold text-emerald-600 dark:text-emerald-400 text-sm bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200/50 dark:border-emerald-800/50">
                    <ArrowDown className="w-3 h-3" />
                    {overallSavingsPercentage}% ({formatBytes(totalSavedBytes)})
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 w-full lg:w-auto justify-end flex-wrap">
            {/* Convert All Button */}
            {pendingCount > 0 && (
              <button
                type="button"
                onClick={onConvertAll}
                disabled={isConvertingAll}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
              >
                <Play className={`w-4 h-4 ${isConvertingAll ? "animate-spin" : "fill-white"}`} />
                <span>{isConvertingAll ? "Converting..." : `Convert All (${pendingCount})`}</span>
              </button>
            )}

            {/* Download All ZIP */}
            {completedItems.length > 0 && (
              <button
                type="button"
                onClick={onDownloadAllZip}
                disabled={isZipping}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
              >
                <FolderArchive className="w-4 h-4" />
                <span>{isZipping ? `Creating ZIP (${zipProgress}%)...` : `Download All (.ZIP)`}</span>
              </button>
            )}

            {/* Clear All */}
            <button
              type="button"
              onClick={onClearAll}
              disabled={isConvertingAll || isZipping}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-800 transition-colors text-xs font-medium"
              title="Clear all images"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Clear All</span>
            </button>
          </div>
        </div>
      </div>

      {/* List of Files */}
      <div className="space-y-2.5">
        {items.map((item) => (
          <FileCard
            key={item.id}
            item={item}
            onRemove={onRemoveItem}
            onCompare={onCompareItem}
          />
        ))}
      </div>
    </div>
  );
}
