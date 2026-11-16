import { describe, expect, it } from "vitest";
import { MAX_SCALE, RESET, panBy, zoomAt } from "@/lib/studentWorks/zoom";

const image = { width: 400, height: 300 };
const viewport = { width: 400, height: 300 };

describe("zoomAt", () => {
  it("zooms about the centre", () => {
    expect(zoomAt(RESET, 2, { x: 0, y: 0 }, image, viewport)).toEqual({ scale: 2, x: 0, y: 0 });
  });

  it("keeps the point under the cursor in place", () => {
    expect(zoomAt(RESET, 2, { x: 100, y: 0 }, image, viewport)).toEqual({ scale: 2, x: -100, y: 0 });
  });

  it("clamps to the max scale", () => {
    expect(zoomAt(RESET, 10, { x: 0, y: 0 }, image, viewport).scale).toBe(MAX_SCALE);
  });

  it("resets when zoomed out to 1 or less", () => {
    const state = { scale: 2, x: 50, y: 0 };
    expect(zoomAt(state, 0.5, { x: 0, y: 0 }, image, viewport)).toEqual(RESET);
  });
});

describe("panBy", () => {
  it("clamps to the image edge", () => {
    expect(panBy({ scale: 2, x: 0, y: 0 }, 1000, 0, image, viewport).x).toBe(200);
  });

  it("does not pan at scale 1", () => {
    expect(panBy(RESET, 50, 50, image, viewport)).toEqual(RESET);
  });
});
