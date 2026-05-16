import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  // API-only app. No frontend pages.
  output: 'standalone',
  poweredByHeader: false,
  serverExternalPackages: ['@prisma/client', 'argon2', 'bullmq', 'ioredis'],
  experimental: {
    // API routes only — keep bundle small
    typedRoutes: false,
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'no-referrer' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
    ];
  },
};

export default config;
