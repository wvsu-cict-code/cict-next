// Plain JS so next.config.mjs can import it.

const LOCAL_HOSTS = ["localhost", "127.0.0.1", "::1", "[::1]"];

/**
 * Why the school site can't be built with these settings, or null if it can.
 * The site's pages load content from this Supabase project in visitors'
 * browsers, so it must be set and must be reachable from the internet.
 *
 * @param {Record<string, string | undefined>} env
 * @returns {string | null}
 */
export function siteBuildEnvProblem(env) {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return "NEXT_PUBLIC_SUPABASE_URL is not set.";
  if (!env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is not set.";
  }

  let hostname;
  try {
    hostname = new URL(url).hostname;
  } catch {
    return `NEXT_PUBLIC_SUPABASE_URL isn't a valid URL: ${url}`;
  }
  if (LOCAL_HOSTS.includes(hostname)) {
    return `NEXT_PUBLIC_SUPABASE_URL points at a local Supabase (${url}), which visitors can't reach. Note that .env.local overrides .env.`;
  }
  return null;
}
