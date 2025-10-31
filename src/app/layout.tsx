import type { Metadata } from "next";
import { Poppins } from 'next/font/google';
import "./globals.css";
import '../styles/typography.css';
import '../styles/mobile.css';
import ConditionalNavigation from '../components/ConditionalNavigation';
import PageTransitionWrapper from '../components/PageTransitionWrapper';
import { AuthProvider } from '@/contexts/AuthContext';
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
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
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
        
        {/* Mobile Status Bar Color */}
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#ffffff" />
        
        {/* Preload Critical CSS to Eliminate Render-Blocking */}
        <link rel="preload" href="/globals.css" as="style" />
        <link rel="preload" href="/styles/typography.css" as="style" />
        <link rel="preload" href="/styles/mobile.css" as="style" />
        
        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
              `}
            </Script>
          </>
        )}

        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" />
        
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
              "review": null,
              "aggregateRating": null,
              "offers": [
                {
                  "@type": "Offer",
                  "name": "Monthly Subscription",
                  "price": "14.99",
                  "priceCurrency": "EUR",
                  "availability": "https://schema.org/PreOrder",
                  "priceValidUntil": null,
                  "shippingDetails": "not included",
                  "hasMerchantReturnPolicy": "no",
                  "description": "Monthly subscription for vaginal health testing kit - Coming Soon"
                },
                {
                  "@type": "Offer",
                  "name": "One-time Kit",
                  "price": "7.00",
                  "priceCurrency": "EUR",
                  "availability": "https://schema.org/PreOrder",
                  "priceValidUntil": null,
                  "shippingDetails": "not included",
                  "hasMerchantReturnPolicy": "no",
                  "description": "Single vaginal health testing kit - Coming Soon"
                }
              ],

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
        <AuthProvider>
          <ConditionalNavigation />
          <PageTransitionWrapper>{children}</PageTransitionWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
