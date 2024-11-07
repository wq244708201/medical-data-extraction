import { authMiddleware } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

export default authMiddleware({
  // 公共路由配置 - 无需登录即可访问
  publicRoutes: [
    '/',
    '/about',
    '/auth/sign-in',
    '/auth/sign-up',
    '/auth/sign-in/sso-callback/google',
    '/auth/sign-up/sso-callback/google',
    '/api/public/(.*)',
    '/pricing',
    // OAuth 相关路由
    '/sign-out',
    '/sso-callback',
    '/auth/sign-up/verify-email-address',
    // API 路由
    '/api/ai',
  ],

  // 忽略的路由 - 完全跳过中间件检查
  ignoredRoutes: [
    '/((?!api|trpc))/_next/static/(.*)',
    '/favicon.ico',
    '/fonts/(.*)',
    '/api/ai',
  ],

  // 中间件处理函数
  afterAuth(auth, req) {
    // 获取请求URL和路径信息
    const requestUrl = new URL(req.url);
    const isAuthPage = requestUrl.pathname.startsWith('/auth/');
    const isSignUpPage = requestUrl.pathname.startsWith('/auth/sign-up');
    const isOAuthCallback = requestUrl.pathname.includes('/sso-callback');
    const isHomePage = requestUrl.pathname === '/';

    // 设置 CSP 头
    const response = NextResponse.next();
    response.headers.set(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://*.clerk.accounts.dev",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' blob: data: https://*.clerk.com",
        "font-src 'self' data:",
        "frame-src 'self' https://accounts.google.com https://*.clerk.accounts.dev",
        "connect-src 'self' " +
          [
            'https://api.clerk.dev',
            'https://*.aliyuncs.com',
            'https://dashscope.aliyuncs.com',
            'wss:',
            'ws:',
            'https://accounts.google.com',
            'https://*.clerk.accounts.dev',
            'http://localhost:*',
            'https://localhost:*',
          ].join(' '),
      ]
        .join(';')
        .replace(/\n/g, ' ')
        .trim()
    );

    // 特别处理：在注册页面通过 OAuth 登录的已存在用户
    if (auth.userId && isSignUpPage && isOAuthCallback) {
      const dashboard = new URL('/dashboard', req.url);
      return NextResponse.redirect(dashboard);
    }

    // 用户未登录且访问需要认证的页面时，重定向到登录页面
    if (!auth.userId && !auth.isPublicRoute) {
      const signInUrl = new URL('/auth/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', requestUrl.href);
      return NextResponse.redirect(signInUrl);
    }

    // 已登录用户访问首页或认证页面时，重定向到 dashboard
    if (auth.userId && (isHomePage || isAuthPage)) {
      const dashboard = new URL('/dashboard', req.url);
      return NextResponse.redirect(dashboard);
    }

    return response;
  },
});

// 路由匹配器配置
export const config = {
  matcher: [
    // 配置所有路由，除了以下情况：
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
    // 匹配 API 路由
    '/api/(.*)',
  ],
};
