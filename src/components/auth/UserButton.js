'use client';

import { UserButton as ClerkUserButton } from '@clerk/nextjs';

export function UserButton() {
  return (
    <ClerkUserButton
      afterSignOutUrl="/"
      afterMultiSessionSingleSignOutUrl="/"
      appearance={{
        elements: {
          userButtonAvatarBox: 'w-10 h-10',
          userButtonTrigger:
            'focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full',
          userButtonPopoverCard: 'shadow-lg rounded-lg border border-gray-200',
          userButtonPopoverActions: 'p-2',
          userButtonPopoverActionButton:
            'hover:bg-gray-100 rounded-md transition-colors duration-200',
        },
        variables: {
          colorPrimary: '#4F46E5',
          colorText: '#111827',
          colorBackground: '#ffffff',
        },
      }}
      localization={{
        signOut: '退出登录',
        userProfile: '个人资料',
      }}
      showName={true}
      userProfileMode="modal" // 改为 modal 模式，这样会直接打开 Clerk 的个人资料模态框
    />
  );
}

export default UserButton;
