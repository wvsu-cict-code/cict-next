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

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
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

export default nextConfig;
