"use client";

import React, { useState, useRef, useEffect, DragEvent, ChangeEvent } from "react";
import { XpIcon } from "./XpIcon";
import { XpButton } from "./XpButton";
import { xpAudio } from "@/lib/xp-sound";

interface XpDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

const SUPPORTED_FORMATS = [
  "PNG",
  "JPG",
  "JPEG",
  "WEBP",
  "GIF",
  "SVG",
  "BMP",
  "AVIF",
  "HEIC",
  "TIFF",
  "ICO",
];

export function XpDropzone({ onFilesSelected, disabled = false }: XpDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clipboard paste listener
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (disabled) return;
      const items = e.clipboardData?.items;
      if (!items) return;

      const imageFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/") || items[i].kind === "file") {
          const file = items[i].getAsFile();
          if (file) {
            imageFiles.push(file);
          }
        }
      }

      if (imageFiles.length > 0) {
        xpAudio.playClickSound();
        onFilesSelected(imageFiles);
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [disabled, onFilesSelected]);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      xpAudio.playClickSound();
      onFilesSelected(droppedFiles);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      xpAudio.playClickSound();
      onFilesSelected(selectedFiles);
      e.target.value = "";
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`xp-inset-box bg-white p-4 sm:p-6 select-none transition-colors ${
        isDragging ? "bg-[#e8f1ff] border-2 border-dashed border-[#0055ea]" : ""
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.*"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      <div className="flex flex-col items-center justify-center text-center py-4 sm:py-6">
        {/* Animated XP Folder / Picture icon */}
        <div
          onClick={() => !disabled && fileInputRef.current?.click()}
          className="cursor-pointer mb-3 transform hover:scale-105 transition-transform"
        >
          <XpIcon name="my-pictures" size={56} />
        </div>

        <h3 className="font-bold text-sm sm:text-base text-black mb-1">
          {isDragging ? "Drop Images to Convert Immediately" : "Drag and Drop Your Pictures Here"}
        </h3>

        <p className="text-[11px] text-gray-600 max-w-md mb-4">
          Drop files from your computer, paste from clipboard (<kbd className="px-1 py-0.5 bg-[#ece9d8] border border-[#7f9db9] rounded text-[10px] font-mono">Ctrl+V</kbd>), or click Browse.
        </p>

        <div className="flex items-center gap-2">
          <XpButton
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            variant="primary"
            className="flex items-center gap-2 px-4 py-1.5 text-xs font-bold"
          >
            <XpIcon name="folder" size={16} />
            <span>Browse Computer...</span>
          </XpButton>
        </div>

        {/* Supported Formats strip */}
        <div className="mt-4 pt-3 border-t border-[#e2dfd2] w-full max-w-lg flex flex-wrap items-center justify-center gap-1.5 text-[10px] text-gray-600">
          <span className="font-bold text-[#00138c]">Supported:</span>
          {SUPPORTED_FORMATS.map((fmt) => (
            <span
              key={fmt}
              className="px-1.5 py-0.5 bg-[#ece9d8] border border-[#d4d0c8] rounded-[2px] font-mono text-[10px]"
            >
              {fmt}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
