'use client';

import { UserButton as ClerkUserButton } from '@clerk/nextjs';

export function UserButton() {
  return (
    <ClerkUserButton
      appearance={{
        elements: {
          userButtonAvatarBox: 'w-10 h-10',
          userButtonTrigger:
            'focus:outline-none focus:ring-2 focus:ring-blue-500',
        },
      }}
    />
  );
}
