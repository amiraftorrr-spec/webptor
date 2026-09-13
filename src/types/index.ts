export type ImageStatus = "idle" | "converting" | "completed" | "error";

export interface ConversionOptions {
  quality: number; // 10 to 100
  scale: number; // 0.25 to 1.0 (or custom)
  maxWidth?: number;
  maxHeight?: number;
  maintainAspectRatio: boolean;
  stripMetadata: boolean;
}

export interface ImageFileItem {
  id: string;
  file: File;
  name: string;
  originalFormat: string;
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  originalPreviewUrl: string;
  
  // Output
  status: ImageStatus;
  progress: number; // 0 - 100
  convertedBlob?: Blob;
  convertedUrl?: string;
  convertedSize?: number;
  convertedWidth?: number;
  convertedHeight?: number;
  savingsPercentage?: number; // e.g. 74 (%)
  errorMessage?: string;
}

export interface BatchStats {
  totalFiles: number;
  completedFiles: number;
  totalOriginalSize: number;
  totalConvertedSize: number;
  totalSavedBytes: number;
  overallSavingsPercentage: number;
}
