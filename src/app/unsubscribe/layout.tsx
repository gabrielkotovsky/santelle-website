import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Unsubscribe - Santelle',
  description: 'Unsubscribe from Santelle waitlist emails and updates.',
};

export default function UnsubscribeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
