'use client';
import { ClerkProvider } from '@clerk/nextjs';
import localFont from 'next/font/local';
import './globals.css';
import { ToastProvider } from './contexts/ToastContext';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      localization={{
        locale: 'zh-CN',
        signIn: {
          title: '登录',
          subtitle: '继续使用您的账号',
        },
        signUp: {
          title: '注册',
          subtitle: '创建您的账号',
        },
      }}
      appearance={{
        layout: {
          socialButtonsPlacement: 'top',
        },
        elements: {
          rootBox: 'mx-auto',
          card: 'shadow-md',
          formButtonPrimary: 'bg-blue-500 hover:bg-blue-600 text-white',
        },
      }}
    >
      <html lang="zh">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ToastProvider>{children}</ToastProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
