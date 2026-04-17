import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    loader: "custom",
    loaderFile: "./supabase-image-loader.js",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "chljxifjjzaffvwixtfm.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  serverExternalPackages: ["@prisma/adapter-pg"],
  async headers() {
    return [
      {
        source: "/_next/image(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
// redeploy Sun Mar 29 00:37:49 HPS 2026
