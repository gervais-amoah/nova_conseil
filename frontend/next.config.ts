import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  allowedDevOrigins: ["172.17.192.1", "192.168.1.69"], // localhosts
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com", // Replace with your image domain
        port: "",
        pathname: "/**", // Allows all image paths under this domain
      },
    ],
  },
};

export default nextConfig;
