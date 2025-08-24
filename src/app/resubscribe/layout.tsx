import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Resubscribe - Santelle',
  description: 'Resubscribe to Santelle waitlist emails and get back on our list for early access and updates.',
};

export default function ResubscribeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
