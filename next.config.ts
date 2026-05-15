import type { NextConfig } from "next";

const API_URL = process.env.BACKEND_URL || "http://localhost:3000";

const nextConfig: NextConfig = {
  /* config options here */
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  async rewrites() {
    return [
      {
        source: "/api/backend/:path*",
        destination: `${API_URL}/:path*`,
      },
    ];
  },
  reactStrictMode: false,
  transpilePackages: ['mui-one-time-password-input'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        hostname: "kma-property.s3.ap-south-1.amazonaws.com",
        pathname: '**'
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '**'
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        pathname: '**'
      }
    ]
  },
   turbopack: {
      rules: {
        '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.tsx',
      },
      },
    },
};

export default nextConfig;
