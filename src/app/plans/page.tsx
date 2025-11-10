'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

// GTM Event Tracking Helper
const trackGTMEvent = (eventName: string, eventData: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    const dataLayer = (window as any).dataLayer as Array<Record<string, any>> | undefined;
    if (dataLayer) {
      dataLayer.push({
        event: eventName,
        ...eventData,
      });
    }
  }
};

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
  },
  {
    name: 'One-Off',
    frequency: 'Single Kit',
    cyclePrice: '€29.99',
    cyclePeriod: 'one-time',
    annualPrice: null,
    annualPeriod: null,
    savingsPercentage: null,
    cycleLookupKey: '1pack',
    annualLookupKey: null,
    originalIndex: 3
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
  const { user, loading: authLoading } = useAuth();
  
  // Debug logging
  console.log('Plans page loaded with:', { recommendedParam, recommendedPlanIndex });
  
  // Check for success/cancel from Stripe redirect
  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');
  const sessionId = searchParams.get('session_id');
  
  // Detect if on mobile device
  const [isMobile, setIsMobile] = useState(false);
  const [showAllPlans, setShowAllPlans] = useState(false);
  
  // Popup state
  const [showPopup, setShowPopup] = useState(false);
  const [pendingLookupKey, setPendingLookupKey] = useState<string | null>(null);
  const [pendingPlan, setPendingPlan] = useState<typeof allPlans[0] | null>(null);
  const [pendingBillingPeriod, setPendingBillingPeriod] = useState<'cycle' | 'one_time' | null>(null);
  
  // Handle checkout - direct if logged in, auth page if not
  const handlePreOrder = async (plan: typeof allPlans[0]) => {
    const isOneOff = plan.cycleLookupKey === '1pack';
    // Track plan selection
    trackGTMEvent('plan_selected', {
      plan_name: plan.name,
      billing_type: isOneOff ? 'one_time' : 'per_cycle',
      is_recommended: recommendedPlanIndex !== null && plan.originalIndex === recommendedPlanIndex,
    });
    
    // Show popup first
    setPendingLookupKey(plan.cycleLookupKey);
    setPendingPlan(plan);
    setPendingBillingPeriod(isOneOff ? 'one_time' : 'cycle');
    setShowPopup(true);
  };
  
  // Confirm and proceed with checkout
  const confirmPreOrder = async () => {
    if (!pendingLookupKey || !pendingPlan || !pendingBillingPeriod) return;
    
    // Track disclaimer confirmation
    trackGTMEvent('Disclaimer_Confirmed', {
      plan_name: pendingPlan.name,
      billing_type: pendingBillingPeriod === 'one_time' ? 'one_time' : 'per_cycle',
      lookup_key: pendingLookupKey,
    });
    
    setShowPopup(false);
    const lookupKey = pendingLookupKey;
    setPendingLookupKey(null);
    setPendingPlan(null);
    setPendingBillingPeriod(null);
    
    if (user && user.email) {
      // User is logged in, go directly to checkout
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = '/.netlify/functions/create-checkout-session';

      const inputLookup = document.createElement('input');
      inputLookup.type = 'hidden';
      inputLookup.name = 'lookup_key';
      inputLookup.value = lookupKey;

      const inputUid = document.createElement('input');
      inputUid.type = 'hidden';
      inputUid.name = 'user_id';
      inputUid.value = user.id;

      const inputEmail = document.createElement('input');
      inputEmail.type = 'hidden';
      inputEmail.name = 'email';
      inputEmail.value = user.email;

      form.appendChild(inputLookup);
      form.appendChild(inputUid);
      form.appendChild(inputEmail);
      document.body.appendChild(form);
      form.submit();
    } else {
      // User not logged in, redirect to auth page
      window.location.href = `/auth?lookup_key=${lookupKey}`;
    }
  };
  
  // Close popup without proceeding
  const cancelPreOrder = () => {
    // Track disclaimer cancellation
    if (pendingPlan && pendingBillingPeriod) {
      trackGTMEvent('Disclaimer_Cancelled', {
        plan_name: pendingPlan.name,
        billing_type: pendingBillingPeriod === 'one_time' ? 'one_time' : 'per_cycle',
        lookup_key: pendingLookupKey || null,
      });
    }
    
    setShowPopup(false);
    setPendingLookupKey(null);
    setPendingPlan(null);
    setPendingBillingPeriod(null);
  };
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // Tailwind's md breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // On mobile, sort plans to show recommended first; on desktop, keep original order
  const sortedPlans = isMobile && recommendedPlanIndex !== null
    ? [...allPlans].sort((a, b) => {
        if (a.originalIndex === recommendedPlanIndex) return -1;
        if (b.originalIndex === recommendedPlanIndex) return 1;
        return a.originalIndex - b.originalIndex;
      })
    : allPlans;
  
  const recommendedPlan = recommendedPlanIndex !== null
    ? sortedPlans.find(plan => plan.originalIndex === recommendedPlanIndex) || null
    : null;

  const oneOffPlan = sortedPlans.find(plan => plan.cycleLookupKey === '1pack') || null;
  
  const displayedPlans = showAllPlans || !recommendedPlan
    ? sortedPlans
    : [
        recommendedPlan,
        ...(oneOffPlan && oneOffPlan.originalIndex !== recommendedPlan.originalIndex ? [oneOffPlan] : []),
      ];

  const isPendingOneOff = pendingPlan?.cycleLookupKey === '1pack';

  const handleShowAllPlans = () => {
    if (recommendedPlan) {
      trackGTMEvent('plans_view_other', {
        recommended_plan: recommendedPlan.name,
      });
    }
    setShowAllPlans(true);
  };
  
  // State for checkout success handling
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const [checkoutTracked, setCheckoutTracked] = useState(false);
  const [cancelTracked, setCancelTracked] = useState(false);

  // Handle successful checkout - fetch details and track event
  useEffect(() => {
    if (success && sessionId && !checkoutTracked) {
      setDetailsLoading(true);
      setDetailsError("");
      
      // Track checkout success immediately
      trackGTMEvent('Checkout_Success', {
        session_id: sessionId,
        timestamp: new Date().toISOString(),
      });
      
      // Fetch session details to get plan information
      fetch(`/api/stripe/session-details?session_id=${sessionId}`)
        .then((res) => res.json())
        .then((data) => {
          // Track checkout success with plan details
          if (data.plan_lookup_key) {
            // Determine plan name and billing type from lookup key
            const plan = allPlans.find(
              p => p.cycleLookupKey === data.plan_lookup_key || p.annualLookupKey === data.plan_lookup_key
            );
            const isAnnual = plan?.annualLookupKey === data.plan_lookup_key;
            
            trackGTMEvent('Checkout_Success_Complete', {
              session_id: sessionId,
              plan_name: plan?.name || 'unknown',
              billing_type: isAnnual ? 'annual' : 'per_cycle',
              lookup_key: data.plan_lookup_key,
              subscription_id: data.subscription_id || null,
              customer_id: data.stripe_customer_id || null,
            });
          }
          setCheckoutTracked(true);
        })
        .catch((err) => {
          setDetailsError(err.message || 'Failed to upsert profile.');
          // Still mark as tracked to avoid duplicate events
          setCheckoutTracked(true);
        })
        .finally(() => setDetailsLoading(false));
    }
  }, [success, sessionId, checkoutTracked]);

  // Handle canceled checkout - track event
  useEffect(() => {
    if (canceled && !cancelTracked) {
      // Track checkout cancellation
      trackGTMEvent('Checkout_Canceled', {
        timestamp: new Date().toISOString(),
        canceled_at: new Date().toISOString(),
      });
      setCancelTracked(true);
    }
  }, [canceled, cancelTracked]);

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

      {/* Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={cancelPreOrder}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white/95 backdrop-blur-md rounded-3xl p-6 md:p-8 border-2 border-[#721422] max-w-lg w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-[#721422] mb-4 text-center">
              Important Information
            </h3>
            
            <div className="text-[#721422] mb-6 space-y-3">
              {isPendingOneOff ? (
                <>
                  <p className="font-semibold text-lg">
                    IMPORTANT: Start exploring the app as soon as you order your kit — full access is unlocked instantly for 30 days.
                  </p>
                  <p>
                    You won’t need a subscription to use Santelle during this time. Your one-off purchase includes complete access to insights, tracking, and personalized recommendations for an entire month after your test results.
                  </p>
                  <p>
                    After 30 days, access will automatically close unless you choose to subscribe — no hidden fees, no automatic renewals, no strings attached.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-lg">
                    Start using the app right away — no payment needed!
                  </p>
                  <p>
                    You&apos;ll get full access to the Santelle app immediately. We won&apos;t charge you anything until your first kit is ready to ship.
                  </p>
                  <p>
                    We&apos;ll email you at least 48 hours before your first payment, so you have plenty of time to decide.
                  </p>
                  <p>
                    You can cancel your subscription anytime before your kit ships — completely free, no questions asked.
                  </p>
                </>
              )}
              <p className="text-sm pt-2">
                <a 
                  href="https://santellehealth.com/terms_of_service" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline hover:text-[#8a1a2a] font-semibold"
                >
                  View Terms of Service
                </a>
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={confirmPreOrder}
                className="flex-1 bg-[#721422] text-white font-bold px-6 py-3 rounded-full hover:bg-[#8a1a2a] transition-colors duration-200"
              >
                Continue
              </button>
              <button
                onClick={cancelPreOrder}
                className="flex-1 bg-white text-[#721422] font-bold px-6 py-3 rounded-full border-2 border-[#721422] hover:bg-[#721422] hover:text-white transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 w-[95%] mx-auto px-1 sm:px-4 py-10">
        <h1 className="text-3xl md:text-4xl font-bold text-[#721422] mb-10 text-center">
          {recommendedPlanIndex !== null 
            ? 'Based on your answers, this plan helps you stay balanced and in control.'
            : 'Choose the plan that best fits your needs.'
          }
        </h1>
        
        <div className="flex flex-col gap-4 sm:gap-8 max-w-7xl mx-auto">
          {/* Plan Cards */}
          <div
            className={`grid gap-1 sm:gap-6 ${
              displayedPlans.length === 1
                ? 'grid-cols-1 max-w-2xl mx-auto'
                : displayedPlans.length === 2
                ? 'grid-cols-2 max-w-4xl mx-auto'
                : 'grid-cols-2 md:grid-cols-4'
            }`}
          >
            {displayedPlans.map((plan) => {
              const recomFlag = recommendedPlanIndex !== null && plan.originalIndex === recommendedPlanIndex;
              const isOneOff = plan.cycleLookupKey === '1pack';
              return (
                <div
                  key={plan.name}
                  className={`bg-white/40 backdrop-blur-md rounded-3xl p-6 md:p-8 border-2 transition-all duration-300 hover:shadow-xl hover:scale-105 flex flex-col ${
                    recomFlag ? 'border-[#721422] shadow-lg' : isOneOff ? 'border-[#721422]/60' : 'border-white/50'
                  }`}
                >
                  {recomFlag && (
                    <div className="text-center mb-4">
                      <span className="bg-[#721422] text-white px-4 py-1 rounded-full text-sm font-bold">
                        RECOMMENDED
                      </span>
                    </div>
                  )}
                  {isOneOff && !recomFlag && (
                    <div className="text-center mb-4">
                      <span className="bg-white text-[#721422] px-4 py-1 rounded-full text-sm font-semibold border border-[#721422]/40">
                        ONE-OFF
                      </span>
                    </div>
                  )}
                  
                  <h2 className="text-2xl md:text-3xl font-bold text-[#721422] mb-4 text-center">
                    {plan.name}
                  </h2>
                  
                  <div className="mb-4">
                    <p className="text-lg text-[#721422] font-semibold text-center">
                      {plan.frequency}
                    </p>
                  </div>
                  
                  {/* Kit Image */}
                  <div className="flex justify-center mb-6">
                    <div className="bg-white/1 backdrop-blur-sm rounded-2xl p-4 border border-white/50">
                      <Image
                        src="/Kit.png"
                        alt="Santelle Kit"
                        width={200}
                        height={200}
                        className="object-contain"
                        style={{ maxHeight: '200px', width: 'auto' }}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-auto">
                    <div className="text-center mb-6">
                      <div className="text-3xl font-bold text-[#721422]">
                        {plan.cyclePrice}
                        {plan.cyclePeriod && (
                          <>
                            <span className="hidden sm:inline text-lg font-normal"> / {plan.cyclePeriod}</span>
                            <span className="block text-base font-normal sm:hidden">
                              {isOneOff ? plan.cyclePeriod : `/ ${plan.cyclePeriod}`}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handlePreOrder(plan)}
                      className={`block text-center w-full font-bold px-6 py-4 rounded-full transition-colors duration-200 ${
                        recomFlag
                          ? 'bg-[#721422] text-white hover:bg-[#8a1a2a]'
                          : 'bg-white text-[#721422] border-2 border-[#721422] hover:bg-[#721422] hover:text-white'
                      }`}
                    >
                      {isOneOff ? 'Buy Now' : 'Pre-Order'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {recommendedPlan && !showAllPlans && (
            <div className="mt-0 text-center">
              <button
                type="button"
                onClick={handleShowAllPlans}
                className="inline-block rounded-full border-2 border-[#721422] px-8 py-3 font-semibold text-[#721422] transition-colors duration-200 hover:bg-[#721422] hover:text-white"
              >
                View other plans
              </button>
            </div>
          )}

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

