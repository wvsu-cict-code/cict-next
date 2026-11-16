import { describe, expect, it } from "vitest";
import { checkImageEdge, checkSubmissionFile, sniffFormat } from "./files";

const webp = [0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50];
const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0];
const mp4 = [0, 0, 0, 0x20, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d];
const webm = [
  0x1a,
  0x45,
  0xdf,
  0xa3,
  0x01,
  0,
  0,
  0,
  0x42,
  0x82,
  0x84,
  ...Array.from("webm").map((c) => c.charCodeAt(0)),
];
const bytes = (a: number[]) => new Uint8Array(a);

describe("sniffFormat", () => {
  it("recognises webp and webm headers and rejects png and mp4", () => {
    expect(sniffFormat(bytes(webp))).toBe("webp");
    expect(sniffFormat(bytes(webm))).toBe("webm");
    expect(sniffFormat(bytes(png))).toBeNull();
    expect(sniffFormat(bytes(mp4))).toBeNull();
    expect(sniffFormat(bytes([0x1a, 0x45, 0xdf, 0xa3, 0, 0]))).toBeNull();
  });
});

describe("checkSubmissionFile", () => {
  it("rejects a .webp-named PNG", async () => {
    const file = new File([bytes(png)], "a.webp", { type: "image/webp" });
    expect(await checkSubmissionFile(file, "image")).toBe(
      "Use a WebP image (.webp).",
    );
  });

  it("accepts valid small files", async () => {
    const img = new File([bytes(webp)], "a.webp");
    expect(await checkSubmissionFile(img, "image")).toBeNull();
    const vid = new File([bytes(webm)], "a.webm");
    expect(await checkSubmissionFile(vid, "video")).toBeNull();
  });

  it("rejects wrong format for media", async () => {
    const vid = new File([bytes(mp4)], "a.webm");
    expect(await checkSubmissionFile(vid, "audio")).toBe(
      "Use a WebM file (.webm).",
    );
  });

  it("rejects a 5 MB + 1 byte image and a 20 MB + 1 byte video", async () => {
    const img = new File(
      [bytes(webp), new Uint8Array(5 * 1024 * 1024 + 1 - webp.length)],
      "a.webp",
    );
    expect(await checkSubmissionFile(img, "image")).toBe(
      "That image is over 5 MB.",
    );
    const vid = new File(
      [bytes(webm), new Uint8Array(20 * 1024 * 1024 + 1 - webm.length)],
      "a.webm",
    );
    expect(await checkSubmissionFile(vid, "video")).toBe(
      "That file is over 20 MB.",
    );
  });
});

describe("checkImageEdge", () => {
  it("allows 2560 and rejects 2561", () => {
    expect(checkImageEdge({ width: 2560, height: 100 })).toBeNull();
    expect(checkImageEdge({ width: 100, height: 2561 })).toBe(
      "That image is larger than 2560 px on its longest side. Export a smaller version.",
    );
  });
});
