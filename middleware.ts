import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  // 公开路由配置
  publicRoutes: ['/', '/auth/sign-in', '/auth/sign-up', '/api/public'],

  // 忽略的路由
  ignoredRoutes: ['/_next/static', '/favicon.ico', '/api/public'],
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
