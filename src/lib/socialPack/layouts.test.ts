import { describe, expect, it } from "vitest";
import { COVER } from "./brand";
import { DEFAULT_LAYOUT, LAYOUTS, type LayoutId } from "./layouts";

describe("LAYOUTS", () => {
  it.each(Object.keys(LAYOUTS) as LayoutId[])(
    "%s tiles the cover exactly",
    (id) => {
      const { slots } = LAYOUTS[id];
      const area = slots.reduce((sum, s) => sum + s.width * s.height, 0);
      expect(area).toBe(COVER.width * COVER.height);
      for (const s of slots) {
        expect(s.x).toBeGreaterThanOrEqual(0);
        expect(s.y).toBeGreaterThanOrEqual(0);
        expect(s.x + s.width).toBeLessThanOrEqual(COVER.width);
        expect(s.y + s.height).toBeLessThanOrEqual(COVER.height);
      }
    },
  );

  it("defaults to three", () => {
    expect(DEFAULT_LAYOUT).toBe("three");
    expect(LAYOUTS.three.slots).toHaveLength(3);
  });
});
