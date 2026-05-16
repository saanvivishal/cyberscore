import type { NextConfig } from 'next';

// On Vercel we let their build adapter handle output packaging. Outside
// Vercel (self-hosted Docker, etc.) we want a standalone build so the image
// can be small.
const isVercel = !!process.env.VERCEL;

const config: NextConfig = {
  reactStrictMode: true,
  // API-only app. No frontend pages.
  ...(isVercel ? {} : { output: 'standalone' as const }),
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
