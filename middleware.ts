import { authMiddleware } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

// 固定格式，用来排除 _ 开头和带扩展名的路径
const PROTECTED_PATHS = ['/dashboard', '/api/ai'];

export default authMiddleware({
  // 配置公开路由
  publicRoutes: ['/', '/about', '/auth(.*)'],

  beforeAuth: req => {
    const url = req.nextUrl;
    if (url.hostname === 'www.jingshen.cc') {
      url.hostname = 'jingshen.cc';
      return NextResponse.redirect(url);
    }
  },

  // 认证检查
  afterAuth(auth, req) {
    const url = req.nextUrl;
    const isProtectedPath = PROTECTED_PATHS.some(path =>
      url.pathname.startsWith(path)
    );

    // 如果是受保护的路径且用户未登录
    if (isProtectedPath && !auth.userId) {
      const signInUrl = new URL('/auth/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', url.pathname);
      return NextResponse.redirect(signInUrl);
    }

    const response = NextResponse.next();

    // 安全响应头设置
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

// 更新 matcher 配置
export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next|favicon.ico).*)'],
};
