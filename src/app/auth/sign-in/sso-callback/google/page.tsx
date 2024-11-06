'use client';

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';

export default function GoogleSSOCallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse">正在完成 Google 登录...</div>
      <AuthenticateWithRedirectCallback
        afterSignInUrl="/dashboard"
        afterSignUpUrl="/dashboard"
      />
    </div>
  );
}
