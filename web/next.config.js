/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  images: {
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
    ],
  },
};

module.exports = nextConfig;
