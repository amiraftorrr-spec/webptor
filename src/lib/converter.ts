import { ConversionOptions, ImageFileItem } from "@/types";

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
function isHeicFile(file: File | Blob, filename = ""): boolean {
  const isHeicType = file.type === "image/heic" || file.type === "image/heif";
  const isHeicExt = /\.(heic|heif)$/i.test(filename || (file instanceof File ? file.name : ""));
  return isHeicType || isHeicExt;
}

/**
 * Preprocesses any file to a standard browser-readable Blob
 */
async function preprocessImageFile(file: File): Promise<Blob> {
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
 * Converts any image file to WebP format using HTML5 Canvas
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
}> {
  onProgress?.(20);

  const { img, width: originalWidth, height: originalHeight, blobUrl } = await loadImageElement(file);

  onProgress?.(50);

  // Calculate target dimensions
  let targetWidth = Math.round(originalWidth * (options.scale || 1.0));
  let targetHeight = Math.round(originalHeight * (options.scale || 1.0));

  if (options.maxWidth && targetWidth > options.maxWidth) {
    const ratio = options.maxWidth / targetWidth;
    targetWidth = options.maxWidth;
    targetHeight = Math.round(targetHeight * ratio);
  }

  if (options.maxHeight && targetHeight > options.maxHeight) {
    const ratio = options.maxHeight / targetHeight;
    targetHeight = options.maxHeight;
    targetWidth = Math.round(targetWidth * ratio);
  }

  // Ensure dimensions are at least 1x1
  targetWidth = Math.max(1, targetWidth);
  targetHeight = Math.max(1, targetHeight);

  // Setup canvas
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext("2d", { willReadFrequently: false });
  if (!ctx) {
    URL.revokeObjectURL(blobUrl);
    throw new Error("Could not initialize 2D canvas context.");
  }

  // Image smoothing settings for high quality downscaling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Draw image on canvas
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  onProgress?.(80);

  // Convert canvas to WebP Blob
  const qualityParam = Math.max(0.01, Math.min(1.0, options.quality / 100));

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) {
          resolve(result);
        } else {
          reject(new Error("Canvas to WebP conversion failed."));
        }
      },
      "image/webp",
      qualityParam
    );
  });

  const url = URL.createObjectURL(blob);
  const size = blob.size;

  // Calculate savings
  const originalSize = file.size;
  const savedBytes = originalSize - size;
  const savingsPercentage = Math.round((savedBytes / originalSize) * 100);

  onProgress?.(100);

  return {
    blob,
    url,
    size,
    width: targetWidth,
    height: targetHeight,
    savingsPercentage,
  };
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
