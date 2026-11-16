// Dates are always shown in Philippine time so server and client renders match.
const TIME_ZONE = "Asia/Manila";

export function formatDate(value: string | Date | null | undefined) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: TIME_ZONE,
  });
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function timeAgo(
  value: string | Date | null | undefined,
  now = new Date(),
) {
  if (!value) return "";
  const days = Math.floor(
    (now.getTime() - new Date(value).getTime()) / (1000 * 60 * 60 * 24),
  );
  if (days <= 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  return formatDate(value);
}

const MB = 1024 ** 2;
const GB = 1024 ** 3;

/** Formats a byte count for the CMS storage card (binary units). */
export function formatBytes(bytes: number): string {
  if (bytes >= GB) {
    const value = bytes / GB;
    const text = Number.isInteger(value) ? String(value) : value.toFixed(1);
    return `${text} GB`;
  }
  return `${Math.round(bytes / MB)} MB`;
}
