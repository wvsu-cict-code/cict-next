import { SITE_URL } from "@/lib/seo";
import { robotsTxt } from "@/lib/sitemap";

export const dynamic = "force-static";

export function GET() {
  return new Response(
    robotsTxt(SITE_URL, process.env.BUILD_TARGET === "site"),
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
}
