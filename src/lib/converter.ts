import { ConversionOptions } from "@/types";

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  if (parts.length > 1) {
    return parts.pop()?.toUpperCase() || "IMG";
  }
  return "IMG";
}

export function getBaseFileName(filename: string): string {
  const lastDotIndex = filename.lastIndexOf(".");
  if (lastDotIndex === -1) return filename;
  return filename.substring(0, lastDotIndex);
}

/**
 * Checks if a file is HEIC/HEIF
 */
export function isHeicFile(file: File | Blob, filename = ""): boolean {
  const isHeicType = file.type === "image/heic" || file.type === "image/heif";
  const isHeicExt = /\.(heic|heif)$/i.test(filename || (file instanceof File ? file.name : ""));
  return isHeicType || isHeicExt;
}

/**
 * Checks if a file is an SVG vector
 */
export function isSvgFile(file: File | Blob, filename = ""): boolean {
  return (
    file.type === "image/svg+xml" ||
    /\.svg$/i.test(filename || (file instanceof File ? file.name : ""))
  );
}

/**
 * Preprocesses any file to a standard browser-readable Blob
 */
export async function preprocessImageFile(file: File): Promise<Blob> {
  if (isHeicFile(file, file.name)) {
    try {
      const heic2anyModule = await import("heic2any");
      const heic2any = heic2anyModule.default || heic2anyModule;
      const converted = await heic2any({
        blob: file,
        toType: "image/jpeg",
        quality: 0.95,
      });
      return Array.isArray(converted) ? converted[0] : converted;
    } catch (e) {
      console.warn("HEIC decode fallback failed, attempting direct load:", e);
      return file;
    }
  }
  return file;
}

/**
 * Loads an image from a File/Blob and returns an HTMLImageElement and its dimensions
 */
export async function loadImageElement(
  file: File | Blob
): Promise<{ img: HTMLImageElement; width: number; height: number; blobUrl: string }> {
  let processableBlob: Blob = file;

  if (file instanceof File && isHeicFile(file, file.name)) {
    processableBlob = await preprocessImageFile(file);
  }

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(processableBlob);
    const img = new Image();

    img.onload = () => {
      const width = img.naturalWidth || img.width || 800;
      const height = img.naturalHeight || img.height || 600;
      resolve({
        img,
        width,
        height,
        blobUrl: url,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to decode image. Please check that the file is a valid image."));
    };

    img.src = url;
  });
}

/**
 * Decodes an image into an ImageBitmap using hardware acceleration where available,
 * with automatic EXIF orientation preservation.
 */
async function decodeToBitmap(
  blob: Blob
): Promise<{ bitmap: ImageBitmap; width: number; height: number } | null> {
  if (typeof window === "undefined" || !("createImageBitmap" in window)) {
    return null;
  }

  // SVG images might fail in some createImageBitmap implementations; fallback to Image element for SVG
  if (blob.type === "image/svg+xml") {
    return null;
  }

  try {
    const bitmap = await createImageBitmap(blob, {
      imageOrientation: "from-image",
      premultiplyAlpha: "default",
      colorSpaceConversion: "default",
    });
    return {
      bitmap,
      width: bitmap.width,
      height: bitmap.height,
    };
  } catch {
    return null;
  }
}

/**
 * Calculates target output dimensions considering scale and max constraints.
 */
function calculateTargetDimensions(
  originalWidth: number,
  originalHeight: number,
  options: ConversionOptions
): { width: number; height: number } {
  let targetWidth = Math.round(originalWidth * (options.scale || 1.0));
  let targetHeight = Math.round(originalHeight * (options.scale || 1.0));

  if (options.maxWidth && targetWidth > options.maxWidth) {
    const ratio = options.maxWidth / targetWidth;
    targetWidth = options.maxWidth;
    if (options.maintainAspectRatio) {
      targetHeight = Math.round(targetHeight * ratio);
    }
  }

  if (options.maxHeight && targetHeight > options.maxHeight) {
    const ratio = options.maxHeight / targetHeight;
    targetHeight = options.maxHeight;
    if (options.maintainAspectRatio) {
      targetWidth = Math.round(targetWidth * ratio);
    }
  }

  return {
    width: Math.max(1, targetWidth),
    height: Math.max(1, targetHeight),
  };
}

/**
 * Multi-step stepped downsampling to achieve pristine bicubic-like downscaling quality.
 * Prevents aliasing and moiré artifacts on high-resolution images.
 */
