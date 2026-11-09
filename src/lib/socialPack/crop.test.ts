import { describe, expect, it } from "vitest";
import { CENTERED, panCrop, sourceRect, zoomCrop } from "./crop";

const slot = { x: 0, y: 0, width: 940, height: 940 };
const wide = { width: 2000, height: 1000 };

describe("sourceRect", () => {
  it("centres a cover fit", () => {
    expect(sourceRect(wide, slot, CENTERED)).toEqual({
      x: 500,
      y: 0,
      width: 1000,
      height: 1000,
    });
  });
  it("follows the horizontal focus", () => {
    expect(sourceRect(wide, slot, { ...CENTERED, focusX: 0 }).x).toBe(0);
    expect(sourceRect(wide, slot, { ...CENTERED, focusX: 1 }).x).toBe(1000);
  });
  it("zooms into the centre", () => {
    expect(sourceRect(wide, slot, { ...CENTERED, zoom: 2 })).toEqual({
      x: 750,
      y: 250,
      width: 500,
      height: 500,
    });
  });
  it("never stretches a portrait photo", () => {
    const s = { x: 0, y: 0, width: 940, height: 540 };
    const r = sourceRect({ width: 600, height: 1200 }, s, CENTERED);
    expect(r.width).toBe(600);
    expect(r.width / r.height).toBeCloseTo(s.width / s.height, 5);
  });
});

describe("panCrop", () => {
  it("dragging right moves the photo right, so the focus decreases", () => {
    expect(panCrop(CENTERED, wide, slot, 100, 0).focusX).toBeLessThan(0.5);
  });
  it("keeps focus within 0-1", () => {
    const c = panCrop(CENTERED, wide, slot, -100000, 100000);
    expect(c.focusX).toBe(1);
    expect(c.focusY).toBeGreaterThanOrEqual(0);
    expect(c.focusY).toBeLessThanOrEqual(1);
  });
});

describe("zoomCrop", () => {
  it("clamps to 1-4", () => {
    expect(zoomCrop(CENTERED, 0.1).zoom).toBe(1);
    expect(zoomCrop(CENTERED, 100).zoom).toBe(4);
    expect(zoomCrop(CENTERED, 2).zoom).toBe(2);
  });
});
