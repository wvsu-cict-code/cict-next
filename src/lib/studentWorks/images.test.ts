import { describe, expect, it } from "vitest";
import { checkImageFile, fitWithin } from "@/lib/studentWorks/images";

describe("checkImageFile", () => {
  it("rejects non PNG/JPEG/WebP types", () => {
    expect(checkImageFile({ type: "image/gif", size: 1 })).toBe(
      "Use a PNG, JPEG or WebP image.",
    );
    expect(checkImageFile({ type: "image/svg+xml", size: 1 })).toBe(
      "Use a PNG, JPEG or WebP image.",
    );
  });
  it("rejects files over 25 MB", () => {
    expect(checkImageFile({ type: "image/png", size: 26214401 })).toBe(
      "That image is over 25 MB. Export a smaller version and try again.",
    );
  });
  it("accepts a 25 MB PNG", () => {
    expect(checkImageFile({ type: "image/png", size: 26214400 })).toBeNull();
  });
});

describe("fitWithin", () => {
  it("scales the long edge down to max", () => {
    expect(fitWithin({ width: 6000, height: 8000 }, 1600)).toEqual({
      width: 1200,
      height: 1600,
    });
  });
  it("never upscales", () => {
    expect(fitWithin({ width: 800, height: 600 }, 1600)).toEqual({
      width: 800,
      height: 600,
    });
  });
  it("returns integers", () => {
    const r = fitWithin({ width: 1000, height: 333 }, 400);
    expect(Number.isInteger(r.width) && Number.isInteger(r.height)).toBe(true);
  });
});
