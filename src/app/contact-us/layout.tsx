import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | Santelle',
  description: 'Get in touch with the Santelle team. We\'re here to answer your questions about vaginal health, our testing kit, and how we can support your wellness journey.',
  keywords: ['contact santelle', 'vaginal health support', 'women\'s health questions', 'santelle customer service'],
  openGraph: {
    title: 'Contact Us | Santelle',
    description: 'Get in touch with the Santelle team. We\'re here to answer your questions about vaginal health and our testing kit.',
    url: 'https://santellehealth.com/contact-us',
  },
  alternates: {
    canonical: '/contact-us',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
