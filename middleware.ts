import { authMiddleware } from '@clerk/nextjs';

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
  ],
  ignoredRoutes: ['/api/webhook', '/_next/static', '/favicon.ico'],
  debug: true, // 开发时可以开启，生产环境记得关闭
  // 删除了 security 配置，因为这个参数在当前版本的 Clerk 中不被支持
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
