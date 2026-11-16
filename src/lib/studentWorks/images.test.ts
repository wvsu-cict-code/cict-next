import { describe, expect, it } from "vitest";
import {
  checkImageFile,
  encodedName,
  fitWithin,
  needsZoomVersion,
  originalExtension,
} from "@/lib/studentWorks/images";

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

describe("encodedName", () => {
  it("names files after the real format", () => {
    expect(encodedName("display", "image/webp")).toBe("display.webp");
    expect(encodedName("display", "image/jpeg")).toBe("display.jpg");
    expect(encodedName("zoom", "image/jpeg")).toBe("zoom.jpg");
  });
});

describe("originalExtension", () => {
  it("maps MIME types to extensions", () => {
    expect(originalExtension("image/png")).toBe("png");
    expect(originalExtension("image/jpeg")).toBe("jpg");
    expect(originalExtension("image/webp")).toBe("webp");
  });
});

describe("needsZoomVersion", () => {
  it("skips the zoom file when it would match the display size", () => {
    expect(needsZoomVersion({ width: 1600, height: 900 })).toBe(false);
    expect(needsZoomVersion({ width: 800, height: 1600 })).toBe(false);
    expect(needsZoomVersion({ width: 400, height: 300 })).toBe(false);
  });

  it("makes one when the original is larger than the display size", () => {
    expect(needsZoomVersion({ width: 1601, height: 900 })).toBe(true);
    expect(needsZoomVersion({ width: 3000, height: 6000 })).toBe(true);
  });
});
