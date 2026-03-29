import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
    formats: ["image/webp", "image/avif"],
    unoptimized: true,
  },
  serverExternalPackages: ["@prisma/adapter-pg"],
};

export default nextConfig;
// redeploy Sun Mar 29 00:37:49 HPS 2026
