'use client'; // 添加这个标记表明这是客户端组件

import { useState, useEffect } from 'react';
import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';

export default function SSOCallback() {
  const [redirectUrl, setRedirectUrl] = useState('/dashboard');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setRedirectUrl(`${window.location.origin}/dashboard`);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <AuthenticateWithRedirectCallback
        afterSignInUrl="/dashboard"
        afterSignUpUrl="/dashboard"
        redirectUrl={redirectUrl}
      />
    </div>
  );
}
