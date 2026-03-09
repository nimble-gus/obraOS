import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "t3.storageapi.dev",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
