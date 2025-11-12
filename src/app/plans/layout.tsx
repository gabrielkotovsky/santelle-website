import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Choose Your Plan | Santelle',
  description: 'Select the perfect Santelle plan for your intimate health needs.',
};

export default function PlansLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

