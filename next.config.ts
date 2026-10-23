import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Same path as the original site, so old bookmarks land in the dashboard.
  async redirects() {
    return [{ source: "/app/plans-and-payments", destination: "/dashboard/plans-and-payments", permanent: false }];
  },
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
