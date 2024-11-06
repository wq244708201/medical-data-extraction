'use client';

import { UserButton as ClerkUserButton } from '@clerk/nextjs';

export function UserButton() {
  return (
    <ClerkUserButton
      afterSignOutUrl="/"
      appearance={{
        elements: {
          userButtonAvatarBox: 'w-10 h-10',
          userButtonTrigger:
            'focus:outline-none focus:ring-2 focus:ring-blue-500',
        },
        variables: {
          colorPrimary: '#4F46E5', // 主题色，可以根据需要调整
        },
      }}
    />
  );
}

export default UserButton;
