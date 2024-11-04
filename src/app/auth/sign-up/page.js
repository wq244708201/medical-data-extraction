'use client';
import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <SignUp
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
          path="/auth/sign-up"
          routing="path"
          signInUrl="/auth/sign-in"
          redirectUrl="/"
          afterSignUpUrl="/"
          localization={{
            signUp: {
              title: '创建账号',
              subtitle: '请填写以下信息注册账号',
              primaryButtonText: '注册',
              alternateMethods: '其他注册方式',
            },
            socialButtonsBlockButton: {
              google: '使用Google账号注册',
            },
            dividerText: '或',
            formFieldLabel_emailAddress: '邮箱地址',
            formFieldLabel_password: '密码',
            signIn: {
              actionText: '已有账号？',
              modalActionText: '立即登录',
            },
          }}
        />
      </div>
    </div>
  );
}
