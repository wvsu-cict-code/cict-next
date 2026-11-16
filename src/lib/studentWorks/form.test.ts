import { describe, expect, it } from "vitest";
import { parseStudentWork } from "@/lib/studentWorks/form";

const image = {
  image_url: "https://x.test/a.webp",
  image_width: 800,
  image_height: 600,
  zoom_url: "https://x.test/z.webp",
  zoom_width: 2000,
  zoom_height: 1500,
  original_url: "https://x.test/o.png",
};

function form(fields: Record<string, string>) {
  const data = new FormData();
  const base: Record<string, string> = {
    category: "digital_art",
    title: "  Sunrise ",
    student: " Ana ",
    description: " A painting ",
    image: JSON.stringify(image),
    visible: "on",
  };
  for (const [k, v] of Object.entries({ ...base, ...fields })) data.set(k, v);
  return data;
}

function values(fields: Record<string, string>) {
  const result = parseStudentWork(form(fields));
  if ("error" in result) throw new Error(result.error);
  return result.values;
}

const err = (fields: Record<string, string>) =>
  (parseStudentWork(form(fields)) as { error: string }).error;

describe("parseStudentWork", () => {
  it("parses a valid art work", () => {
    expect(values({})).toMatchObject({
      category: "digital_art",
      title: "Sunrise",
      student: "Ana",
      description: "A painting",
      ...image,
      youtube_id: null,
      orientation: null,
      store_url: null,
      portfolio_url: null,
      visible: true,
      featured: false,
    });
  });

  it("reads the featured checkbox", () => {
    expect(values({ featured: "on" }).featured).toBe(true);
  });

  it("validates the basic fields", () => {
    expect(err({ title: " " })).toBe("Enter a title.");
    expect(err({ student: "" })).toBe("Enter the student's or team's name.");
    expect(err({ description: "" })).toBe("Enter a short description.");
    expect(err({ category: "music" })).toBe("Choose a category.");
    // Sound design comes only from student submissions
    expect(err({ category: "sound_design" })).toBe("Choose a category.");
  });

  it("requires images and store links", () => {
    expect(err({ image: "" })).toBe("Upload the artwork.");
    expect(err({ category: "game", image: "", store_url: "https://a.test" })).toBe(
      "Upload a screenshot or cover image.",
    );
    const link = "Enter the link where the work is published (itch.io, Google Play, App Store…).";
    expect(err({ category: "game" })).toBe(link);
    expect(err({ category: "game", store_url: "ftp://a.test" })).toBe(link);
    expect(values({ category: "game", store_url: "https://a.itch.io/g" }).store_url).toBe(
      "https://a.itch.io/g",
    );
    expect(err({ category: "xr_3d", store_url: "" })).toBe(link);
    expect(values({ category: "interactive_media", store_url: "https://a.test/p" })).toMatchObject({
      category: "interactive_media",
      store_url: "https://a.test/p",
    });
  });

  it("keeps an uploaded webm when the form has no YouTube link", () => {
    const result = parseStudentWork(
      form({
        category: "animation",
        youtube_url: "",
        orientation: "vertical",
        featured: "on",
      }),
      { video_url: "https://cdn.test/clip.webm", orientation: "vertical" },
    );
    expect(result).toMatchObject({
      values: {
        category: "animation",
        featured: true,
        youtube_id: null,
        orientation: "vertical",
        image_url: image.image_url,
      },
    });
  });

  it("allows saving an existing sound design work", () => {
    const result = parseStudentWork(form({ category: "sound_design" }), {
      category: "sound_design",
      audio_url: "https://cdn.test/track.webm",
    });
    expect(result).toMatchObject({
      values: { category: "sound_design", youtube_id: null, store_url: null },
    });
  });

  it("parses videos", () => {
    const v = values({
      category: "short_film",
      image: "",
      youtube_url: "https://youtube.com/shorts/dQw4w9WgXcQ",
    });
    expect(v).toMatchObject({ youtube_id: "dQw4w9WgXcQ", orientation: "vertical", image_url: null });
    expect(
      values({ category: "short_film", image: "", youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" })
        .orientation,
    ).toBe("landscape");
    expect(
      values({
        category: "short_film",
        image: "",
        youtube_url: "https://youtube.com/shorts/dQw4w9WgXcQ",
        orientation: "landscape",
      }).orientation,
    ).toBe("landscape");
    expect(
      values({ category: "animation", image: "", youtube_url: "https://youtu.be/dQw4w9WgXcQ" }),
    ).toMatchObject({ category: "animation", youtube_id: "dQw4w9WgXcQ" });
    expect(err({ category: "short_film", image: "", youtube_url: "nope" })).toBe(
      "Enter a YouTube link to the video.",
    );
  });

  it("keeps a video thumbnail without zoom", () => {
    const v = values({ category: "short_film", youtube_url: "https://youtu.be/dQw4w9WgXcQ" });
    expect(v).toMatchObject({
      image_url: image.image_url,
      image_width: 800,
      image_height: 600,
      zoom_url: null,
      zoom_width: null,
      zoom_height: null,
    });
  });

  it("keeps a game screenshot without zoom", () => {
    const v = values({ category: "game", store_url: "https://a.itch.io/g" });
    expect(v).toMatchObject({
      image_url: image.image_url,
      image_width: 800,
      image_height: 600,
      zoom_url: null,
      zoom_width: null,
      zoom_height: null,
    });
  });

  it("drops fields that don't belong to the chosen type", () => {
    const v = values({
      category: "short_film",
      store_url: "https://a.test",
      youtube_url: "https://youtu.be/dQw4w9WgXcQ",
    });
    expect(v.store_url).toBeNull();
    expect(values({ youtube_url: "https://youtu.be/dQw4w9WgXcQ" }).youtube_id).toBeNull();
  });

  it("validates the portfolio link", () => {
    expect(err({ portfolio_url: "javascript:alert(1)" })).toBe(
      "The portfolio link must start with http:// or https://.",
    );
    expect(values({ portfolio_url: " " }).portfolio_url).toBeNull();
    expect(values({ portfolio_url: "https://me.test" }).portfolio_url).toBe("https://me.test");
  });

  it("treats a missing checkbox as hidden", () => {
    const data = form({});
    data.delete("visible");
    expect(parseStudentWork(data)).toMatchObject({ values: { visible: false } });
  });

  it("stores a blank original as null", () => {
    expect(
      values({ image: JSON.stringify({ ...image, original_url: "" }) }).original_url,
    ).toBeNull();
  });

  it("rejects malformed image uploads", () => {
    const msg = "The image upload didn't finish. Upload it again.";
    expect(err({ image: "{nope" })).toBe(msg);
    expect(err({ image: JSON.stringify({ ...image, image_width: 0 }) })).toBe(msg);
    expect(err({ image: JSON.stringify({ ...image, zoom_height: -1 }) })).toBe(msg);
  });
});
