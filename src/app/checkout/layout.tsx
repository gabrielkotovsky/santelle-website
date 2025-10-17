import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Checkout | Santelle',
  description: 'Complete your Santelle subscription checkout.',
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

