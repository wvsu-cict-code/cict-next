import { describe, expect, it } from "vitest";
import type { StudentWork } from "@/lib/cms/content";
import {
  columnCountFor,
  masonryLayout,
  tileImage,
  workAspect,
} from "@/lib/studentWorks/layout";

function work(overrides: Partial<StudentWork> = {}): StudentWork {
  return {
    id: "w1",
    kind: "art",
    title: "Piece",
    student: "Juan",
    description: "",
    orientation: null,
    image_url: "https://cdn.example.com/a.jpg",
    image_width: 3000,
    image_height: 4000,
    youtube_id: null,
    store_url: null,
    portfolio_url: null,
    original_url: null,
    zoom_url: null,
    zoom_width: null,
    zoom_height: null,
    sort_order: 0,
    visible: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("workAspect", () => {
  it("uses fixed ratios for videos", () => {
    expect(workAspect(work({ kind: "video", orientation: "vertical" }))).toBe(9 / 16);
    expect(workAspect(work({ kind: "video", orientation: "landscape" }))).toBe(16 / 9);
  });

  it("uses image dimensions for art", () => {
    expect(workAspect(work())).toBe(0.75);
  });

  it("falls back to 4:3 without dimensions", () => {
    expect(workAspect(work({ image_width: null, image_height: null }))).toBe(4 / 3);
  });
});

describe("tileImage", () => {
  const video = { kind: "video" as const, image_url: null, youtube_id: "abc" };

  it("uses maxres with an hq fallback for landscape videos", () => {
    expect(tileImage(work({ ...video, orientation: "landscape" }))).toEqual({
      src: "https://i.ytimg.com/vi/abc/maxresdefault.jpg",
      fallbackSrc: "https://i.ytimg.com/vi/abc/hqdefault.jpg",
    });
  });

  it("uses hq only for vertical videos", () => {
    expect(tileImage(work({ ...video, orientation: "vertical" }))).toEqual({
      src: "https://i.ytimg.com/vi/abc/hqdefault.jpg",
    });
  });

  it("prefers an uploaded image", () => {
    expect(tileImage(work({ ...video, orientation: "landscape", image_url: "https://cdn.example.com/t.jpg" }))).toEqual({
      src: "https://cdn.example.com/t.jpg",
    });
  });
});

describe("columnCountFor", () => {
  it("picks 2 columns on phones and 3 otherwise", () => {
    expect(columnCountFor(390)).toBe(2);
    expect(columnCountFor(640)).toBe(3);
    expect(columnCountFor(1200)).toBe(3);
  });
});

describe("masonryLayout", () => {
  const options = { width: 210, columns: 2, gap: 10, captionHeight: 0 };
  const aspects = [1, 0.5, 1, 1];

  it("places each item in the shortest column", () => {
    const { boxes, height } = masonryLayout(aspects, options);
    expect(boxes[0]).toEqual({ x: 0, y: 0, width: 100, height: 100 });
    expect(boxes[1]).toEqual({ x: 110, y: 0, width: 100, height: 200 });
    expect(boxes[2]).toEqual({ x: 0, y: 110, width: 100, height: 100 });
    expect(boxes[3]).toEqual({ x: 110, y: 210, width: 100, height: 100 });
    expect(height).toBe(310);
  });

  it("includes the caption in box height", () => {
    const { boxes } = masonryLayout([1], { ...options, captionHeight: 20 });
    expect(boxes[0].height).toBe(120);
  });

  it("is empty-safe", () => {
    expect(masonryLayout([], options)).toEqual({ boxes: [], height: 0 });
  });

  it("never moves existing boxes when appending", () => {
    expect(masonryLayout(aspects.slice(0, 3), options).boxes).toEqual(
      masonryLayout(aspects, options).boxes.slice(0, 3),
    );
  });
});
