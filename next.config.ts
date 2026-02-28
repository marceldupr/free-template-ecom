import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@aurora-studio/sdk"],
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
