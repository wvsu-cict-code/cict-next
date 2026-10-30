import "server-only";

import { redirect } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/server";

/**
 * Returns the signed-in user and a session client if they are a CMS admin,
 * otherwise null. RLS enforces the same rule in the database; this check is
 * for routing and friendlier errors.
 */
export async function getAdmin() {
  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: isAdmin, error } = await supabase.rpc("is_admin");
  if (error || !isAdmin) return null;

  return { user, supabase };
}

/** Use at the top of every CMS page and server action. */
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login?error=not-admin");
  return admin;
}
