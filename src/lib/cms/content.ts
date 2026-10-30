import type { SupabaseClient } from "@supabase/supabase-js";
import { formatDate } from "@/lib/format";
import { toDepartment, toFacultyMember } from "@/lib/faculty";
import type { Database, Enums, Tables } from "@/lib/supabase/database.types";

export type Post = Tables<"posts">;
export type Program = Tables<"programs">;
export type PostCategory = Enums<"post_category">;
export type SiteSettings = Tables<"site_settings">;
export type ContentClient = SupabaseClient<Database>;

// Content queries shared by the public site (run in the browser) and the CMS.
// Each takes the client to use: anonymous on the school site, the admin's
// session on the CMS deployment. RLS decides what each one can read.

/**
 * Posts visitors can see. The filters repeat what RLS already enforces for
 * anonymous visitors, so a signed-in admin previewing on the CMS deployment
 * doesn't get drafts or scheduled posts mixed into lists.
 */
export async function fetchPublishedPosts(
  client: ContentClient,
  options: { category?: PostCategory; limit?: number } = {},
) {
  let query = client
    .from("posts")
    .select("*")
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false });

  if (options.category) query = query.eq("category", options.category);
  if (options.limit) query = query.limit(options.limit);

  const { data, error } = await query;
  if (error) throw new Error(`Failed to load posts: ${error.message}`);
  return data;
}

/** Featured post for the home page: the newest post flagged as featured. */
export async function fetchFeaturedPost(client: ContentClient) {
  const { data, error } = await client
    .from("posts")
    .select("*")
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .eq("is_featured", true)
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`Failed to load featured post: ${error.message}`);
  return data;
}

/**
 * Looks up a post by slug. There's no status filter: RLS only returns drafts
 * to admins, which is how CMS previews work.
 */
export async function fetchPostBySlug(client: ContentClient, slug: string) {
  const { data, error } = await client
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(`Failed to load post: ${error.message}`);
  return data;
}

/**
 * The CMS's site switches. Null when the settings table hasn't been created
 * yet (its migration not applied), so the site behaves as if every switch
 * is off instead of failing.
 */
export async function fetchSiteSettings(
  client: ContentClient,
): Promise<SiteSettings | null> {
  const { data, error } = await client
    .from("site_settings")
    .select("*")
    .eq("id", true)
    .maybeSingle();

  if (error) {
    // PGRST205: table missing from the schema cache; 42P01: undefined table
    if (error.code === "PGRST205" || error.code === "42P01") return null;
    throw new Error(`Failed to load site settings: ${error.message}`);
  }
  return data;
}

export async function fetchPrograms(client: ContentClient) {
  const { data, error } = await client
    .from("programs")
    .select("*")
    .order("sort_order")
    .order("code");

  if (error) throw new Error(`Failed to load programs: ${error.message}`);
  return data;
}

export async function fetchProgram(client: ContentClient, id: string) {
  const { data, error } = await client
    .from("programs")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Failed to load program: ${error.message}`);
  return data;
}

/** Departments with their members, for search and the directory cache. */
export async function fetchDepartmentsWithFaculty(client: ContentClient) {
  const { data, error } = await client
    .from("departments")
    .select("*, faculty_members(*)")
    .order("sort_order")
    .order("name")
    .order("sort_order", { referencedTable: "faculty_members" });

  if (error) throw new Error(`Failed to load faculty: ${error.message}`);

  return (data ?? []).map((row) => {
    const { faculty_members, ...department } = row;
    return {
      department: toDepartment(department),
      faculty: (faculty_members ?? []).map((member) => ({
        id: member.id,
        name: member.name,
        title: member.title,
        description: member.description,
        member: toFacultyMember(member),
      })),
    };
  });
}

export async function fetchDepartments(client: ContentClient) {
  const { data, error } = await client
    .from("departments")
    .select("*")
    .order("sort_order")
    .order("name");

  if (error) throw new Error(`Failed to load departments: ${error.message}`);
  return data.map(toDepartment);
}

export async function fetchDepartmentWithFaculty(
  client: ContentClient,
  slug: string,
) {
  const { data, error } = await client
    .from("departments")
    .select("*, faculty_members(*)")
    .eq("slug", slug)
    .order("sort_order", { referencedTable: "faculty_members" })
    .maybeSingle();

  if (error) throw new Error(`Failed to load department: ${error.message}`);
  if (!data) return null;

  const { faculty_members, ...department } = data;
  return {
    department: toDepartment(department),
    faculty: faculty_members.map(toFacultyMember),
  };
}

/**
 * Banner text for a post only an admin can see (a draft or a post scheduled
 * for later), or null for a post visible to everyone.
 */
export function previewLabel(post: Post, now = new Date()) {
  if (post.status === "draft") return "Preview — this post is a draft";
  if (post.published_at && new Date(post.published_at) > now) {
    return `Preview — scheduled for ${formatDate(post.published_at)}`;
  }
  return null;
}
