import { describe, expect, it } from "vitest";
import { applyAdjustments, cssFilter, NO_ADJUSTMENTS } from "./adjust";

const pixel = (r: number, g: number, b: number) =>
  new Uint8ClampedArray([r, g, b, 255]);

describe("applyAdjustments", () => {
  it("leaves pixels alone at 100%", () => {
    const data = pixel(10, 120, 250);
    applyAdjustments(data, NO_ADJUSTMENTS);
    expect([...data]).toEqual([10, 120, 250, 255]);
  });

  it("scales brightness and clamps at white", () => {
    const data = pixel(100, 200, 50);
    applyAdjustments(data, { ...NO_ADJUSTMENTS, brightness: 150 });
    expect([...data]).toEqual([150, 255, 75, 255]);
  });

  it("pushes contrast away from mid gray", () => {
    const data = pixel(100, 155, 128);
    applyAdjustments(data, { ...NO_ADJUSTMENTS, contrast: 150 });
    expect([...data]).toEqual([86, 169, 128, 255]);
  });

  it("turns a color gray at low saturation and keeps grays gray", () => {
    const data = new Uint8ClampedArray([200, 50, 50, 255, 90, 90, 90, 255]);
    applyAdjustments(data, { ...NO_ADJUSTMENTS, saturation: 50 });
    // Red moves toward its luminance
    expect(data[0]).toBeLessThan(200);
    expect(data[1]).toBeGreaterThan(50);
    expect([...data.slice(4)]).toEqual([90, 90, 90, 255]);
  });

  it("never touches alpha", () => {
    const data = new Uint8ClampedArray([100, 100, 100, 7]);
    applyAdjustments(data, { brightness: 140, contrast: 60, saturation: 130 });
    expect(data[3]).toBe(7);
  });
});

describe("cssFilter", () => {
  it("is none when nothing changes", () => {
    expect(cssFilter(NO_ADJUSTMENTS)).toBe("none");
  });

  it("lists the filters in the same order as the export", () => {
    expect(cssFilter({ brightness: 110, contrast: 90, saturation: 120 })).toBe(
      "brightness(110%) contrast(90%) saturate(120%)",
    );
  });
});
