import { authMiddleware } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

export default authMiddleware({
  publicRoutes: ['/', '/about', '/auth/*', '/api/*'],
  ignoredRoutes: ['/api/webhook'],

  beforeAuth: req => {
    const url = req.nextUrl;
    if (url.hostname === 'www.jingshen.cc') {
      url.hostname = 'jingshen.cc';
      return NextResponse.redirect(url);
    }
  },

  afterAuth(auth, req) {
    if (!auth.userId && !auth.isPublicRoute) {
      const signInUrl = new URL('/auth/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }

    const response = NextResponse.next();
    const nonce = Buffer.from(crypto.randomUUID()).toString('base64');

    // 更新的 CSP 配置
    response.headers.set(
      'Content-Security-Policy',
      `
        default-src 'self' https://*.clerk.com https://*.clerk.accounts.dev;
        script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.com https://*.clerk.accounts.dev https://*.google.com https://*.cloudflare.com;
        style-src 'self' 'unsafe-inline' https://*.clerk.com https://fonts.googleapis.com;
        img-src 'self' blob: data: https://*.clerk.com https://*.googleusercontent.com;
        font-src 'self' data: https://fonts.gstatic.com;
        frame-src 'self' https://*.clerk.com https://*.clerk.accounts.dev https://accounts.google.com https://challenges.cloudflare.com;
        connect-src 'self' https://*.clerk.com https://*.clerk.accounts.dev https://accounts.google.com wss://*.clerk.accounts.dev https://*.google.com;
        form-action 'self' https://*.clerk.com https://accounts.google.com;
        media-src 'self';
        worker-src 'self' blob:;
        child-src 'self' blob:;
        object-src 'none';
        frame-ancestors 'self';
        base-uri 'self';
        upgrade-insecure-requests;
      `
        .replace(/\s+/g, ' ')
        .trim()
    );

    // 安全相关的其他响应头
    response.headers.set('X-Frame-Options', 'DENY');
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

    return response;
  },
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
