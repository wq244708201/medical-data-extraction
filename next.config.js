/** @type {import('next').NextConfig} */
const nextConfig = {
  // 删除原有注释行
  // 测试配置
  experimental: {
    scrollRestoration: true,
  },

  // 头部配置
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://*.clerk.accounts.dev https://clerk.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://*.clerk.com https://img.clerk.com https://images.clerk.dev",
              "frame-src 'self' https://accounts.google.com https://*.clerk.accounts.dev",
              "connect-src 'self' https://accounts.google.com https://*.clerk.accounts.dev https://clerk.com",
              "form-action 'self'",
              "base-uri 'self'",
              "font-src 'self' data:",
              "media-src 'self'",
              "worker-src 'self' blob:",
              "manifest-src 'self'",
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

  // 重写配置
  async rewrites() {
    return [
      {
        source: '/auth/:path*',
        destination: '/auth/:path*',
      },
      // 添加以下新的重写规则
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

  // 重定向配置(新增)
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

  // 图片域名配置
  images: {
    domains: ['accounts.google.com', 'img.clerk.com', 'images.clerk.dev'],
  },
};

module.exports = nextConfig;
