import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["172.26.23.215"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
  experimental: {
    externalDir: true,
  },
  turbopack: {
    root: path.resolve(__dirname, "../"),
  },
};

export default nextConfig;
