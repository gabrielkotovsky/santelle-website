import type { Metadata } from "next";
import { Poppins } from 'next/font/google';
import "./globals.css";
import '../styles/typography.css';
import '../styles/mobile.css';
import NavBar from '../components/NavBar';
import MobileNavBar from '../components/MobileNavBar';
import PageTransitionWrapper from '../components/PageTransitionWrapper';
import Script from 'next/script';

export const metadata: Metadata = {
  title: {
    default: "Santelle | Your Vaginal Health Companion - At-Home Testing Kit",
    template: "%s | Santelle"
  },
  description: "Discover Santelle, your vaginal health companion. Get lab-quality insights from home with our at-home testing kit. Easy, discreet, and empowering vaginal wellness.",
  keywords: ["vaginal health", "at-home testing", "women's health", "vaginal wellness", "health testing kit", "vaginal infections", "women's wellness"],
  authors: [{ name: "Santelle Team" }],
  creator: "Santelle",
  publisher: "Santelle",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://santellehealth.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://santellehealth.com',
    title: 'Santelle | Your Vaginal Health Companion',
    description: 'Discover Santelle, your vaginal health companion. Get lab-quality insights from home with our at-home testing kit.',
    siteName: 'Santelle',
    images: [
      {
        url: '/kit.webp',
        width: 1200,
        height: 630,
        alt: 'Santelle Vaginal Health Testing Kit',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Santelle | Your Vaginal Health Companion',
    description: 'Discover Santelle, your vaginal health companion. Get lab-quality insights from home.',
    images: ['/kit.webp'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/S_logo.svg',
    shortcut: '/S_logo.svg',
    apple: '/S_logo.svg',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: 'cover',
  },
};

const poppins = Poppins({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={poppins.className}>
      <head>
        <title>Santelle | Vaginal Health Companion - At-Home Testing</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-title" content="Santelle" />
        
        {/* Structured Data */}
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Santelle",
              "url": "https://santellehealth.com",
              "logo": "https://santellehealth.com/S_logo.svg",
              "description": "Your vaginal health companion. Get lab-quality insights from home with our at-home testing kit.",
              "sameAs": [],
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "url": "https://santellehealth.com/contact-us"
              },
              "foundingDate": "2024",
              "areaServed": "Worldwide",
              "serviceType": "Women's Health Testing"
            })
          }}
        />
      </head>
      <body className={`antialiased`}>
        {/* Desktop Navigation */}
        <div className="hidden md:block">
          <NavBar />
        </div>
        
        {/* Mobile Navigation */}
        <div className="block md:hidden">
          <MobileNavBar />
        </div>
        
        <PageTransitionWrapper>{children}</PageTransitionWrapper>
      </body>
    </html>
  );
}
