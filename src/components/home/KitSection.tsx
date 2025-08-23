'use client';

import { smoothScrollTo } from '../shared/SmoothScroll';
import { LazyImage, LazyText } from '../shared';

export default function KitSection() {
  function handleSmoothScroll(e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>, sectionId: string) {
    e.preventDefault();
    const el = document.getElementById(sectionId);
    if (el) {
      smoothScrollTo(el, { 
        duration: 800, 
        easing: 'easeInOutQuad',
        block: 'start',
        offset: 100 
      });
    }
  }

  const focusHeroEmailInput = () => {
    // Track button click
    import('@/lib/analytics').then(({ analytics }) => {
      analytics.trackButtonClick('get_early_access', 'kit_section');
    });
    
    // Dispatch event to open waitlist
    window.dispatchEvent(new Event('openWaitlist'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const emailInput = document.getElementById('waitlist-email') as HTMLInputElement;
    if (emailInput) {
      emailInput.focus();
    }
  };

  return (
    <>
      {/* Desktop Horizontal Divider */}
      <div className="hidden md:block w-full py-20">
        <div className="max-w-4xl mx-auto">
          <div className="h-1 bg-[#721422] rounded-full"></div>
        </div>
      </div>

      {/* Desktop Kit Image Section */}
      <section id="kit" className="hidden md:flex w-full min-h-screen h-screen items-center justify-center">
        <div className="bg-white/30 backdrop-blur-lg rounded-3xl shadow-none flex flex-col md:flex-row items-center justify-center gap-2 md:gap-0 border border-white/50" style={{height: 'clamp(90vh, 95vh, 98vh)', width: 'clamp(90vw, 95vw, 98vw)', padding: '120px'}}>
          <div className="md:w-1/2 flex justify-center md:justify-end items-center p-0 py-2 md:py-0">
            <LazyImage
              src="/SantelleKit+App.png"
              alt="Santelle Kit and App"
              width={900}
              height={900}
              className="h-auto object-contain drop-shadow-lg"
              style={{
                width: 'clamp(300px, 70vh, 900px)',
                maxWidth: '100%'
              }}
              sizes="(max-width: 768px) 300px, (max-width: 1024px) 600px, 900px"
              quality={85}
            />
          </div>
          <div className="md:w-1/2 flex flex-col items-center md:items-start justify-center" style={{gap: '5vh'}}>
            {/* First Group: Title and Subtitle */}
            <LazyText style={{gap: '0.5rem'}} delay={300}>
              <h1 
                className="font-bold text-[#721422] mb-0 text-left"
                style={{
                  fontSize: 'clamp(1rem, 2.5vw, 2.5rem)',
                  lineHeight: '1.0'
                }}
              >
                <span className="chunko-bold">Meet Santelle</span>
              </h1>
              <h2 
                className="font-bold text-[#721422] mb-0 text-left"
                style={{
                  fontSize: 'clamp(0.5rem, 1.25vw, 1.25rem)',
                  lineHeight: '0.8',
                  marginTop: '0.5rem'
                }}
              >
                Your discreet, at-home vaginal health companion
              </h2>
            </LazyText>

            {/* Second Group: Description and Bullet Points */}
            <LazyText style={{gap: '1rem'}} delay={600}>
              <p 
                className="text-[#721422] text-center md:text-left"
                style={{
                  fontSize: 'clamp(0.25rem, 1.25vw, 1.25rem)'
                }}
              >
                Santelle makes it simple to check in on your intimate health
                each month — with instant results, personalised insights, and support
                along your intimate health journey.
              </p>
              <ul 
                className="list-disc pl-8 text-[#721422] space-y-2 text-left"
                style={{
                  fontSize: 'clamp(0.25rem, 1.25vw, 1.25rem)',
                  marginTop: '0.5rem'
                }}
              >
                <li>Instant results from home</li>
                <li>Multi-biomarker analysis — beyond pH</li>
                <li>Connected app with personalised insights & tips</li>
              </ul>
            </LazyText>
            <LazyText className="flex flex-col md:flex-row gap-4 w-full md:w-auto justify-center md:justify-start" delay={900}>
              <a
                href="#how-it-works"
                className="how-it-works-btn inline-block bg-white text-[#511828] font-bold rounded-full shadow-lg border-2 border-[#511828] focus:outline-none focus:ring-4 focus:ring-[#18321f]/40 transition-all duration-300 cursor-pointer w-full max-w-xs mx-auto md:mx-0 md:w-auto text-center hover:bg-[#511828] hover:text-white"
                style={{
                  fontSize: 'clamp(0.875rem, 1.5vw, 1.125rem)',
                  paddingLeft: 'clamp(1rem, 2vw, 2rem)',
                  paddingRight: 'clamp(1rem, 2vw, 2rem)',
                  paddingTop: 'clamp(0.75rem, 1.5vw, 1rem)',
                  paddingBottom: 'clamp(0.75rem, 1.5vw, 1rem)'
                }}
                onClick={e => handleSmoothScroll(e, 'how-it-works')}
              >
                How It Works
              </a>
              <button
                className="bg-[#721422] text-white font-bold rounded-full hover:bg-[#8a1a2a] hover:text-white transition cursor-pointer get-access-pulse w-full max-w-xs mx-auto md:mx-0 md:w-auto"
                style={{
                  fontSize: 'clamp(0.875rem, 1.5vw, 1.125rem)',
                  paddingLeft: 'clamp(1rem, 2vw, 2rem)',
                  paddingRight: 'clamp(1rem, 2vw, 2rem)',
                  paddingTop: 'clamp(0.75rem, 1.5vw, 1rem)',
                  paddingBottom: 'clamp(0.75rem, 1.5vw, 1rem)'
                }}
                onClick={focusHeroEmailInput}
                type="button"
              >
                Get Early Access
              </button>
            </LazyText>
          </div>
        </div>
      </section>
    </>
  );
}
