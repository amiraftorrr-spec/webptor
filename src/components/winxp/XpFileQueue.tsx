"use client";

import React, { useState } from "react";
import { ImageFileItem } from "@/types";
import { formatBytes, downloadFile, getBaseFileName } from "@/lib/converter";
import { XpIcon } from "./XpIcon";
import { XpButton } from "./XpButton";
import { XpProgressBar } from "./XpProgressBar";
import { xpAudio } from "@/lib/xp-sound";

interface XpFileQueueProps {
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

export function XpFileQueue({
  items,
  isConvertingAll,
  isZipping,
  zipProgress,
  onConvertAll,
  onDownloadAllZip,
  onClearAll,
  onRemoveItem,
  onCompareItem,
}: XpFileQueueProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (items.length === 0) return null;

  const completedItems = items.filter((i) => i.status === "completed" && i.convertedSize !== undefined);
  const totalOriginalSize = items.reduce((acc, curr) => acc + curr.originalSize, 0);
  const totalConvertedSize = completedItems.reduce((acc, curr) => acc + (curr.convertedSize || 0), 0);
  
  const completedOriginalSize = completedItems.reduce((acc, curr) => acc + curr.originalSize, 0);
  const totalSavedBytes = Math.max(0, completedOriginalSize - totalConvertedSize);
  const overallSavingsPercentage =
    completedOriginalSize > 0 ? Math.round((totalSavedBytes / completedOriginalSize) * 100) : 0;

  const pendingCount = items.filter((i) => i.status === "idle" || i.status === "error").length;

  const handleDownloadSingle = (item: ImageFileItem) => {
    xpAudio.playClickSound();
    if (item.convertedUrl) {
      downloadFile(item.convertedUrl, `${getBaseFileName(item.name)}.webp`);
    }
  };

  return (
    <div className="w-full space-y-3 select-none text-[12px] font-sans">
      {/* Batch Overview Groupbox / Header */}
      <div className="xp-groupbox flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-[#ece9d8]">
        {/* Stats */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-[11px]">
          <div>
            <span className="text-gray-600 block text-[10px]">Queue Status</span>
            <span className="font-bold text-black flex items-center gap-1">
              <XpIcon name="my-pictures" size={14} />
              {items.length} {items.length === 1 ? "Image" : "Images"}
            </span>
          </div>

          <div className="h-6 w-[1px] bg-[#c5c1b4] hidden sm:block" />

          <div>
            <span className="text-gray-600 block text-[10px]">Original Total</span>
            <span className="font-semibold text-black">{formatBytes(totalOriginalSize)}</span>
          </div>

          {completedItems.length > 0 && (
            <>
              <div className="h-6 w-[1px] bg-[#c5c1b4] hidden sm:block" />

              <div>
                <span className="text-gray-600 block text-[10px]">WebP Total</span>
                <span className="font-bold text-[#0055ea]">{formatBytes(totalConvertedSize)}</span>
              </div>

              <div className="h-6 w-[1px] bg-[#c5c1b4] hidden sm:block" />

              <div>
                <span className="text-gray-600 block text-[10px]">Space Saved</span>
                <span className="font-bold text-[#1b7a24] bg-[#e6f4ea] px-1.5 py-0.5 rounded border border-[#b7dfbe]">
                  -{overallSavingsPercentage}% ({formatBytes(totalSavedBytes)})
                </span>
              </div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-end">
          {pendingCount > 0 && (
            <XpButton
              onClick={onConvertAll}
              disabled={isConvertingAll}
              variant="primary"
              className="px-3 py-1 text-xs"
            >
              <span>{isConvertingAll ? "Converting..." : `Convert All (${pendingCount})`}</span>
            </XpButton>
          )}

          {completedItems.length > 0 && (
            <XpButton
              onClick={onDownloadAllZip}
              disabled={isZipping}
              variant="default"
              className="px-3 py-1 text-xs flex items-center gap-1.5"
            >
              <XpIcon name="zip" size={14} />
              <span>{isZipping ? `Archiving (${zipProgress}%)...` : "Save All (.ZIP)"}</span>
            </XpButton>
          )}

          <XpButton
            onClick={onClearAll}
            disabled={isConvertingAll || isZipping}
            className="px-2.5 py-1 text-xs text-gray-700"
          >
            Clear List
          </XpButton>
        </div>
      </div>

      {/* Details View List Table */}
      <div className="xp-inset-box bg-white overflow-x-auto min-h-[160px] max-h-[480px] overflow-y-auto">
        <table className="w-full text-left border-collapse text-[11px]">
          {/* Table Headers */}
          <thead>
            <tr className="bg-gradient-to-b from-[#f0ede0] to-[#e0dcd0] border-b border-[#7f9db9] sticky top-0 z-10 select-none shadow-xs">
              <th className="p-1.5 border-r border-[#bbb] font-normal text-[#222] min-w-[180px]">
                Name
              </th>
              <th className="p-1.5 border-r border-[#bbb] font-normal text-[#222] min-w-[70px]">
                Type
              </th>
              <th className="p-1.5 border-r border-[#bbb] font-normal text-[#222] min-w-[85px]">
                Original Size
              </th>
              <th className="p-1.5 border-r border-[#bbb] font-normal text-[#222] min-w-[85px]">
                WebP Size
              </th>
              <th className="p-1.5 border-r border-[#bbb] font-normal text-[#222] min-w-[80px]">
                Savings
              </th>
              <th className="p-1.5 border-r border-[#bbb] font-normal text-[#222] min-w-[120px]">
                Status / Progress
              </th>
              <th className="p-1.5 font-normal text-[#222] text-right min-w-[140px]">
                Actions
              </th>
            </tr>
          </thead>

          {/* Table Rows */}
          <tbody>
            {items.map((item) => {
              const isSelected = selectedId === item.id;
              return (
                <tr
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`border-b border-[#f0f0f0] cursor-pointer transition-none ${
                    isSelected ? "bg-[#316ac5] text-white" : "hover:bg-[#eef4fd] text-black"
                  }`}
                >
                  {/* Name + Thumbnail */}
                  <td className="p-1.5 flex items-center gap-2 font-medium">
                    <div className="w-7 h-7 rounded-[2px] border border-[#7f9db9] bg-white overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.convertedUrl || item.originalPreviewUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="truncate max-w-[180px] sm:max-w-[220px]" title={item.name}>
                      {item.name}
                    </span>
                  </td>

                  {/* Format */}
                  <td className="p-1.5 font-mono uppercase text-[10px]">
                    {item.originalFormat}
                  </td>

                  {/* Original Size */}
                  <td className="p-1.5">{formatBytes(item.originalSize)}</td>

                  {/* WebP Size */}
                  <td className="p-1.5">
                    {item.status === "completed" && item.convertedSize !== undefined ? (
                      <div className="flex items-center gap-1.5">
                        <strong className={isSelected ? "text-white" : "text-[#0055ea]"}>
                          {formatBytes(item.convertedSize)}
                        </strong>
                        {item.conversionTimeMs !== undefined && (
                          <span className={`text-[9px] ${isSelected ? "text-blue-100" : "text-gray-400"}`}>
                            ({item.conversionTimeMs}ms)
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>

                  {/* Savings % */}
                  <td className="p-1.5">
                    {item.status === "completed" && item.savingsPercentage !== undefined ? (
                      <span
                        className={`font-bold ${
                          isSelected
                            ? "text-[#a6ffb2]"
                            : item.savingsPercentage > 0
                            ? "text-[#1b7a24]"
                            : "text-gray-500"
                        }`}
                      >
                        {item.savingsPercentage > 0 ? `-${item.savingsPercentage}%` : "0%"}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>

                  {/* Status / Progress */}
                  <td className="p-1.5">
                    {item.status === "converting" && (
                      <XpProgressBar progress={item.progress} showPercent />
                    )}
                    {item.status === "completed" && (
                      <span className={`flex items-center gap-1 font-semibold ${isSelected ? "text-white" : "text-[#1b7a24]"}`}>
                        <span>✓</span> Complete
                      </span>
                    )}
                    {item.status === "idle" && (
                      <span className={isSelected ? "text-gray-200" : "text-gray-500"}>Ready</span>
                    )}
                    {item.status === "error" && (
                      <span className="text-[#d8000c] font-bold">Error</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="p-1.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {item.status === "completed" && (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              xpAudio.playClickSound();
                              onCompareItem(item);
                            }}
                            className="xp-btn text-[10px] py-0.5 px-1.5"
                            title="Compare in Windows Picture Viewer"
                          >
                            Compare
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadSingle(item);
                            }}
                            className="xp-btn xp-btn-primary font-bold text-[10px] py-0.5 px-1.5"
                            title="Download WebP"
                          >
                            Save
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          xpAudio.playClickSound();
                          onRemoveItem(item.id);
                        }}
                        className="xp-btn text-[10px] py-0.5 px-1.5 text-red-600 hover:text-red-800"
                        title="Remove from queue"
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
