"use client";

import { useState, useRef, useEffect, DragEvent, ChangeEvent } from "react";
import { UploadCloud, Image as ImageIcon, Sparkles, FolderUp, CheckCircle2 } from "lucide-react";

interface DropzoneProps {
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
  "ALL FORMATS",
];

export function Dropzone({ onFilesSelected, disabled = false }: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Global paste listener for pasting images from clipboard (e.g. Snipping tool, screenshots)
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
      onFilesSelected(droppedFiles);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      onFilesSelected(selectedFiles);
      // Reset input value so same files can be re-selected if removed
      e.target.value = "";
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !disabled && fileInputRef.current?.click()}
      className={`relative group rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden ${
        isDragging
          ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 scale-[1.01] shadow-xl shadow-indigo-500/10"
          : "border-slate-300 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 bg-white/70 dark:bg-[#101522]/70 hover:bg-slate-50/80 dark:hover:bg-[#13192a]/80 shadow-sm"
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

      <div className="px-6 py-12 sm:py-16 flex flex-col items-center justify-center text-center">
        {/* Glowing animated icon container */}
        <div
          className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 ${
            isDragging
              ? "scale-110 bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 animate-bounce"
              : "bg-gradient-to-tr from-indigo-500/10 to-cyan-500/10 dark:from-indigo-500/20 dark:to-cyan-500/20 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 border border-indigo-200/50 dark:border-indigo-800/40"
          }`}
        >
          <UploadCloud className="w-8 h-8 sm:w-10 sm:h-10" />
        </div>

        {/* Action Title */}
        <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          {isDragging ? "Drop your images here" : "Drag & drop your images here"}
        </h3>

        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">
          Drop any image files, paste from clipboard (<kbd className="px-1.5 py-0.5 text-xs bg-slate-100 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700 font-mono">Ctrl+V</kbd>), or browse from your computer.
        </p>

        {/* Browse Button */}
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-md shadow-indigo-600/25 transition-all group-hover:shadow-lg group-hover:shadow-indigo-600/30">
          <FolderUp className="w-4 h-4" />
          <span>Browse Files</span>
        </div>

        {/* Supported formats list */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80 w-full max-w-xl">
          <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5">
            Supported Formats
          </div>
          <div className="flex flex-wrap justify-center gap-1.5">
            {SUPPORTED_FORMATS.map((fmt) => (
              <span
                key={fmt}
                className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-800"
              >
                .{fmt.toLowerCase()}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
