import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable experimental caching for server components
  cacheComponents: true,

  // Minimal Turbopack config
  turbopack: {},
};

export default nextConfig;
