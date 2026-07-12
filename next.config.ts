import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow images from any hostname (Firebase Storage, Unsplash, local, etc.)
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
  // Ensure fs and path are treated as server-only — never bundled for the client
  serverExternalPackages: ['fs', 'path'],
};

export default nextConfig;
