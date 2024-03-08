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
    ],
  },
};

module.exports = nextConfig;
