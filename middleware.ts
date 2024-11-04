import { authMiddleware } from '@clerk/nextjs';

const addSecurityHeaders = (headers: Headers) => {
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('X-XSS-Protection', '1; mode=block');
  headers.set('Referrer-Policy', 'same-origin');
};

export default authMiddleware({
  publicRoutes: [
    '/',
    '/api/public',
    '/auth/sign-in',
    '/auth/sign-up',
    '/auth/sign-in/sso-callback',
    '/auth/sign-in/sso-callback/google',
    '/auth/sign-up/sso-callback',
    '/auth/sign-up/sso-callback/google',
    // 添加新的公共路由
    '/auth/sign-up/verify-email',
    '/auth/sign-up/verify-email-code',
    '/auth/reset-password',
  ],
  ignoredRoutes: ['/api/webhook', '/_next/static', '/favicon.ico'],
  debug: true, // 开发环境使用，生产环境记得关闭
  beforeAuth: req => {
    addSecurityHeaders(req.headers);
    return null;
  },
});

export const config = {
  matcher: ['/((?!.*\\..+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
