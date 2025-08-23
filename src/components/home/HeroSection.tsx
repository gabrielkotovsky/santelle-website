'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { analytics } from '@/lib/analytics';
import EmailForm from '../shared/EmailForm';

const HERO_HEIGHT = '100vh';

interface HeroSectionProps {
  onEmailFormToggle: (show: boolean) => void;
  showEmailForm: boolean;
}

export default function HeroSection({ onEmailFormToggle, showEmailForm }: HeroSectionProps) {
  const [heroFadeOpacity, setHeroFadeOpacity] = useState(1);

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY;

      // Calculate hero fade opacity based on scroll position
      if (window.innerWidth >= 768) {
        // Desktop: fade based on stats card
        const statsCard = document.getElementById('stats');
        if (statsCard) {
          const statsCardTop = statsCard.offsetTop;
          const statsCardHeight = statsCard.offsetHeight;
          const fadeStart = 0; // Start fading from the top of the page
          const fadeEnd = statsCardTop+statsCardHeight/2; // End fading when stats card is fully in viewport
          
          if (scrollY <= fadeStart) {
            setHeroFadeOpacity(1);
          } else if (scrollY >= fadeEnd) {
            setHeroFadeOpacity(0);
          } else {
            const fadeRange = fadeEnd - fadeStart;
            const fadeProgress = (scrollY - fadeStart) / fadeRange;
            setHeroFadeOpacity(Math.max(0, 1 - fadeProgress));
          }
        } else {
          // If stats card not found, keep hero content visible
          setHeroFadeOpacity(1);
        }
      } else {
        // Mobile: fade based on unified card
        const unifiedCard = document.querySelector('.block.md\\:hidden.w-full.py-8') as HTMLElement;
        if (unifiedCard) {
          const windowHeight = window.innerHeight;
          const fadeStart = windowHeight/2; // Start fading from the top of the page
          const fadeEnd = windowHeight; // End fading when unified card completely hides hero
          
          if (scrollY <= fadeStart) {
            setHeroFadeOpacity(1);
          } else if (scrollY >= fadeEnd) {
            setHeroFadeOpacity(0);
          } else {
            const fadeRange = fadeEnd - fadeStart;
            const fadeProgress = (scrollY - fadeStart) / fadeRange;
            setHeroFadeOpacity(Math.max(0, 1 - fadeProgress));
          }
        } else {
          // If unified card not found, keep hero content visible
          setHeroFadeOpacity(1);
        }
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const focusHeroEmailInput = () => {
    // Track button click
    analytics.trackButtonClick('get_early_access', 'hero_section');
    
    onEmailFormToggle(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const emailInput = document.getElementById('waitlist-email') as HTMLInputElement;
    if (emailInput) {
      emailInput.focus();
    }
  };

  return (
    <section
      id="hero"
      className="fixed top-0 left-0 w-full h-screen min-h-screen flex flex-col items-center justify-center text-center z-10"
      style={{ 
        height: HERO_HEIGHT,
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)'
      }}
    >
      {/* Background - Always Video */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center" style={{
        top: 0,
        bottom: 'env(safe-area-inset-bottom)',
        left: 'env(safe-area-inset-left)',
        right: 'env(safe-area-inset-right)'
      }}>
        {/* Desktop Video Background */}
        <video
          src="/background_desktop.mp4"
          autoPlay
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover hidden md:block"
          style={{ 
            objectFit: 'cover', 
            objectPosition: 'center',
            width: '100vw',
            height: '100dvh'
          }}
        />
        
        {/* Mobile Background Image */}
        <div 
          className="absolute inset-0 w-full h-full block md:hidden"
          style={{
            backgroundImage: 'url(/background-mobile.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            width: '100vw',
            height: '100dvh'
          }}
        />
        
        {/* Overlay - Blur only, no color */}
        <div className="bg-white/30 absolute inset-0 backdrop-blur-lg" />
      </div>

      {/* Desktop Hero Content */}
      <div className="hidden md:flex flex-col items-center justify-center w-full h-full absolute top-0 left-0 z-10" style={{ opacity: heroFadeOpacity, transition: 'opacity 0.3s ease-out' }}>
        <div className="flex flex-col items-center w-[680px] max-w-full mx-auto">
          <Image
            src="/logo-dark.svg"
            alt="Santelle Logo"
            width={1020}
            height={360}
            priority
            style={{
              width: 'clamp(300px, 50vw, 680px)',
              height: 'auto'
            }}
          />
          <h2 
            className="mt-2 mb-2 text-black text-right"
            style={{
              fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
              width: 'clamp(300px, 50vw, 680px)'
            }}
          >
            To Her Health
          </h2>
        </div>
        
        {/* Desktop Get Early Access Button and Email Form Container */}
        <div className="relative">
          {/* Desktop Get Early Access Button */}
          <div className={`absolute inset-0 transition-all duration-700 ease-in-out ${showEmailForm ? 'opacity-0 scale-95 -translate-y-2 pointer-events-none' : 'opacity-100 scale-100 translate-y-0'}`}>
            <div className="flex gap-4 mt-5 w-full max-w-[680px] justify-center">
              <button
                className="bg-[#721422] text-white font-bold rounded-full shadow-lg hover:bg-[#8a1a2a] transition-all duration-500 ease-in-out cursor-pointer get-access-pulse"
                style={{
                  fontSize: 'clamp(0.875rem, 1.5vw, 1.125rem)',
                  paddingLeft: 'clamp(1rem, 2vw, 2rem)',
                  paddingRight: 'clamp(1rem, 2vw, 2rem)',
                  paddingTop: 'clamp(0.75rem, 1.5vw, 1rem)',
                  paddingBottom: 'clamp(0.75rem, 1.5vw, 1rem)',
                  width: 'clamp(180px, 20vw, 280px)',
                  whiteSpace: 'nowrap'
                }}
                onClick={focusHeroEmailInput}
              >
                Get Early Access
              </button>
              <button
                className="bg-white text-[#721422] font-bold rounded-full shadow-lg border-2 border-[#721422] focus:outline-none focus:ring-4 focus:ring-[#721422]/40 transition-all duration-300 cursor-pointer hover:bg-[#721422] hover:text-white"
                style={{
                  fontSize: 'clamp(0.875rem, 1.5vw, 1.125rem)',
                  paddingLeft: 'clamp(1rem, 2vw, 2rem)',
                  paddingRight: 'clamp(1rem, 2vw, 2rem)',
                  paddingTop: 'clamp(0.75rem, 1.5vw, 1rem)',
                  paddingBottom: 'clamp(0.75rem, 1.5vw, 1rem)',
                  width: 'clamp(200px, 22vw, 320px)',
                  whiteSpace: 'nowrap'
                }}
                type="button"
                onClick={() => {
                  const el = document.getElementById('stats');
                  if (el) {
                    // Import smoothScrollTo function
                    import('@/components/shared/SmoothScroll').then(({ smoothScrollTo }) => {
                      smoothScrollTo(el, { 
                        duration: 800, 
                        easing: 'easeInOutQuad',
                        block: 'center'
                      });
                    });
                  }
                }}
              >
                Explore Santelle Now
              </button>
            </div>
          </div>
          
          {/* Desktop Email Form */}
          <div className={`transition-all duration-700 ease-in-out ${showEmailForm ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2 pointer-events-none'}`}>
            <EmailForm 
              variant="hero"
              onSubmitSuccess={() => onEmailFormToggle(false)}
            />
          </div>
        </div>
      </div>

      {/* Mobile Hero Content */}
      <div className="flex md:hidden flex-col items-start justify-center w-full h-full absolute top-0 left-0 z-10 px-2" style={{ opacity: heroFadeOpacity, transition: 'opacity 0.3s ease-out' }}>
        {/* Mobile "Discover Santelle" text and button - centered vertically */}
        <div className="flex flex-col items-start justify-center flex-1 w-full">
          <span 
            className="italic text-[#721422] text-4xl font-medium text-left leading-relaxed mb-6 chunko-bold"
          >
            Discover Santelle,<br />
            Your vaginal health companion
          </span>
        
          {/* Mobile Get Early Access Button and Email Form Container */}
          <div className="relative">
            {/* Mobile Get Early Access Button */}
            <div className={`absolute inset-0 transition-all duration-700 ease-in-out ${showEmailForm ? 'opacity-0 scale-95 -translate-y-2 pointer-events-none' : 'opacity-100 scale-100 translate-y-0'}`}>
              <div className="flex gap-4 justify-center">
                <button
                  className="bg-[#721422] text-white font-bold text-sm px-6 py-4 rounded-full shadow-lg hover:bg-[#8a1a2a] transition-all duration-300 ease-in-out cursor-pointer get-access-pulse touch-target"
                  onClick={focusHeroEmailInput}
                >
                  Get Early Access
                </button>
                <button
                  className="bg-white text-[#721422] font-bold text-sm px-6 py-4 rounded-full shadow-lg border-2 border-[#721422] focus:outline-none focus:ring-4 focus:ring-[#721422]/40 transition-all duration-300 cursor-pointer hover:bg-[#721422] hover:text-white touch-target"
                  onClick={() => {
                    const unifiedCard = document.getElementById('mobile-unified-card');
                    const statsSection = unifiedCard?.querySelector('[data-section="stats"]');
                    if (statsSection) {
                      import('@/components/shared/SmoothScroll').then(({ smoothScrollTo }) => {
                        smoothScrollTo(statsSection as HTMLElement, { 
                          duration: 800, 
                          easing: 'easeInOutQuad',
                          block: 'start',
                          offset: 64 
                        });
                      });
                    }
                  }}
                >
                  Explore Santelle
                </button>
              </div>
            </div>
            
            {/* Mobile Email Form */}
            <div className={`transition-all duration-700 ease-in-out ${showEmailForm ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2 pointer-events-none'}`}>
              <EmailForm 
                variant="mobile"
                onSubmitSuccess={() => onEmailFormToggle(false)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Bottom Section */}
      <div className="hidden md:flex absolute left-0 w-full flex-col items-center justify-center gap-0 z-20 bottom-0 md:bottom-12 lg:bottom-15" style={{ opacity: heroFadeOpacity, transition: 'opacity 0.3s ease-out' }}>
        <span 
          className="italic text-[#721422] text-center"
          style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.5rem)'
          }}
        >
          Discover Santelle, your vaginal health companion
        </span>
        <span className="flex justify-center mt-2">
          <span
            className="cursor-pointer hover:scale-110 transition-transform duration-200"
            style={{
              width: 'clamp(40px, 4vw, 50px)',
              height: 'clamp(40px, 4vw, 50px)'
            }}
            onClick={() => {
              const el = document.getElementById('stats');
              if (el) {
                import('@/components/shared/SmoothScroll').then(({ smoothScrollTo }) => {
                  smoothScrollTo(el, { 
                    duration: 800, 
                    easing: 'easeInOutQuad',
                    offset: window.innerHeight / 2 
                  });
                });
              }
            }}
          >
            <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 10l4 4 4-4" stroke="#721422" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </span>
      </div>
    </section>
  );
}
