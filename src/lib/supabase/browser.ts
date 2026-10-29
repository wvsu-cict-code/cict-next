import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";
import { getSupabaseEnv } from "./env";

let client: ReturnType<typeof createBrowserClient<Database>> | undefined;

/**
 * Supabase client for public pages, which load their content in the browser.
 * On the CMS deployment it picks up a signed-in admin's session from cookies
 * (so drafts can be previewed); on the school site there is none, so it reads
 * as an anonymous visitor.
 */
export function getBrowserClient() {
  if (!client) {
    const { url, key } = getSupabaseEnv();
    client = createBrowserClient<Database>(url, key);
  }
  return client;
}
