import "server-only";

import { cache } from "react";
import { draftMode } from "next/headers";
import { toDepartment, toFacultyMember } from "@/lib/faculty";
import type { Enums, Tables } from "@/lib/supabase/database.types";
import { createPublicClient, createSessionClient } from "@/lib/supabase/server";

export type Post = Tables<"posts">;
export type Program = Tables<"programs">;
export type PostCategory = Enums<"post_category">;

// Public reads go through the anon client, so RLS only ever returns
// published content. Errors are thrown so ISR keeps serving the last good
// page instead of caching an empty one.

export const getPublishedPosts = cache(
  async (options: { category?: PostCategory; limit?: number } = {}) => {
    const supabase = createPublicClient();
    let query = supabase
      .from("posts")
      .select("*")
      .order("published_at", { ascending: false });

    if (options.category) query = query.eq("category", options.category);
    if (options.limit) query = query.limit(options.limit);

    const { data, error } = await query;
    if (error) throw new Error(`Failed to load posts: ${error.message}`);
    return data;
  },
);

/** Featured post for the home page: the newest post flagged as featured. */
export const getFeaturedPost = cache(async () => {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("is_featured", true)
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`Failed to load featured post: ${error.message}`);
  return data;
});

/**
 * Looks up a post by slug. In draft mode (enabled from the CMS preview
 * button) it uses the admin's session, so unpublished drafts are visible.
 */
export const getPostBySlug = cache(async (slug: string) => {
  const { isEnabled: isPreview } = await draftMode();
  const supabase = isPreview
    ? await createSessionClient()
    : createPublicClient();

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(`Failed to load post: ${error.message}`);
  return data;
});

export const getPrograms = cache(async () => {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("programs")
    .select("*")
    .order("sort_order")
    .order("code");

  if (error) throw new Error(`Failed to load programs: ${error.message}`);
  return data;
});

export const getProgram = cache(async (id: string) => {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("programs")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Failed to load program: ${error.message}`);
  return data;
});

export const getDepartments = cache(async () => {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("departments")
    .select("*")
    .order("sort_order")
    .order("name");

  if (error) throw new Error(`Failed to load departments: ${error.message}`);
  return data.map(toDepartment);
});

export const getDepartmentWithFaculty = cache(async (slug: string) => {
  const supabase = createPublicClient();
  const { data, error } = await supabase
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
});
