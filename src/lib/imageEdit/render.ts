import { checkImageFile, fitWithin } from "@/lib/studentWorks/images";
import { applyAdjustments, NO_ADJUSTMENTS, type Adjustments } from "./adjust";
import { suggestCrop, type Pixels, type Suggestion } from "./analyze";
import { pixelRect, rotatedSize, type Rect, type Rotation } from "./geometry";

export type Orientation = {
  rotation: Rotation;
  flipX: boolean;
  flipY: boolean;
};

export const UPRIGHT: Orientation = { rotation: 0, flipX: false, flipY: false };

/** Edits made in the editor; crop is in pixels of the oriented working image. */
export type Edits = Orientation & { crop: Rect; adjust: Adjustments };

/** Largest image the editor works on; bigger photos are scaled down first. */
export const WORK_MAX = 4000;
/** Size of the small copy that's analyzed for the smart crop. */
const SAMPLE_MAX = 480;
const QUALITY = 0.92;

/** An image ready to edit, plus whether it may be transparent. */
export type Loaded = { bitmap: ImageBitmap; hasAlpha: boolean; name: string };

function baseName(name: string) {
  return name.replace(/\.[^.]*$/, "").replace(/[^\w-]+/g, "-") || "photo";
}

/** Reads a picked file, or downloads an already-uploaded image by URL. */
export async function loadImage(source: File | string): Promise<Loaded> {
  let blob: Blob;
  let name: string;
  if (typeof source === "string") {
    let response: Response;
    try {
      response = await fetch(source);
    } catch {
      throw new Error("The image couldn't be downloaded for editing.");
    }
    if (!response.ok)
      throw new Error("The image couldn't be downloaded for editing.");
    blob = await response.blob();
    if (blob.type === "image/svg+xml")
      throw new Error("Vector (SVG) images can't be edited here.");
    name = source.split("?")[0].split("/").pop() ?? "photo";
  } else {
    const problem = checkImageFile(source);
    if (problem) throw new Error(problem);
    blob = source;
    name = source.name;
  }

  try {
    const bitmap = await createImageBitmap(blob, {
      imageOrientation: "from-image",
    });
    return {
      bitmap,
      hasAlpha: blob.type !== "image/jpeg",
      name: baseName(name),
    };
  } catch {
    throw new Error("That image couldn't be read. Try a different file.");
  }
}

function context2d(canvas: HTMLCanvasElement) {
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Your browser couldn't process that image.");
  return context;
}

/** Frees a canvas's pixels now; Safari caps total canvas memory. */
export function releaseCanvas(canvas: HTMLCanvasElement | null) {
  if (!canvas) return;
  canvas.width = 0;
  canvas.height = 0;
}

/**
 * Draws the image turned and mirrored as asked, at most WORK_MAX on the
 * long edge. Flips apply to what's on screen, after the turn.
 */
export function drawOriented(
  bitmap: ImageBitmap,
  orientation: Orientation,
  max = WORK_MAX,
): HTMLCanvasElement {
  const base = fitWithin({ width: bitmap.width, height: bitmap.height }, max);
  const size = rotatedSize(base, orientation.rotation);
  const canvas = document.createElement("canvas");
  canvas.width = size.width;
  canvas.height = size.height;
  const context = context2d(canvas);
  context.imageSmoothingQuality = "high";
  context.translate(size.width / 2, size.height / 2);
  context.scale(orientation.flipX ? -1 : 1, orientation.flipY ? -1 : 1);
  context.rotate((orientation.rotation * Math.PI) / 180);
  context.drawImage(
    bitmap,
    -base.width / 2,
    -base.height / 2,
    base.width,
    base.height,
  );
  return canvas;
}

/** A small copy of the canvas's pixels for analysis. */
export function samplePixels(source: HTMLCanvasElement): Pixels {
  const size = fitWithin(
    { width: source.width, height: source.height },
    SAMPLE_MAX,
  );
  const canvas = document.createElement("canvas");
  canvas.width = size.width;
  canvas.height = size.height;
  try {
    const context = context2d(canvas);
    context.drawImage(source, 0, 0, size.width, size.height);
    const { data } = context.getImageData(0, 0, size.width, size.height);
    return { data, ...size };
  } finally {
    releaseCanvas(canvas);
  }
}

/** The smart crop for an oriented image. */
export function suggestFor(
  oriented: HTMLCanvasElement,
  ratio: number | null,
): Suggestion {
  return suggestCrop(
    samplePixels(oriented),
    { width: oriented.width, height: oriented.height },
    ratio,
  );
}

function toBlob(canvas: HTMLCanvasElement, type: string) {
  return new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, type, QUALITY),
  );
}

/**
 * Encodes as WebP, or where the browser can't, as PNG (to keep
 * transparency) or JPEG.
 */
async function encode(canvas: HTMLCanvasElement, hasAlpha: boolean) {
  let blob = await toBlob(canvas, "image/webp");
  if (!blob || blob.type !== "image/webp") {
    blob = await toBlob(canvas, hasAlpha ? "image/png" : "image/jpeg");
  }
  if (!blob) throw new Error("Your browser couldn't process that image.");
  return blob;
}

const EXTENSIONS: Record<string, string> = {
  "image/webp": "webp",
  "image/png": "png",
  "image/jpeg": "jpg",
};

/**
 * Cuts the crop out of the oriented image, applies the color adjustments,
 * and encodes it as a file at most `max` pixels on the long edge.
 */
export async function exportEdited(
  oriented: HTMLCanvasElement,
  edits: Pick<Edits, "crop" | "adjust">,
  options: { max: number; hasAlpha: boolean; name: string },
): Promise<File> {
  const crop = pixelRect(edits.crop, oriented);
  const size = fitWithin(crop, options.max);
  const canvas = document.createElement("canvas");
  canvas.width = size.width;
  canvas.height = size.height;
  try {
    const context = context2d(canvas);
    context.imageSmoothingQuality = "high";
    context.drawImage(
      oriented,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      size.width,
      size.height,
    );
    const pixels = context.getImageData(0, 0, size.width, size.height);
    applyAdjustments(pixels.data, edits.adjust);
    context.putImageData(pixels, 0, 0);
    const blob = await encode(canvas, options.hasAlpha);
    return new File([blob], `${options.name}.${EXTENSIONS[blob.type]}`, {
      type: blob.type,
    });
  } finally {
    releaseCanvas(canvas);
  }
}

/** Applies the smart crop to a file without opening the editor. */
export async function autoEdit(
  file: File,
  ratio: number | null,
  max: number,
): Promise<File> {
  const { bitmap, hasAlpha, name } = await loadImage(file);
  let oriented: HTMLCanvasElement | null = null;
  try {
    oriented = drawOriented(bitmap, UPRIGHT);
    const { crop } = suggestFor(oriented, ratio);
    return await exportEdited(
      oriented,
      { crop, adjust: NO_ADJUSTMENTS },
      { max, hasAlpha, name },
    );
  } finally {
    releaseCanvas(oriented);
    bitmap.close();
  }
}
