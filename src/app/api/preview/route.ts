import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/cms/auth";

// Enables Draft Mode so a CMS admin can view unpublished posts.
// Usage: /api/preview?url=/news-announcements/news/my-draft
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!(await getAdmin())) {
    return new Response("Sign in to the CMS to preview content", {
      status: 401,
    });
  }

  (await draftMode()).enable();

  // Redirect to a validated internal path to avoid open redirect vulnerabilities
  const safeUrl =
    url && url.startsWith("/") && !url.startsWith("//") ? url : "/";
  redirect(safeUrl);
}
