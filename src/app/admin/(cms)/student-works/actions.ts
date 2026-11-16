"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/cms/auth";
import { assertDbOk, FormError, handleForm } from "@/lib/cms/forms";
import { SUBMISSIONS_BUCKET } from "@/lib/museum/limits";
import { submissionPaths } from "@/lib/museum/submissions";
import {
  parseStudentWork,
  type ExistingStudentWork,
} from "@/lib/studentWorks/form";

function valuesFromForm(
  formData: FormData,
  existing?: ExistingStudentWork | null,
) {
  const parsed = parseStudentWork(formData, existing);
  if ("error" in parsed) throw new FormError(parsed.error);
  return parsed.values;
}

function refreshWork(id?: string) {
  revalidatePath("/admin/student-works");
  if (id) revalidatePath(`/admin/student-works/${id}`);
}

export async function createStudentWork(
  _state: { error?: string } | undefined,
  formData: FormData,
) {
  return handleForm(async () => {
    const { supabase } = await requireAdmin();
    const values = valuesFromForm(formData);

    // New works go last
    const { data: last, error: lastError } = await supabase
      .from("student_works")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    assertDbOk(lastError);

    const { data, error } = await supabase
      .from("student_works")
      .insert({ ...values, sort_order: (last?.sort_order ?? -1) + 1 })
      .select("id")
      .single();
    assertDbOk(error);

    redirect(`/admin/student-works/${data!.id}?saved=1`);
  });
}

export async function updateStudentWork(
  id: string,
  _state: { error?: string } | undefined,
  formData: FormData,
) {
  return handleForm(async () => {
    const { supabase } = await requireAdmin();
    const { data: existing, error: readError } = await supabase
      .from("student_works")
      .select("category, video_url, audio_url, orientation")
      .eq("id", id)
      .maybeSingle();
    assertDbOk(readError);
    if (!existing) throw new FormError("That work no longer exists.");

    const values = valuesFromForm(formData, existing);
    const { error } = await supabase
      .from("student_works")
      .update(values)
      .eq("id", id);
    assertDbOk(error);

    redirect(`/admin/student-works/${id}?saved=1`);
  });
}

export async function deleteStudentWork(id: string) {
  const { supabase } = await requireAdmin();
  const { data: work, error: readError } = await supabase
    .from("student_works")
    .select("image_url, video_url, audio_url")
    .eq("id", id)
    .maybeSingle();
  assertDbOk(readError);

  const { error } = await supabase.from("student_works").delete().eq("id", id);
  assertDbOk(error);

  const paths = work ? submissionPaths(work) : [];
  if (paths.length > 0) {
    try {
      await supabase.storage.from(SUBMISSIONS_BUCKET).remove(paths);
    } catch {
      // The row is already gone; leftover files can be removed later.
    }
  }

  redirect("/admin/student-works");
}

export async function approveStudentWork(
  id: string,
): Promise<{ error?: string }> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase
      .from("student_works")
      .update({ status: "approved", rejection_reason: null })
      .eq("id", id);
    assertDbOk(error);
    refreshWork(id);
    return {};
  } catch (error) {
    if (error instanceof FormError) return { error: error.message };
    throw error;
  }
}

export async function rejectStudentWork(
  id: string,
  reason: string,
): Promise<{ error?: string }> {
  try {
    const trimmed = reason.trim();
    if (!trimmed) throw new FormError("Give the student a reason.");
    const { supabase } = await requireAdmin();
    const { error } = await supabase
      .from("student_works")
      .update({ status: "rejected", rejection_reason: trimmed })
      .eq("id", id);
    assertDbOk(error);
    refreshWork(id);
    return {};
  } catch (error) {
    if (error instanceof FormError) return { error: error.message };
    throw error;
  }
}

export async function setStudentWorkFeatured(
  id: string,
  featured: boolean,
): Promise<{ error?: string }> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase
      .from("student_works")
      .update({ featured })
      .eq("id", id);
    assertDbOk(error);
    refreshWork();
    return {};
  } catch (error) {
    if (error instanceof FormError) return { error: error.message };
    throw error;
  }
}

/** Saves the order of the works: each id's position becomes its sort_order. */
export async function reorderStudentWorks(
  ids: string[],
): Promise<{ error?: string }> {
  try {
    const { supabase } = await requireAdmin();
    const results = await Promise.all(
      ids.map((id, index) =>
        supabase
          .from("student_works")
          .update({ sort_order: index })
          .eq("id", id),
      ),
    );
    for (const { error } of results) assertDbOk(error);
    return {};
  } catch (error) {
    if (error instanceof FormError) return { error: error.message };
    throw error;
  }
}

export async function setStudentWorkVisible(
  id: string,
  visible: boolean,
): Promise<{ error?: string }> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase
      .from("student_works")
      .update({ visible })
      .eq("id", id);
    assertDbOk(error);
    return {};
  } catch (error) {
    if (error instanceof FormError) return { error: error.message };
    throw error;
  }
}
