import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  publicRoutes: [
    '/',
    '/sign-in',
    '/sign-up',
    '/api/public',
    '/api/webhook',
    '/auth/sign-in',
    '/auth/sign-up',
    '/auth/sign-in/sso-callback',
    '/auth/sign-up/sso-callback',
    '/auth/sign-in/sso-callback/google',
    '/auth/sign-up/sso-callback/google',
  ],
  ignoredRoutes: [
    '/_next/static',
    '/favicon.ico',
    '/api/public',
    '/api/webhook',
  ],
});

export const config = {
  matcher: ['/((?!.*\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
