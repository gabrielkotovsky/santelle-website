import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In | Santelle',
  description: 'Sign in to your Santelle account to continue with your subscription.',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

