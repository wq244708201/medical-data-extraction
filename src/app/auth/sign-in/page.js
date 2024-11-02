'use client';
import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <SignIn
          appearance={{
            elements: {
              formButtonPrimary:
                'bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-all duration-200',
              footerActionLink: 'text-blue-600 hover:text-blue-800 font-medium',
            },
          }}
          redirectUrl="/"
          routing="path"
          signUpUrl="/auth/sign-up"
        />
      </div>
    </div>
  );
}
