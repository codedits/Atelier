/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ctiwaclyvidudekvvizs.supabase.co',
        port: '',
        pathname: '/storage/**',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        port: '',
        pathname: '/storage/**',
      },
    ],
    // avoid runtime optimizer fetch timeouts in local dev environment
    // Set to true to bypass Next.js image optimizer (useful for local testing)
    unoptimized: true,
  },
}

module.exports = nextConfig
