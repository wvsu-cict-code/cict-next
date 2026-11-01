import type { ContentClient } from "@/lib/cms/content";
import type { UploadedWorkImage } from "@/lib/studentWorks/form";
import type { Size } from "@/lib/studentWorks/layout";

export const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;
export const MAX_IMAGE_BYTES = 26214400;
export const DISPLAY_MAX = 1600;
export const ZOOM_MAX = 4000;

const MEDIA_BUCKET = "media";
const WEBP_QUALITY = 0.86;

/** Returns an error message for an unusable image file, or null if it is fine. */
export function checkImageFile(file: {
  type: string;
  size: number;
}): string | null {
  if (!(IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return "Use a PNG, JPEG or WebP image.";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "That image is over 25 MB. Export a smaller version and try again.";
  }
  return null;
}

/** Scales size down so its longer edge is at most max. Never upscales. */
export function fitWithin(size: Size, max: number): Size {
  const longest = Math.max(size.width, size.height);
  if (longest <= max) return { width: size.width, height: size.height };
  const scale = max / longest;
  return {
    width: Math.max(1, Math.round(size.width * scale)),
    height: Math.max(1, Math.round(size.height * scale)),
  };
}

/** File name for an encoded work image, named after its real format. */
export function encodedName(
  base: "display" | "zoom",
  blobType: string,
): string {
  return `${base}.${blobType === "image/webp" ? "webp" : "jpg"}`;
}

/** Extension for an original upload, from its (already validated) MIME type. */
export function originalExtension(type: string): string {
  if (type === "image/jpeg") return "jpg";
  if (type === "image/webp") return "webp";
  return "png";
}

function canvasBlob(
  canvas: HTMLCanvasElement,
  type: string,
): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, WEBP_QUALITY));
}

async function renderEncoded(
  bitmap: ImageBitmap,
  max: number,
): Promise<{ blob: Blob } & Size> {
  const size = fitWithin({ width: bitmap.width, height: bitmap.height }, max);
  const canvas = document.createElement("canvas");
  canvas.width = size.width;
  canvas.height = size.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Your browser couldn't process that image.");
  context.drawImage(bitmap, 0, 0, size.width, size.height);
  let blob = await canvasBlob(canvas, "image/webp");
  // Browsers that can't encode WebP fall back to PNG; use JPEG instead.
  if (blob && blob.type !== "image/webp")
    blob = await canvasBlob(canvas, "image/jpeg");
  if (!blob) throw new Error("Your browser couldn't process that image.");
  return { blob, ...size };
}

async function uploadBlob(
  client: ContentClient,
  path: string,
  blob: Blob,
): Promise<string> {
  const { error } = await client.storage
    .from(MEDIA_BUCKET)
    .upload(path, blob, { contentType: blob.type, upsert: false });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  return client.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
}

/**
 * Resizes a work image in the browser and uploads the original, a display
 * version and (optionally) a larger zoom version straight to storage.
 */
export async function uploadWorkImage(
  client: ContentClient,
  file: File,
  options: { withZoom: boolean },
): Promise<UploadedWorkImage> {
  const problem = checkImageFile(file);
  if (problem) throw new Error(problem);

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error("That image couldn't be read. Try a different file.");
  }

  try {
    const folder = `student-works/${crypto.randomUUID()}`;
    const display = await renderEncoded(bitmap, DISPLAY_MAX);
    const zoom = options.withZoom
      ? await renderEncoded(bitmap, ZOOM_MAX)
      : null;

    const original_url = await uploadBlob(
      client,
      `${folder}/original.${originalExtension(file.type)}`,
      file,
    );
    const image_url = await uploadBlob(
      client,
      `${folder}/${encodedName("display", display.blob.type)}`,
      display.blob,
    );
    const zoom_url = zoom
      ? await uploadBlob(
          client,
          `${folder}/${encodedName("zoom", zoom.blob.type)}`,
          zoom.blob,
        )
      : null;

    return {
      image_url,
      image_width: display.width,
      image_height: display.height,
      zoom_url,
      zoom_width: zoom?.width ?? null,
      zoom_height: zoom?.height ?? null,
      original_url,
    };
  } finally {
    bitmap.close();
  }
}
