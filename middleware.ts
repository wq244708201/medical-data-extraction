import { authMiddleware } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

export default authMiddleware({
  // 简化公共路由配置
  publicRoutes: [
    '/',
    '/about',
    '/auth/*', // 这会匹配所有 auth 路径
    '/api/*', // 这会匹配所有 api 路径
  ],
  ignoredRoutes: ['/api/webhook'],

  afterAuth(auth, req) {
    // 如果用户未登录且访问的不是公共路由，重定向到登录页
    if (!auth.userId && !auth.isPublicRoute) {
      const signInUrl = new URL('/auth/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }

    const response = NextResponse.next();

    // 简化的 CSP 配置，只保留关键部分
    response.headers.set(
      'Content-Security-Policy',
      `
        default-src 'self' https://*.clerk.com https://*.clerk.dev https://*.google.com;
        script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.com https://*.clerk.dev https://*.google.com https://*.cloudflare.com;
        style-src 'self' 'unsafe-inline' https://*.clerk.com https://fonts.googleapis.com;
        img-src 'self' blob: data: https://*.clerk.com https://*.clerk.dev https://*.google.com;
        font-src 'self' data: https://*.clerk.com https://fonts.gstatic.com;
        connect-src 'self' https://*.clerk.com https://*.clerk.dev https://*.google.com;
        frame-src 'self' https://*.clerk.com https://*.clerk.dev https://*.google.com https://accounts.google.com;
        form-action 'self' https://*.clerk.com https://accounts.google.com;
      `
        .replace(/\s+/g, ' ')
        .trim()
    );

    // 基本安全头部
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    return response;
  },
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
