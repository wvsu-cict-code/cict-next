import { describe, expect, it } from "vitest";
import {
  matchesSearch,
  pageCount,
  pageItems,
  pageRange,
  parsePostListParams,
  postListHref,
  postState,
  searchWords,
} from "./postList";

describe("parsePostListParams", () => {
  it("defaults to everything, page 1", () => {
    expect(parsePostListParams({})).toEqual({ q: "", filter: "all", page: 1 });
  });

  it("tidies the search and ignores unknown filters and bad pages", () => {
    expect(
      parsePostListParams({
        q: "  open   house ",
        status: "bogus",
        page: "-3",
      }),
    ).toEqual({ q: "open house", filter: "all", page: 1 });
    expect(parsePostListParams({ status: "draft", page: "4" })).toEqual({
      q: "",
      filter: "draft",
      page: 4,
    });
  });

  it("takes the first of repeated params and caps the search length", () => {
    const parsed = parsePostListParams({ q: ["a".repeat(300), "b"] });
    expect(parsed.q).toHaveLength(100);
  });
});

describe("postListHref", () => {
  it("leaves defaults out of the URL", () => {
    expect(postListHref({ q: "", filter: "all", page: 1 })).toBe(
      "/admin/posts",
    );
  });

  it("keeps the search, filter and page", () => {
    expect(postListHref({ q: "lab & tour", filter: "draft", page: 3 })).toBe(
      "/admin/posts?q=lab+%26+tour&status=draft&page=3",
    );
  });
});

describe("search", () => {
  const post = {
    title: "𝗪𝗩𝗦𝗨 𝗖𝗜𝗖𝗧 Hosts Tech Expo",
    slug: "cict-tech-expo-2026",
    excerpt: "Student projects on show.",
  };

  it("matches everything without a search", () => {
    expect(matchesSearch(post, searchWords("  "))).toBe(true);
  });

  it("finds Facebook bold letters with plain typing, in any case", () => {
    expect(matchesSearch(post, searchWords("wvsu"))).toBe(true);
    expect(matchesSearch(post, searchWords("CICT hosts"))).toBe(true);
  });

  it("needs every word, in any order, across title, slug and excerpt", () => {
    expect(matchesSearch(post, searchWords("2026 expo"))).toBe(true);
    expect(matchesSearch(post, searchWords("projects expo"))).toBe(true);
    expect(matchesSearch(post, searchWords("expo seminar"))).toBe(false);
  });

  it("treats symbols as plain text", () => {
    expect(matchesSearch(post, searchWords("50%"))).toBe(false);
    expect(matchesSearch(post, searchWords("."))).toBe(true);
  });

  it("matches slug words typed with spaces", () => {
    expect(
      matchesSearch(
        { ...post, title: "x", excerpt: null },
        searchWords("tech expo"),
      ),
    ).toBe(true);
  });
});

describe("postState", () => {
  const now = new Date("2026-11-09T00:00:00Z");

  it("tells drafts, scheduled and live posts apart", () => {
    expect(postState({ status: "draft", published_at: null }, now)).toBe(
      "draft",
    );
    expect(
      postState(
        { status: "published", published_at: "2026-12-01T00:00:00Z" },
        now,
      ),
    ).toBe("scheduled");
    expect(
      postState(
        { status: "published", published_at: "2026-01-01T00:00:00Z" },
        now,
      ),
    ).toBe("published");
    expect(postState({ status: "published", published_at: null }, now)).toBe(
      "published",
    );
  });
});

describe("paging", () => {
  it("counts pages, with at least one", () => {
    expect(pageCount(0)).toBe(1);
    expect(pageCount(20)).toBe(1);
    expect(pageCount(21)).toBe(2);
  });

  it("gives the row range for a page", () => {
    expect(pageRange(1)).toEqual({ from: 0, to: 19 });
    expect(pageRange(3)).toEqual({ from: 40, to: 59 });
  });

  it("shows ends, neighbors and gaps", () => {
    expect(pageItems(1, 1)).toEqual([1]);
    expect(pageItems(1, 4)).toEqual([1, 2, 3, 4]);
    expect(pageItems(6, 12)).toEqual([1, "gap", 5, 6, 7, "gap", 12]);
    expect(pageItems(1, 12)).toEqual([1, 2, "gap", 12]);
  });

  it("shows a single skipped page instead of a gap", () => {
    expect(pageItems(4, 12)).toEqual([1, 2, 3, 4, 5, "gap", 12]);
  });
});
