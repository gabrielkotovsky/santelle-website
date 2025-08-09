import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Santelle',
  description: 'Learn how Santelle protects your privacy and personal information. Our commitment to data security and your rights regarding your personal data.',
  keywords: ['santelle privacy policy', 'data protection', 'personal information', 'privacy rights'],
  openGraph: {
    title: 'Privacy Policy | Santelle',
    description: 'Learn how Santelle protects your privacy and personal information.',
    url: 'https://santellehealth.com/privacy-policy',
  },
  alternates: {
    canonical: '/privacy-policy',
  },
};

export default function PrivacyPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
