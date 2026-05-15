import type { NextConfig } from 'next';

const isProduction = process.env.NODE_ENV === 'production';

const securityHeaders = [
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
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  ...(isProduction
    ? [
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload',
        },
      ]
    : []),
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // Ajout de https://challenges.cloudflare.com pour le CAPTCHA
      `script-src 'self' 'unsafe-inline' ${
        isProduction ? '' : "'unsafe-eval'"
      } https://js.stripe.com https://bursting-vulture-4.clerk.accounts.dev https://challenges.cloudflare.com`,
      
      "frame-src 'self' https://js.stripe.com https://checkout.stripe.com https://hooks.stripe.com https://bursting-vulture-4.clerk.accounts.dev https://challenges.cloudflare.com",
      
      "connect-src 'self' https://api.stripe.com https://bursting-vulture-4.clerk.accounts.dev",
      
      "img-src 'self' data: https: https://img.clerk.com",
      
      // CRUCIAL : Autorise les Workers Clerk (le fameux 'blob:')
      "worker-src 'self' blob:;",
      
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self' data:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self' https://checkout.stripe.com",
      "frame-ancestors 'none'",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;