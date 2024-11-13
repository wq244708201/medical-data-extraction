import { authMiddleware } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

// 固定格式，用来排除 _ 开头和带扩展名的路径
const PROTECTED_PATHS = ['/dashboard', '/api/ai'];

// 添加允许的域名列表
const ALLOWED_ORIGINS = [
  'https://jingshen.cc',
  'https://www.jingshen.cc',
  'https://medical-data-extraction.vercel.app',
  'https://clerk.jingshen.cc',
  'https://accounts.clerk.dev',
];

export default authMiddleware({
  // 配置公开路由
  publicRoutes: ['/', '/about', '/auth(.*)'],

  beforeAuth: req => {
    const url = req.nextUrl;
    // www 域名重定向
    if (url.hostname === 'www.jingshen.cc') {
      url.hostname = 'jingshen.cc';
      return NextResponse.redirect(url);
    }
  },

  // 认证检查
  afterAuth(auth, req) {
    const url = req.nextUrl;
    const origin = req.headers.get('origin');

    // 检查是否是受保护的路径
    const isProtectedPath = PROTECTED_PATHS.some(path =>
      url.pathname.startsWith(path)
    );

    // 如果是受保护的路径且用户未登录
    if (isProtectedPath && !auth.userId) {
      const signInUrl = new URL('/auth/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', url.pathname);
      return NextResponse.redirect(signInUrl);
    }

    const response = NextResponse.next();

    // CORS 配置
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
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

    // 安全响应头设置
    response.headers.set('X-Frame-Options', 'SAMEORIGIN'); // 修改为 SAMEORIGIN
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=()'
    );
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    );

    // 添加 Content-Security-Policy
    response.headers.set(
      'Content-Security-Policy',
      `
        default-src 'self' ${ALLOWED_ORIGINS.join(' ')};
        script-src 'self' 'unsafe-inline' 'unsafe-eval' https://clerk.jingshen.cc https://accounts.clerk.dev;
        style-src 'self' 'unsafe-inline';
        img-src 'self' data: https: blob:;
        font-src 'self' data:;
        frame-src 'self' ${ALLOWED_ORIGINS.join(' ')};
        connect-src 'self' ${ALLOWED_ORIGINS.join(' ')} https://api.clerk.dev https://clerk.jingshen.cc https://accounts.clerk.dev;
      `
        .replace(/\s+/g, ' ')
        .trim()
    );

    return response;
  },

  // 添加调试模式
  debug: process.env.NODE_ENV === 'development',
});

// 更新 matcher 配置，确保包含所有需要的路由
export const config = {
  matcher: [
    '/((?!.+\\.[\\w]+$|_next|favicon.ico).*)',
    '/',
    '/(api|trpc)(.*)',
    '/dashboard(.*)',
  ],
};
