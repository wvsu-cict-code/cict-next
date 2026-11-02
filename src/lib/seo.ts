import type { Metadata } from "next";

/** The public site's address; share links and canonical URLs point here. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://cict.wvsu.edu.ph"
).replace(/\/+$/, "");

export const SITE_NAME = "WVSU CICT";

export const SITE_TITLE =
  "WVSU CICT | College of Information and Communications Technology";

export const SITE_DESCRIPTION =
  "West Visayas State University's College of ICT in Iloilo City: degree programs in computer science, IT, information systems, library science, and multimedia computing.";

/** The picture shown when a page is shared on social media or in chat apps. */
export const SHARE_IMAGE = {
  url: "/program_assets/cict.webp",
  width: 968,
  height: 642,
  type: "image/webp",
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
