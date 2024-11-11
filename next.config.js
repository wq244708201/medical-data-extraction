/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self' https://*.clerk.com https://*.clerk.accounts.dev",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.com https://*.clerk.accounts.dev https://*.google.com https://*.cloudflare.com https://*.vercel.app https://vercel.live https://*.vercel.live https://clerk.jingshen.cc",
              "style-src 'self' 'unsafe-inline' https://*.clerk.com https://fonts.googleapis.com",
              "img-src 'self' blob: data: https://*.clerk.com https://*.googleusercontent.com https://*.vercel.app",
              "font-src 'self' data: https://fonts.gstatic.com",
              "frame-src 'self' https://*.clerk.com https://*.clerk.accounts.dev https://accounts.google.com https://*.vercel.live https://clerk.jingshen.cc",
              "connect-src 'self' https://*.clerk.com https://*.clerk.accounts.dev https://accounts.google.com wss://*.clerk.accounts.dev https://*.google.com https://*.vercel.app https://*.vercel.live wss://*.vercel.live https://vercel.live https://clerk.jingshen.cc",
              "form-action 'self' https://*.clerk.com https://accounts.google.com",
              "media-src 'self'",
              "worker-src 'self' blob:",
              "manifest-src 'self'",
              "object-src 'none'",
              "frame-ancestors 'self'",
              "base-uri 'self'",
              'upgrade-insecure-requests',
            ].join('; '),
          },
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
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/auth/:path*',
        destination: '/auth/:path*',
      },
      {
        source: '/sign-in',
        destination: '/auth/sign-in',
      },
      {
        source: '/sign-up',
        destination: '/auth/sign-up',
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/auth/sign-in/factor-one',
        destination: '/auth/sign-in',
        permanent: false,
      },
      {
        source: '/auth/sign-in/factor-two',
        destination: '/auth/sign-in',
        permanent: false,
      },
    ];
  },
  images: {
    domains: [
      'img.clerk.com',
      'images.clerk.dev',
      'accounts.google.com',
      'lh3.googleusercontent.com',
      'medical-data-extraction.vercel.app',
      'jingshen.cc',
    ],
  },
};

module.exports = nextConfig;
