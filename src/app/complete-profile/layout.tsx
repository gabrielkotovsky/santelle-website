import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Complete Your Profile - Santelle',
  description: 'Complete your Santelle profile to boost your beta testing chances and get early access to our intimate health platform.',
};

export default function CompleteProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
