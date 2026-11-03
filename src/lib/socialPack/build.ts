import { strToU8, zipSync, type Zippable } from "fflate";
import { COVER, SQUARE } from "./brand";
import {
  drawCover,
  drawSquare,
  type CoverInput,
  type Fonts,
  type LoadedImage,
} from "./draw";
import { captionText, fileNames, type PackSource } from "./pack";

export type Renderer = {
  cover(input: CoverInput): Promise<[Blob, Blob]>;
  square(image: LoadedImage): Promise<Blob>;
};

const JPEG_QUALITY = 0.9;
const FALLBACK_FONT = "sans-serif";

export function loadImage(url: string): Promise<LoadedImage> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () =>
      resolve({
        url,
        image,
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
    image.onerror = () => reject(new Error(`Could not load ${url}`));
    image.src = url;
  });
}

/** Reads the site's next/font families and waits for the weights we draw with. */
export async function loadSiteFonts(): Promise<Fonts> {
  const style = getComputedStyle(document.documentElement);
  const family = (name: string) =>
    style.getPropertyValue(name).trim() || FALLBACK_FONT;
  const fonts = {
    display: family("--font-oswald"),
    body: family("--font-source-sans"),
  };
  // Load only each stack's first family, the real face. next/font adds a
  // "Fallback" face that uses local Arial, and loading the whole stack
  // rejects where Arial is missing even though the real font loaded.
  const primary = (stack: string) => stack.split(",")[0].trim();
  const requests = [
    `bold 80px ${primary(fonts.display)}`,
    `80px ${primary(fonts.body)}`,
    `bold 80px ${primary(fonts.body)}`,
    `italic bold 80px ${primary(fonts.body)}`,
  ];
  const loaded = await Promise.all(
    requests.map((font) => document.fonts.load(font)),
  );
  // No matching face means the site font isn't there and the pack would be
  // drawn in a system font
  if (loaded.some((faces) => faces.length === 0)) {
    throw new Error("The site fonts are not available.");
  }
  return fonts;
}

function newCanvas(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("This browser cannot draw images.");
  return { canvas, ctx };
}

/** toBlob throws a SecurityError on a tainted canvas; that becomes a rejection. */
function toJpeg(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("Could not encode the image.")),
      "image/jpeg",
      JPEG_QUALITY,
    );
  });
}

function cropHalf(full: HTMLCanvasElement, top: number): Promise<Blob> {
  const { canvas, ctx } = newCanvas(SQUARE, SQUARE);
  ctx.drawImage(full, 0, top, SQUARE, SQUARE, 0, 0, SQUARE, SQUARE);
  return toJpeg(canvas);
}

/** Draws on real canvases and encodes each image as a JPEG. */
export function canvasRenderer(fonts: Fonts): Renderer {
  return {
    async cover(input) {
      const { canvas, ctx } = newCanvas(COVER.width, COVER.height);
      drawCover(ctx, input, fonts);
      return Promise.all([cropHalf(canvas, 0), cropHalf(canvas, COVER.cutY)]);
    },
    async square(image) {
      const { canvas, ctx } = newCanvas(SQUARE, SQUARE);
      drawSquare(ctx, image, fonts);
      return toJpeg(canvas);
    },
  };
}

function isSecurityError(error: unknown) {
  return error instanceof DOMException && error.name === "SecurityError";
}

/**
 * Zips the two cover halves, one image per photo and caption.txt. Photos
 * that taint the canvas are left out and listed in `skipped`.
 */
export async function buildPack(
  input: { source: PackSource; cover: CoverInput; photos: LoadedImage[] },
  render: Renderer,
): Promise<{ zip: Uint8Array; skipped: string[] }> {
  const images: Blob[] = [...(await render.cover(input.cover))];
  const skipped: string[] = [];
  for (const photo of input.photos) {
    try {
      images.push(await render.square(photo));
    } catch (error) {
      if (!isSecurityError(error)) throw error;
      skipped.push(photo.url);
    }
  }

  const names = fileNames(images.length - 2);
  const files: Zippable = {};
  for (const [i, blob] of images.entries()) {
    // JPEGs are already compressed; store them as they are.
    files[names[i]] = [new Uint8Array(await blob.arrayBuffer()), { level: 0 }];
  }
  files["caption.txt"] = strToU8(captionText(input.source));
  return { zip: zipSync(files), skipped };
}
