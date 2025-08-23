'use client';

import { useEffect, useState, Suspense, lazy } from 'react';
import Head from 'next/head';
import { analytics } from '../lib/analytics';

// Dynamic imports with React.lazy() for code splitting
const HeroSection = lazy(() => import('@/components/home/HeroSection'));
const StatsSection = lazy(() => import('@/components/home/StatsSection'));
const KitSection = lazy(() => import('@/components/home/KitSection'));
const HowItWorksSection = lazy(() => import('@/components/home/HowItWorksSection'));
const TeamSection = lazy(() => import('@/components/home/TeamSection'));
const MobileUnifiedCard = lazy(() => import('@/components/home/MobileUnifiedCard'));
const FooterSection = lazy(() => import('@/components/home/FooterSection'));

// Loading fallback component
const ComponentLoader = ({ componentName }: { componentName: string }) => (
  <div className="w-full min-h-screen flex items-center justify-center bg-white/20 backdrop-blur-lg rounded-3xl border border-white/50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#721422] mx-auto mb-4"></div>
      <p className="text-[#721422] text-lg">Loading {componentName}...</p>
    </div>
  </div>
);

const HERO_HEIGHT = '100vh';

export default function Home() {
  // Add preconnect hints for better performance and track page view
  useEffect(() => {
    // Track homepage view
    analytics.trackPageView('homepage');
    
    // Preconnect to CDN if you're using one
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = 'https://fonts.googleapis.com';
    document.head.appendChild(link);
    
    const link2 = document.createElement('link');
    link2.rel = 'preconnect';
    link2.href = 'https://fonts.gstatic.com';
    document.head.appendChild(link2);
  }, []);
  
  const [showEmailForm, setShowEmailForm] = useState(false);

  useEffect(() => {
    // Display page at the top on load
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    function openWaitlistListener() {
      setShowEmailForm(true);
    }
    window.addEventListener('openWaitlist', openWaitlistListener);
    return () => window.removeEventListener('openWaitlist', openWaitlistListener);
  }, []);

  useEffect(() => {
    const sectionOrder = ['hero', 'stats', 'kit', 'how-it-works', 'team', 'footer'];
    
    function handleKeyDown(e: KeyboardEvent) {
      if (['ArrowDown', 'ArrowUp'].includes(e.key)) {
        e.preventDefault();
        const sectionElements = sectionOrder.map(id => document.getElementById(id));
        const scrollY = window.scrollY;
        let currentIdx = 0;
        for (let i = 0; i < sectionElements.length; i++) {
          const el = sectionElements[i];
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top + window.scrollY - 100 > scrollY) break;
            currentIdx = i;
          }
        }
        let nextIdx = currentIdx;
        if (e.key === 'ArrowDown' && currentIdx < sectionOrder.length - 1) nextIdx++;
        if (e.key === 'ArrowUp' && currentIdx > 0) nextIdx--;
        const nextSection = sectionElements[nextIdx];
        if (sectionOrder[nextIdx] === 'hero') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (nextSection) {
          // Import smoothScrollTo function
          import('@/components/shared/SmoothScroll').then(({ smoothScrollTo }) => {
            smoothScrollTo(nextSection, { 
              duration: 800, 
              easing: 'easeInOutQuad',
              block: 'start',
              offset: 100 
            });
          });
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <Head>
        <title>Santelle | To Her Health</title>
      </Head>
      <main className="flex flex-col items-center w-full bg-brand-blue overflow-x-hidden overflow-hidden" style={{
        minHeight: '100dvh',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)'
      }}>

        {/* Hero Section - fixed and full screen */}
        <Suspense fallback={<ComponentLoader componentName="Hero Section" />}>
          <HeroSection 
            onEmailFormToggle={setShowEmailForm}
            showEmailForm={showEmailForm}
          />
        </Suspense>

        {/* Spacer to allow scrolling past the fixed hero */}
        <div style={{ height: HERO_HEIGHT }} className="w-full" />

        {/* Main content sections with higher z-index to cover hero */}
        <div className="relative z-20 w-full">
          {/* Desktop Stats Section */}
          <Suspense fallback={<ComponentLoader componentName="Stats Section" />}>
            <StatsSection />
          </Suspense>

          {/* Desktop Kit Image Section - Load with higher priority since stats section links to it */}
          <Suspense fallback={<ComponentLoader componentName="Kit Section" />}>
            <KitSection />
          </Suspense>

          {/* Desktop Product Intro Section */}
          <Suspense fallback={<ComponentLoader componentName="How It Works Section" />}>
            <HowItWorksSection />
          </Suspense>

          {/* Desktop Team/Leadership Section */}
          <Suspense fallback={<ComponentLoader componentName="Team Section" />}>
            <TeamSection />
          </Suspense>

          {/* Mobile Unified Card - All Sections */}
          <Suspense fallback={<ComponentLoader componentName="Mobile Content" />}>
            <MobileUnifiedCard />
          </Suspense>

          {/* Bottom Glassmorphic Card */}
          <Suspense fallback={<ComponentLoader componentName="Footer" />}>
            <FooterSection />
          </Suspense>
        </div>
      </main>
      <script dangerouslySetInnerHTML={{__html:`window.statsCard = document.getElementById('stats');`}} />
    </>
  );
}
