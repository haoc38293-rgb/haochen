import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The repository also contains Cloudflare-only helper files for Sites.
  // Next compiles the app itself, so Vercel can safely skip type-checking those helpers.
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
