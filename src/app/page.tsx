'use client';

import { useEffect, useState } from 'react';
import Head from 'next/head';
import { analytics } from '../lib/analytics';

// Import split components
import {
  HeroSection,
  StatsSection,
  KitSection,
  HowItWorksSection,
  TeamSection,
  MobileUnifiedCard,
  FooterSection
} from '@/components/home';

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
        <HeroSection 
          onEmailFormToggle={setShowEmailForm}
          showEmailForm={showEmailForm}
        />

      {/* Spacer to allow scrolling past the fixed hero */}
      <div style={{ height: HERO_HEIGHT }} className="w-full" />

      {/* Main content sections with higher z-index to cover hero */}
      <div className="relative z-20 w-full">
          {/* Desktop Stats Section */}
          <StatsSection />

        {/* Desktop Kit Image Section */}
          <KitSection />

        {/* Desktop Product Intro Section */}
          <HowItWorksSection />

        {/* Desktop Team/Leadership Section */}
          <TeamSection />

        {/* Mobile Unified Card - All Sections */}
          <MobileUnifiedCard />

        {/* Bottom Glassmorphic Card */}
          <FooterSection />
              </div>
    </main>
      <script dangerouslySetInnerHTML={{__html:`window.statsCard = document.getElementById('stats');`}} />
    </>
  );
}
