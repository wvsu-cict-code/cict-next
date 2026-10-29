// Allow next/image to optimize files served from Supabase Storage.
const remotePatterns = [];
let isLocalSupabase = false;
const supabaseUrlEnv = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (supabaseUrlEnv) {
  try {
    const parsed = new URL(supabaseUrlEnv);
    remotePatterns.push({
      protocol: parsed.protocol.replace(":", ""),
      hostname: parsed.hostname,
      port: parsed.port,
      pathname: "/storage/v1/object/public/**",
    });
    isLocalSupabase = ["127.0.0.1", "localhost"].includes(parsed.hostname);
  } catch {
    // If NEXT_PUBLIC_SUPABASE_URL is invalid, only local images are allowed.
  }
}

// Two builds from one codebase:
// - `npm run build` (CMS, deployed to Vercel): the whole app.
// - `npm run build:site` (BUILD_TARGET=site): a static export of the public
//   site for the school's Apache server. It only includes `*.site.tsx` route
//   files, which leaves out the CMS (`admin/`, `api/`, `proxy.ts`).
// New public pages and layouts MUST be named `page.site.tsx` /
// `layout.site.tsx`, or they won't be on the school site.
const isSiteBuild = process.env.BUILD_TARGET === "site";

/** @type {import('next').NextConfig} */
const cmsConfig = {
  reactCompiler: true,
  pageExtensions: ["tsx", "ts", "site.tsx", "site.ts"],
  images: {
    remotePatterns,
    // Local Supabase (`supabase start`) serves images from 127.0.0.1
    dangerouslyAllowLocalIP: isLocalSupabase,
  },
  experimental: {
    serverActions: {
      // CMS image and PDF uploads go through server actions
      bodySizeLimit: "10mb",
    },
  },
};

/** @type {import('next').NextConfig} */
const siteConfig = {
  reactCompiler: true,
  pageExtensions: ["site.tsx", "site.ts"],
  output: "export",
  trailingSlash: true,
  // There's no image optimization server on static hosting
  images: { unoptimized: true },
};

export default isSiteBuild ? siteConfig : cmsConfig;
