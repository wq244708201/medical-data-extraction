/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // serverActions: true, // 删除这行或改为以下配置
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.google.com https://*.clerk.com https://*.clerk.dev https://clerk.jingshen.cc https://*.cloudflare.com https://*.turnstile.com https://*.clerk.accounts.dev",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://*.clerk.com https://*.clerk.dev https://clerk.jingshen.cc",
              "font-src 'self'",
              "connect-src 'self' https://*.google.com https://*.clerk.com https://*.clerk.dev https://clerk.jingshen.cc https://*.clerk.accounts.dev https://*.allyncs.com https://*.turnstile.com wss: ws:",
              "frame-src 'self' https://*.google.com https://*.clerk.com https://*.clerk.dev https://clerk.jingshen.cc",
              "form-action 'self'",
              "media-src 'self' data:",
              "worker-src 'self' blob:",
              "manifest-src 'self'",
              "object-src 'none'",
              "frame-ancestors 'none'",
            ].join('; '),
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
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
      'accounts.google.com',
      'img.clerk.com',
      'clerk.jingshen.cc',
      'images.clerk.dev',
      'medical-data-extraction.vercel.app',
    ],
  },
};

module.exports = nextConfig;
