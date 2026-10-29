import { describe, expect, it } from "vitest";
import {
  NEWS_PREFIX,
  PROGRAMS_PREFIX,
  segmentFromPathname,
} from "@/lib/routes";

describe("segmentFromPathname", () => {
  it("reads the slug with or without a trailing slash", () => {
    expect(
      segmentFromPathname("/news-announcements/news/icc-2025", NEWS_PREFIX),
    ).toBe("icc-2025");
    expect(
      segmentFromPathname("/news-announcements/news/icc-2025/", NEWS_PREFIX),
    ).toBe("icc-2025");
  });

  it("decodes percent-encoded characters", () => {
    expect(
      segmentFromPathname("/news-announcements/news/caf%C3%A9", NEWS_PREFIX),
    ).toBe("café");
  });

  it("returns null for the template placeholder and the bare prefix", () => {
    expect(
      segmentFromPathname("/news-announcements/news/_/", NEWS_PREFIX),
    ).toBeNull();
    expect(
      segmentFromPathname("/news-announcements/news/", NEWS_PREFIX),
    ).toBeNull();
  });

  it("requires exactly one segment after the prefix", () => {
    expect(segmentFromPathname("/programs/bscs", PROGRAMS_PREFIX)).toBe("bscs");
    expect(
      segmentFromPathname("/programs/bscs/extra", PROGRAMS_PREFIX),
    ).toBeNull();
  });

  it("returns null for malformed encoding", () => {
    expect(
      segmentFromPathname("/news-announcements/news/%E0%A4%A", NEWS_PREFIX),
    ).toBeNull();
  });

  it("returns null for a path under a different prefix", () => {
    expect(segmentFromPathname("/programs/bscs", NEWS_PREFIX)).toBeNull();
  });
});
