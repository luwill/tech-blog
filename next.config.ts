import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Experimental features for bundle optimization
  experimental: {
    // Tree-shake these packages to reduce bundle size
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
    ],
  },

  // Keep heavy server-only packages out of client bundle analysis
  serverExternalPackages: ['@prisma/client', 'prisma'],

  // Disable source maps in production to reduce memory during build
  productionBrowserSourceMaps: false,

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
  },

  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },

  // Disable x-powered-by header
  poweredByHeader: false,

  // 构建期恢复类型/lint 检查（Turbopack + 大内存下可承受；再 OOM 时优先调内存而非跳过检查）
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
