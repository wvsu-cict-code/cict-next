import type { VideoOrientation } from "@/lib/cms/content";

const HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"]);
const ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

/** Extracts the video id from a YouTube watch, share, Shorts or embed link. */
export function parseYouTubeUrl(url: string): { id: string; isShort: boolean } | null {
  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    return null;
  }
  if (!HOSTS.has(parsed.hostname)) return null;

  const segments = parsed.pathname.split("/").filter(Boolean);
  let id: string | null | undefined;
  let isShort = false;
  if (parsed.hostname === "youtu.be") {
    id = segments[0];
  } else if (segments[0] === "shorts") {
    id = segments[1];
    isShort = true;
  } else if (segments[0] === "embed") {
    id = segments[1];
  } else if (segments[0] === "watch") {
    id = parsed.searchParams.get("v");
  }
  return id && ID_PATTERN.test(id) ? { id, isShort } : null;
}

/** The public YouTube page for a video. */
export function youtubeWatchUrl(id: string, orientation: VideoOrientation): string {
  return orientation === "vertical"
    ? `https://www.youtube.com/shorts/${id}`
    : `https://www.youtube.com/watch?v=${id}`;
}

/** Privacy-enhanced embed URL that autoplays inline. */
export function youtubeEmbedUrl(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1`;
}

/** YouTube-hosted thumbnail for a video. */
export function youtubeThumbnail(id: string, quality: "maxresdefault" | "hqdefault"): string {
  return `https://i.ytimg.com/vi/${id}/${quality}.jpg`;
}
