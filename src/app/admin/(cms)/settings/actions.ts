"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/cms/auth";
import {
  assertDbOk,
  FormError,
  getBoolean,
  getString,
  handleForm,
  type FormState,
} from "@/lib/cms/forms";

export async function updateSettings(_state: FormState, formData: FormData) {
  return handleForm(async () => {
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase
      .from("site_settings")
      .update({
        maintenance_mode: getBoolean(formData, "maintenance_mode"),
        maintenance_message: getString(formData, "maintenance_message"),
      })
      .eq("id", true)
      .select("id");

    if (error?.code === "PGRST205" || (!error && data.length === 0)) {
      throw new FormError(
        "The settings table doesn't exist yet. Apply the site_settings database migration first.",
      );
    }
    assertDbOk(error);

    // The maintenance banner lives in the CMS layout
    revalidatePath("/admin", "layout");
    redirect("/admin/settings?saved=1");
  });
}
