import { authMiddleware } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

export const middleware = authMiddleware({
  // 公开路由配置
  publicRoutes: [
    '/',
    '/about',
    '/auth/sign-in',
    '/auth/sign-up',
    '/auth/sign-up/sso-callback/google',
    '/auth/sign-up/sso-callback',
    '/api/public/(.*)',
    '/pricing',
    '/sign-out',
    '/sso-callback',
    '/auth/sign-up/verify-email-address',
    '/api/ai',
  ],
  afterAuth(auth, req) {
    const response = NextResponse.next();

    // 设置 CSP 头，特别处理 Cloudflare 相关域名
    response.headers.set(
      'Content-Security-Policy',
      `
        default-src 'self' https://*.clerk.com https://*.clerk.dev https://clerk.jingshen.cc;
        script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.com https://*.clerk.dev https://clerk.jingshen.cc https://*.google.com https://*.cloudflare.com https://*.turnstile.com https://challenges.cloudflare.com;
        style-src 'self' 'unsafe-inline' https://*.clerk.com;
        img-src 'self' blob: data: https://*.clerk.com https://*.clerk.dev https://clerk.jingshen.cc https://*.cloudflare.com;
        font-src 'self' https://*.clerk.com;
        connect-src 'self' https://*.clerk.com https://*.clerk.dev https://clerk.jingshen.cc https://*.cloudflare.com https://*.turnstile.com https://challenges.cloudflare.com;
        frame-src 'self' https://*.clerk.com https://*.clerk.dev https://clerk.jingshen.cc https://*.cloudflare.com https://*.turnstile.com https://*.google.com https://challenges.cloudflare.com http://localhost:3000 https://medical-data-extraction.vercel.app https://jingshen.cc https://www.jingshen.cc;
        worker-src 'self' blob: https://*.cloudflare.com;
        child-src 'self' blob: https://*.cloudflare.com https://challenges.cloudflare.com;
        frame-ancestors 'none';
        form-action 'self' https://*.clerk.com https://clerk.jingshen.cc;
        base-uri 'self';
        upgrade-insecure-requests;
      `
        .replace(/\s+/g, ' ')
        .trim()
    );

    // 添加额外的安全头
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    return response;
  },
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
