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
    kind: "art",
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
      kind: "art",
      title: "Sunrise",
      student: "Ana",
      description: "A painting",
      ...image,
      youtube_id: null,
      orientation: null,
      store_url: null,
      portfolio_url: null,
      visible: true,
    });
  });

  it("validates the basic fields", () => {
    expect(err({ title: " " })).toBe("Enter a title.");
    expect(err({ student: "" })).toBe("Enter the student's or team's name.");
    expect(err({ description: "" })).toBe("Enter a short description.");
    expect(err({ kind: "music" })).toBe("Choose a type.");
  });

  it("requires images and store links", () => {
    expect(err({ image: "" })).toBe("Upload the artwork.");
    expect(err({ kind: "game", image: "", store_url: "https://a.test" })).toBe(
      "Upload a screenshot of the game.",
    );
    const link = "Enter the link where the game is published (itch.io, Google Play, App Store…).";
    expect(err({ kind: "game" })).toBe(link);
    expect(err({ kind: "game", store_url: "ftp://a.test" })).toBe(link);
    expect(values({ kind: "game", store_url: "https://a.itch.io/g" }).store_url).toBe(
      "https://a.itch.io/g",
    );
  });

  it("parses videos", () => {
    const v = values({
      kind: "video",
      image: "",
      youtube_url: "https://youtube.com/shorts/dQw4w9WgXcQ",
    });
    expect(v).toMatchObject({ youtube_id: "dQw4w9WgXcQ", orientation: "vertical", image_url: null });
    expect(
      values({ kind: "video", image: "", youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" })
        .orientation,
    ).toBe("landscape");
    expect(
      values({
        kind: "video",
        image: "",
        youtube_url: "https://youtube.com/shorts/dQw4w9WgXcQ",
        orientation: "landscape",
      }).orientation,
    ).toBe("landscape");
    expect(err({ kind: "video", image: "", youtube_url: "nope" })).toBe(
      "Enter a YouTube link to the video.",
    );
  });

  it("keeps a video thumbnail without zoom", () => {
    const v = values({ kind: "video", youtube_url: "https://youtu.be/dQw4w9WgXcQ" });
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
      kind: "video",
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

  it("rejects malformed image uploads", () => {
    const msg = "The image upload didn't finish. Upload it again.";
    expect(err({ image: "{nope" })).toBe(msg);
    expect(err({ image: JSON.stringify({ ...image, image_width: 0 }) })).toBe(msg);
    expect(err({ image: JSON.stringify({ ...image, zoom_height: -1 }) })).toBe(msg);
  });
});
