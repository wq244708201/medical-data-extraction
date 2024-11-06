import { authMiddleware, redirectToSignIn } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

export default authMiddleware({
  // 公共路由配置 - 匹配添加自动的
  publicRoutes: [
    '/',
    '/about',
    '/auth/sign-in',
    '/auth/sign-up',
    '/auth/sign-in/sso-callback/google',
    '/auth/sign-in/sso-callback',
    '/auth/sign-in/factor-one',
    '/auth/sign-in/factor-two',
    '/auth/sign-in/verify-email',
    '/auth/sign-in/reset-password',
    '/auth/sign-in/*',
    '/auth/sign-up/sso-callback',
    '/auth/sign-in/sso-callback/(.+)',
    '/auth/sign-up/sso-callback/(.+)',
    '/api/public/(.+)',
    '/pricing',
    // 添加登出相关路径
    '/sign-out',
    '/sso-callback',
    '/auth/sign-up/verify-email-address',
  ],

  // 忽略的静态资源路由
  ignoredRoutes: [
    '/(((?!api)(?!trpc))/_next/static/(.+)',
    '/favicon.ico',
    '/fonts/(.+)',
  ],

  // 认证后的处理逻辑
  afterAuth(auth, req) {
    // 获取请求的路径
    const requestUrl = new URL(req.url);
    const isAuthPage = requestUrl.pathname.startsWith('/auth/');

    // 设置 CSP 头
    const response = NextResponse.next();
    response.headers.set(
      'Content-Security-Policy',
      `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://*.clerk.accounts.dev;
      style-src 'self' 'unsafe-inline';
      img-src 'self' blob: data: https://*.clerk.com;
      font-src 'self' data:;
      frame-src 'self' https://accounts.google.com https://*.clerk.accounts.dev;
      connect-src 'self' 
        https://api.clerk.dev 
        https://*.aliyuncs.com 
        https://dashscope.aliyuncs.com
        wss: 
        ws:
        https://accounts.google.com 
        https://*.clerk.accounts.dev 
        http://localhost:*
        https://localhost:*;
    `
        .replace(/\n/g, ' ')
        .trim()
    );

    // 如果用户未登录且访问的不是公共分页面，重定向到登录页面
    if (!auth.userId && !auth.isPublicRoute) {
      return redirectToSignIn({ returnBackUrl: requestUrl.href });
    }

    // 如果用户已登录且正在访问认证页面，重定向到 dashboard
    if (auth.userId && isAuthPage) {
      return Response.redirect(new URL('/dashboard', requestUrl.origin));
    }

    return response;
  },
});

// 路由匹配配置
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/(((?!_next/static|_next/image|favicon.ico|public|fonts).*)',
  ],
};
