/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://dashscope.aliyuncs.com/api/:path*',
      },
    ];
  },
  async headers() {
    return [
      {
        // API 路由的 headers
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
          {
            key: 'Access-Control-Allow-Headers',
            value:
              'Content-Type, Authorization, X-DashScope-AccessKeyId, X-DashScope-AccessKeySecret',
          },
        ],
      },
      {
        // 所有路由的安全 headers
        source: '/:path*',
        headers: [
          // 安全相关的 headers
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Set-Cookie',
            value:
              '__Host-next-auth.csrf-token=*; Path=/; Secure; HttpOnly; SameSite=Lax',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' https: data:",
              "frame-src 'self' https://accounts.google.com",
              "connect-src 'self' https://accounts.google.com https://*.clerk.accounts.dev",
              "font-src 'self' data:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              'upgrade-insecure-requests',
            ].join('; '),
          },
        ],
      },
    ];
  },
  // 确保图片域名白名单
  images: {
    domains: ['accounts.google.com', 'clerk.accounts.dev'],
  },
};

module.exports = nextConfig;
