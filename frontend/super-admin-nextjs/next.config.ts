import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'
    return [{ source: '/api/proxy/:path*', destination: `${apiUrl}/:path*` }]
  },
  async headers() {
    return [
      {
        source: '/api/proxy/:path*',
        headers: [{ key: 'ngrok-skip-browser-warning', value: 'true' }],
      },
    ]
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "github.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "http", hostname: "**" },
    ],
  },
};

export default nextConfig;
