import type { ContentClient, StudentWork } from "@/lib/cms/content";
import { GALLERIES, type Category, type GalleryId } from "./categories";
import { HALL_CAPACITY } from "./limits";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function escapeIlike(value: string): string {
  return value.replace(/[%_\\]/g, (char) => `\\${char}`);
}

/**
 * ilike on title or student. `%` and `_` are matched literally.
 * Quote only when the pattern would break PostgREST `or` syntax, and
 * double backslashes inside quotes because that parser treats `\` as an escape.
 */
function searchFilter(search: string): string {
  const like = `%${escapeIlike(search)}%`;
  const value = /[,"()]/.test(like)
    ? `"${like.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`
    : like;
  return `title.ilike.${value},student.ilike.${value}`;
}

export async function fetchFeaturedWorks(
  client: ContentClient,
  limit = 12,
): Promise<StudentWork[]> {
  const { data, error } = await client
    .from("student_works")
    .select("*")
    .eq("visible", true)
    .eq("status", "approved")
    .eq("featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Failed to load featured works: ${error.message}`);
  return data ?? [];
}

export async function fetchGalleryWorks(
  client: ContentClient,
  galleryId: GalleryId,
  capacity = HALL_CAPACITY,
): Promise<StudentWork[]> {
  const gallery = GALLERIES.find((gallery) => gallery.id === galleryId);
  if (!gallery) return [];
  const { data, error } = await client
    .from("student_works")
    .select("*")
    .eq("visible", true)
    .eq("status", "approved")
    .in("category", [...gallery.categories])
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(capacity);
  if (error) throw new Error(`Failed to load gallery works: ${error.message}`);
  return data ?? [];
}

export async function fetchExhibit(
  client: ContentClient,
  id: string,
): Promise<StudentWork | null> {
  if (!UUID_RE.test(id)) return null;
  const { data, error } = await client
    .from("student_works")
    .select("*")
    .eq("id", id)
    .eq("visible", true)
    .eq("status", "approved")
    .maybeSingle();
  if (error) throw new Error(`Failed to load exhibit: ${error.message}`);
  return data;
}

export async function fetchExhibits(
  client: ContentClient,
  page: {
    offset: number;
    limit: number;
    categories?: Category[];
    search?: string;
    ids?: string[];
  },
): Promise<{ works: StudentWork[]; total: number }> {
  if (page.ids && page.ids.length === 0) return { works: [], total: 0 };
  if (page.categories && page.categories.length === 0) return { works: [], total: 0 };

  let query = client
    .from("student_works")
    .select("*", { count: "exact" })
    .eq("visible", true)
    .eq("status", "approved");

  if (page.categories) query = query.in("category", page.categories);
  if (page.ids) query = query.in("id", page.ids);
  const search = page.search?.trim();
  if (search) query = query.or(searchFilter(search));

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(page.offset, page.offset + page.limit - 1);
  if (error) throw new Error(`Failed to load exhibits: ${error.message}`);
  return { works: data ?? [], total: count ?? data?.length ?? 0 };
}

export async function fetchGalleryCounts(
  client: ContentClient,
): Promise<Record<GalleryId, number>> {
  const entries = await Promise.all(
    GALLERIES.map(async (gallery) => {
      const { count, error } = await client
        .from("student_works")
        .select("id", { count: "exact", head: true })
        .eq("visible", true)
        .eq("status", "approved")
        .in("category", [...gallery.categories]);
      if (error) throw new Error(`Failed to count gallery works: ${error.message}`);
      return [gallery.id, count ?? 0] as const;
    }),
  );
  return {
    a: 0,
    b: 0,
    c: 0,
    ...Object.fromEntries(entries),
  };
}
