'use client';

import { useClerk } from '@clerk/nextjs';
import { useEffect } from 'react';

export default function SSOCallback() {
  const { handleRedirectCallback } = useClerk();

  useEffect(() => {
    async function handleCallback() {
      try {
        await handleRedirectCallback();
        window.location.href = '/';
      } catch (error) {
        console.error('Callback error:', error);
        // 错误时重定向到登录页
        window.location.href = '/auth/sign-in';
      }
    }
    handleCallback();
  }, []); // 移除 handleRedirectCallback 依赖

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse">处理登录中...</div>
    </div>
  );
}
