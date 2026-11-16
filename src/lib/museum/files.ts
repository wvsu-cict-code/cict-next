import {
  SUBMISSION_IMAGE_MAX_BYTES,
  SUBMISSION_IMAGE_MAX_EDGE,
  SUBMISSION_MEDIA_MAX_BYTES,
} from "./limits";

export type MediaKind = "image" | "video" | "audio";

const EBML = [0x1a, 0x45, 0xdf, 0xa3];

export function sniffFormat(head: Uint8Array): "webp" | "webm" | null {
  const ascii = (from: number, to: number) =>
    String.fromCharCode(...Array.from(head.slice(from, to)));
  if (head.length >= 12 && ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP")
    return "webp";
  if (
    head.length >= 4 &&
    EBML.every((b, i) => head[i] === b) &&
    ascii(0, 64).includes("webm")
  )
    return "webm";
  return null;
}

export async function checkSubmissionFile(
  file: File,
  kind: MediaKind,
): Promise<string | null> {
  const head = new Uint8Array(await file.slice(0, 64).arrayBuffer());
  const format = sniffFormat(head);
  if (kind === "image") {
    if (format !== "webp") return "Use a WebP image (.webp).";
    if (file.size > SUBMISSION_IMAGE_MAX_BYTES)
      return "That image is over 5 MB.";
    return null;
  }
  if (format !== "webm") return "Use a WebM file (.webm).";
  if (file.size > SUBMISSION_MEDIA_MAX_BYTES) return "That file is over 20 MB.";
  return null;
}

export async function readImageSize(
  file: File,
): Promise<{ width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  try {
    return { width: bitmap.width, height: bitmap.height };
  } finally {
    bitmap.close();
  }
}

export function checkImageEdge(size: {
  width: number;
  height: number;
}): string | null {
  return Math.max(size.width, size.height) > SUBMISSION_IMAGE_MAX_EDGE
    ? `That image is larger than ${SUBMISSION_IMAGE_MAX_EDGE} px on its longest side. Export a smaller version.`
    : null;
}
