/** @type {import('next').NextConfig} */

// ── Content-Security-Policy ──────────────────────────────────────────
// Tuned for Next.js Pages Router (inline scripts for __NEXT_DATA__),
// React inline styles, Supabase, image CDNs, and self-hosted fonts via
// next/font/google.  In production you can tighten script-src once you
// verify no inline scripts remain beyond Next.js hydration.
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : '*.supabase.co'

const cspDirectives = [
  // Only allow scripts from own origin + Next.js inline hydration
  `script-src 'self' 'unsafe-inline' 'unsafe-eval'`,
  // Inline styles are used heavily (React style={} props)
  `style-src 'self' 'unsafe-inline'`,
  // Images: self + Supabase storage + Unsplash + Pexels + data URIs
  `img-src 'self' data: blob: https://${supabaseHost} https://images.unsplash.com https://images.pexels.com`,
  // Fonts: self only (next/font/google self-hosts them)
  `font-src 'self'`,
  // API / WebSocket connections to own origin + Supabase
  `connect-src 'self' https://${supabaseHost} wss://${supabaseHost}`,
  // No <object>, <embed>, <applet>
  `object-src 'none'`,
  // Restrict <base> to own origin
  `base-uri 'self'`,
  // Forms only submit to own origin
  `form-action 'self'`,
  // Framing controlled by X-Frame-Options too; mirror it here
  `frame-ancestors 'self'`,
  // Block mixed content
  `upgrade-insecure-requests`,
].join('; ')

const nextConfig = {
  reactStrictMode: true,
  // Enable gzip/brotli compression
  compress: true,
  // Reduce bundle size by removing console in prod (keep error/warn for debugging)
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
      ? { exclude: ['error', 'warn'] }
      : false,
  },
  // All headers merged into a single function
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'Content-Security-Policy',
            value: cspDirectives
          }
        ]
      },
      {
        source: '/:all*(svg|jpg|jpeg|png|webp|avif|gif|ico|woff|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
  // Reduce unused JavaScript
  experimental: {
    optimizePackageImports: ['@supabase/supabase-js'],
  },
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
        hostname: 'images.pexels.com',
        port: '',
        pathname: '/**',
      },
      // Dynamic Supabase hostname from env var
      ...(process.env.NEXT_PUBLIC_SUPABASE_URL
        ? [{
          protocol: 'https',
          hostname: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname,
          port: '',
          pathname: '/storage/**',
        }]
        : []),
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        port: '',
        pathname: '/storage/**',
      },
    ],
    // Keep unoptimized to avoid Vercel quota; use source-side sizing instead
    unoptimized: false,
    // Optimize images for faster loads on low-end devices
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    // Use modern formats for smaller file sizes
    formats: ['image/avif', 'image/webp'],
    // Allow quality 85 for hero images
    qualities: [75, 85],
    // Cache images for 30 days
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
}

module.exports = nextConfig
