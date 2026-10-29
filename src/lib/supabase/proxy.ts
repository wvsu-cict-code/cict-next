import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "./env";

/**
 * Refreshes the Supabase auth session on /admin requests and redirects
 * signed-out visitors to the login page. Admin role checks happen in
 * requireAdmin() and in the database's RLS policies.
 *
 * `requestHeaders` are the (CSP-augmented) headers to forward to the page.
 */
export async function updateSession(
  request: NextRequest,
  requestHeaders: Headers,
) {
  const { url, key } = getSupabaseEnv();
  const next = () =>
    NextResponse.next({ request: { headers: requestHeaders } });
  let response = next();

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        // Forward refreshed tokens to this render and back to the browser
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        requestHeaders.set("cookie", request.cookies.toString());
        response = next();
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
        Object.entries(headers ?? {}).forEach(([header, value]) =>
          response.headers.set(header, value),
        );
      },
    },
  });

  // Do not run code between createServerClient and getClaims(): it is what
  // refreshes an expired session.
  const { data } = await supabase.auth.getClaims();
  const isSignedIn = Boolean(data?.claims);
  const isLoginPage = request.nextUrl.pathname === "/admin/login";

  if (!isSignedIn && !isLoginPage) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.search = "";
    return NextResponse.redirect(loginUrl);
  }

  return response;
}
