import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance optimizations
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
  },
  
  // Output configuration
  output: 'standalone',
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Headers for security and performance
  async headers() {
    // Content Security Policy
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://giscus.app", // Required for Next.js + Giscus
      "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net", // Required for Tailwind CSS + CDN fonts
      "img-src 'self' data: blob: https: http:", // Allow images from any https/http source
      "font-src 'self' https://cdn.jsdelivr.net", // Allow CDN fonts (LXGW WenKai Lite)
      "connect-src 'self' https://giscus.app", // Allow Giscus API calls
      "frame-src https://giscus.app", // Allow Giscus iframe
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ]
    const csp = cspDirectives.join('; ')

    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: csp,
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
    ];
  },
  
  // Redirects
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/admin',
        permanent: true,
      },
    ];
  },
  
  // Disable x-powered-by header
  poweredByHeader: false,
  
  // Enable compression
  compress: true,
  
  // Typescript strict mode
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // ESLint during builds
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
