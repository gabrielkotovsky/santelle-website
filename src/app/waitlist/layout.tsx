import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Join Waitlist | Santelle',
  description: 'Join the Santelle waitlist for early access.',
};

export default function WaitlistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

