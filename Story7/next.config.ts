import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: "/Story7",
  allowedDevOrigins: ["127.0.0.1", "127.0.2.2", "localhost"]
};

export default nextConfig;
