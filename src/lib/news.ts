import { formatDate } from "@/lib/format";
import type { Tables } from "@/lib/supabase/database.types";

/** Post data in the shape the news and announcement components render. */
export interface NewsArticle {
  id: string;
  slug: string;
  imgSrc?: string;
  /** Display date, e.g. "February 1, 2026" */
  date: string;
  /** ISO timestamp, used for sorting and relative dates */
  publishedAt: string;
  newsHeader: string;
  description?: string;
  category: Tables<"posts">["category"];
  /** Sustainable Development Goal numbers the post supports */
  sdgs: number[];
}

export function toNewsArticle(post: Tables<"posts">): NewsArticle {
  return {
    id: post.id,
    slug: post.slug,
    imgSrc: post.cover_image_url || undefined,
    date: formatDate(post.published_at),
    publishedAt: post.published_at ?? post.created_at,
    newsHeader: post.title,
    description: post.excerpt || undefined,
    category: post.category,
    // Rows saved before the sdgs column existed don't have it
    sdgs: post.sdgs ?? [],
  };
}

export function newsHref(slug: string) {
  return `/news-announcements/news/${slug}`;
}
