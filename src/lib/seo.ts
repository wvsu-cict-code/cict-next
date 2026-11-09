import type { Metadata } from "next";

const SCHOOL_SITE_URL = "https://cict.wvsu.edu.ph";

/**
 * The public site's address; share links, canonical URLs and the share image
 * point here.
 * - NEXT_PUBLIC_SITE_URL when it's set.
 * - The school site build: the school domain.
 * - A Vercel deployment without NEXT_PUBLIC_SITE_URL serves the public pages
 *   itself (see routeAccess), so it points at its own production domain.
 *   Otherwise Facebook follows og:url to a site that may not be up yet and
 *   the share preview breaks.
 */
export function resolveSiteUrl(env: Record<string, string | undefined>) {
  const vercelDomain = env.VERCEL_PROJECT_PRODUCTION_URL;
  const url =
    env.NEXT_PUBLIC_SITE_URL ||
    (env.BUILD_TARGET !== "site" && vercelDomain
      ? `https://${vercelDomain}`
      : SCHOOL_SITE_URL);
  return url.replace(/\/+$/, "");
}

export const SITE_URL = resolveSiteUrl(process.env);

export const SITE_NAME = "WVSU CICT";

export const SITE_TITLE =
  "WVSU CICT | College of Information and Communications Technology";

export const SITE_DESCRIPTION =
  "West Visayas State University's College of ICT in Iloilo City: degree programs in computer science, IT, information systems, library science, and multimedia computing.";

export const SITE_KEYWORDS = [
  "WVSU CICT",
  "West Visayas State University",
  "College of Information and Communications Technology",
  "Iloilo City",
  "computer science",
  "information technology",
  "information systems",
  "library and information science",
  "entertainment and multimedia computing",
];

/**
 * The picture shown when a page is shared on social media or in chat apps:
 * the site's default photo (`/home-page_assets/featured-card-image.png`)
 * cropped to 1200×630 (1.91:1) so Facebook, X and LinkedIn show it as a large
 * card without cropping. JPEG because not every link-preview crawler reads
 * WebP.
 */
export const SHARE_IMAGE = {
  url: "/og-image.jpg",
  width: 1200,
  height: 630,
  type: "image/jpeg",
  alt: "The College of Information and Communications Technology building at West Visayas State University",
};

/**
 * Canonical URL plus Open Graph and Twitter tags for one page. Without a
 * `path` (the site-wide defaults) there's no canonical or share URL, so
 * pages that don't set their own never claim to be another page.
 *
 * Next replaces a parent's `openGraph`/`twitter` instead of merging into it,
 * so a page that sets its own share title would otherwise lose the share
 * image and site name. Every page that sets them goes through this.
 */
export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path?: string;
}): Pick<Metadata, "description" | "alternates" | "openGraph" | "twitter"> {
  return {
    description,
    ...(path ? { alternates: { canonical: path } } : {}),
    openGraph: {
      type: "website",
      locale: "en_PH",
      siteName: SITE_NAME,
      ...(path ? { url: path } : {}),
      title,
      description,
      images: [SHARE_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [SHARE_IMAGE],
    },
  };
}
