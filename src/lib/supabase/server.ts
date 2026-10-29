import "server-only";

import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "./database.types";
import { getSupabaseEnv } from "./env";

/**
 * Session-aware client for the CMS (server components, server actions, route
 * handlers). Reads the signed-in admin from cookies, so RLS sees their role.
 * Using it opts the route into dynamic rendering.
 */
export async function createSessionClient() {
  const { url, key } = getSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component, where cookies are read-only.
          // The proxy refreshes the session for /admin routes instead.
        }
      },
    },
  });
}

/**
 * Anonymous client for the public site. It never touches cookies, so pages
 * that use it can be statically generated and revalidated.
 */
export function createPublicClient() {
  const { url, key } = getSupabaseEnv();

  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
