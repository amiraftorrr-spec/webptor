"use client";

import { useState, useCallback, useRef } from "react";
import { Header } from "@/components/Header";
import { Dropzone } from "@/components/Dropzone";
import { ConversionSettings } from "@/components/ConversionSettings";
import { FileQueue } from "@/components/FileQueue";
import { ComparisonModal } from "@/components/ComparisonModal";
import { Footer } from "@/components/Footer";
import { ImageFileItem, ConversionOptions } from "@/types";
import { convertImageToWebP, getFileExtension, loadImageElement, runWithConcurrency } from "@/lib/converter";
import { downloadAllAsZip } from "@/lib/zip";
import { triggerSuccessConfetti } from "@/lib/confetti";
import { useTheme } from "@/context/ThemeContext";

// Windows XP Components
import { BlissBackground } from "@/components/winxp/BlissBackground";
import { XpDesktopIcons } from "@/components/winxp/XpDesktopIcons";
import { XpTaskbar } from "@/components/winxp/XpTaskbar";
import { XpMenuBar } from "@/components/winxp/XpMenuBar";
import { XpConversionSettings } from "@/components/winxp/XpConversionSettings";
import { XpDropzone } from "@/components/winxp/XpDropzone";
import { XpFileQueue } from "@/components/winxp/XpFileQueue";
import { XpComparisonViewer } from "@/components/winxp/XpComparisonViewer";
import { XpAboutModal } from "@/components/winxp/XpAboutModal";
import { XpIcon } from "@/components/winxp/XpIcon";
import { xpAudio } from "@/lib/xp-sound";

