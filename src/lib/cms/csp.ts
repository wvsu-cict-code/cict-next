/**
 * Content-Security-Policy for the CMS (/admin). Development is looser:
 * React needs eval() to show readable error stacks, and Next's dev tools
 * inject <style> tags without the nonce. Production allows neither.
 * https://nextjs.org/docs/app/guides/content-security-policy
 */
export function contentSecurityPolicy(
  nonce: string,
  { isDev, supabaseOrigin = "" }: { isDev: boolean; supabaseOrigin?: string },
) {
  // The admin uploads straight to Supabase Storage; ws: is Next's dev-tools socket.
  const connectSrc = ["'self'", supabaseOrigin, isDev && "ws:"]
    .filter(Boolean)
    .join(" ");
  return `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""};
    style-src 'self' ${isDev ? "'unsafe-inline'" : `'nonce-${nonce}'`} https://fonts.googleapis.com;
    img-src 'self' blob: data: ${supabaseOrigin} https://i.ytimg.com;
    font-src 'self' https://fonts.gstatic.com;
    connect-src ${connectSrc};
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'self';
    upgrade-insecure-requests;
`
    .replace(/\s{2,}/g, " ")
    .trim();
}
