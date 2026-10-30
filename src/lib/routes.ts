/**
 * The school site exports one template page per detail section under this
 * segment (e.g. /programs/_/), and .htaccess rewrites every slug to it.
 * Slugs and IDs can't contain "_", so it never clashes with real content.
 */
export const PLACEHOLDER_SEGMENT = "_";

export const NEWS_PREFIX = "/news-announcements/news";
export const PROGRAMS_PREFIX = "/programs";
export const FACULTY_PREFIX = "/faculty-profiles";

/**
 * Reads the slug/ID from a detail page's URL. Detail pages read it from the
 * address bar, not route params, because the params are always the
 * placeholder. Returns null when there is no single, valid segment.
 */
export function segmentFromPathname(pathname: string, prefix: string) {
  if (!pathname.startsWith(`${prefix}/`)) return null;

  const segments = pathname
    .slice(prefix.length + 1)
    .split("/")
    .filter(Boolean);
  if (segments.length !== 1 || segments[0] === PLACEHOLDER_SEGMENT) {
    return null;
  }

  try {
    return decodeURIComponent(segments[0]);
  } catch {
    return null;
  }
}
