import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@saeteum/shared"],
  agentRules: false,
};

export default nextConfig;
