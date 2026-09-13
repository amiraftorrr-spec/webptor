"use client";

import { useState, useCallback, useRef } from "react";
import { Header } from "@/components/Header";
import { Dropzone } from "@/components/Dropzone";
import { ConversionSettings } from "@/components/ConversionSettings";
import { FileQueue } from "@/components/FileQueue";
import { ComparisonModal } from "@/components/ComparisonModal";
import { Footer } from "@/components/Footer";
import { ImageFileItem, ConversionOptions } from "@/types";
import { convertImageToWebP, getFileExtension, loadImageElement } from "@/lib/converter";
import { downloadAllAsZip } from "@/lib/zip";
import { triggerSuccessConfetti } from "@/lib/confetti";

export default function Home() {
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

  const resultsRef = useRef<HTMLDivElement>(null);

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
          errorMessage: undefined,
        };

        setItems((prev) => prev.map((i) => (i.id === item.id ? updatedItem : i)));
        return updatedItem;
      } catch (err: any) {
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

      // If auto-convert is enabled, process them immediately
      if (autoConvert && newItems.length > 0) {
        // Convert newly added items in parallel (bounded concurrency)
        const promises = newItems.map((item) => processConversion(item, options));
        const results = await Promise.all(promises);
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
      const promises = pendingItems.map((item) => processConversion(item, options));
      const results = await Promise.all(promises);
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
