"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/cms/auth";
import { assertDbOk, FormError, handleForm } from "@/lib/cms/forms";
import { parseStudentWork } from "@/lib/studentWorks/form";

function valuesFromForm(formData: FormData) {
  const parsed = parseStudentWork(formData);
  if ("error" in parsed) throw new FormError(parsed.error);
  return parsed.values;
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
    const values = valuesFromForm(formData);
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
  const { error } = await supabase.from("student_works").delete().eq("id", id);
  assertDbOk(error);

  redirect("/admin/student-works");
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
