import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // target: 'serverless',
  // output: "export",
  images: {
    unoptimized: true,
    domains: ["localhost"],
  },
  basePath: "/out",
  assetPrefix: process.env.NODE_ENV === "production" ? "https://us-east-1.s3.test-albavision-webhost.amazonaws.com/out/" : "",

};

export default nextConfig;
