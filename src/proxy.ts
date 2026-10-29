import { NextResponse, type NextRequest } from "next/server";
import { routeAccess } from "@/lib/cms/access";
import { siteUrl } from "@/lib/site";
import { updateSession } from "@/lib/supabase/proxy";

// Supabase Storage serves CMS uploads (images, PDFs)
const supabaseOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin
  : "";

function contentSecurityPolicy(nonce: string) {
  return `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic';
    style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com;
    img-src 'self' blob: data: ${supabaseOrigin};
    font-src 'self' https://fonts.gstatic.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'self';
    upgrade-insecure-requests;
`
    .replace(/\s{2,}/g, " ")
    .trim();
}

// Runs on the CMS deployment only (the school site is static files).
// - /admin: nonce-based CSP and a signed-in user. The CSP needs dynamically
//   rendered pages (Next can't add per-request nonces to static HTML), so it
//   is not applied to the statically generated public pages.
//   https://nextjs.org/docs/app/guides/content-security-policy
// - Public pages: only for admins previewing content; everyone else is sent
//   to the same page on the school site, so there's one indexable copy.
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isCms = pathname === "/admin" || pathname.startsWith("/admin/");

  const requestHeaders = new Headers(request.headers);
  const nonce = isCms
    ? Buffer.from(crypto.randomUUID()).toString("base64")
    : null;
  const csp = nonce ? contentSecurityPolicy(nonce) : null;
  if (nonce && csp) {
    requestHeaders.set("x-nonce", nonce);
    requestHeaders.set("Content-Security-Policy", csp);
  }

  const { response, isSignedIn, supabase } = await updateSession(
    request,
    requestHeaders,
  );
  const isAdmin =
    !isCms && isSignedIn && (await supabase.rpc("is_admin")).data === true;

  const access = routeAccess({
    pathname,
    isSignedIn,
    isAdmin,
    hasSiteUrl: Boolean(process.env.NEXT_PUBLIC_SITE_URL),
  });

  if (access === "login") {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.search = "";
    return NextResponse.redirect(loginUrl);
  }
  if (access === "site") {
    return NextResponse.redirect(siteUrl(`${pathname}${search}`), 307);
  }

  if (csp) {
    response.headers.set("Content-Security-Policy", csp);
  } else {
    response.headers.set("X-Robots-Tag", "noindex");
  }
  return response;
}

export const config = {
  matcher: [
    {
      // Everything except build assets and files with an extension (images,
      // icons, PDFs in /public)
      source: "/((?!_next/static|_next/image|.*\\..*).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
