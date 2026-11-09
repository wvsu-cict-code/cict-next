export type PostState = "published" | "scheduled" | "draft";
export type PostFilter = PostState | "all";

export const POST_FILTERS: { value: PostFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "published", label: "Live" },
  { value: "scheduled", label: "Scheduled" },
  { value: "draft", label: "Drafts" },
];

export const POSTS_PER_PAGE = 20;
const MAX_QUERY = 100;

export type PostListParams = { q: string; filter: PostFilter; page: number };

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

/** Reads the list's search, filter and page from the URL, with safe defaults. */
export function parsePostListParams(raw: {
  q?: string | string[];
  status?: string | string[];
  page?: string | string[];
}): PostListParams {
  const q = (first(raw.q) ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, MAX_QUERY);
  const status = first(raw.status);
  const filter = POST_FILTERS.some((f) => f.value === status)
    ? (status as PostFilter)
    : "all";
  const page = Number.parseInt(first(raw.page) ?? "", 10);
  return { q, filter, page: Number.isFinite(page) && page > 0 ? page : 1 };
}

/** The list URL for these params, leaving out the defaults. */
export function postListHref({ q, filter, page }: PostListParams): string {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (filter !== "all") params.set("status", filter);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/admin/posts?${query}` : "/admin/posts";
}

/**
 * Folds text for searching: NFKC turns the "bold" and "italic" Unicode
 * letters often pasted from Facebook (𝗪𝗩𝗦𝗨) into plain ones, then case
 * is dropped.
 */
export function foldForSearch(text: string): string {
  return text.normalize("NFKC").toLowerCase();
}

/** The words of a search, folded; every one must match. */
export function searchWords(q: string): string[] {
  return foldForSearch(q).split(/\s+/).filter(Boolean);
}

/**
 * Whether a post matches every word of the search somewhere in its title,
 * slug or excerpt, in any order ("2026 expo" finds "Expo 2026", and a
 * hyphenated slug still matches words typed with spaces).
 */
export function matchesSearch(
  post: { title: string; slug: string; excerpt?: string | null },
  words: string[],
): boolean {
  if (words.length === 0) return true;
  const haystack = foldForSearch(
    `${post.title} ${post.slug} ${post.slug.replace(/-/g, " ")} ${post.excerpt ?? ""}`,
  );
  return words.every((word) => haystack.includes(word));
}

/** Live, scheduled (published with a future date) or draft. */
export function postState(
  post: { status: string; published_at: string | null },
  now: Date,
): PostState {
  if (post.status === "draft") return "draft";
  return post.published_at && new Date(post.published_at) > now
    ? "scheduled"
    : "published";
}

/** The number of pages for `total` items (at least 1). */
export function pageCount(total: number, perPage = POSTS_PER_PAGE): number {
  return Math.max(1, Math.ceil(total / perPage));
}

/** The first and last (inclusive) item index on a page. */
export function pageRange(page: number, perPage = POSTS_PER_PAGE) {
  const from = (page - 1) * perPage;
  return { from, to: from + perPage - 1 };
}

/**
 * Page numbers to show: always the first and last, the current one and its
 * neighbors, with "gap" where pages are skipped. Short runs are shown in
 * full rather than hiding a single page behind a gap.
 */
export function pageItems(current: number, total: number): (number | "gap")[] {
  const wanted = new Set([1, total, current - 1, current, current + 1]);
  const pages = [...wanted]
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b);
  const items: (number | "gap")[] = [];
  for (const page of pages) {
    const previous = items[items.length - 1];
    if (typeof previous === "number" && page - previous === 2)
      items.push(previous + 1);
    else if (typeof previous === "number" && page - previous > 2)
      items.push("gap");
    items.push(page);
  }
  return items;
}
