export type RouteAccess = "allow" | "login" | "site";

const isUnder = (pathname: string, prefix: string) =>
  pathname === prefix || pathname.startsWith(`${prefix}/`);

/**
 * Who may open a page on the CMS deployment (Vercel). The public site lives
 * on the school server, so its pages here are only for admins previewing
 * content; everyone else is sent to the school site. The CMS itself needs a
 * signed-in user (requireAdmin() then checks the admin role).
 *
 * Without a school site address (NEXT_PUBLIC_SITE_URL, unset in local dev)
 * there is nowhere to send visitors, so public pages are served to everyone.
 */
export function routeAccess({
  pathname,
  isSignedIn,
  isAdmin,
  hasSiteUrl,
}: {
  pathname: string;
  isSignedIn: boolean;
  isAdmin: boolean;
  hasSiteUrl: boolean;
}): RouteAccess {
  if (pathname === "/admin/login" || isUnder(pathname, "/api")) return "allow";
  if (isUnder(pathname, "/admin")) return isSignedIn ? "allow" : "login";
  return isAdmin || !hasSiteUrl ? "allow" : "site";
}
