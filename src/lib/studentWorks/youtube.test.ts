import { describe, expect, it } from "vitest";
import {
  isYouTubePlaceholder,
  parseYouTubeUrl,
  youtubeEmbedUrl,
  youtubeThumbnail,
  youtubeWatchUrl,
} from "@/lib/studentWorks/youtube";

describe("parseYouTubeUrl", () => {
  it.each([
    ["https://www.youtube.com/watch?v=dQw4w9WgXcQ", { id: "dQw4w9WgXcQ", isShort: false }],
    ["https://youtu.be/dQw4w9WgXcQ?si=abc", { id: "dQw4w9WgXcQ", isShort: false }],
    ["https://m.youtube.com/watch?feature=share&v=dQw4w9WgXcQ", { id: "dQw4w9WgXcQ", isShort: false }],
    ["https://youtube.com/shorts/dQw4w9WgXcQ?feature=share", { id: "dQw4w9WgXcQ", isShort: true }],
    ["https://www.youtube.com/embed/dQw4w9WgXcQ", { id: "dQw4w9WgXcQ", isShort: false }],
    ["  https://youtu.be/dQw4w9WgXcQ  ", { id: "dQw4w9WgXcQ", isShort: false }],
  ])("parses %s", (url, expected) => {
    expect(parseYouTubeUrl(url)).toEqual(expected);
  });

  it.each([
    "",
    "not a url",
    "https://vimeo.com/123",
    "https://youtube.com/watch?v=short",
    "https://evil.com/watch?v=dQw4w9WgXcQ",
  ])("rejects %s", (url) => {
    expect(parseYouTubeUrl(url)).toBeNull();
  });
});

describe("youtube urls", () => {
  it("builds watch urls by orientation", () => {
    expect(youtubeWatchUrl("abc", "vertical")).toBe("https://www.youtube.com/shorts/abc");
    expect(youtubeWatchUrl("abc", "landscape")).toBe("https://www.youtube.com/watch?v=abc");
  });

  it("builds the privacy-enhanced embed url", () => {
    expect(youtubeEmbedUrl("dQw4w9WgXcQ")).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0&playsinline=1",
    );
  });

  it("builds thumbnail urls", () => {
    expect(youtubeThumbnail("abc", "hqdefault")).toBe("https://i.ytimg.com/vi/abc/hqdefault.jpg");
  });
});

describe("isYouTubePlaceholder", () => {
  const img = (naturalWidth: number, naturalHeight: number) =>
    ({ naturalWidth, naturalHeight }) as HTMLImageElement;

  it("spots YouTube's 120x90 missing-thumbnail placeholder", () => {
    expect(isYouTubePlaceholder(img(120, 90))).toBe(true);
  });

  it("accepts real thumbnails", () => {
    expect(isYouTubePlaceholder(img(1280, 720))).toBe(false);
    expect(isYouTubePlaceholder(img(480, 360))).toBe(false);
    expect(isYouTubePlaceholder(img(90, 120))).toBe(false);
  });
});
