/** @type {import('next').NextConfig} */
const nextConfig = {
  // 移除 experimental.appDir 配置
  headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://*.clerk.accounts.dev",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' https://accounts.google.com data: https://*.clerk.accounts.dev https://*.clerk.com https://img.clerk.com",
              "font-src 'self' data:",
              "frame-src 'self' https://accounts.google.com https://*.clerk.accounts.dev",
              "connect-src 'self' https://accounts.google.com https://*.clerk.accounts.dev",
              "worker-src 'self' blob:",
              "form-action 'self'",
              "base-uri 'self'",
              "frame-ancestors 'none'",
              'block-all-mixed-content',
              'upgrade-insecure-requests',
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
  images: {
    domains: ['accounts.google.com', 'img.clerk.com', 'images.clerk.dev'],
  },
};

module.exports = nextConfig;