export default function Home() {
  const { isXpMode, toggleXpMode } = useTheme();

  const [items, setItems] = useState<ImageFileItem[]>([]);
  const [options, setOptions] = useState<ConversionOptions>({
    quality: 80,
    scale: 1.0,
    maintainAspectRatio: true,
    stripMetadata: true,
  });
  const [autoConvert, setAutoConvert] = useState<boolean>(true);
  const [isConvertingAll, setIsConvertingAll] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [zipProgress, setZipProgress] = useState<number>(0);
  const [comparingItem, setComparingItem] = useState<ImageFileItem | null>(null);
  const [aboutModalOpen, setAboutModalOpen] = useState<boolean>(false);
  const [isMaximized, setIsMaximized] = useState<boolean>(false);

  const resultsRef = useRef<HTMLDivElement>(null);
  const xpFileInputRef = useRef<HTMLInputElement>(null);

  const scrollToResults = useCallback(() => {
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 150);
  }, []);

  // Convert a single item
  const processConversion = useCallback(
    async (item: ImageFileItem, customOptions = options): Promise<ImageFileItem> => {
      try {
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, status: "converting", progress: 10 } : i))
        );

        const result = await convertImageToWebP(item.file, customOptions, (progress) => {
          setItems((prev) =>
            prev.map((i) => (i.id === item.id ? { ...i, progress } : i))
          );
        });

        const updatedItem: ImageFileItem = {
          ...item,
          status: "completed",
          progress: 100,
          convertedBlob: result.blob,
          convertedUrl: result.url,
          convertedSize: result.size,
          convertedWidth: result.width,
          convertedHeight: result.height,
          savingsPercentage: result.savingsPercentage,
          conversionTimeMs: result.conversionTimeMs,
          errorMessage: undefined,
        };

        setItems((prev) => prev.map((i) => (i.id === item.id ? updatedItem : i)));
        return updatedItem;
      } catch (err: any) {
        xpAudio.playErrorSound();
        const errorItem: ImageFileItem = {
          ...item,
          status: "error",
          progress: 0,
          errorMessage: err?.message || "Conversion failed",
        };
        setItems((prev) => prev.map((i) => (i.id === item.id ? errorItem : i)));
        return errorItem;
      }
    },
    [options]
  );

  // Add new files from dropzone or paste
  const handleFilesSelected = useCallback(
    async (newFiles: File[]) => {
      const newItems: ImageFileItem[] = [];

      for (const file of newFiles) {
        const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const previewUrl = URL.createObjectURL(file);

        let width = 0;
        let height = 0;

        try {
          const loaded = await loadImageElement(file);
          width = loaded.width;
          height = loaded.height;
        } catch {
          // If dimension loading fails, default to 0
        }

        const item: ImageFileItem = {
          id,
          file,
          name: file.name,
          originalFormat: getFileExtension(file.name),
          originalSize: file.size,
          originalWidth: width,
          originalHeight: height,
          originalPreviewUrl: previewUrl,
          status: "idle",
          progress: 0,
        };

        newItems.push(item);
      }

      setItems((prev) => [...newItems, ...prev]);

      // If auto-convert is enabled, process them with bounded concurrency
      if (autoConvert && newItems.length > 0) {
        const concurrency = typeof navigator !== "undefined" ? Math.max(2, Math.min(8, navigator.hardwareConcurrency || 4)) : 4;
        const results = await runWithConcurrency(newItems, concurrency, (item) =>
          processConversion(item, options)
        );
        const hasSuccess = results.some((r) => r.status === "completed");
        if (hasSuccess) {
          triggerSuccessConfetti();
          scrollToResults();
        }
      } else if (newItems.length > 0) {
        scrollToResults();
      }
    },
    [autoConvert, options, processConversion, scrollToResults]
  );

  // Convert all pending or error items
  const handleConvertAll = async () => {
    setIsConvertingAll(true);
    const pendingItems = items.filter((i) => i.status !== "completed");
    
    try {
      const concurrency = typeof navigator !== "undefined" ? Math.max(2, Math.min(8, navigator.hardwareConcurrency || 4)) : 4;
      const results = await runWithConcurrency(pendingItems, concurrency, (item) =>
        processConversion(item, options)
      );
      const hasSuccess = results.some((r) => r.status === "completed");
      if (hasSuccess) {
        triggerSuccessConfetti();
        scrollToResults();
      }
    } finally {
      setIsConvertingAll(false);
    }
  };

  // Download All as ZIP
  const handleDownloadAllZip = async () => {
    setIsZipping(true);
    setZipProgress(0);
    try {
      await downloadAllAsZip(items, "webp-converted-images.zip", (percent) => {
        setZipProgress(percent);
      });
    } catch (err: any) {
      alert(err.message || "Failed to create ZIP archive.");
    } finally {
      setIsZipping(false);
      setZipProgress(0);
    }
  };

  // Remove single item
  const handleRemoveItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target?.originalPreviewUrl) {
        URL.revokeObjectURL(target.originalPreviewUrl);
      }
      if (target?.convertedUrl) {
        URL.revokeObjectURL(target.convertedUrl);
      }
      return prev.filter((i) => i.id !== id);
    });
  };

  // Clear all items
  const handleClearAll = () => {
    items.forEach((item) => {
      if (item.originalPreviewUrl) URL.revokeObjectURL(item.originalPreviewUrl);
      if (item.convertedUrl) URL.revokeObjectURL(item.convertedUrl);
    });
    setItems([]);
  };

  const completedCount = items.filter((i) => i.status === "completed").length;

  // Trigger hidden file picker in XP mode
  const openXpFolderPicker = () => {
    xpFileInputRef.current?.click();
  };

  const handleXpFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesSelected(Array.from(e.target.files));
      e.target.value = "";
    }
  };

  // ==========================================
  // Render Windows XP Mode
  // ==========================================
  if (isXpMode) {
    return (
      <div className="relative min-h-screen w-full select-none overflow-x-hidden pb-12">
        {/* Hidden File Input for XP Actions */}
        <input
          ref={xpFileInputRef}
          type="file"
          multiple
          accept="image/*,.*"
          onChange={handleXpFileInputChange}
          className="hidden"
        />

        {/* Bliss Wallpaper Background */}
        <BlissBackground />

        {/* XP Desktop Icons */}
        <XpDesktopIcons
          onOpenMyPictures={openXpFolderPicker}
          onClearQueue={handleClearAll}
          onOpenAbout={() => setAboutModalOpen(true)}
          queueCount={items.length}
        />

        {/* Main Application Window */}
        <div className="relative z-10 p-2 sm:p-6 lg:p-10 max-w-7xl mx-auto flex justify-center">
          <div
            className={`w-full bg-[#ece9d8] border-2 border-[#0055ea] rounded-t-lg shadow-2xl transition-all duration-200 overflow-hidden flex flex-col ${
              isMaximized ? "max-w-full" : "max-w-4xl"
            }`}
          >
            {/* Windows Luna Titlebar */}
            <div className="xp-titlebar flex items-center justify-between px-2 py-1 select-none">
              <div className="flex items-center gap-2">
                <XpIcon name="webptor" size={18} />
                <span className="text-white font-bold text-xs tracking-wide text-shadow-xp truncate">
                  webptor - Instant Image to WebP Converter v1.0
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
                  title={isMaximized ? "Restore Window" : "Maximize Window"}
                  onClick={() => {
                    xpAudio.playClickSound();
                    setIsMaximized((prev) => !prev);
                  }}
                >
                  □
                </button>
                <button
                  type="button"
                  className="xp-win-btn xp-win-btn-close"
                  title="Close / Exit XP Mode"
                  onClick={() => {
                    xpAudio.playClickSound();
                    toggleXpMode();
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Menu Bar & Navigation Bar */}
            <XpMenuBar
              onOpenFilePicker={openXpFolderPicker}
              onConvertAll={handleConvertAll}
              onDownloadZip={handleDownloadAllZip}
              onClearAll={handleClearAll}
              onOpenAbout={() => setAboutModalOpen(true)}
              onToggleModern={toggleXpMode}
              hasItems={items.length > 0}
              hasCompleted={completedCount > 0}
            />

            {/* Window Content Workspace */}
            <div className="p-3 sm:p-5 space-y-4 bg-[#ece9d8]">
              {/* Image Conversion Settings */}
              <XpConversionSettings
                options={options}
                onChange={setOptions}
                autoConvert={autoConvert}
                onAutoConvertChange={setAutoConvert}
                disabled={isConvertingAll}
              />

              {/* Dropzone */}
              <XpDropzone
                onFilesSelected={handleFilesSelected}
                disabled={isConvertingAll}
              />

              {/* Queue List */}
              <div ref={resultsRef}>
                <XpFileQueue
                  items={items}
                  isConvertingAll={isConvertingAll}
                  isZipping={isZipping}
                  zipProgress={zipProgress}
                  onConvertAll={handleConvertAll}
                  onDownloadAllZip={handleDownloadAllZip}
                  onClearAll={handleClearAll}
                  onRemoveItem={handleRemoveItem}
                  onCompareItem={setComparingItem}
                />
              </div>
            </div>

            {/* Window Status Bar */}
            <div className="bg-[#ece9d8] border-t border-[#d4d0c8] px-3 py-1 text-[11px] font-sans flex items-center justify-between text-gray-700 select-none">
              <div className="flex items-center gap-2 truncate">
                <span>
                  {items.length === 0
                    ? "Ready"
                    : isConvertingAll
                    ? "Converting images..."
                    : `${items.length} item(s) in queue (${completedCount} completed)`}
                </span>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 text-gray-500 text-[10px]">
                <span>100% Client-side</span>
                <span>|</span>
                <span className="flex items-center gap-1">
                  <span>🔒</span> Local Intranet
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* XP Taskbar */}
        <XpTaskbar
          onOpenFilePicker={openXpFolderPicker}
          onOpenAbout={() => setAboutModalOpen(true)}
          onToggleModern={toggleXpMode}
          queueCount={items.length}
        />

        {/* Windows Picture and Fax Viewer Modal (Comparison) */}
        {comparingItem && (
          <XpComparisonViewer
            item={comparingItem}
            onClose={() => setComparingItem(null)}
          />
        )}

        {/* System Properties / About Modal */}
        {aboutModalOpen && (
          <XpAboutModal onClose={() => setAboutModalOpen(false)} />
        )}
      </div>
    );
  }

  // ==========================================
  // Render Modern Mode (Default)
  // ==========================================
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-[#090d16] bg-grid-pattern">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Convert Any Image to{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-400 bg-clip-text text-transparent">
              WebP
            </span>
          </h1>

          <p className="text-sm text-slate-600 dark:text-slate-400">
            Upload any image format and convert it to lightweight WebP in seconds.
          </p>
        </div>

        {/* Conversion Settings Control Bar */}
        <ConversionSettings
          options={options}
          onChange={setOptions}
          autoConvert={autoConvert}
          onAutoConvertChange={setAutoConvert}
          disabled={isConvertingAll}
        />

        {/* Main Dropzone Area */}
        <Dropzone onFilesSelected={handleFilesSelected} disabled={isConvertingAll} />

        {/* Uploaded / Converted File Queue */}
        <div ref={resultsRef} className="scroll-mt-6">
          <FileQueue
            items={items}
            isConvertingAll={isConvertingAll}
            isZipping={isZipping}
            zipProgress={zipProgress}
            onConvertAll={handleConvertAll}
            onDownloadAllZip={handleDownloadAllZip}
            onClearAll={handleClearAll}
            onRemoveItem={handleRemoveItem}
            onCompareItem={setComparingItem}
          />
        </div>
      </main>

      {/* Comparison Modal */}
      {comparingItem && (
        <ComparisonModal
          item={comparingItem}
          onClose={() => setComparingItem(null)}
        />
      )}

      <Footer />
    </div>
  );
}

