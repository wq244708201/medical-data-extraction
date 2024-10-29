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
  // 添加以下配置
  async headers() {
    return [
      {
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
    ];
  },
};

module.exports = nextConfig;
