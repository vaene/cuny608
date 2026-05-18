/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  allowedDevOrigins: ["127.0.2.2", "localhost"]
};

module.exports = nextConfig;
