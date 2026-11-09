import { describe, expect, it } from "vitest";
import {
  aspectRatio,
  fitAspect,
  flipRect,
  moveCrop,
  pixelRect,
  resizeCrop,
  rotateBy,
  rotatedSize,
} from "./geometry";

const image = { width: 1000, height: 500 };
const ratioOf = (r: { width: number; height: number }) => r.width / r.height;

describe("fitAspect", () => {
  it("keeps the bounds when there's no ratio", () => {
    const bounds = { x: 0, y: 0, width: 1000, height: 400 };
    expect(fitAspect(bounds, null)).toEqual(bounds);
  });

  it("fits the largest centered square inside wide bounds", () => {
    expect(fitAspect({ x: 0, y: 0, width: 1000, height: 500 }, 1)).toEqual({
      x: 250,
      y: 0,
      width: 500,
      height: 500,
    });
  });

  it("fits a wide ratio inside tall bounds", () => {
    const rect = fitAspect({ x: 10, y: 20, width: 400, height: 800 }, 16 / 9);
    expect(rect.width).toBe(400);
    expect(ratioOf(rect)).toBeCloseTo(16 / 9);
    expect(rect.y + rect.height / 2).toBeCloseTo(420);
  });
});

describe("moveCrop", () => {
  it("stops at the image edges", () => {
    const crop = { x: 100, y: 100, width: 200, height: 200 };
    expect(moveCrop(crop, image, -500, 900)).toEqual({
      ...crop,
      x: 0,
      y: 300,
    });
  });
});

describe("resizeCrop without a ratio", () => {
  const start = { x: 100, y: 100, width: 200, height: 200 };

  it("moves only the dragged edge", () => {
    expect(resizeCrop(start, "s", 0, 50, image, null)).toEqual({
      ...start,
      height: 250,
    });
    expect(resizeCrop(start, "w", -40, 0, image, null)).toEqual({
      x: 60,
      y: 100,
      width: 240,
      height: 200,
    });
  });

  it("clamps to the image and the minimum size", () => {
    expect(resizeCrop(start, "se", 5000, 5000, image, null)).toEqual({
      x: 100,
      y: 100,
      width: 900,
      height: 400,
    });
    const tiny = resizeCrop(start, "nw", 500, 500, image, null);
    expect(tiny.width).toBe(32);
    expect(tiny.height).toBe(32);
    expect(tiny.x + tiny.width).toBe(300);
  });
});

describe("resizeCrop with a ratio", () => {
  const start = { x: 100, y: 100, width: 200, height: 100 };
  const ratio = 2;

  it("keeps the ratio on a corner drag, pivoting on the opposite corner", () => {
    const rect = resizeCrop(start, "nw", -50, 0, image, ratio);
    expect(ratioOf(rect)).toBeCloseTo(2);
    expect(rect.x + rect.width).toBe(300);
    expect(rect.y + rect.height).toBe(200);
    expect(rect.width).toBe(250);
  });

  it("stops a corner at whichever image edge comes first", () => {
    const rect = resizeCrop(start, "se", 5000, 0, image, ratio);
    expect(rect.x).toBe(100);
    expect(rect.y + rect.height).toBeCloseTo(500);
    expect(ratioOf(rect)).toBeCloseTo(2);
  });

  it("grows the other axis evenly on an edge drag", () => {
    const rect = resizeCrop(start, "e", 100, 0, image, ratio);
    expect(rect.width).toBe(300);
    expect(rect.height).toBe(150);
    expect(rect.y + rect.height / 2).toBe(150);
  });

  it("slides back onto the image when the even growth would spill over", () => {
    const top = { x: 100, y: 0, width: 200, height: 100 };
    const rect = resizeCrop(top, "e", 100, 0, image, ratio);
    expect(rect.y).toBe(0);
    expect(rect.height).toBe(150);
  });

  it("limits a bottom-edge drag by the image width", () => {
    const rect = resizeCrop(start, "s", 0, 5000, image, ratio);
    expect(rect.y).toBe(100);
    expect(rect.height).toBe(400);
    expect(rect.width).toBe(800);
    expect(rect.x).toBeGreaterThanOrEqual(0);
    expect(rect.x + rect.width).toBeLessThanOrEqual(1000);
  });
});

describe("orientation helpers", () => {
  it("swaps the size on a quarter turn", () => {
    expect(rotatedSize(image, 90)).toEqual({ width: 500, height: 1000 });
    expect(rotatedSize(image, 180)).toEqual(image);
  });

  it("wraps rotation both ways", () => {
    expect(rotateBy(0, -1)).toBe(270);
    expect(rotateBy(270, 1)).toBe(0);
  });

  it("mirrors a crop", () => {
    const crop = { x: 100, y: 50, width: 200, height: 100 };
    expect(flipRect(crop, image, "x")).toEqual({ ...crop, x: 700 });
    expect(flipRect(crop, image, "y")).toEqual({ ...crop, y: 350 });
  });

  it("looks up ratios", () => {
    expect(aspectRatio("free")).toBeNull();
    expect(aspectRatio("16:9")).toBeCloseTo(16 / 9);
  });
});

describe("pixelRect", () => {
  it("rounds and keeps the crop on the image", () => {
    expect(
      pixelRect({ x: 999.6, y: -0.2, width: 50, height: 600.4 }, image),
    ).toEqual({ x: 999, y: 0, width: 1, height: 500 });
  });
});
