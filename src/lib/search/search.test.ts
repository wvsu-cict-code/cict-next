import { describe, expect, it } from "vitest";
import {
  buildSearchHits,
  searchHits,
  searchPreview,
  type SearchHit,
} from "@/lib/search/search";

const hits = buildSearchHits({
  events: [
    {
      slug: "hackathon-2026",
      title: "CICT Hackathon 2026",
      summary: "A weekend of building.",
      body: "Teams build apps for local government.",
      location: "CICT Building, Room 301",
      starts_at: "2026-11-14T01:00:00.000Z",
      ends_at: null,
      all_day: false,
    },
  ],
  posts: [
    {
      slug: "icc-2025",
      title: "WVSU-CICT Presents Tech Solutions at ICC 2025 in Taiwan",
      excerpt: "Students presented projects in Taipei.",
      body: "The college joined the conference.",
      category: "news",
    },
  ],
  programs: [
    {
      id: "bsit",
      code: "BSIT",
      name: "Bachelor of Science in Information Technology",
      description: "CMS description",
      objectives: "Prepare IT professionals.",
    },
    {
      id: "mit",
      code: "MIT",
      name: "Master in Information Technology",
      description: "A postgraduate program for IT educators.",
      objectives: "Advanced information technology.",
    },
  ],
  departments: [
    {
      slug: "deans-office",
      name: "Dean's Office",
      faculty: [
        {
          id: "dean",
          name: "DR. MA. BETH S. CONCEPCION",
          title: "College Dean",
          description: "Teaches information technology in the college.",
        },
      ],
    },
  ],
});

const titles = (query: string) =>
  searchHits(hits, query).map((hit) => hit.title);

describe("searchHits", () => {
  it("finds a program from a brochure subject", () => {
    expect(titles("penetration testing")).toContain(
      "Bachelor of Science in Information Technology",
    );
  });

  it("finds an article, a faculty member, and the contact page", () => {
    expect(titles("taiwan")[0]).toBe(
      "WVSU-CICT Presents Tech Solutions at ICC 2025 in Taiwan",
    );
    expect(titles("concepcion")[0]).toBe("DR. MA. BETH S. CONCEPCION");
    expect(titles("admission").map((title) => title)).toContain("Contact");
  });

  it("finds an event by its location and links to its page", () => {
    const [event] = searchHits(hits, "room 301");
    expect(event.kind).toBe("Event");
    expect(event.href).toBe("/events/hackathon-2026");
    expect(event.detail).toContain("November 14, 2026");
  });

  it("finds the admissions page", () => {
    expect(titles("how to apply")).toContain("Admissions");
  });

  it("requires every content word and ignores filler words", () => {
    expect(titles("taiwan office")).toEqual([]);
    expect(titles("a")).toEqual([]);
    expect(titles("the")).toEqual([]);
    expect(titles("")).toEqual([]);
    expect(titles("about the college")).toContain("About");
    const about = searchHits(hits, "about the college").find(
      (hit) => hit.title === "About",
    );
    const preview = searchPreview(about!, "about the college");
    expect(preview).toContain("College of Information");
    expect(preview).not.toMatch(/(^|\s)ounded/);
  });

  it("ranks a title match ahead of a passing mention", () => {
    const ordered = searchHits(hits, "information technology").map(
      (hit: SearchHit) => hit.title,
    );
    const program = ordered.indexOf(
      "Bachelor of Science in Information Technology",
    );
    const dean = ordered.indexOf("DR. MA. BETH S. CONCEPCION");
    expect(program).toBeGreaterThanOrEqual(0);
    expect(dean).toBeGreaterThan(program);
  });
});
