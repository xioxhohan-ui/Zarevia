import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow images from any remote source (Firebase Storage, Cloudinary, etc.)
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },



  // TypeScript errors will still block — keep code safe
  typescript: {
    ignoreBuildErrors: false,
  },

  // Compress responses
  compress: true,

  // Power by header removed for security
  poweredByHeader: false,

  // Trailing slash consistency
  trailingSlash: false,

  // Security + Cache headers (also in vercel.json for edge)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
        ],
      },
    ];
  },
};

export default nextConfig;
