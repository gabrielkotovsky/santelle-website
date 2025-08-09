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
    default: "Santelle | To Her Health",
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
    title: 'Santelle | To Her Health',
    description: 'Discover Santelle, your vaginal health companion. Get lab-quality insights from home with our at-home testing kit.',
    siteName: 'Santelle',
    images: [
      {
        url: '/logo-dark.svg',
        width: 916,
        height: 272,
        alt: 'Santelle Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Santelle | To Her Health',
    description: 'Discover Santelle, your vaginal health companion. Get lab-quality insights from home.',
    images: ['/logo-dark.svg'],
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
  manifest: '/manifest.json',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
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
        <title>Santelle | To Her Health</title>
        <meta name="apple-mobile-web-app-title" content="Santelle" />
        
        {/* Structured Data */}
        <Script
          id="organization-schema"
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
              "foundingDate": "2025",
              "areaServed": "Worldwide",
              "serviceType": "Women's Health Testing",
              "industry": "Healthcare",
              "brand": {
                "@type": "Brand",
                "name": "Santelle"
              }
            })
          }}
        />
        
        {/* Product Schema */}
        <Script
          id="product-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              "name": "Santelle Vaginal Health Testing Kit",
              "description": "At-home vaginal health testing kit that analyzes 6 key biomarkers for infection, inflammation, and imbalance. Get lab-quality insights from the comfort of your home.",
              "brand": {
                "@type": "Brand",
                "name": "Santelle"
              },
              "category": "Health & Beauty > Health Care > Medical Tests",
              "image": "https://santellehealth.com/kit.webp",
              "offers": [
                {
                  "@type": "Offer",
                  "name": "Monthly Subscription",
                  "price": "14.99",
                  "priceCurrency": "EUR",
                  "availability": "https://schema.org/PreOrder",
                  "description": "Monthly subscription for vaginal health testing kit"
                },
                {
                  "@type": "Offer",
                  "name": "One-time Kit",
                  "price": "7.00",
                  "priceCurrency": "EUR",
                  "availability": "https://schema.org/PreOrder",
                  "description": "Single vaginal health testing kit"
                }
              ],
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "reviewCount": "127",
                "bestRating": "5",
                "worstRating": "1"
              },
              "additionalProperty": [
                {
                  "@type": "PropertyValue",
                  "name": "Biomarkers Tested",
                  "value": "6 key biomarkers (pH, H₂O₂, LE, SNA, β-G, B-G)"
                },
                {
                  "@type": "PropertyValue",
                  "name": "Test Type",
                  "value": "At-home vaginal health testing"
                },
                {
                  "@type": "PropertyValue",
                  "name": "Results Time",
                  "value": "Instant results from home"
                }
              ]
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
