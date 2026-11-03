import { strFromU8, unzipSync } from "fflate";
import { describe, expect, it } from "vitest";
import { buildPack, type Renderer } from "./build";
import type { CoverInput, LoadedImage } from "./draw";
import { captionText, type PackSource } from "./pack";

const source: PackSource = {
  kind: "post",
  slug: "open-house",
  title: "Open House",
  summary: "A summary",
  date: "2026-10-29T01:00:00Z",
  body: "# Heading\n\n**Bold** text",
  coverImageUrl: null,
  photos: [],
};

const cover: CoverInput = {
  layout: "three",
  slots: [],
  title: "Open House",
  label: "UPFLASH",
  date: "October 29, 2026",
  summary: "A summary",
  logos: [],
};

const image = (url: string): LoadedImage => ({
  url,
  image: {} as CanvasImageSource,
  width: 10,
  height: 10,
});

const blob = (text: string) => new Blob([text], { type: "image/jpeg" });

function fakeRenderer(failing: string[] = []): Renderer {
  return {
    cover: async () => [blob("cover-top"), blob("cover-bottom")],
    square: async (img) => {
      if (failing.includes(img.url)) {
        throw new DOMException("x", "SecurityError");
      }
      return blob(`square ${img.url}`);
    },
  };
}

async function entries(photos: LoadedImage[], render: Renderer) {
  const result = await buildPack({ source, cover, photos }, render);
  const files = unzipSync(result.zip);
  const text = Object.fromEntries(
    Object.entries(files).map(([name, data]) => [name, strFromU8(data)]),
  );
  return { text, skipped: result.skipped };
}

describe("buildPack", () => {
  it("zips the two cover halves, each photo and the caption", async () => {
    const photos = ["/a.jpg", "/b.jpg", "/c.jpg"].map(image);
    const { text, skipped } = await entries(photos, fakeRenderer());
    expect(Object.keys(text).sort()).toEqual([
      "01.jpg",
      "02.jpg",
      "03.jpg",
      "04.jpg",
      "05.jpg",
      "caption.txt",
    ]);
    expect(text["01.jpg"]).toBe("cover-top");
    expect(text["02.jpg"]).toBe("cover-bottom");
    expect(text["03.jpg"]).toBe("square /a.jpg");
    expect(text["05.jpg"]).toBe("square /c.jpg");
    expect(text["caption.txt"]).toBe(captionText(source));
    expect(skipped).toEqual([]);
  });

  it("leaves out a photo that taints the canvas and keeps numbering continuous", async () => {
    const photos = ["/a.jpg", "https://elsewhere.test/b.jpg", "/c.jpg"].map(
      image,
    );
    const { text, skipped } = await entries(
      photos,
      fakeRenderer(["https://elsewhere.test/b.jpg"]),
    );
    expect(Object.keys(text).sort()).toEqual([
      "01.jpg",
      "02.jpg",
      "03.jpg",
      "04.jpg",
      "caption.txt",
    ]);
    expect(text["03.jpg"]).toBe("square /a.jpg");
    expect(text["04.jpg"]).toBe("square /c.jpg");
    expect(skipped).toEqual(["https://elsewhere.test/b.jpg"]);
  });

  it("still exports the cover and caption with no photos", async () => {
    const { text } = await entries([], fakeRenderer());
    expect(Object.keys(text).sort()).toEqual([
      "01.jpg",
      "02.jpg",
      "caption.txt",
    ]);
  });

  it("does not swallow other rendering errors", async () => {
    const render: Renderer = {
      ...fakeRenderer(),
      square: async () => {
        throw new Error("boom");
      },
    };
    await expect(
      buildPack({ source, cover, photos: [image("/a.jpg")] }, render),
    ).rejects.toThrow("boom");
  });
});
