'use client';

import { useClerk } from '@clerk/nextjs';
import { useEffect } from 'react';

export default function GoogleSSOCallback() {
  const { handleRedirectCallback } = useClerk();

  useEffect(() => {
    async function handleCallback() {
      try {
        await handleRedirectCallback();
        window.location.href = '/';
      } catch (error) {
        console.error('Google callback error:', error);
        window.location.href = '/auth/sign-in';
      }
    }
    handleCallback();
  }, []); // 移除 handleRedirectCallback 依赖

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse">正在完成 Google 登录...</div>
    </div>
  );
}
