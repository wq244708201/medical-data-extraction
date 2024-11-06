'use client';

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';

export default function SSOCallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <AuthenticateWithRedirectCallback
        afterSignInUrl="/dashboard"
        afterSignUpUrl="/dashboard"
        redirectUrl={`${window.location.origin}/dashboard`}
      />
    </div>
  );
}
