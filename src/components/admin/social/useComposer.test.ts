import { describe, expect, it } from "vitest";
import { CENTERED, panCrop } from "@/lib/socialPack/crop";
import { LAYOUTS } from "@/lib/socialPack/layouts";
import {
  formatCoverDate,
  packPhotoUrls,
  type PackSource,
} from "@/lib/socialPack/pack";
import { summaryFor } from "@/lib/socialPack/text";
import {
  composerReducer,
  initialComposerState,
  type ComposerState,
} from "./useComposer";

const photo = (url: string) => ({ url, width: 1600, height: 900, alt: "" });

const source: PackSource = {
  kind: "post",
  slug: "open-house",
  title: "Open House",
  summary: "",
  date: "2026-10-29T01:00:00Z",
  body: "**Come** to the open house.",
  coverImageUrl: "/cover.jpg",
  photos: [photo("/a.jpg"), photo("/b.jpg"), photo("/c.jpg")],
};

const urls = (state: ComposerState) => state.slots.map((s) => s.url);

describe("initialComposerState", () => {
  it("starts with three stacked photos and the article's text", () => {
    const state = initialComposerState(source);
    expect(state.layout).toBe("three");
    expect(urls(state)).toEqual(
      packPhotoUrls(source)
        .slice(0, 3)
        .map((p) => p.url),
    );
    expect(urls(state)).toEqual(["/cover.jpg", "/a.jpg", "/b.jpg"]);
    expect(state.slots.every((s) => s.crop === CENTERED)).toBe(true);
    expect(state.selectedSlot).toBe(0);
    expect(state.title).toBe("Open House");
    expect(state.summary).toBe(summaryFor(source.summary, source.body));
    expect(state.summary).toBe("Come to the open house.");
    expect(state.label).toBe("UPFLASH");
    expect(state.date).toBe(formatCoverDate(source.date));
  });

  it("leaves slots empty when there are fewer photos than slots", () => {
    const state = initialComposerState({
      ...source,
      coverImageUrl: null,
      photos: [photo("/a.jpg")],
    });
    expect(urls(state)).toEqual(["/a.jpg", null, null]);
  });
});

describe("togglePhoto", () => {
  it("empties the slot of a photo that is already used", () => {
    const state = composerReducer(initialComposerState(source), {
      type: "togglePhoto",
      url: "/a.jpg",
    });
    expect(urls(state)).toEqual(["/cover.jpg", null, "/b.jpg"]);
  });

  it("puts an unused photo in the first empty slot", () => {
    let state = initialComposerState(source);
    state = composerReducer(state, { type: "togglePhoto", url: "/cover.jpg" });
    state = composerReducer(state, { type: "togglePhoto", url: "/a.jpg" });
    state = composerReducer(state, { type: "togglePhoto", url: "/c.jpg" });
    expect(urls(state)).toEqual(["/c.jpg", null, "/b.jpg"]);
  });

  it("does nothing when every slot is full", () => {
    const before = initialComposerState(source);
    const after = composerReducer(before, {
      type: "togglePhoto",
      url: "/c.jpg",
    });
    expect(after).toEqual(before);
  });

  it("starts a newly placed photo centred", () => {
    let state = initialComposerState(source);
    state = composerReducer(state, { type: "zoom", factor: 2 });
    state = composerReducer(state, { type: "togglePhoto", url: "/cover.jpg" });
    state = composerReducer(state, { type: "togglePhoto", url: "/c.jpg" });
    expect(state.slots[0]).toEqual({ url: "/c.jpg", crop: CENTERED });
  });
});

describe("setLayout", () => {
  it("keeps the first two photos when going from three slots to two", () => {
    const state = composerReducer(initialComposerState(source), {
      type: "setLayout",
      layout: "two",
    });
    expect(state.layout).toBe("two");
    expect(urls(state)).toEqual(["/cover.jpg", "/a.jpg"]);
  });

  it("keeps all three photos and adds an empty slot for four", () => {
    const state = composerReducer(initialComposerState(source), {
      type: "setLayout",
      layout: "four",
    });
    expect(urls(state)).toEqual(["/cover.jpg", "/a.jpg", "/b.jpg", null]);
    expect(state.slots[3].crop).toEqual(CENTERED);
  });

  it("moves the selection to a slot that still exists", () => {
    let state = composerReducer(initialComposerState(source), {
      type: "selectSlot",
      index: 2,
    });
    state = composerReducer(state, { type: "setLayout", layout: "two" });
    expect(state.selectedSlot).toBe(1);
  });
});

describe("selectSlot", () => {
  it("ignores a slot the layout doesn't have", () => {
    const before = initialComposerState(source);
    expect(composerReducer(before, { type: "selectSlot", index: 5 })).toBe(
      before,
    );
  });
});

describe("pan", () => {
  it("only changes the selected slot's crop", () => {
    const image = { width: 1600, height: 900 };
    let state = initialComposerState(source);
    state = composerReducer(state, { type: "selectSlot", index: 1 });
    state = composerReducer(state, { type: "pan", dx: 40, dy: 0, image });
    expect(state.slots[0].crop).toEqual(CENTERED);
    expect(state.slots[2].crop).toEqual(CENTERED);
    expect(state.slots[1].crop).toEqual(
      panCrop(CENTERED, image, LAYOUTS.three.slots[1], 40, 0),
    );
    expect(state.slots[1].crop).not.toEqual(CENTERED);
  });

  it("does nothing on an empty slot", () => {
    let state = composerReducer(initialComposerState(source), {
      type: "togglePhoto",
      url: "/cover.jpg",
    });
    const before = state;
    state = composerReducer(state, {
      type: "pan",
      dx: 40,
      dy: 0,
      image: { width: 1600, height: 900 },
    });
    expect(state).toBe(before);
  });
});

describe("zoom", () => {
  it("zooms the selected slot only, within the allowed range", () => {
    let state = initialComposerState(source);
    state = composerReducer(state, { type: "zoom", factor: 2 });
    expect(state.slots[0].crop.zoom).toBe(2);
    expect(state.slots[1].crop.zoom).toBe(1);
    state = composerReducer(state, { type: "zoom", factor: 0.1 });
    expect(state.slots[0].crop.zoom).toBe(1);
  });
});

describe("setText", () => {
  it("changes one text field", () => {
    const state = composerReducer(initialComposerState(source), {
      type: "setText",
      field: "label",
      value: "EVENT",
    });
    expect(state.label).toBe("EVENT");
    expect(state.title).toBe("Open House");
  });
});
