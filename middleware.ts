import { authMiddleware } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const middleware = authMiddleware({
  // 公共路由配置
  publicRoutes: [
    '/',
    '/about',
    '/auth/sign-in',
    '/auth/sign-up',
    '/auth/sign-in/sso-callback/google',
    '/auth/sign-up/sso-callback/google',
    '/api/public/(.*)',
    '/pricing',
    '/sign-out',
    '/sso-callback',
    '/auth/sign-up/verify-email-address',
    '/api/ai',
  ],

  afterAuth(auth, req) {
    // 获取请求URL和路径信息
    const requestUrl = new URL(req.url);
    const isAuthPage = requestUrl.pathname.startsWith('/auth/');
    const isSignUpPage = requestUrl.pathname.startsWith('/auth/sign-up');
    const isAuthCallback = requestUrl.pathname.includes('/sso-callback');
    const isHomePage = requestUrl.pathname === '/';

    // 设置 CSP
    const response = NextResponse.next();
    const nonce = Buffer.from(crypto.randomUUID()).toString('base64');

    response.headers.set(
      'Content-Security-Policy',
      `
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev https://clerk.com https://accounts.google.com;
        style-src 'self' 'unsafe-inline';
        img-src 'self' blob: data: https://*.clerk.com;
        font-src 'self';
        frame-src 'self' https://*.clerk.com https://accounts.google.com;
        connect-src 'self' https://*.clerk.com https://accounts.google.com https://api.clerk.dev https://*.allyncs.com https://dashscope.aliyuncs.com wss: ws: https://accounts.google.com https://*.clerk.accounts.dev http://localhost:* https://localhost:*;
        object-src 'none';
        base-uri 'self';
        form-action 'self';
        frame-ancestors 'none';
      `
        .replace(/\s{2,}/g, ' ')
        .trim()
    );

    // 特殊处理：在注册页面进过谷歌认证，登录后已存在用户
    if (auth.userId && isSignUpPage && isAuthCallback) {
      const dashboard = new URL('/dashboard', req.url);
      return NextResponse.redirect(dashboard);
    }

    // 用户未登录且访问的路由需认证的路由时，重定向到登录页面
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

// 需要忽略的路由 - 完全排除中间件检查
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public|.*).*)/',
    '/api/((?!public).*)/',
  ],
};
