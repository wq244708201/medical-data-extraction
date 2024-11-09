import { authMiddleware } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

export const middleware = authMiddleware({
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

    response.headers.set(
      'Content-Security-Policy',
      `
        default-src 'self' https://*.clerk.com https://*.clerk.dev https://clerk.jingshen.cc https://*.google.com;
        script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.com https://*.clerk.dev https://*.google.com https://*.cloudflare.com https://*.turnstile.com https://challenges.cloudflare.com https://clerk.jingshen.cc https://accounts.google.com;
        style-src 'self' 'unsafe-inline' https://*.clerk.com https://*.clerk.dev https://fonts.googleapis.com;
        img-src 'self' blob: data: https://*.clerk.com https://*.clerk.dev https://clerk.jingshen.cc https://*.cloudflare.com https://*.google.com https://accounts.google.com;
        font-src 'self' data: https://*.clerk.com https://fonts.gstatic.com;
        connect-src 'self' https://*.clerk.com https://*.clerk.dev https://clerk.jingshen.cc https://*.cloudflare.com https://*.turnstile.com https://challenges.cloudflare.com https://accounts.google.com;
        frame-src 'self' https://*.clerk.com https://*.clerk.dev https://clerk.jingshen.cc https://*.google.com https://*.cloudflare.com https://challenges.cloudflare.com https://turnstile.cloudflare.com http://localhost:3000 https://*.jingshen.cc https://*.vercel.live https://accounts.google.com;
        worker-src 'self' blob: https://*.cloudflare.com 'unsafe-inline' 'unsafe-eval';
        child-src 'self' blob: https://*.cloudflare.com https://challenges.cloudflare.com;
        frame-ancestors 'self';
        form-action 'self' https://*.clerk.com https://clerk.jingshen.cc https://accounts.google.com;
        base-uri 'self';
        upgrade-insecure-requests;
      `
        .replace(/\s+/g, ' ')
        .trim()
    );

    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    return response;
  },
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
