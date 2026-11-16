import { eventHref } from "@/lib/events";
import { formatDate } from "@/lib/format";
import { newsHref } from "@/lib/news";
import type { Photo } from "@/lib/photos";
import { SITE_URL } from "@/lib/seo";
import { markdownToPlain } from "./text";

export type PackSource = {
  kind: "post" | "event";
  slug: string;
  title: string;
  summary: string;
  date: string;
  body: string;
  coverImageUrl: string | null;
  photos: Photo[];
};

const COVER_HALVES = 2;
const MIN_IMAGES = 5;

/** The cover image first, then the gallery photos, without repeats. */
export function packPhotoUrls(
  source: PackSource,
): { url: string; alt: string }[] {
  const out: { url: string; alt: string }[] = [];
  const seen = new Set<string>();
  const add = (url: string, alt: string) => {
    if (seen.has(url)) return;
    seen.add(url);
    out.push({ url, alt });
  };
  if (source.coverImageUrl) {
    const match = source.photos.find((p) => p.url === source.coverImageUrl);
    add(source.coverImageUrl, match?.alt ?? "");
  }
  for (const p of source.photos) add(p.url, p.alt);
  return out;
}

/** Two cover halves, then one file per photo. */
export function fileNames(photoCount: number): string[] {
  return Array.from(
    { length: photoCount + COVER_HALVES },
    (_, i) => `${String(i + 1).padStart(2, "0")}.jpg`,
  );
}

export function zipName(slug: string): string {
  return `${slug}.zip`;
}

export function captionText(source: PackSource): string {
  const body = markdownToPlain(source.body) || source.summary.trim();
  const path =
    source.kind === "post" ? newsHref(source.slug) : eventHref(source.slug);
  return [source.title, body, `${SITE_URL}${path}/`]
    .filter(Boolean)
    .join("\n\n");
}

export function fewImagesWarning(photoCount: number): string | null {
  return photoCount + COVER_HALVES < MIN_IMAGES
    ? "This pack has fewer than 5 images, so Facebook may not stack the two cover halves into one tall picture."
    : null;
}

export function formatCoverDate(iso: string): string {
  return formatDate(iso);
}

/**
 * A warning for an item the public can't see yet, since the link in its
 * caption won't work until it is live; null when it is already visible.
 */
export function notLiveNotice(
  item: { status: string; publishedAt: string | null },
  now = new Date(),
): string | null {
  if (item.status !== "published") {
    return "This is still a draft, so the link in the caption won't work until you publish it.";
  }
  if (item.publishedAt && new Date(item.publishedAt) > now) {
    return "This is scheduled for later, so the link in the caption won't work until it goes live.";
  }
  return null;
}
