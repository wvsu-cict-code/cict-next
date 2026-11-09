import { describe, expect, it } from "vitest";
import { COLLAGE_HEIGHT, COVER } from "./brand";
import { DEFAULT_LAYOUT, LAYOUTS, type LayoutId } from "./layouts";

describe("LAYOUTS", () => {
  it.each(Object.keys(LAYOUTS) as LayoutId[])(
    "%s tiles the collage exactly",
    (id) => {
      const { slots } = LAYOUTS[id];
      const area = slots.reduce((sum, s) => sum + s.width * s.height, 0);
      expect(area).toBe(COVER.width * COLLAGE_HEIGHT);
      for (const s of slots) {
        expect(s.x).toBeGreaterThanOrEqual(0);
        expect(s.y).toBeGreaterThanOrEqual(0);
        expect(s.x + s.width).toBeLessThanOrEqual(COVER.width);
        expect(s.y + s.height).toBeLessThanOrEqual(COLLAGE_HEIGHT);
      }
      for (const [i, a] of slots.entries()) {
        for (const b of slots.slice(i + 1)) {
          const apart =
            a.x + a.width <= b.x ||
            b.x + b.width <= a.x ||
            a.y + a.height <= b.y ||
            b.y + b.height <= a.y;
          expect(apart).toBe(true);
        }
      }
    },
  );

  it("defaults to three", () => {
    expect(DEFAULT_LAYOUT).toBe("three");
    expect(LAYOUTS.three.slots).toHaveLength(3);
  });
});
