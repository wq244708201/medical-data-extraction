import { authMiddleware } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

// 受保护的路径配置
const PROTECTED_PATHS = ['/dashboard', '/api/ai'];

// 允许的域名列表
const ALLOWED_ORIGINS = [
  'https://jingshen.cc',
  'https://www.jingshen.cc',
  'https://medical-data-extraction.vercel.app',
  'https://clerk.jingshen.cc',
  'https://accounts.clerk.dev',
];

export default authMiddleware({
  // 公开路由配置
  publicRoutes: [
    '/',
    '/about',
    '/auth(.*)',
    '/api/webhook(.*)', // 添加 webhook 路由
  ],

  beforeAuth: req => {
    const url = req.nextUrl;
    // www 域名重定向
    if (url.hostname === 'www.jingshen.cc') {
      url.hostname = 'jingshen.cc';
      return NextResponse.redirect(url);
    }
  },

  afterAuth(auth, req) {
    const url = req.nextUrl;
    const origin = req.headers.get('origin');

    // 检查是否是受保护的路径
    const isProtectedPath = PROTECTED_PATHS.some(path =>
      url.pathname.startsWith(path)
    );

    // 未登录用户访问受保护路径时重定向到登录页
    if (isProtectedPath && !auth.userId) {
      const signInUrl = new URL('/auth/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', url.pathname);
      return NextResponse.redirect(signInUrl);
    }

    const response = NextResponse.next();

    // CORS 配置
    if (origin) {
      if (ALLOWED_ORIGINS.includes(origin)) {
        response.headers.set('Access-Control-Allow-Origin', origin);
        response.headers.set('Access-Control-Allow-Credentials', 'true');
        response.headers.set(
          'Access-Control-Allow-Methods',
          'GET, POST, PUT, DELETE, OPTIONS'
        );
        response.headers.set(
          'Access-Control-Allow-Headers',
          'Content-Type, Authorization, X-Requested-With'
        );
      }
    }

    // 基础安全头设置
    const securityHeaders = {
      'X-Frame-Options': 'SAMEORIGIN',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    };

    // 设置安全头
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // Content Security Policy 配置
    const cspDirectives = [
      "default-src 'self' " + ALLOWED_ORIGINS.join(' '),
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://clerk.jingshen.cc https://accounts.clerk.dev https://va.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "frame-src 'self' " + ALLOWED_ORIGINS.join(' '),
      "connect-src 'self' " +
        ALLOWED_ORIGINS.join(' ') +
        ' https://*.clerk.dev https://va.vercel-scripts.com',
      "media-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      'upgrade-insecure-requests',
    ];

    response.headers.set('Content-Security-Policy', cspDirectives.join('; '));

    return response;
  },

  debug: process.env.NODE_ENV === 'development',
});

// 更新的 matcher 配置
export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
