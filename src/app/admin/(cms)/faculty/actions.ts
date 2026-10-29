"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/cms/auth";
import {
  assertDbOk,
  getNumber,
  getString,
  handleForm,
  requireValue,
  resolveMediaField,
  revalidateSite,
  type FormState,
} from "@/lib/cms/forms";
import { slugify } from "@/lib/format";

// ---------- Departments ----------

function departmentFromForm(formData: FormData) {
  return {
    name: requireValue(getString(formData, "name"), "Name is required."),
    side: getString(formData, "side") === "right" ? "right" : "left",
    x: getNumber(formData, "x"),
    y: getNumber(formData, "y"),
    logo_anchor_x: getNumber(formData, "logo_anchor_x"),
    logo_anchor_y: getNumber(formData, "logo_anchor_y"),
    zoom_scale: getNumber(formData, "zoom_scale", 6),
    sort_order: getNumber(formData, "sort_order"),
  };
}

export async function createDepartment(_state: FormState, formData: FormData) {
  return handleForm(async () => {
    const { supabase } = await requireAdmin();
    const values = departmentFromForm(formData);
    const slug = requireValue(
      slugify(getString(formData, "slug") || values.name),
      "Slug is required.",
    );

    const { error } = await supabase
      .from("departments")
      .insert({ slug, ...values });
    assertDbOk(error);

    revalidateSite();
    redirect(`/admin/faculty/departments/${slug}?saved=1`);
  });
}

export async function updateDepartment(
  slug: string,
  _state: FormState,
  formData: FormData,
) {
  return handleForm(async () => {
    const { supabase } = await requireAdmin();
    const { error } = await supabase
      .from("departments")
      .update(departmentFromForm(formData))
      .eq("slug", slug);
    assertDbOk(error);

    revalidateSite();
    redirect(`/admin/faculty/departments/${slug}?saved=1`);
  });
}

export async function deleteDepartment(slug: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("departments")
    .delete()
    .eq("slug", slug);
  assertDbOk(error);

  revalidateSite();
  redirect("/admin/faculty");
}

// ---------- Faculty members ----------

async function memberFromForm(formData: FormData) {
  const { supabase } = await requireAdmin();

  const values = {
    department_slug: requireValue(
      getString(formData, "department_slug"),
      "Pick a department.",
    ),
    name: requireValue(getString(formData, "name"), "Name is required."),
    title: getString(formData, "title"),
    description: getString(formData, "description"),
    sort_order: getNumber(formData, "sort_order"),
    image_url: await resolveMediaField(
      supabase,
      formData,
      "image_url",
      "faculty",
    ),
  };

  return { supabase, values };
}

export async function createMember(_state: FormState, formData: FormData) {
  return handleForm(async () => {
    const { supabase, values } = await memberFromForm(formData);
    const { data, error } = await supabase
      .from("faculty_members")
      .insert(values)
      .select("id")
      .single();
    assertDbOk(error);

    revalidateSite();
    redirect(`/admin/faculty/members/${data!.id}?saved=1`);
  });
}

export async function updateMember(
  id: string,
  _state: FormState,
  formData: FormData,
) {
  return handleForm(async () => {
    const { supabase, values } = await memberFromForm(formData);
    const { error } = await supabase
      .from("faculty_members")
      .update(values)
      .eq("id", id);
    assertDbOk(error);

    revalidateSite();
    redirect(`/admin/faculty/members/${id}?saved=1`);
  });
}

export async function deleteMember(id: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("faculty_members")
    .delete()
    .eq("id", id);
  assertDbOk(error);

  revalidateSite();
  redirect("/admin/faculty");
}
