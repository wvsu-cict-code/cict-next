import { describe, expect, it } from "vitest";
import { eventHref } from "@/lib/events";
import { newsHref } from "@/lib/news";
import { SITE_URL } from "@/lib/seo";
import {
  captionText,
  fewImagesWarning,
  fileNames,
  formatCoverDate,
  packPhotoUrls,
  zipName,
  type PackSource,
} from "./pack";

const photo = (url: string) => ({
  url,
  width: 10,
  height: 10,
  alt: `alt ${url}`,
});
const base: PackSource = {
  kind: "post",
  slug: "open-house",
  title: "Open House",
  summary: "A summary",
  date: "2026-10-29T01:00:00Z",
  body: "# Heading\n\n**Bold** text",
  coverImageUrl: null,
  photos: [],
};

describe("packPhotoUrls", () => {
  it("puts the cover first and drops duplicates", () => {
    const urls = packPhotoUrls({
      ...base,
      coverImageUrl: "/c.jpg",
      photos: [photo("/a.jpg"), photo("/c.jpg")],
    });
    expect(urls.map((u) => u.url)).toEqual(["/c.jpg", "/a.jpg"]);
    expect(urls[0].alt).toBe("alt /c.jpg");
  });
  it("is empty with nothing", () => {
    expect(packPhotoUrls(base)).toEqual([]);
  });
});

describe("names", () => {
  it("numbers the two cover halves and each photo", () => {
    expect(fileNames(3)).toEqual([
      "01.jpg",
      "02.jpg",
      "03.jpg",
      "04.jpg",
      "05.jpg",
    ]);
  });
  it("names the zip", () => {
    expect(zipName("open-house")).toBe("open-house.zip");
  });
});

describe("captionText", () => {
  it("builds a post caption with a trailing-slash link", () => {
    expect(captionText(base)).toBe(
      `Open House\n\nHeading\n\nBold text\n\n${SITE_URL}${newsHref("open-house")}/`,
    );
  });
  it("uses the event link for events", () => {
    expect(
      captionText({ ...base, kind: "event" }).endsWith(
        `${SITE_URL}${eventHref("open-house")}/`,
      ),
    ).toBe(true);
  });
  it("falls back to the summary without a body", () => {
    expect(captionText({ ...base, body: "  " })).toBe(
      `Open House\n\nA summary\n\n${SITE_URL}${newsHref("open-house")}/`,
    );
  });
});

describe("fewImagesWarning", () => {
  it("warns under five images in total", () => {
    expect(fewImagesWarning(2)).toContain("fewer than 5");
    expect(fewImagesWarning(3)).toBeNull();
  });
});

describe("formatCoverDate", () => {
  it("uses Manila time", () => {
    expect(formatCoverDate("2026-10-29T01:00:00Z")).toBe("October 29, 2026");
    expect(formatCoverDate("2026-10-28T20:00:00Z")).toBe("October 29, 2026");
  });
});
