"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/cms/auth";
import {
  assertDbOk,
  getNumber,
  getOptionalString,
  getString,
  handleForm,
  requireValue,
  resolveMediaField,
  revalidateSite,
  type FormState,
} from "@/lib/cms/forms";
import { slugify } from "@/lib/format";

async function programFromForm(formData: FormData) {
  const { supabase } = await requireAdmin();

  const values = {
    code: requireValue(getString(formData, "code"), "Code is required."),
    name: requireValue(getString(formData, "name"), "Name is required."),
    description: getString(formData, "description"),
    objectives: getString(formData, "objectives"),
    duration: getOptionalString(formData, "duration"),
    semesters: getOptionalString(formData, "semesters"),
    sort_order: getNumber(formData, "sort_order"),
    logo_url: await resolveMediaField(
      supabase,
      formData,
      "logo_url",
      "programs",
    ),
    curriculum_pdf_url: await resolveMediaField(
      supabase,
      formData,
      "curriculum_pdf_url",
      "curricula",
    ),
  };

  return { supabase, values };
}

export async function createProgram(_state: FormState, formData: FormData) {
  return handleForm(async () => {
    const { supabase, values } = await programFromForm(formData);
    const id = requireValue(
      slugify(getString(formData, "id") || values.code),
      "ID is required.",
    );

    const { error } = await supabase.from("programs").insert({ id, ...values });
    assertDbOk(error);

    revalidateSite();
    redirect(`/admin/programs/${id}?saved=1`);
  });
}

export async function updateProgram(
  id: string,
  _state: FormState,
  formData: FormData,
) {
  return handleForm(async () => {
    const { supabase, values } = await programFromForm(formData);
    const { error } = await supabase
      .from("programs")
      .update(values)
      .eq("id", id);
    assertDbOk(error);

    revalidateSite();
    redirect(`/admin/programs/${id}?saved=1`);
  });
}

export async function deleteProgram(id: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("programs").delete().eq("id", id);
  assertDbOk(error);

  revalidateSite();
  redirect("/admin/programs");
}
