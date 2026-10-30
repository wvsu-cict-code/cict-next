import { describe, expect, it } from "vitest";
import {
  SITEMAP_PAGES,
  robotsTxt,
  sitemapEntries,
  sitemapXml,
} from "@/lib/sitemap";

describe("sitemapEntries", () => {
  const entries = sitemapEntries("https://cict.wvsu.edu.ph", {
    posts: [{ slug: "open-house", updated_at: "2026-10-01T00:00:00Z" }],
    events: [{ slug: "hackathon", updated_at: "2026-10-02T00:00:00Z" }],
    programs: [{ id: "bscs", updated_at: "2026-09-01T00:00:00Z" }],
    departments: [{ slug: "deans-office", updated_at: "2026-08-01T00:00:00Z" }],
  });
  const urls = entries.map((entry) => entry.url);

  it("lists every section page with the school site's trailing slash", () => {
    expect(urls.slice(0, SITEMAP_PAGES.length)).toEqual([
      "https://cict.wvsu.edu.ph/",
      "https://cict.wvsu.edu.ph/programs/",
      "https://cict.wvsu.edu.ph/admissions/",
      "https://cict.wvsu.edu.ph/news-announcements/",
      "https://cict.wvsu.edu.ph/events/",
      "https://cict.wvsu.edu.ph/faculty-profiles/",
      "https://cict.wvsu.edu.ph/about/",
      "https://cict.wvsu.edu.ph/contact/",
    ]);
  });

  it("lists posts, events, programs and departments with their last edit", () => {
    expect(entries).toContainEqual({
      url: "https://cict.wvsu.edu.ph/news-announcements/news/open-house/",
      lastModified: "2026-10-01T00:00:00Z",
    });
    expect(urls).toContain("https://cict.wvsu.edu.ph/events/hackathon/");
    expect(urls).toContain("https://cict.wvsu.edu.ph/programs/bscs/");
    expect(urls).toContain(
      "https://cict.wvsu.edu.ph/faculty-profiles/deans-office/",
    );
  });

  it("leaves out search results", () => {
    expect(urls.some((url) => url.includes("/search"))).toBe(false);
  });
});

describe("sitemapXml", () => {
  it("writes each entry as a <url>, escaping special characters", () => {
    const xml = sitemapXml([
      { url: "https://cict.wvsu.edu.ph/" },
      {
        url: "https://cict.wvsu.edu.ph/events/a&b/",
        lastModified: "2026-10-02T00:00:00Z",
      },
    ]);
    expect(xml).toContain(
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    );
    expect(xml).toContain("<url><loc>https://cict.wvsu.edu.ph/</loc></url>");
    expect(xml).toContain(
      "<url><loc>https://cict.wvsu.edu.ph/events/a&amp;b/</loc><lastmod>2026-10-02T00:00:00Z</lastmod></url>",
    );
  });
});

describe("robotsTxt", () => {
  it("lets search engines index the school site and points them to the sitemap", () => {
    const robots = robotsTxt("https://cict.wvsu.edu.ph", true);
    expect(robots).toContain("Allow: /");
    expect(robots).toContain("Disallow: /search/");
    expect(robots).toContain("Sitemap: https://cict.wvsu.edu.ph/sitemap.xml");
  });

  it("keeps the CMS deployment out of search engines", () => {
    expect(robotsTxt("https://cict.wvsu.edu.ph", false)).toBe(
      "User-agent: *\nDisallow: /\n",
    );
  });
});
