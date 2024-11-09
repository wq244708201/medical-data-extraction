import { authMiddleware } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

export const middleware = authMiddleware({
  publicRoutes: [
    '/',
    '/about',
    '/auth/sign-in',
    '/auth/sign-up',
    '/auth/sign-up/sso-callback/google',
    '/auth/sign-in/sso-callback/google', // 添加这个路由
    '/auth/sign-up/sso-callback',
    '/auth/sign-in/sso-callback', // 添加这个路由
    '/api/public/(.*)',
    '/pricing',
    '/sign-out',
    '/sso-callback',
    '/auth/sign-up/verify-email-address',
    '/api/ai',
  ],
  ignoredRoutes: [
    '/api/webhook', // 如果有 webhook 路由的话
  ],
  debug: true, // 临时开启调试模式，排查问题后可以移除
  afterAuth(auth, req) {
    const response = NextResponse.next();

    // 更新的 CSP 配置
    response.headers.set(
      'Content-Security-Policy',
      `
        default-src 'self' https://*.clerk.com https://*.clerk.dev https://clerk.jingshen.cc https://clerk.medical-data-extraction.vercel.app https://*.google.com;
        
        script-src 'self' 'unsafe-inline' 'unsafe-eval' 
          https://*.clerk.com 
          https://*.clerk.dev 
          https://*.google.com 
          https://*.cloudflare.com 
          https://*.turnstile.com 
          https://challenges.cloudflare.com 
          https://clerk.jingshen.cc 
          https://clerk.medical-data-extraction.vercel.app 
          https://accounts.google.com;
        
        style-src 'self' 'unsafe-inline' 
          https://*.clerk.com 
          https://*.clerk.dev 
          https://fonts.googleapis.com;
        
        img-src 'self' blob: data: 
          https://*.clerk.com 
          https://*.clerk.dev 
          https://clerk.jingshen.cc 
          https://clerk.medical-data-extraction.vercel.app 
          https://*.cloudflare.com 
          https://*.google.com 
          https://accounts.google.com;
        
        font-src 'self' data: 
          https://*.clerk.com 
          https://fonts.gstatic.com;
        
        connect-src 'self' 
          https://*.clerk.com 
          https://*.clerk.dev 
          https://clerk.jingshen.cc 
          https://clerk.medical-data-extraction.vercel.app 
          https://*.cloudflare.com 
          https://*.turnstile.com 
          https://challenges.cloudflare.com 
          https://accounts.google.com;
        
        frame-src 'self' 
          https://*.clerk.com 
          https://*.clerk.dev 
          https://clerk.jingshen.cc 
          https://clerk.medical-data-extraction.vercel.app 
          https://*.google.com 
          https://*.cloudflare.com 
          https://challenges.cloudflare.com 
          https://turnstile.cloudflare.com 
          http://localhost:3000 
          https://*.jingshen.cc 
          https://*.vercel.live 
          https://accounts.google.com;
        
        worker-src 'self' blob: 
          https://*.cloudflare.com 
          'unsafe-inline' 
          'unsafe-eval';
        
        child-src 'self' blob: 
          https://*.cloudflare.com 
          https://challenges.cloudflare.com;
        
        frame-ancestors 'self';
        
        form-action 'self' 
          https://*.clerk.com 
          https://clerk.jingshen.cc 
          https://clerk.medical-data-extraction.vercel.app 
          https://accounts.google.com;
        
        base-uri 'self';
        upgrade-insecure-requests;
      `
        .replace(/\s+/g, ' ')
        .trim()
    );

    // 安全头部设置
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=()'
    );

    // 如果用户未认证且不是公共路由，重定向到登录页面
    if (!auth.userId && !auth.isPublicRoute) {
      const signInUrl = new URL('/auth/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }

    return response;
  },
});

export const config = {
  matcher: [
    '/((?!.*\\..*|_next).*)', // 匹配所有不包含文件扩展名的路由
    '/', // 匹配根路径
    '/(api|trpc)(.*)', // 匹配所有 API 路由
  ],
};
