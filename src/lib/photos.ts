export type Photo = { url: string; width: number; height: number; alt: string };

export const MAX_PHOTOS = 60;

const URL_RE = /^(https?:\/\/|\/)/i;

function isPositiveInt(n: unknown): n is number {
  return typeof n === "number" && Number.isInteger(n) && n > 0;
}

/** Parse a gallery from a JSON string or array, keeping only well-formed photos. */
export function parsePhotos(raw: unknown): Photo[] {
  let value = raw;
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(value)) return [];

  const photos: Photo[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const { url, width, height, alt } = item as Record<string, unknown>;
    if (typeof url !== "string" || !URL_RE.test(url)) continue;
    if (!isPositiveInt(width) || !isPositiveInt(height)) continue;
    photos.push({ url, width, height, alt: typeof alt === "string" ? alt.trim() : "" });
    if (photos.length === MAX_PHOTOS) break;
  }
  return photos;
}
