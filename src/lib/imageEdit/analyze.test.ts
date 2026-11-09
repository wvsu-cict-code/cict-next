import { describe, expect, it } from "vitest";
import {
  detectContentBounds,
  edgeEnergy,
  placeByEnergy,
  suggestCrop,
  type Pixels,
} from "./analyze";

type RGB = [number, number, number];

/** Builds test pixels from a color function. */
function image(
  width: number,
  height: number,
  color: (x: number, y: number) => RGB,
): Pixels {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const [r, g, b] = color(x, y);
      const i = (y * width + x) * 4;
      data.set([r, g, b, 255], i);
    }
  }
  return { data, width, height };
}

/** A busy "photo": a checkerboard of mid tones. */
const photo = (x: number, y: number): RGB =>
  (x + y) % 2 ? [40, 90, 160] : [200, 150, 60];
const white: RGB = [255, 255, 255];
const black: RGB = [0, 0, 0];

describe("detectContentBounds", () => {
  it("leaves a photo without borders alone", () => {
    const { bounds, trimmed } = detectContentBounds(image(100, 80, photo));
    expect(bounds).toEqual({ x: 0, y: 0, width: 100, height: 80 });
    expect(trimmed).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
  });

  it("finds a white footer band, plus one line for blending", () => {
    const px = image(100, 80, (x, y) => (y >= 60 ? white : photo(x, y)));
    const { bounds, trimmed } = detectContentBounds(px);
    expect(trimmed.bottom).toBe(21);
    expect(bounds).toEqual({ x: 0, y: 0, width: 100, height: 59 });
  });

  it("trims a footer with a small caption in it", () => {
    const px = image(100, 80, (x, y) => {
      if (y < 60) return photo(x, y);
      // "Caption" rows: a few dark letters on the white band
      if (y >= 68 && y < 72 && x >= 5 && x < 25 && x % 2) return [90, 90, 90];
      return white;
    });
    expect(detectContentBounds(px).trimmed.bottom).toBe(21);
  });

  it("tolerates JPEG-like noise in the band", () => {
    const px = image(100, 80, (x, y) =>
      y >= 60 ? [250 - (x % 5), 252, 249 + (y % 3)] : photo(x, y),
    );
    expect(detectContentBounds(px).trimmed.bottom).toBe(21);
  });

  it("finds side bars between top and bottom bands of another color", () => {
    const px = image(100, 80, (x, y) => {
      if (y < 10) return white;
      if (y >= 70) return white;
      if (x < 15 || x >= 90) return black;
      return photo(x, y);
    });
    const { bounds } = detectContentBounds(px);
    expect(bounds).toEqual({ x: 16, y: 11, width: 73, height: 58 });
  });

  it("doesn't mistake a smooth sky gradient for a border", () => {
    const px = image(100, 200, (x, y) =>
      y < 150
        ? [90 + Math.round(y * 0.6), 160, 224 - Math.round(y * 0.6)]
        : photo(x, y),
    );
    expect(detectContentBounds(px).trimmed.top).toBe(0);
  });

  it("ignores a single bright edge line", () => {
    const px = image(100, 80, (x, y) => (y === 79 ? white : photo(x, y)));
    expect(detectContentBounds(px).trimmed.bottom).toBe(0);
  });

  it("doesn't trim a plain, single-colored image down to nothing", () => {
    const { bounds } = detectContentBounds(image(100, 80, () => white));
    expect(bounds).toEqual({ x: 0, y: 0, width: 100, height: 80 });
  });

  it("stops short of eating most of the image", () => {
    const px = image(100, 100, (x, y) => (y >= 30 ? white : photo(x, y)));
    expect(detectContentBounds(px).trimmed.bottom).toBeLessThanOrEqual(46);
  });
});

describe("placeByEnergy", () => {
  it("moves the window over the detailed part of the image", () => {
    // Flat gray except a busy patch on the right
    const px = image(200, 100, (x, y) =>
      x >= 140 ? photo(x, y) : [128, 128, 128],
    );
    const energy = edgeEnergy(px);
    const rect = placeByEnergy(
      energy,
      px,
      { x: 0, y: 0, width: 200, height: 100 },
      { width: 100, height: 100 },
    );
    expect(rect.x).toBe(100);
    expect(rect.y).toBe(0);
  });

  it("centers the window on a flat image", () => {
    const px = image(200, 100, () => [128, 128, 128]);
    const rect = placeByEnergy(
      edgeEnergy(px),
      px,
      { x: 0, y: 0, width: 200, height: 100 },
      { width: 100, height: 100 },
    );
    expect(rect.x).toBe(50);
  });
});

describe("suggestCrop", () => {
  it("cuts off a footer and scales the crop to the full image", () => {
    const px = image(100, 80, (x, y) => (y >= 60 ? white : photo(x, y)));
    const { crop, trimmed } = suggestCrop(
      px,
      { width: 1000, height: 800 },
      null,
    );
    expect(crop).toEqual({ x: 0, y: 0, width: 1000, height: 590 });
    expect(trimmed).toEqual({
      top: false,
      right: false,
      bottom: true,
      left: false,
    });
  });

  it("keeps the exact ratio inside the trimmed area", () => {
    const px = image(100, 80, (x, y) => (y >= 60 ? white : photo(x, y)));
    const { crop } = suggestCrop(px, { width: 1003, height: 797 }, 1);
    expect(crop.width / crop.height).toBeCloseTo(1, 6);
    expect(crop.y + crop.height).toBeLessThanOrEqual(797 * (59 / 80) + 1e-6);
  });
});
