import { UserButton as ClerkUserButton } from '@clerk/nextjs';

export function UserButton() {
  return (
    <ClerkUserButton
      appearance={{
        elements: {
          userButtonBox: 'hover:opacity-80 transition-opacity',
          userButtonTrigger: 'rounded-full',
          userButtonAvatarBox: 'w-10 h-10',
        },
      }}
      fallbackRedirectUrl="/auth/sign-in"
    />
  );
}
