import type { NextConfig } from "next";

const API_URL = process.env.API_URL ?? "http://localhost:4000/api";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  // Uploaded images live in the backend; serve them from this site's own /uploads path.
  async rewrites() {
    return [{ source: "/uploads/:file", destination: `${API_URL}/uploads/:file` }];
  },
  experimental: {
    // Admin image uploads go through a server action (10 MB images plus form overhead).
    serverActions: { bodySizeLimit: "11mb" },
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
