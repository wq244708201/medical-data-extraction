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

  // 添加 beforeAuth 处理程序来处理 www 重定向
  beforeAuth: req => {
    const url = req.nextUrl;
    // 重定向 www 到非 www
    if (url.hostname === 'www.jingshen.cc') {
      url.hostname = 'jingshen.cc';
      return NextResponse.redirect(url);
    }
  },

  afterAuth(auth, req) {
    // 如果用户未登录且访问的不是公共路由，重定向到登录页
    if (!auth.userId && !auth.isPublicRoute) {
      const signInUrl = new URL('/auth/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }

    const response = NextResponse.next();

    // 优化的 CSP 配置
    response.headers.set(
      'Content-Security-Policy',
      `
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval' 
          https://*.clerk.com 
          https://*.clerk.dev 
          https://*.google.com 
          https://*.cloudflare.com 
          https://*.vercel.app 
          https://*.vercel.live;
        connect-src 'self' 
          https://*.clerk.com 
          https://*.clerk.dev 
          https://*.google.com 
          https://*.cloudflare.com 
          https://*.vercel.app 
          wss://*.vercel.live;
        style-src 'self' 'unsafe-inline' 
          https://*.clerk.com 
          https://fonts.googleapis.com;
        img-src 'self' blob: data: 
          https://*.clerk.com 
          https://*.clerk.dev 
          https://*.google.com;
        font-src 'self' data: 
          https://*.clerk.com 
          https://fonts.gstatic.com;
        frame-src 'self' 
          https://*.clerk.com 
          https://*.clerk.dev 
          https://*.google.com 
          https://accounts.google.com 
          https://*.turnstile.com;
        form-action 'self' 
          https://*.clerk.com 
          https://accounts.google.com;
        worker-src 'self' blob:;
        manifest-src 'self';
        media-src 'self';
        object-src 'none';
      `
        .replace(/\s+/g, ' ')
        .trim()
    );

    // 基本安全头部
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=()'
    );

    return response;
  },
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
