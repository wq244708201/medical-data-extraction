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
            },
          }}
          redirectUrl="/"
          routing="path"
          signInUrl="/auth/sign-in"
          localization={{
            signUp: {
              title: '创建账号',
              subtitle: '请填写以下信息注册账号',
              primaryButtonText: '注册',
              alternateMethods: '其他注册方式',
            },
            socialButtonsBlockButton: '使用{{provider}}账号注册',
            dividerText: '或',
            formFieldLabel__emailAddress: '电子邮箱',
            formFieldLabel__password: '密码',
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
