import { describe, expect, it } from "vitest";
import {
  CATEGORIES,
  CATEGORY_ICON,
  CATEGORY_LABELS,
  CATEGORY_MEDIA,
  CATEGORY_SINGULAR,
  CATEGORY_TINT,
  GALLERIES,
  galleryOf,
} from "@/lib/museum/categories";

describe("galleries", () => {
  it("every category belongs to exactly one gallery", () => {
    for (const category of CATEGORIES) {
      const owners = GALLERIES.filter((g) => g.categories.includes(category));
      expect(owners).toHaveLength(1);
      expect(galleryOf(category)).toBe(owners[0].id);
    }
    expect(GALLERIES.flatMap((g) => g.categories).sort()).toEqual(
      [...CATEGORIES].sort(),
    );
  });

  it('galleryOf maps sound_design to "b" and xr_3d to "c"', () => {
    expect(galleryOf("sound_design")).toBe("b");
    expect(galleryOf("xr_3d")).toBe("c");
  });
});

describe("categories", () => {
  it("every category has a label, singular label, media rule, icon and tint", () => {
    for (const category of CATEGORIES) {
      expect(CATEGORY_LABELS[category]).toBeTruthy();
      expect(CATEGORY_SINGULAR[category]).toBeTruthy();
      expect(CATEGORY_MEDIA[category]).toBeTruthy();
      expect(CATEGORY_ICON[category]).toBeTruthy();
      expect(CATEGORY_TINT[category].from).toMatch(/^#[0-9a-f]{6}$/i);
      expect(CATEGORY_TINT[category].to).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it("CATEGORIES order matches the database enum order", () => {
    expect(CATEGORIES).toEqual([
      "game",
      "interactive_media",
      "xr_3d",
      "digital_art",
      "animation",
      "short_film",
      "sound_design",
    ]);
  });
});
