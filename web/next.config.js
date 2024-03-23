/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "static.simiotics.com",
        port: "",
        pathname: "/fullcount/**",
      },
      {
        protocol: "https",
        hostname: "badges.moonstream.to",
        port: "",
        pathname: "/blb/**",
      },
      {
        protocol: "https",
        hostname: "badges.moonstream.to",
        port: "",
        pathname: "/fullcount-coaches/**",
      },
    ],
  },
};

module.exports = nextConfig;
