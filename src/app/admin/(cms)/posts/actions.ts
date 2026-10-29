"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/cms/auth";
import {
  assertDbOk,
  getBoolean,
  getOptionalString,
  getString,
  handleForm,
  parseManilaDateTime,
  requireValue,
  FormError,
  resolveMediaField,
  revalidateSite,
  uploadMedia,
  type FormState,
} from "@/lib/cms/forms";
import { slugify } from "@/lib/format";

async function postFromForm(formData: FormData) {
  const { supabase } = await requireAdmin();

  const title = requireValue(
    getString(formData, "title"),
    "Title is required.",
  );
  const slug = requireValue(
    slugify(getString(formData, "slug") || title),
    "Could not build a slug from the title. Enter one manually.",
  );
  const status =
    getString(formData, "status") === "published" ? "published" : "draft";
  const category =
    getString(formData, "category") === "announcement"
      ? "announcement"
      : "news";
  let publishedAt = parseManilaDateTime(getString(formData, "published_at"));

  // Publishing without a date means "publish now"
  if (status === "published" && !publishedAt)
    publishedAt = new Date().toISOString();

  const values = {
    title,
    slug,
    status,
    category,
    published_at: publishedAt,
    is_featured: getBoolean(formData, "is_featured"),
    excerpt: getOptionalString(formData, "excerpt"),
    body: getString(formData, "body"),
    cover_image_url: await resolveMediaField(
      supabase,
      formData,
      "cover_image_url",
      "posts",
    ),
  } as const;

  return { supabase, values };
}

export async function createPost(_state: FormState, formData: FormData) {
  return handleForm(async () => {
    const { supabase, values } = await postFromForm(formData);
    const { data, error } = await supabase
      .from("posts")
      .insert(values)
      .select("id")
      .single();
    assertDbOk(error);

    revalidateSite();
    redirect(`/admin/posts/${data!.id}?saved=1`);
  });
}

export async function updatePost(
  id: string,
  _state: FormState,
  formData: FormData,
) {
  return handleForm(async () => {
    const { supabase, values } = await postFromForm(formData);
    const { error } = await supabase.from("posts").update(values).eq("id", id);
    assertDbOk(error);

    revalidateSite();
    redirect(`/admin/posts/${id}?saved=1`);
  });
}

export async function deletePost(id: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("posts").delete().eq("id", id);
  assertDbOk(error);

  revalidateSite();
  redirect("/admin/posts");
}

/** Uploads an image for use inside a post body; returns its public URL. */
export async function uploadPostImage(
  formData: FormData,
): Promise<{ url?: string; error?: string }> {
  const { supabase } = await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0)
    return { error: "Choose an image to upload." };

  try {
    return { url: await uploadMedia(supabase, file, "posts/body") };
  } catch (error) {
    if (error instanceof FormError) return { error: error.message };
    throw error;
  }
}
