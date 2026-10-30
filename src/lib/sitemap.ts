import {
  EVENTS_PREFIX,
  FACULTY_PREFIX,
  NEWS_PREFIX,
  PROGRAMS_PREFIX,
} from "@/lib/routes";

/** Section pages listed in the sitemap. Search results are left out. */
export const SITEMAP_PAGES = [
  "/",
  "/programs",
  "/admissions",
  "/news-announcements",
  "/events",
  "/faculty-profiles",
  "/about",
  "/contact",
];

type Dated = { updated_at: string };

export type SitemapEntry = { url: string; lastModified?: string };

/**
 * Sitemap entries for the school site. Its URLs end in a slash (static
 * export with trailingSlash), so every path here does too.
 */
export function sitemapEntries(
  siteUrl: string,
  content: {
    posts: (Dated & { slug: string })[];
    events: (Dated & { slug: string })[];
    programs: (Dated & { id: string })[];
    departments: (Dated & { slug: string })[];
  },
): SitemapEntry[] {
  const url = (path: string) =>
    `${siteUrl}${path.endsWith("/") ? path : `${path}/`}`;
  const item = (path: string, updatedAt: string) => ({
    url: url(path),
    lastModified: updatedAt,
  });

  return [
    ...SITEMAP_PAGES.map((path) => ({ url: url(path) })),
    ...content.programs.map((p) =>
      item(`${PROGRAMS_PREFIX}/${p.id}`, p.updated_at),
    ),
    ...content.posts.map((p) => item(`${NEWS_PREFIX}/${p.slug}`, p.updated_at)),
    ...content.events.map((e) =>
      item(`${EVENTS_PREFIX}/${e.slug}`, e.updated_at),
    ),
    ...content.departments.map((d) =>
      item(`${FACULTY_PREFIX}/${d.slug}`, d.updated_at),
    ),
  ];
}

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

/** The sitemap.xml document for a list of entries. */
export function sitemapXml(entries: SitemapEntry[]) {
  const urls = entries.map((entry) => {
    const lastmod = entry.lastModified
      ? `<lastmod>${escapeXml(entry.lastModified)}</lastmod>`
      : "";
    return `<url><loc>${escapeXml(entry.url)}</loc>${lastmod}</url>`;
  });
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    "</urlset>",
    "",
  ].join("\n");
}

/**
 * robots.txt. The school site is indexed (search results aside); the CMS
 * deployment never is.
 */
export function robotsTxt(siteUrl: string, isSchoolSite: boolean) {
  if (!isSchoolSite) return "User-agent: *\nDisallow: /\n";
  return [
    "User-agent: *",
    "Allow: /",
    "Disallow: /search/",
    "",
    `Sitemap: ${siteUrl}/sitemap.xml`,
    "",
  ].join("\n");
}