function drawWithSteppedDownsampling(
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number
): HTMLCanvasElement | OffscreenCanvas {
  // If downscaling is less than 50% or we are upscaling, single pass is optimal
  if (targetWidth >= sourceWidth * 0.5 && targetHeight >= sourceHeight * 0.5) {
    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d", { willReadFrequently: false, alpha: true });
    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(source, 0, 0, targetWidth, targetHeight);
    }
    return canvas;
  }

  // Stepped halving passes
  let currentWidth = sourceWidth;
  let currentHeight = sourceHeight;
  let currentCanvas = document.createElement("canvas");
  currentCanvas.width = currentWidth;
  currentCanvas.height = currentHeight;
  let currentCtx = currentCanvas.getContext("2d", { willReadFrequently: false, alpha: true });
  if (currentCtx) {
    currentCtx.imageSmoothingEnabled = true;
    currentCtx.imageSmoothingQuality = "high";
    currentCtx.drawImage(source, 0, 0, currentWidth, currentHeight);
  }

  while (currentWidth * 0.5 > targetWidth && currentHeight * 0.5 > targetHeight) {
    const nextWidth = Math.round(currentWidth * 0.5);
    const nextHeight = Math.round(currentHeight * 0.5);

    const nextCanvas = document.createElement("canvas");
    nextCanvas.width = nextWidth;
    nextCanvas.height = nextHeight;
    const nextCtx = nextCanvas.getContext("2d", { willReadFrequently: false, alpha: true });
    if (nextCtx) {
      nextCtx.imageSmoothingEnabled = true;
      nextCtx.imageSmoothingQuality = "high";
      nextCtx.drawImage(currentCanvas, 0, 0, nextWidth, nextHeight);
    }

    currentWidth = nextWidth;
    currentHeight = nextHeight;
    currentCanvas = nextCanvas;
  }

  // Final step to exact target dimensions
  const finalCanvas = document.createElement("canvas");
  finalCanvas.width = targetWidth;
  finalCanvas.height = targetHeight;
  const finalCtx = finalCanvas.getContext("2d", { willReadFrequently: false, alpha: true });
  if (finalCtx) {
    finalCtx.imageSmoothingEnabled = true;
    finalCtx.imageSmoothingQuality = "high";
    finalCtx.drawImage(currentCanvas, 0, 0, targetWidth, targetHeight);
  }

  return finalCanvas;
}

/**
 * Converts any image file to WebP format using hardware accelerated bitmaps,
 * high-fidelity stepped scaling, and WebP encoding.
 */
export async function convertImageToWebP(
  file: File,
  options: ConversionOptions,
  onProgress?: (progress: number) => void
): Promise<{
  blob: Blob;
  url: string;
  size: number;
  width: number;
  height: number;
  savingsPercentage: number;
  conversionTimeMs: number;
}> {
  const startTime = performance.now();
  onProgress?.(15);

  let processableBlob: Blob = file;
  if (isHeicFile(file, file.name)) {
    processableBlob = await preprocessImageFile(file);
  }

  onProgress?.(30);

  // Try decoding with fast ImageBitmap first
  const bitmapData = await decodeToBitmap(processableBlob);

  let sourceWidth = 0;
  let sourceHeight = 0;
  let sourceElement: CanvasImageSource;
  let cleanupCallback: (() => void) | null = null;

  if (bitmapData) {
    sourceWidth = bitmapData.width;
    sourceHeight = bitmapData.height;
    sourceElement = bitmapData.bitmap;
    cleanupCallback = () => bitmapData.bitmap.close();
  } else {
    // Fallback to HTMLImageElement
    const { img, width, height, blobUrl } = await loadImageElement(processableBlob);
    sourceWidth = width;
    sourceHeight = height;
    sourceElement = img;
    cleanupCallback = () => URL.revokeObjectURL(blobUrl);
  }

  onProgress?.(55);

  // Calculate target dimensions
  const { width: targetWidth, height: targetHeight } = calculateTargetDimensions(
    sourceWidth,
    sourceHeight,
    options
  );

  // Render on canvas with stepped anti-aliased scaling
  const renderedCanvas = drawWithSteppedDownsampling(
    sourceElement,
    sourceWidth,
    sourceHeight,
    targetWidth,
    targetHeight
  );

  // Free memory
  if (cleanupCallback) {
    cleanupCallback();
  }

  onProgress?.(80);

  // Normalize quality (0.01 to 1.0)
  const qualityParam = Math.max(0.01, Math.min(1.0, options.quality / 100));

  let blob: Blob;

  if ("convertToBlob" in renderedCanvas) {
    // OffscreenCanvas support
    blob = await (renderedCanvas as OffscreenCanvas).convertToBlob({
      type: "image/webp",
      quality: qualityParam,
    });
  } else {
    // HTMLCanvasElement support
    const htmlCanvas = renderedCanvas as HTMLCanvasElement;
    blob = await new Promise<Blob>((resolve, reject) => {
      htmlCanvas.toBlob(
        (result) => {
          if (result) {
            resolve(result);
          } else {
            reject(new Error("Canvas to WebP encoding failed."));
          }
        },
        "image/webp",
        qualityParam
      );
    });
  }

  const url = URL.createObjectURL(blob);
  const size = blob.size;
  const originalSize = file.size;
  const savedBytes = originalSize - size;
  const savingsPercentage = Math.round((savedBytes / originalSize) * 100);
  const conversionTimeMs = Math.round(performance.now() - startTime);

  onProgress?.(100);

  return {
    blob,
    url,
    size,
    width: targetWidth,
    height: targetHeight,
    savingsPercentage,
    conversionTimeMs,
  };
}

/**
 * Concurrency-bounded queue runner.
 * Allows running many image conversions in parallel up to `concurrency` limit
 * without overloading memory or UI thread.
 */
export async function runWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let currentIndex = 0;

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (currentIndex < items.length) {
      const index = currentIndex++;
      results[index] = await fn(items[index]);
    }
  });

  await Promise.all(workers);
  return results;
}

/**
 * Helper to download a single file
 */
export function downloadFile(url: string, filename: string): void {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
