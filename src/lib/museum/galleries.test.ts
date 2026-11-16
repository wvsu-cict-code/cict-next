import { describe, expect, it } from "vitest";
import type { GalleryId } from "@/lib/museum/categories";
import { availableGalleries } from "./galleries";

describe("availableGalleries", () => {
  it("availableGalleries drops empty galleries", () => {
    const counts: Record<GalleryId, number> = { a: 0, b: 2, c: 0 };
    expect(availableGalleries(counts)).toEqual(["b"]);
    expect(availableGalleries({ a: 3, b: 0, c: 1 })).toEqual(["a", "c"]);
    expect(availableGalleries({ c: 4, b: 1, a: 0 })).toEqual(["b", "c"]);
    expect(availableGalleries({ a: 0, b: 0, c: 0 })).toEqual([]);
  });
});
