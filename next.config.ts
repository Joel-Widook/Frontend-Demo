import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    domains: ["localhost"],
  },
  output: "export",
};

export default nextConfig;
