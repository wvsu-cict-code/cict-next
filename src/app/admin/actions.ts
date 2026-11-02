"use server";

import { redirect } from "next/navigation";
import { getString, type FormState } from "@/lib/cms/forms";
import { createSessionClient } from "@/lib/supabase/server";

export async function signIn(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const supabase = await createSessionClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: getString(formData, "email"),
    password: getString(formData, "password"),
  });
  if (error) return { error: "Incorrect email or password." };

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) {
    await supabase.auth.signOut();
    return {
      error:
        "This account does not have CMS access. Ask an existing admin to add you.",
    };
  }

  redirect("/admin");
}

export async function signOut() {
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
