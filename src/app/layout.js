'use client';
import localFont from 'next/font/local';
import './globals.css';
import { ToastProvider } from './contexts/ToastContext';

const geistSans = localFont({
  src: './fonts/GeistVF.woff', // 修改这里
  variable: '--font-geist-sans',
  weight: '100 900',
});

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff', // 修改这里
  variable: '--font-geist-mono',
  weight: '100 900',
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
