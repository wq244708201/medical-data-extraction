// src/app/auth/sign-up/verify-email-address/page.js
import { SignUp } from '@clerk/nextjs';

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <SignUp />
    </div>
  );
}
