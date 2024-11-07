/** @type {import('next').NextConfig} */
const nextConfig = {
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
            value:
              process.env.NODE_ENV === 'development'
                ? '' // 开发环境不启用 CSP
                : [
                    "default-src 'self'",
                    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://*.clerk.accounts.dev https://clerk.com https://clerk.jingshen.cc",
                    "style-src 'self' 'unsafe-inline'",
                    "img-src 'self' data: blob: https://*.clerk.com https://img.clerk.com https://images.clerk.dev https://clerk.jingshen.cc",
                    "frame-src 'self' https://accounts.google.com https://*.clerk.accounts.dev https://clerk.jingshen.cc",
                    "connect-src 'self' https://accounts.google.com https://*.clerk.accounts.dev https://clerk.com https://clerk.jingshen.cc https://api.clerk.dev https://*.allyncs.com https://dashscope.aliyuncs.com wss: ws:",
                    "form-action 'self'",
                    "base-uri 'self'",
                    "font-src 'self' data:",
                    "media-src 'self'",
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

  // 保持原有的重写配置
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

  // 保持原有的重定向配置
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

  // 保持原有的图片域名配置
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
