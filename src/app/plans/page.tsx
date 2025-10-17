'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';

const allPlans = [
  {
    name: 'Proactive',
    frequency: 'Monthly Kit',
    cyclePrice: '€12.99',
    cyclePeriod: 'month',
    annualPrice: '€129.99',
    annualPeriod: 'year',
    cycleLookupKey: 'proactive-monthly',
    annualLookupKey: 'proactive-annual',
    originalIndex: 0
  },
  {
    name: 'Balanced',
    frequency: 'Bi-Monthly Kit',
    cyclePrice: '€16.99',
    cyclePeriod: '2 months',
    annualPrice: '€79.99',
    annualPeriod: 'year',
    cycleLookupKey: 'balanced-bimonthly',
    annualLookupKey: 'balanced-annual',
    originalIndex: 1
  },
  {
    name: 'Essential',
    frequency: 'Quarterly Kit',
    cyclePrice: '€19.99',
    cyclePeriod: '3 months',
    annualPrice: '€59.99',
    annualPeriod: 'year',
    cycleLookupKey: 'essential-quarterly',
    annualLookupKey: 'essential-annual',
    originalIndex: 2
  }
];

const commonFeatures = [
  'Full access to app',
  '30% off on extra kits'
];

function PlansContent() {
  const searchParams = useSearchParams();
  const recommendedParam = searchParams.get('recommended');
  const recommendedPlanIndex = recommendedParam ? parseInt(recommendedParam) : null;
  
  // Check for success/cancel from Stripe redirect
  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');
  const sessionId = searchParams.get('session_id');
  
  // Detect if on mobile device
  const [isMobile, setIsMobile] = useState(false);
  
  // Billing period toggle state
  const [isAnnual, setIsAnnual] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // Tailwind's md breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // On mobile, sort plans to show recommended first; on desktop, keep original order
  const plans = isMobile && recommendedPlanIndex !== null
    ? [...allPlans].sort((a, b) => {
        if (a.originalIndex === recommendedPlanIndex) return -1;
        if (b.originalIndex === recommendedPlanIndex) return 1;
        return a.originalIndex - b.originalIndex;
      })
    : allPlans;
  
  // Show success message if payment was successful
  if (success && sessionId) {
    return (
      <main className="relative min-h-screen flex items-center justify-center">
        {/* Background - Video for Desktop, Image for Mobile */}
        <div className="fixed inset-0 -z-10 flex items-center justify-center">
          <video
            src="/background_desktop.mp4"
            autoPlay
            loop
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
          <div 
            className="absolute inset-0 w-full h-full block md:hidden"
            style={{
              backgroundImage: 'url(/background-mobile.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundAttachment: 'fixed',
              width: '100vw',
              height: '100dvh'
            }}
          />
          <div className="bg-white/30 absolute inset-0 backdrop-blur-lg" />
        </div>

        <div className="relative z-10 w-[95%] max-w-2xl mx-auto px-4 py-16">
          <div className="bg-white/40 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/50">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl md:text-3xl font-bold text-[#721422] mb-4">
                Subscription successful!
              </h3>
              <p className="text-lg text-[#721422]/80">
                Welcome to Santelle! You&apos;ll receive a confirmation email shortly.
              </p>
            </div>

            <form action="/create-portal-session" method="POST" className="space-y-4">
              <input type="hidden" name="session_id" value={sessionId} />
              <button
                type="submit"
                className="w-full bg-[#721422] text-white font-bold px-8 py-4 rounded-full hover:bg-[#8a1a2a] transition-colors duration-200"
              >
                Manage your billing information
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }
  
  // Show cancel message if payment was canceled
  if (canceled) {
    return (
      <main className="relative min-h-screen flex items-center justify-center">
        {/* Background - Video for Desktop, Image for Mobile */}
        <div className="fixed inset-0 -z-10 flex items-center justify-center">
          <video
            src="/background_desktop.mp4"
            autoPlay
            loop
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
          <div 
            className="absolute inset-0 w-full h-full block md:hidden"
            style={{
              backgroundImage: 'url(/background-mobile.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundAttachment: 'fixed',
              width: '100vw',
              height: '100dvh'
            }}
          />
          <div className="bg-white/30 absolute inset-0 backdrop-blur-lg" />
        </div>

        <div className="relative z-10 w-[95%] max-w-2xl mx-auto px-4 py-16">
          <div className="bg-white/40 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/50">
            <div className="text-center">
              <p className="text-xl text-[#721422] mb-6">
                Order canceled -- continue to shop around and checkout when you&apos;re ready.
              </p>
            </div>

            <div className="text-center">
              <a
                href="/plans"
                className="inline-block bg-[#721422] text-white font-bold px-8 py-4 rounded-full hover:bg-[#8a1a2a] transition-colors duration-200"
              >
                Back to Plans
              </a>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center">
      {/* Background - Video for Desktop, Image for Mobile */}
      <div className="fixed inset-0 -z-10 flex items-center justify-center">
        {/* Desktop Video Background */}
        <video
          src="/background_desktop.mp4"
          autoPlay
          loop
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
            backgroundAttachment: 'fixed',
            width: '100vw',
            height: '100dvh'
          }}
        />
        
        {/* Overlay - Blur only, no color */}
        <div className="bg-white/30 absolute inset-0 backdrop-blur-lg" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-[95%] mx-auto px-4 py-16">
        <h1 className="text-3xl md:text-4xl font-bold text-[#721422] mb-4 text-center">
          {recommendedPlanIndex !== null 
            ? 'Based on your answers, this plan helps you stay balanced and in control.'
            : 'Choose the plan that best fits your needs.'
          }
        </h1>
        
        {/* Billing Period Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-white/40 backdrop-blur-md rounded-full p-1 border border-white/50 inline-flex">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-200 ${
                !isAnnual
                  ? 'bg-[#721422] text-white shadow-md'
                  : 'text-[#721422] hover:bg-white/50'
              }`}
            >
              Per Cycle
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-200 ${
                isAnnual
                  ? 'bg-[#721422] text-white shadow-md'
                  : 'text-[#721422] hover:bg-white/50'
              }`}
            >
              Annual
            </button>
          </div>
        </div>
        
        <div className="flex flex-col gap-8 max-w-6xl mx-auto">
          {/* Plan Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const isRecommended = recommendedPlanIndex !== null && plan.originalIndex === recommendedPlanIndex;
              return (
                <div
                  key={plan.name}
                  className={`bg-white/40 backdrop-blur-md rounded-3xl p-6 md:p-8 border-2 transition-all duration-300 hover:shadow-xl hover:scale-105 flex flex-col ${
                    isRecommended ? 'border-[#721422] shadow-lg' : 'border-white/50'
                  }`}
                >
                  {isRecommended && (
                    <div className="text-center mb-4">
                      <span className="bg-[#721422] text-white px-4 py-1 rounded-full text-sm font-bold">
                        RECOMMENDED FOR YOU
                      </span>
                    </div>
                  )}
                  
                  <h2 className="text-2xl md:text-3xl font-bold text-[#721422] mb-4 text-center">
                    {plan.name}
                  </h2>
                  
                  <div className="mb-6">
                    <p className="text-lg text-[#721422] font-semibold text-center">
                      {plan.frequency}
                    </p>
                  </div>
                  
                  <div className="mt-auto">
                    <div className="text-center mb-6">
                      <div className="text-3xl font-bold text-[#721422]">
                        {isAnnual ? plan.annualPrice : plan.cyclePrice}
                        <span className="text-lg font-normal"> / {isAnnual ? plan.annualPeriod : plan.cyclePeriod}</span>
                      </div>
                      <div className="text-sm text-[#721422]/70 mt-1">
                        {isAnnual 
                          ? `${plan.cyclePrice} / ${plan.cyclePeriod}`
                          : `${plan.annualPrice} / year`
                        }
                      </div>
                    </div>
                    
                    <form action="/create-checkout-session" method="POST">
                      <input type="hidden" name="lookup_key" value={isAnnual ? plan.annualLookupKey : plan.cycleLookupKey} />
                      <button
                        type="submit"
                        className={`w-full font-bold px-6 py-4 rounded-full transition-colors duration-200 ${
                          isRecommended
                            ? 'bg-[#721422] text-white hover:bg-[#8a1a2a]'
                            : 'bg-white text-[#721422] border-2 border-[#721422] hover:bg-[#721422] hover:text-white'
                        }`}
                      >
                        Subscribe
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Common Features - Below Plan Cards */}
          <div className="flex justify-center">
            <div className="bg-white/40 backdrop-blur-md rounded-3xl p-6 border border-white/50">
              <h3 className="text-xl font-bold text-[#721422] mb-4 text-center">
                All Plans Include:
              </h3>
              <ul className="flex flex-wrap gap-6 justify-center">
                {commonFeatures.map((feature, idx) => (
                  <li key={idx} className="text-[#721422] flex items-center">
                    <span className="mr-2 text-lg">✓</span>
                    <span className="text-base">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function PlansPage() {
  return (
    <Suspense fallback={
      <main className="relative min-h-screen flex items-center justify-center">
        <div className="fixed inset-0 -z-10 flex items-center justify-center">
          <video
            src="/background_desktop.mp4"
            autoPlay
            loop
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
          <div 
            className="absolute inset-0 w-full h-full block md:hidden"
            style={{
              backgroundImage: 'url(/background-mobile.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundAttachment: 'fixed',
              width: '100vw',
              height: '100dvh'
            }}
          />
          <div className="bg-white/30 absolute inset-0 backdrop-blur-lg" />
        </div>
        <div className="relative z-10 text-[#721422] text-xl">Loading...</div>
      </main>
    }>
      <PlansContent />
    </Suspense>
  );
}

