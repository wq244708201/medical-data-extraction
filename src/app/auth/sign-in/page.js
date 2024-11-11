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
              card: 'shadow-md rounded-lg',
              socialButtonsBlockButton:
                'w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
            },
          }}
          path="/auth/sign-in"
          routing="path"
          signUpUrl="/auth/sign-up"
          redirectUrl="/dashboard"
          afterSignInUrl="/dashboard"
          afterSignOutUrl="/"
          signInUrl="/auth/sign-in"
          localization={{
            signIn: {
              title: '登录账号',
              subtitle: '请使用您的账号登录系统',
              primaryButtonText: '登录',
              alternateMethods: '其他登录方式',
            },
            socialButtonsBlockButton: {
              google: '使用Google账号登录',
            },
            dividerText: '或',
            formFieldLabel_emailAddress: '邮箱地址',
            formFieldLabel_password: '密码',
            actionText: '还没有账号？',
            modalActionText: '立即注册',
          }}
        />
      </div>
    </div>
  );
}
