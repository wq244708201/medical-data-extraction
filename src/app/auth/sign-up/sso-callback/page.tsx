'use client';

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';

export default function SignUpSSOCallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse">处理注册中...</div>
      <AuthenticateWithRedirectCallback
        afterSignInUrl="/dashboard"
        afterSignUpUrl="/dashboard"
      />
    </div>
  );
}
