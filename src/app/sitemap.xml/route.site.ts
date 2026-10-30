import { createClient } from "@supabase/supabase-js";
import {
  fetchDepartmentsWithUpdates,
  fetchPrograms,
  fetchPublishedEvents,
  fetchPublishedPosts,
} from "@/lib/cms/content";
import { SITE_URL } from "@/lib/seo";
import { sitemapEntries, sitemapXml } from "@/lib/sitemap";
import type { Database } from "@/lib/supabase/database.types";
import { getSupabaseEnv } from "@/lib/supabase/env";

export const dynamic = "force-static";

/**
 * Written when the school site is built, so content published later is
 * listed after the next build and upload. The CMS deployment isn't indexed
 * (see robots.txt), so it only lists the section pages.
 */
export async function GET() {
  let content: Parameters<typeof sitemapEntries>[1] = {
    posts: [],
    events: [],
    programs: [],
    departments: [],
  };

  if (process.env.BUILD_TARGET === "site") {
    const { url, key } = getSupabaseEnv();
    const client = createClient<Database>(url, key);
    const [posts, events, programs, departments] = await Promise.all([
      fetchPublishedPosts(client),
      fetchPublishedEvents(client),
      fetchPrograms(client),
      fetchDepartmentsWithUpdates(client),
    ]);
    content = { posts, events, programs, departments };
  }

  return new Response(sitemapXml(sitemapEntries(SITE_URL, content)), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
