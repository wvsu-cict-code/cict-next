import { describe, expect, it } from "vitest";
import { parsePhotos } from "@/lib/photos";

describe("parsePhotos", () => {
  it("parses a JSON string, trimming alt", () => {
    expect(
      parsePhotos('[{"url":"https://x/a.webp","width":800,"height":600,"alt":" Team "}]'),
    ).toEqual([{ url: "https://x/a.webp", width: 800, height: 600, alt: "Team" }]);
  });
  it("defaults alt to empty and accepts rooted urls", () => {
    expect(parsePhotos([{ url: "/a.jpg", width: 3, height: 2 }])).toEqual([
      { url: "/a.jpg", width: 3, height: 2, alt: "" },
    ]);
  });
  it("drops unsafe urls", () => {
    expect(parsePhotos([{ url: "javascript:alert(1)", width: 1, height: 1 }])).toEqual([]);
  });
  it("drops non-positive dimensions", () => {
    expect(parsePhotos([{ url: "/a.jpg", width: 0, height: 5 }])).toEqual([]);
  });
  it("returns [] for invalid input", () => {
    expect(parsePhotos("not json")).toEqual([]);
    expect(parsePhotos(null)).toEqual([]);
  });
  it("caps at 60", () => {
    const many = Array.from({ length: 61 }, () => ({ url: "/a.jpg", width: 1, height: 1 }));
    expect(parsePhotos(many)).toHaveLength(60);
  });
});
