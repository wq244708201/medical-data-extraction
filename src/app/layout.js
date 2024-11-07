'use client';

import { ClerkProvider } from '@clerk/nextjs';
import localFont from 'next/font/local';
import { ToastProvider } from '../contexts/ToastContext';
import './globals.css';

// 保持原有的字体配置
const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
});

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
});

import { headers } from 'next/headers';

export default function RootLayout({ children }) {
  const nonce = headers().get('x-nonce');

  return (
    <html lang="zh">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClerkProvider
          appearance={{
            layout: {
              socialButtonsPlacement: 'top',
            },
            elements: {
              rootBox: 'mx-auto',
              card: 'shadow-md',
              formButtonPrimary: 'bg-blue-500 hover:bg-blue-600 text-white',
            },
            localization: {
              locale: 'zh-CN',
              socialButtonsBlockButton: '使用 {{provider}} 账号登录',
              signIn: {
                title: '登录',
                subtitle: '继续使用所有功能号',
              },
              signUp: {
                title: '注册',
                subtitle: '创建你的账号',
              },
            },
          }}
          scriptNonce={nonce}
        >
          <ToastProvider>{children}</ToastProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
