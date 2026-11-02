/**
 * Absolute URL on the public site (cict.wvsu.edu.ph), for links from the CMS.
 * Without NEXT_PUBLIC_SITE_URL (local dev) links stay relative.
 */
export function siteUrl(path: string) {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/+$/, "");
  return `${base}${path}`;
}

/** The college was founded in 2002 (BOR Resolution No. 34). */
export const FOUNDING_YEAR = 2002;

/**
 * Whole years since founding. The school site is a static export, so the
 * number shown is the one from the last build.
 */
export function yearsOfService(today = new Date()) {
  return today.getFullYear() - FOUNDING_YEAR;
}
