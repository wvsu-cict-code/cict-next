"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/cms/auth";
import {
  assertDbOk,
  getString,
  handleForm,
  requireValue,
  type FormState,
} from "@/lib/cms/forms";

export async function updatePage(
  slug: string,
  _state: FormState,
  formData: FormData,
) {
  return handleForm(async () => {
    const { supabase } = await requireAdmin();
    const values = {
      title: requireValue(getString(formData, "title"), "Title is required."),
      summary: getString(formData, "summary"),
      body: getString(formData, "body"),
      status:
        getString(formData, "status") === "published" ? "published" : "draft",
    } as const;

    const { error } = await supabase
      .from("pages")
      .update(values)
      .eq("slug", slug);
    assertDbOk(error);

    redirect(`/admin/pages/${slug}?saved=1`);
  });
}
