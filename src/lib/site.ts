/**
 * Absolute URL on the public site (cict.wvsu.edu.ph), for links from the CMS.
 * Without NEXT_PUBLIC_SITE_URL (local dev) links stay relative.
 */
export function siteUrl(path: string) {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/+$/, "");
  return `${base}${path}`;
}
