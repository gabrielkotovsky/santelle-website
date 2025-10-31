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
    savingsPercentage: '16.6%',
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
    savingsPercentage: '21.5%',
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
    savingsPercentage: '25.0%',
    cycleLookupKey: 'essential-quarterly',
    annualLookupKey: 'essential-annual',
    originalIndex: 2
  }
];

const preOrderFeatures = [
  'Early access to the app',
  'Ships now for first 15 subscribers'
];

const commonFeatures = [
  'Full access to app',
  '30% off on extra kits'
];

const kitContents = [
  '6 biomarkers testing for 4 types of infections, inflammation, and good bacteria'
];

const appFeatures = [
  'AI analysis of your results',
  'Personalized bite-sized educational content',
  '(Analytics coming soon)'
];

function PlansContent() {
  const searchParams = useSearchParams();
  const recommendedParam = searchParams.get('recommended');
  const recommendedPlanIndex = recommendedParam ? parseInt(recommendedParam) : null;
  
  // Debug logging
  console.log('Plans page loaded with:', { recommendedParam, recommendedPlanIndex });
  
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
    const [detailsLoading, setDetailsLoading] = useState(false); // still allow fetch for backend-upsert
    const [detailsError, setDetailsError] = useState("");

    useEffect(() => {
      // Keep upsert but do not show details
      setDetailsLoading(true);
      setDetailsError("");
      fetch(`/api/stripe/session-details?session_id=${sessionId}`)
        .then((res) => res.json())
        .catch((err) => setDetailsError(err.message || 'Failed to upsert profile.'))
        .finally(() => setDetailsLoading(false));
    }, [sessionId]);

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
              <p className="text-lg text-[#721422]/80 mb-6">
                Welcome to Santelle! You'll receive a confirmation email shortly.
              </p>
              {detailsLoading && <p className="text-[#721422]">Finalizing your subscription...</p>}
              {detailsError && <p className="text-red-600">{detailsError}</p>}
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
      <div className="relative z-10 w-[95%] mx-auto px-4 py-40">
        <h1 className="text-3xl md:text-4xl font-bold text-[#721422] mb-10 text-center">
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
                      {isAnnual && (
                        <div className="text-sm font-semibold text-green-600 mt-2">
                          Save {plan.savingsPercentage}
                        </div>
                      )}
                    </div>
                    
                    <a
                      href={`/auth?lookup_key=${isAnnual ? plan.annualLookupKey : plan.cycleLookupKey}`}
                      className={`block text-center w-full font-bold px-6 py-4 rounded-full transition-colors duration-200 ${
                        isRecommended
                          ? 'bg-[#721422] text-white hover:bg-[#8a1a2a]'
                          : 'bg-white text-[#721422] border-2 border-[#721422] hover:bg-[#721422] hover:text-white'
                      }`}
                    >
                      Pre-Order
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pre-Order Features and Common Features - Below Plan Cards */}
          <div className="flex flex-col gap-6">
            {/* First Row: Pre-Order Benefits and All Plans Include */}
            <div className="flex flex-col md:flex-row gap-6 justify-center items-stretch">
              {/* Pre-Order Features Card */}
              <div className="bg-white/40 backdrop-blur-md rounded-3xl p-6 border border-white/50 flex-1 max-w-md">
                <h3 className="text-xl font-bold text-[#721422] mb-4 text-center">
                  Pre-order benefits
                </h3>
                <ul className="flex flex-col gap-4 justify-center">
                  {preOrderFeatures.map((feature, idx) => (
                    <li key={idx} className="text-[#721422] flex items-center">
                      <span className="mr-2 text-lg">✓</span>
                      <span className="text-base">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Common Features Card */}
              <div className="bg-white/40 backdrop-blur-md rounded-3xl p-6 border border-white/50 flex-1 max-w-md">
                <h3 className="text-xl font-bold text-[#721422] mb-4 text-center">
                  All plans will include
                </h3>
                <ul className="flex flex-col gap-4 justify-center">
                  {commonFeatures.map((feature, idx) => (
                    <li key={idx} className="text-[#721422] flex items-center">
                      <span className="mr-2 text-lg">✓</span>
                      <span className="text-base">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Second Row: Kit Features Card */}
            <div className="flex justify-center">
              <div className="bg-white/40 backdrop-blur-md rounded-3xl p-6 border border-white/50 max-w-2xl w-full">
                <div className="text-center">
                  <button
                    onClick={() => {
                      const details = document.getElementById('kit-details');
                      const arrow = document.getElementById('kit-expand-arrow');
                      if (details && arrow) {
                        const isExpanded = details.classList.contains('expanded');
                        
                        if (isExpanded) {
                          // Collapse
                          details.style.maxHeight = '0px';
                          details.style.opacity = '0';
                          details.classList.remove('expanded');
                          arrow.style.transform = 'rotate(0deg)';
                        } else {
                          // Expand
                          details.style.maxHeight = details.scrollHeight + 'px';
                          details.style.opacity = '1';
                          details.classList.add('expanded');
                          arrow.style.transform = 'rotate(180deg)';
                        }
                      }
                    }}
                    className="flex items-center justify-center gap-2 text-[#721422] hover:text-[#8a1a2a] transition-colors duration-200 mx-auto mb-0"
                  >
                    <h3 className="text-xl font-bold text-[#721422]">
                      What's in the kit?
                    </h3>
                    <svg
                      id="kit-expand-arrow"
                      className="w-5 h-5 transition-transform duration-300 ease-in-out"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                
                <div 
                  id="kit-details" 
                  className="overflow-hidden transition-all duration-500 ease-in-out"
                  style={{ 
                    maxHeight: '0px', 
                    opacity: '0',
                    transform: 'translateY(-10px)'
                  }}
                >
                  <div className="pt-4 space-y-6">
                    {/* Kit Contents Section */}
                    <div>
                      <h4 className="font-semibold text-lg mb-3 text-[#721422]">Santelle Kit:</h4>
                      <ul className="flex flex-col gap-4 justify-center">
                        {kitContents.map((content, idx) => (
                          <li key={idx} className="text-[#721422] flex items-center">
                            <span className="mr-2 text-lg">✓</span>
                            <span className="text-base">{content}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* App Features Section */}
                    <div>
                      <h4 className="font-semibold text-lg mb-3 text-[#721422]">App Features:</h4>
                      <ul className="flex flex-col gap-4 justify-center">
                        {appFeatures.map((feature, idx) => (
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

