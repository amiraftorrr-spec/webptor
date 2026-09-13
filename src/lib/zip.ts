import JSZip from "jszip";
import { ImageFileItem } from "@/types";
import { getBaseFileName } from "./converter";

/**
 * Packs all completed converted WebP files into a zip archive and triggers download
 */
export async function downloadAllAsZip(
  items: ImageFileItem[],
  zipName = "webp-converted-images.zip",
  onProgress?: (percent: number) => void
): Promise<void> {
  const completedItems = items.filter((item) => item.status === "completed" && item.convertedBlob);

  if (completedItems.length === 0) {
    throw new Error("No completed images to download.");
  }

  const zip = new JSZip();
  const folder = zip.folder("webp-images") || zip;

  const usedNames = new Set<string>();

  completedItems.forEach((item) => {
    let baseName = getBaseFileName(item.name);
    let finalName = `${baseName}.webp`;
    let counter = 1;

    // Ensure unique filenames inside the zip
    while (usedNames.has(finalName)) {
      finalName = `${baseName}-${counter}.webp`;
      counter++;
    }
    usedNames.add(finalName);

    if (item.convertedBlob) {
      folder.file(finalName, item.convertedBlob);
    }
  });

  const content = await zip.generateAsync(
    {
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    },
    (metadata) => {
      onProgress?.(Math.round(metadata.percent));
    }
  );

  const url = URL.createObjectURL(content);
  const a = document.createElement("a");
  a.href = url;
  a.download = zipName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
