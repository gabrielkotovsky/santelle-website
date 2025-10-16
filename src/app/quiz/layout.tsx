import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quiz | Santelle',
  description: 'Take our quiz to discover your ideal Santelle plan',
};

export default function QuizLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

