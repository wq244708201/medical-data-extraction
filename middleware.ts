import { authMiddleware } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const middleware = authMiddleware({
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
  async afterAuth(auth, req) {
    const requestUrl = new URL(req.url);
    const isAuthPage = requestUrl.pathname.startsWith('/auth');
    const isSignUpPage = requestUrl.pathname.startsWith('/auth/sign-up');
    const isAuthCallback = requestUrl.pathname.includes('/sso-callback');
    const isHomePage = requestUrl.pathname === '/';

    // 设置响应
    const response = NextResponse.next();

    // 添加 CSP 头
    response.headers.set(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.google.com https://*.clerk.com https://*.clerk.dev https://clerk.jingshen.cc https://*.cloudflare.com https://*.turnstile.com https://*.clerk.accounts.dev 'nonce-*'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob: https://*.clerk.com https://*.clerk.dev https://clerk.jingshen.cc https://*.cloudflare.com",
        "font-src 'self'",
        "connect-src 'self' https://*.google.com https://*.clerk.com https://*.clerk.dev https://clerk.jingshen.cc https://*.turnstile.com https://*.clerk.accounts.dev",
        "frame-src 'self' https://*.google.com https://*.clerk.com https://*.clerk.dev https://clerk.jingshen.cc https://*.turnstile.com https://*.clerk.accounts.dev",
        "frame-ancestors 'none'",
        "form-action 'self'",
        "media-src 'self'",
        "worker-src 'self' blob:",
        "manifest-src 'self'",
        "object-src 'none'",
      ].join('; ')
    );

    // 特殊处理: 在注册页面进行回调验证时，重定向已存在用户
    if (auth.userId && isSignUpPage && isAuthCallback) {
      const dashboard = new URL('/dashboard', req.url);
      return NextResponse.redirect(dashboard);
    }

    // 用户未登录且访问的路由需要认证时，重定向到登录页面
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

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public|.*).*)',
    '/api/((?!public).*)',
  ],
};
