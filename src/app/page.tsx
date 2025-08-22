'use client';

import Image from 'next/image';
import { useEffect, useState, useRef, useCallback } from 'react';
import Head from 'next/head';
import confetti from 'canvas-confetti';
import Link from 'next/link';
const HERO_HEIGHT = '100vh';

// Custom hook for intersection observer
function useIntersectionObserver(options = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  const callback = useCallback((entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setIsIntersecting(true);
        setHasIntersected(true);
      }
    });
  }, []);

  useEffect(() => {
    const currentElement = elementRef.current;
    const observer = new IntersectionObserver(callback, {
      rootMargin: '50px 0px',
      threshold: 0.1,
      ...options,
    });

    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [callback, options]);

  return [elementRef, isIntersecting, hasIntersected] as const;
}

// Custom smooth scroll function with easing options
function smoothScrollTo(element: HTMLElement, options: {
  duration?: number;
  easing?: 'linear' | 'easeInQuad' | 'easeOutQuad' | 'easeInOutQuad' | 'easeInCubic' | 'easeOutCubic' | 'easeInOutCubic';
  offset?: number;
  block?: 'start' | 'center' | 'end';
} = {}) {
  const { duration = 1000, easing = 'easeInOutCubic', offset = 0, block = 'start' } = options;
  
  const startPosition = window.pageYOffset;
  const elementRect = element.getBoundingClientRect();
  const elementTop = elementRect.top + window.pageYOffset;
  
  // Calculate target position based on block alignment
  let targetPosition: number;
  if (block === 'center') {
    targetPosition = elementTop - (window.innerHeight / 2) + (elementRect.height / 2) - offset;
  } else if (block === 'end') {
    targetPosition = elementTop - window.innerHeight + elementRect.height - offset;
  } else {
    // 'start' - align to top
    targetPosition = elementTop - offset;
  }
  
  const distance = targetPosition - startPosition;
  let startTime: number | null = null;

  // Easing functions
  const easingFunctions = {
    linear: (t: number) => t,
    easeInQuad: (t: number) => t * t,
    easeOutQuad: (t: number) => t * (2 - t),
    easeInOutQuad: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeInCubic: (t: number) => t * t * t,
    easeOutCubic: (t: number) => (--t) * t * t + 1,
    easeInOutCubic: (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
  };

  function animation(currentTime: number) {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);
    
    const easedProgress = easingFunctions[easing](progress);
    const newPosition = startPosition + distance * easedProgress;
    
    window.scrollTo(0, newPosition);
    
    if (progress < 1) {
      requestAnimationFrame(animation);
    }
  }

  requestAnimationFrame(animation);
}

export default function Home() {
  // Add preconnect hints for better performance
  useEffect(() => {
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
  
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [heroFadeOpacity, setHeroFadeOpacity] = useState(1);


  const [showEmailForm, setShowEmailForm] = useState(false);
  const waitlistRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const emailFormRef = useRef<HTMLFormElement>(null);

  // Lazy loading states
  const [kitSectionLoaded, setKitSectionLoaded] = useState(false);
  const [howItWorksLoaded, setHowItWorksLoaded] = useState(false);
  const [teamSectionLoaded, setTeamSectionLoaded] = useState(false);

  // Intersection observers for lazy loading
  const [kitSectionRef, kitSectionIntersecting] = useIntersectionObserver();
  const [howItWorksRef, howItWorksIntersecting] = useIntersectionObserver();
  const [teamSectionRef, teamSectionIntersecting] = useIntersectionObserver();

  // Animation state for stats card lines
  const [showStatsLine1] = useState(true);
  const [showStatsLine2] = useState(true);
  const [showStatsLine3] = useState(true);

  useEffect(() => {
    if (kitSectionIntersecting && !kitSectionLoaded) {
      setKitSectionLoaded(true);
    }
  }, [kitSectionIntersecting, kitSectionLoaded]);

  useEffect(() => {
    if (howItWorksIntersecting && !howItWorksLoaded) {
      setHowItWorksLoaded(true);
    }
  }, [howItWorksIntersecting, howItWorksLoaded]);

  useEffect(() => {
    if (teamSectionIntersecting && !teamSectionLoaded) {
      setTeamSectionLoaded(true);
    }
  }, [teamSectionIntersecting, teamSectionLoaded]);

  function handleSmoothScroll(e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>, sectionId: string) {
    e.preventDefault();
    if (sectionId === 'how-it-works' && howItWorksRef.current) {
      smoothScrollTo(howItWorksRef.current, { 
        duration: 800, 
        easing: 'easeInOutQuad',
        block: 'start',
        offset: 100 
      });
      return;
    }
    const el = document.getElementById(sectionId);
    if (el) {
      const block = sectionId === 'stats' ? 'center' : (window.innerWidth < 768 ? 'start' : 'center');
      const offset = window.innerWidth < 768 ? 64 : 0;
      smoothScrollTo(el, { 
        duration: 800, 
        easing: 'easeInOutQuad',
        block,
        offset 
      });
    }
  }

  useEffect(() => {
    // The label will now change directly based on waitlistOpen
  }, [waitlistOpen]);

  useEffect(() => {
    // Display page at the top on load
    window.scrollTo(0, 0);
  }, []);

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
          const fadeEnd = statsCardTop + statsCardHeight; // End fading when stats card is fully in viewport
          
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

  useEffect(() => {
    if (!waitlistOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (waitlistRef.current && !waitlistRef.current.contains(event.target as Node)) {
        setWaitlistOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [waitlistOpen]);

  useEffect(() => {
    function openWaitlistListener() {
      setShowEmailForm(true);
    }
    window.addEventListener('openWaitlist', openWaitlistListener);
    return () => window.removeEventListener('openWaitlist', openWaitlistListener);
  }, []);

  useEffect(() => {
    // Intersection Observer to trigger animation when stats card is in view
    const statsEl = statsRef.current;
    if (!statsEl) return;
    const observer = new window.IntersectionObserver(
      () => {
        // Stats in view tracking removed
      },
      { threshold: 0.3 }
    );
    observer.observe(statsEl);
    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    // All lines are now shown immediately, no animation needed
    return;
  }, []);

  const [cardOrder] = useState([0, 1, 2, 3]);
  const howItWorksSteps = [
    {
      number: 1,
      title: 'Receive your kit',
      desc: 'A discreet kit delivered to your door each month — with everything you need to check in with your vaginal health from home.',
      img: '/kit.webp',
    },
    {
      number: 2,
      title: 'Test in Minutes',
      desc: 'Use a small sample of discharge to test for 6 key biomarkers linked to infection, inflammation, and imbalance.',
      img: '/step2.webp',
    },
    {
      number: 3,
      title: 'Enter Your Results in the App',
      desc: 'Match your strip to the color guide and enter your results in the Santelle app. Get instant, clear personalized insights to understand what\'s going on.',
      img: '/step3.webp',
    },
    {
      number: 4,
      title: 'Track, Learn & Take Control',
      desc: 'See patterns, get monthly tips, and stay ahead of changes — whether you\'re managing symptoms, pregnancy, or just staying in tune.',
      img: '/step4.webp',
    },
    {
      number: 5,
      title: 'About the 6 Key Biomarkers',
      desc: '', // Will render custom content
      img: '/kit.webp', // Placeholder, can be changed
    },
  ];

  useEffect(() => {
    // Card offsets calculation removed
  }, [cardOrder]);

  const [formData, setFormData] = useState({ name: '', email: '' });
  const [emailValidation, setEmailValidation] = useState({
    isValid: false,
    isChecking: false,
    error: '',
    domainValid: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [rateLimit, setRateLimit] = useState({
    attempts: 0,
    lastAttempt: 0,
    blocked: false,
    cooldownEnd: 0
  });
  const [validationTimeout, setValidationTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (validationTimeout) {
        clearTimeout(validationTimeout);
      }
    };
  }, [validationTimeout]);

  const triggerConfetti = () => {
    // Create a burst of confetti from the center
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff4fa3', '#721422', '#F7A8B8', '#721422', '#18321f'],
      shapes: ['circle', 'square'],
      gravity: 0.8,
      ticks: 200
    });
    
    // Add a second burst after a short delay for more dramatic effect
    setTimeout(() => {
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#ff4fa3', '#721422', '#F7A8B8'],
        shapes: ['circle'],
        gravity: 1,
        ticks: 150
      });
    }, 200);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'email') {
      // Clear any existing timeout
      if (validationTimeout) {
        clearTimeout(validationTimeout);
      }
      
      // Set a new timeout for debounced validation
      const timeout = setTimeout(() => {
      validateEmail(e.target.value);
      }, 500); // 500ms delay after user stops typing
      
      setValidationTimeout(timeout);
    }
  };

  const validateEmailFormat = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateEmailDomain = async (email: string): Promise<boolean> => {
    const domain = email.split('@')[1];
    if (!domain) return false;
    
    try {
      const response = await fetch(`https://dns.google/resolve?name=${domain}&type=MX`);
      const data = await response.json();
      return data.Answer && data.Answer.length > 0;
    } catch (error) {
      console.error('Domain validation error:', error);
      return false;
    }
  };

  const validateEmail = async (email: string) => {
    if (!email) {
      setEmailValidation({
        isValid: false,
        isChecking: false,
        error: '',
        domainValid: false
      });
      return;
    }

    // Check format first
    const formatValid = validateEmailFormat(email);
    if (!formatValid) {
      setEmailValidation({
        isValid: false,
        isChecking: false,
        error: 'Please enter a valid email address',
        domainValid: false
      });
      return;
    }

    // Check domain
    setEmailValidation(prev => ({ ...prev, isChecking: true }));
    const domainValid = await validateEmailDomain(email);
    
    setEmailValidation({
      isValid: formatValid && domainValid,
      isChecking: false,
      error: domainValid ? '' : 'This email domain appears to be invalid',
      domainValid
    });
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const now = Date.now();
    
    // Rate limiting checks
    if (rateLimit.blocked && now < rateLimit.cooldownEnd) {
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 3000);
      return;
    }
    
    // Check for rapid submissions (more than 3 attempts in 60 seconds)
    const timeWindow = 60000; // 60 seconds
    const maxAttempts = 3;
    
    if (now - rateLimit.lastAttempt < timeWindow) {
      const newAttempts = rateLimit.attempts + 1;
      
      if (newAttempts > maxAttempts) {
        // Block for 5 minutes
        const cooldownTime = 300000; // 5 minutes
        setRateLimit({
          attempts: newAttempts,
          lastAttempt: now,
          blocked: true,
          cooldownEnd: now + cooldownTime
        });
        setSubmitStatus('error');
        setTimeout(() => setSubmitStatus('idle'), 3000);
        return;
      }
      
      setRateLimit(prev => ({
        ...prev,
        attempts: newAttempts,
        lastAttempt: now
      }));
    } else {
      // Reset attempts if outside time window
      setRateLimit(prev => ({
        ...prev,
        attempts: 1,
        lastAttempt: now,
        blocked: false,
        cooldownEnd: 0
      }));
    }
    
    if (!emailValidation.isValid) {
      setEmailValidation(prev => ({ ...prev, error: 'Please enter a valid email address' }));
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Subscribe to waitlist (saves to database and sends email)
      const subscribeResponse = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email
        })
      });

      if (!subscribeResponse.ok) {
        const errorData = await subscribeResponse.json();
        throw new Error(errorData.error || 'Failed to subscribe to waitlist');
      }

      console.log('Form submitted:', formData.email);
      setIsSubmitting(false);
      setSubmitStatus('success');
      triggerConfetti(); // Trigger confetti on success
      
      // Reset form after success
      setTimeout(() => {
        setFormData({ name: '', email: '' });
        setEmailValidation({
          isValid: false,
          isChecking: false,
          error: '',
          domainValid: false
        });
        setSubmitStatus('idle');
        // Reset rate limiting on successful submission
        setRateLimit({
          attempts: 0,
          lastAttempt: 0,
          blocked: false,
          cooldownEnd: 0
        });
      }, 3000);
    } catch (error) {
      console.error('Submission error:', error);
      setIsSubmitting(false);
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 3000);
    }
  };

  const focusHeroEmailInput = () => {
    setShowEmailForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const emailInput = document.getElementById('waitlist-email') as HTMLInputElement;
    if (emailInput) {
      emailInput.focus();
    }
  };

  useEffect(() => {
    if (!rateLimit.blocked) return;
    
    const interval = setInterval(() => {
      const now = Date.now();
      if (now >= rateLimit.cooldownEnd) {
        setRateLimit(prev => ({
          ...prev,
          blocked: false,
          cooldownEnd: 0
        }));
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [rateLimit.blocked, rateLimit.cooldownEnd]);

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
          smoothScrollTo(nextSection, { 
            duration: 800, 
            easing: 'easeInOutQuad',
            block: 'start',
            offset: 100 
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

      {/* Mobile Top Bar: Logo left, Hamburger + Shop right */}
      {/* Remove or hide this block for mobile since NavBar already provides the logo */}
      {/* Hero Section - fixed and full screen */}
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
                  smoothScrollTo(el, { 
                    duration: 800, 
                    easing: 'easeInOutQuad',
                    block: 'center'
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
                <form
                  ref={emailFormRef}
                  className="flex flex-col items-center mt-0 px-4 md:px-0"
                  style={{
                    width: 'clamp(400px, 50vw, 600px)'
                  }}
                  onSubmit={handleFormSubmit}
                >
                <label 
                  htmlFor="waitlist-email" 
                  className="self-start mb-1 text-[#721422] font-medium pl-2"
                  style={{
                    fontSize: 'clamp(0.875rem, 1.2vw, 1rem)'
                  }}
                >
                  Your email*
                </label>
                <div className="relative w-full">
                  <div className="get-access-pulse flex w-full">
                      <input
                      id="waitlist-email"
                      name="email"
                        type="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      placeholder="your@email.com"
                      className={`flex-1 rounded-l-full border ${
                        emailValidation.error ? 'border-red-500' : 
                        emailValidation.isValid ? 'border-green-500' : 
                        'border-[#ececec]'
                      } bg-white text-[#721422] outline-none focus:ring-2 focus:ring-[#721422]/20 transition caret-[#ff4fa3]`}
                      style={{
                        fontSize: 'clamp(0.875rem, 1.2vw, 1.125rem)',
                        paddingLeft: 'clamp(1rem, 1.5vw, 2rem)',
                        paddingRight: 'clamp(1rem, 1.5vw, 2rem)',
                        paddingTop: 'clamp(0.75rem, 1.2vw, 1rem)',
                        paddingBottom: 'clamp(0.75rem, 1.2vw, 1rem)'
                      }}
                      required
                      disabled={isSubmitting}
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting || (!!formData.email && !emailValidation.isValid) || rateLimit.blocked}
                      className={`font-semibold rounded-r-full border transition focus:outline-none focus:ring-2 focus:ring-[#721422]/30 flex items-center justify-center
                        ${isSubmitting ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                          : (!formData.email ? 'bg-[#721422] text-white border-[#721422]/40 hover:bg-[#8a1a2a] hover:text-white'
                            : (!emailValidation.isValid ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                              : 'bg-[#721422] text-white border-[#721422]/40 hover:bg-[#8a1a2a] hover:text-white'))}
                      `}
                      style={{ 
                        WebkitBackdropFilter: 'blur(12px)',
                        fontSize: 'clamp(0.75rem, 1vw, 1rem)',
                        paddingLeft: 'clamp(1rem, 1.5vw, 2.5rem)',
                        paddingRight: 'clamp(1rem, 1.5vw, 2.5rem)',
                        paddingTop: 'clamp(0.75rem, 1.2vw, 1rem)',
                        paddingBottom: 'clamp(0.75rem, 1.2vw, 1rem)'
                      }}
                    >
                      {isSubmitting ? 'Joining...' : rateLimit.blocked ? 'Rate limited' : (
                        <Image
                          src="/SantelleSBlack.svg"
                          alt="Santelle Logo"
                          width={40}
                          height={40}
                          className="w-10 h-10 brightness-0 invert"
                          style={{
                            width: 'clamp(24px, 2.5vw, 40px)',
                            height: 'clamp(24px, 2.5vw, 40px)'
                          }}
                        />
                      )}
                    </button>
                  </div>
                  {/* Validation feedback - absolutely positioned */}
                  <div className="absolute top-full left-0 right-0 mt-2">
                    {emailValidation.isChecking && (
                      <div 
                        className="text-blue-600 text-center"
                        style={{
                          fontSize: 'clamp(0.75rem, 1vw, 0.875rem)'
                        }}
                      >
                        Checking email domain...
                      </div>
                    )}
                    {emailValidation.error && (
                      <div 
                        className="text-red-600 text-center"
                        style={{
                          fontSize: 'clamp(0.75rem, 1vw, 0.875rem)'
                        }}
                      >
                        {emailValidation.error}
                      </div>
                    )}
                    {emailValidation.isValid && !emailValidation.isChecking && (
                      <div 
                        className="text-green-600 text-center"
                        style={{
                          fontSize: 'clamp(0.75rem, 1vw, 0.875rem)'
                        }}
                      >
                        ✓ Valid email address
                      </div>
                    )}
                    {/* Rate limiting feedback */}
                    {rateLimit.blocked && (
                      <div 
                        className="text-red-600 text-center"
                        style={{
                          fontSize: 'clamp(0.75rem, 1vw, 0.875rem)'
                        }}
                      >
                        Too many attempts. Please wait {Math.ceil((rateLimit.cooldownEnd - Date.now()) / 1000)} seconds before trying again.
                      </div>
                    )}
                    {/* Submit status */}
                    {submitStatus === 'success' && (
                      <div 
                        className="text-green-600 font-semibold text-center mt-2"
                        style={{
                          fontSize: 'clamp(1rem, 1.5vw, 1.125rem)'
                        }}
                      >
                    ✓ You&apos;ve been added to the waitlist!
                      </div>
                    )}
                    {submitStatus === 'error' && (
                      <div 
                        className="text-red-600 font-semibold text-center mt-2"
                        style={{
                          fontSize: 'clamp(1rem, 1.5vw, 1.125rem)'
                        }}
                      >
                        {rateLimit.blocked ? 'Too many submission attempts. Please wait before trying again.' : 'Something went wrong. Please try again.'}
                      </div>
                    )}
                  </div>
                </div>
              </form>
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
                        smoothScrollTo(statsSection as HTMLElement, { 
                          duration: 800, 
                          easing: 'easeInOutQuad',
                          block: 'start',
                          offset: 64 
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
                <form
                  ref={emailFormRef}
                  className="w-full"
                  onSubmit={handleFormSubmit}
                >
                <div className="relative w-full">
                  {/* Unified input and button container */}
                  <div className="flex w-full shadow-lg rounded-full overflow-hidden">
                    {/* Input field - left side */}
                    <input
                      id="waitlist-email-mobile"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      placeholder="your@email.com"
                      className="flex-1 px-6 py-4 bg-white text-[#721422] text-base outline-none transition caret-[#ff4fa3] border-none"
                      required
                      disabled={isSubmitting}
                    />
                    {/* Submit button - right side */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-3 py-4 font-semibold text-sm border-none transition focus:outline-none focus:ring-2 focus:ring-[#721422]/30 flex items-center justify-center bg-[#721422] text-white hover:bg-[#8a1a2a]"
                    >
                      {isSubmitting ? 'Joining...' : (
                        <Image
                          src="/S_logo.svg"
                          alt="Santelle Logo"
                          width={50}
                          height={50}
                          className="w-8 h-8 brightness-0 invert"
                        />
                      )}
                    </button>
                  </div>
                  {/* Validation feedback */}
                  <div className="mt-2">
                    {emailValidation.isChecking && (
                      <div className="text-blue-600 text-sm">Checking email domain...</div>
                    )}
                    {emailValidation.error && (
                      <div className="text-red-600 text-sm">{emailValidation.error}</div>
                    )}
                    {emailValidation.isValid && !emailValidation.isChecking && (
                      <div className="text-green-600 text-sm">✓ Valid email address</div>
                    )}
                    {/* Rate limiting feedback */}
                    {rateLimit.blocked && (
                      <div className="text-red-600 text-sm">
                        Too many attempts. Please wait {Math.ceil((rateLimit.cooldownEnd - Date.now()) / 1000)} seconds before trying again.
                      </div>
                    )}
                    {/* Submit status */}
                    {submitStatus === 'success' && (
                      <div className="text-green-600 text-base font-semibold mt-2">
                        ✓ You&apos;ve been added to the waitlist!
                      </div>
                    )}
                    {submitStatus === 'error' && (
                      <div className="text-red-600 text-base font-semibold mt-2">
                        {rateLimit.blocked ? 'Too many submission attempts. Please wait before trying again.' : 'Something went wrong. Please try again.'}
                      </div>
                    )}
                  </div>
                </div>
              </form>
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
                  smoothScrollTo(el, { 
                    duration: 800, 
                    easing: 'easeInOutQuad',
                    offset: window.innerHeight / 2 
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

      {/* Spacer to allow scrolling past the fixed hero */}
      <div style={{ height: HERO_HEIGHT }} className="w-full" />

      {/* Main content sections with higher z-index to cover hero */}
      <div className="relative z-20 w-full">
          {/* Desktop Stats Section */}
          <section id="stats" ref={statsRef} className="hidden md:flex w-full min-h-screen flex-col justify-center items-center gap-2 p-0 m-0 -mt-8 md:-mt-26">
            <div className="px-4 md:px-8 py-8 md:py-12 w-full flex justify-center items-center">
              <div className="bg-white/20 backdrop-blur-lg rounded-3xl shadow-none px-4 py-6 md:px-8 md:py-12 flex flex-col justify-center items-center text-center border border-white/50" style={{height: 'clamp(90vh, 95vh, 98vh)', width: 'clamp(90vw, 95vw, 98vw)'}}>
                <div
                  className="block md:inline-flex md:flex-row items-center md:items-start font-bold mb-12 text-center relative poppins-bold"
                  style={{
                    fontSize: 'clamp(1rem, 2vw, 2rem)',
                    color: '#721422'
                  }}
                >
                      <span 
                    className={`transition-opacity duration-[1200ms] ${showStatsLine1 ? 'opacity-100' : 'opacity-0'}`} 
                  >
                    Vaginal infections affect 3 in 4 women.
                  </span>
              </div>
              <div
                className="block md:inline-flex md:flex-row items-center md:items-start font-bold mb-12 text-center relative poppins-bold"
                style={{
                  fontSize: 'clamp(1rem, 2vw, 2rem)',
                  color: '#721422'
                }}
              >
                <span 
                  className={`transition-opacity duration-[1200ms] ${showStatsLine1 ? 'opacity-100' : 'opacity-0'}`} 
                >
                  50% are recurrent.
                      </span>
              </div>
                <div 
                  className={`text-[#721422] mb-12 transition-opacity duration-[1200ms] ${showStatsLine2 ? 'opacity-100' : 'opacity-0'}`}
                  style={{
                    fontSize: 'clamp(0.5rem, 1.5vw, 1.5rem)'
                  }}
                >
                  Left untreated, this can lead to <span className="font-bold">infertility</span>, <span className="font-bold">pregnancy complications</span>, and <span className="font-bold">long-term discomfort</span>.
                </div>
                <div 
                  className={`font-bold text-[#721422] mb-12 transition-opacity duration-[1200ms] ${showStatsLine3 ? 'opacity-100' : 'opacity-0'}`}
                  style={{
                    fontSize: 'clamp(0.5rem, 1.5vw, 1.5rem)'
                  }}
                >
                  It&apos;s time to take charge of your vaginal health — with insights, not guesswork.
                </div>
              <button
                onClick={e => handleSmoothScroll(e, 'kit')}
                className="mx-auto mt-10 flex items-center justify-center bg-white text-[#721422] font-bold rounded-full shadow-lg border-2 border-[#721422] focus:outline-none focus:ring-4 focus:ring-[#721422]/40 transition-all duration-300 cursor-pointer hover:bg-[#721422] hover:text-white"
                style={{
                  fontSize: 'clamp(0.875rem, 1.5vw, 1.125rem)',
                  paddingLeft: 'clamp(1rem, 2vw, 2rem)',
                  paddingRight: 'clamp(1rem, 2vw, 2rem)',
                  paddingTop: 'clamp(0.75rem, 1.5vw, 1rem)',
                  paddingBottom: 'clamp(0.75rem, 1.5vw, 1rem)',
                  width: 'clamp(250px, 30vw, 400px)',
                  whiteSpace: 'nowrap'
                }}
                aria-label="Scroll to kit section"
              >
                Discover how you can prevent this
              </button>
              </div>
            </div>
          </section>

        {/* Desktop Horizontal Divider */}
        <div className="hidden md:block w-full py-20">
          <div className="max-w-4xl mx-auto">
            <div className="h-1 bg-[#721422] rounded-full"></div>
          </div>
        </div>

        {/* Desktop Kit Image Section */}
          <section ref={kitSectionRef} id="kit" className="hidden md:flex w-full min-h-screen h-screen items-center justify-center">
            <div className="bg-white/30 backdrop-blur-lg rounded-3xl shadow-none flex flex-col md:flex-row items-center justify-center gap-2 md:gap-0 border border-white/50" style={{height: 'clamp(90vh, 95vh, 98vh)', width: 'clamp(90vw, 95vw, 98vw)', padding: '120px'}}>
          <div className="md:w-1/2 flex justify-center md:justify-end items-center p-0 py-2 md:py-0">
            {kitSectionLoaded ? (
              <Image
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
                loading="lazy"
                priority={false}
              />
            ) : (
              <div 
                className="w-full max-w-[28.8rem] md:w-[900px] md:max-w-[54rem] h-[600px] bg-gradient-to-br from-[#FBD5DB] to-[#F48CA3] rounded-lg animate-pulse"
                style={{
                  background: 'linear-gradient(135deg, #FBD5DB 0%, #F48CA3 50%, #721422 100%)',
                }}
              />
            )}
          </div>
                    <div className="md:w-1/2 flex flex-col items-center md:items-start justify-center" style={{gap: '5vh'}}>
                {/* First Group: Title and Subtitle */}
                <div style={{gap: '0.5rem'}}>
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
                </div>

                {/* Second Group: Description and Bullet Points */}
                <div style={{gap: '1rem'}}>
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
                </div>
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto justify-center md:justify-start">
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
            </div>
              </div>
          </div>
        </section>

        {/* Desktop Horizontal Divider */}
        <div className="hidden md:block w-full py-20">
          <div className="max-w-4xl mx-auto">
            <div className="h-1 bg-[#721422] rounded-full"></div>
          </div>
        </div>

        {/* Desktop Product Intro Section */}
          <section ref={howItWorksRef} id="how-it-works" className="hidden md:flex w-full py-0 mt-0 flex-col items-center gap-12 min-h-screen">
            <h2 className="hidden md:block font-bold text-[#721422] mb-0 md:mb-10 text-center"
                style={{
                  fontSize: 'clamp(2rem, 5vw, 4rem)'
                }}>
              <span className="chunko-bold">How you&apos;ll use it</span>
            </h2>
            <div ref={howItWorksRef} className="hidden md:block w-full mx-auto flex flex-col" style={{maxWidth: 'clamp(70vw, 70vw, 70vw)'}}>
               {howItWorksSteps.slice(0, 4).map((step) => (
                 <div
                   key={step.number}
                   className={`w-full flex flex-col items-center justify-center bg-white/30 backdrop-blur-lg rounded-3xl shadow-none mb-16 border border-white/50`}
                              style={{
                     padding: 'clamp(2rem, 2vw, 2rem)',
                     gap: '0'
                   }}
                     >
                                        {/* Top: Step number and heading */}
                  <div className="flex flex-row items-center w-full justify-center p-4" 
                       style={{
                         gap: 'clamp(1rem, 2vw, 2rem)',
                         height: 'clamp(80px, 10vh, 120px)'
                       }}>
                    <span className="font-bold text-white bg-[#721422] rounded-full aspect-square flex items-center justify-center"
                          style={{
                            fontSize: 'clamp(1.25rem, 2.5vw, 2.5rem)',
                            width: 'clamp(2.5rem, 5vw, 4rem)',
                            height: 'clamp(2.5rem, 5vw, 4rem)'
                          }}>
                      {step.number}
                    </span>
                    <div className="font-bold text-[#721422]" style={{fontSize: 'clamp(1rem, 2vw, 2rem)'}}>
                      {step.title}
                    </div>
                  </div>
                  {/* Middle: Image */}
                  <div className="flex items-center justify-center w-full p-4"
                       style={{
                         height: 'clamp(200px, 25vh, 400px)'
                       }}>
                        {howItWorksLoaded ? (
                                                  <Image 
                          src={step.img} 
                          alt={step.title} 
                          width={500}
                          height={500}
                          className="w-full h-full object-contain mx-auto"
                          style={{
                            height: 'clamp(200px, 25vh, 400px)',
                            width: 'clamp(200px, 60vw, 500px)',
                            maxWidth: '100%'
                          }}
                          sizes="(max-width: 768px) 200px, (max-width: 1024px) 300px, 500px"
                          quality={85}
                          loading="lazy"
                        />
                        ) : (
                                                <div 
                        className="w-auto bg-gradient-to-br from-[#FBD5DB] to-[#F48CA3] rounded-lg animate-pulse"
                        style={{
                          background: 'linear-gradient(135deg, #FBD5DB 0%, #F48CA3 50%, #721422 100%)',
                          minWidth: 'clamp(200px, 60vw, 500px)',
                          height: 'clamp(200px, 25vh, 400px)'
                        }}
                      />
                        )}
                      </div>
                                              {/* Bottom: Description */}
                                    <div className="w-full text-center flex items-center p-4 text-[#721422]"
                       style={{
                         fontSize: 'clamp(0.875rem, 1.5vw, 1.5rem)',
                         minHeight: 'clamp(80px, 10vh, 120px)'
                       }}>
                    {step.desc}
                  </div>
                    </div>
               ))}

            </div>

            {/* Mobile: Single card with dividers */}
            <div className="block md:hidden w-full max-w-7xl mx-auto">
              <div className="bg-white/30 backdrop-blur-lg rounded-3xl p-6 border border-white/50">
                {howItWorksSteps.slice(0, 4).map((step) => (
                  <div key={step.number}>
                      {/* Step content */}
                      <div className="flex flex-col items-center text-center py-6">
                        {/* Step number and title */}
                          <div className="flex flex-col items-center gap-4 mb-4">
                            <span className="text-3xl font-bold text-white bg-[#721422] rounded-full w-16 h-16 aspect-square flex items-center justify-center">
                              {step.number}
                            </span>
                            <div className="text-xl font-bold text-[#721422]">
                              {step.title}
                            </div>
                          </div>
                        
                        {/* Image */}
                        <div className="flex items-center justify-center w-full h-32 mb-4">
                          <Image 
                          src={step.img} 
                          alt={step.title} 
                            width={128}
                            height={128}
                            className="h-32 w-auto object-contain"
                            loading="lazy"
                            unoptimized
                          />
                        </div>
                        
                        {/* Description */}
                        <div className="text-base text-[#721422] leading-relaxed">
                          {step.desc}
                        </div>
                      </div>
                      
                      {/* Divider - don&apos;t show after last step */}
                      {step.number < 4 && (
                        <div className="flex justify-center py-4">
                          <div className="w-16 h-0.5 bg-[#721422]/30 rounded-full"></div>
                        </div>
                      )}
                    </div>
                ))}
              </div>
            </div>
            {/* CTA */}
            <div className="flex flex-col items-center mt-32 md:mt-12">
              <div className="text-3xl font-semibold mb-6" style={{color: '#721422'}}>
                Ready to take control?
              </div>
                <button
                className="bg-[#721422] text-white font-bold text-2xl px-12 py-5 rounded-full shadow-lg focus:outline-none focus:ring-4 focus:ring-[#18321f]/40 transition-all duration-300 cursor-pointer hover:bg-[#8a1a2a] hover:text-[#ffffff] get-access-pulse"
                onClick={focusHeroEmailInput}
                  type="button"
                >
                  Get Early Access
                </button>
          </div>
        </section>

        {/* Desktop Horizontal Divider */}
        <div className="hidden md:block w-full py-20">
          <div className="max-w-4xl mx-auto">
            <div className="h-1 bg-[#721422] rounded-full"></div>
          </div>
        </div>

        {/* Desktop Team/Leadership Section */}
        <section ref={teamSectionRef} id="team" className="hidden md:flex w-full py-0 px-8 lg:px-32 flex-col items-center gap-12 min-h-screen" style={{minWidth: '100vw', width: '100vw'}}>
          <h2 className="font-bold text-[#721422] mb-10 text-center"
              style={{
                fontSize: 'clamp(2rem, 5vw, 4rem)'
              }}>
            <span className="chunko-bold">Our Team</span>
          </h2>
          <p className="text-center text-[#721422] mb-8 font-bold" style={{fontSize: 'clamp(0.875rem, 1.25vw, 1.25rem)'}}>
            Santelle is built by a passionate team with backgrounds in health, tech, and women&apos;s wellness.
          </p>
          {/* Logos Row */}
                      <div className="w-full px-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
                                {/* Left: Roxanne Sabbag */}
                <a 
                  href="https://www.linkedin.com/in/roxanne-sabbag-642a3014b/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full max-w-sm"
                >
                  <div 
                    className="bg-white/30 backdrop-blur-lg rounded-3xl overflow-hidden hover:bg-white/40 cursor-pointer relative w-full h-[600px] border border-white/50"
                  >
                  <div className="w-full h-96 flex items-center justify-center overflow-hidden relative" style={{
                    backgroundImage: 'url(/profile_background.webp)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }}>
                    <Image
                      src="/RS.png"
                      alt="Roxanne Sabbag"
                      width={500}
                      height={500}
                      className="absolute top-[60%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-130 h-130 object-cover"
                      priority
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-[#721422] mb-2">Roxanne Sabbag</h3>
                    <p className="text-lg font-semibold text-[#ff4fa3] mb-4">Founder & CEO</p>
                    <div className="flex items-center gap-3">
                      <Image src="/McK.webp" alt="McKinsey & Co." width={60} height={60} className="w-50 h-auto object-contain" />
                      <Image src="/ICL.webp" alt="Imperial College London" width={60} height={60} className="w-50 h-auto object-contain" />
                      <Image src="/INSEAD.webp" alt="INSEAD" width={80} height={80} className="w-50 h-auto object-contain" />
                  </div>
                </div>
                </div>
                  </a>

                {/* Center: Leonor Landeau */}
                <a 
                  href="https://www.linkedin.com/in/léonor-landeau-412197121/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full max-w-sm"
                >
                  <div 
                    className="bg-white/30 backdrop-blur-lg rounded-3xl overflow-hidden hover:bg-white/40 cursor-pointer relative w-full h-[600px] border border-white/50"
                  >
                  <div className="w-full h-96 flex items-center justify-center overflow-hidden relative" style={{
                    backgroundImage: 'url(/profile_background.webp)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }}>
                    <Image
                      src="/LL.png"
                      alt="Leonor Landeau"
                      width={400}
                      height={400}
                      className="absolute top-[65%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-150 h-150 object-cover"
                      priority
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-[#721422] mb-2">Leonor Landeau</h3>
                    <p className="text-lg font-semibold text-[#ff4fa3] mb-4">Collaborator & Advisor</p>
                    <div className="flex items-center gap-3">
                      <Image src="/feelmore_labs_logo.jpeg" alt="Feelmore Labs" width={60} height={60} className="w-27 h-auto object-contain" />
                      <Image src="/LSE_Logo.svg" alt="London School of Economics" width={60} height={60} className="w-20 h-auto object-contain" />
                      <Image src="/INSEAD.webp" alt="INSEAD" width={60} height={60} className="w-50 h-auto object-contain" />
                  </div>
                </div>
                </div>
                  </a>

                {/* Right: Tomasso Busolo */}
                <a 
                  href="https://www.linkedin.com/in/tommaso-busolo/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full max-w-sm"
                >
                  <div 
                    className="bg-white/30 backdrop-blur-lg rounded-3xl overflow-hidden hover:bg-white/40 cursor-pointer relative w-full h-[600px] border border-white/50"
                  >
                  <div className="w-full h-96 flex items-center justify-center overflow-hidden relative" style={{
                    backgroundImage: 'url(/profile_background.webp)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }}>
                    <Image
                      src="/TB.png"
                      alt="Tomasso Busolo"
                      width={400}
                      height={400}
                      className="absolute top-[60%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-130 h-130 object-cover"
                      priority
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-[#721422] mb-2">Dr. Tomasso Busolo</h3>
                    <p className="text-lg font-semibold text-[#ff4fa3] mb-4">Collaborator & Advisor</p>
                    <div className="flex items-center gap-3">
                      <Image src="/almafutura_logo.jpeg" alt="Alma Futura" width={60} height={60} className="w-20 h-auto object-contain" />
                      <Image src="/daya_ventures_femtech_logo.jpeg" alt="Daya Ventures" width={60} height={60} className="w-20 h-auto object-contain" />
                      <Image src="/cambridge.svg" alt="University of Cambridge" width={60} height={60} className="w-30 h-auto object-contain" />
                  </div>
                </div>
                </div>
                  </a>
              </div>
          </div>
        </section>

        {/* Desktop Horizontal Divider */}
        <div className="hidden md:block w-full py-20">
          <div className="max-w-4xl mx-auto">
            <div className="h-1 bg-[#721422] rounded-full"></div>
          </div>
        </div>

        {/* Mobile Unified Card - All Sections */}
        <section id="mobile-unified-card" className="block md:hidden w-full py-8">
          <div className="bg-white/30 backdrop-blur-lg rounded-3xl p-6 border border-white/50">
            
            {/* Stats Section */}
                                <div data-section="stats" className="py-40">
              <div className="text-center">
                <div className="poppins-bold text-3xl font-bold text-[#721422] mb-20">
                  Vaginal infections affect 3 in 4 women. 50% are recurrent.
                </div>
                <div className="text-2xl text-[#721422] mb-20">
                  Untreated, they can lead to<br/>
                  <span className="font-bold">pregnancy complications</span><br/>
                  <span className="font-bold">long-term discomfort</span><br/>
                  <span className="font-bold">infertility</span>
                </div>
                <div className="text-2xl font-bold text-[#721422] mb-4">
                  It&apos;s time to take charge of your vaginal health — with insights, not guesswork.
                </div>
              </div>
            </div>

            {/* Meet Section Title */}
                                <div data-section="meet" className="py-40">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-1 bg-[#721422] rounded-full"></div>
                <h2 className="font-bold text-4xl text-[#721422] text-center">
                  <span className="chunko-bold">Meet Santelle</span>
                </h2>
                <div className="flex-1 h-1 bg-[#721422] rounded-full"></div>
              </div>
              <div className="flex flex-col items-start text-left">
                
                <div className="mb-4 self-center">
                  <Image
                    src="/SantelleKit+App.png"
                    alt="Santelle Kit and App"
                    width={300}
                    height={300}
                    className="w-full max-w-[300px] h-auto object-contain drop-shadow-lg"
                    sizes="300px"
                    quality={85}
                    priority
                  />
                </div>
                <div className="font-bold text-xl text-[#721422] text-left mb-4">
                  Your discreet, at-home vaginal health companion
                </div>
                <p className="text-lg text-[#721422] mb-4 leading-relaxed">
                  Santelle makes it simple to check in on your intimate health each month — with instant
                  results, personalised insights, and no awkward clinic visits.
                </p>
                <ul className="list-disc pl-6 text-[#721422] mb-6 space-y-1 text-lg text-left">
                  <li>Instant results from home</li>
                  <li>Multi-biomarker analysis — beyond pH</li>
                  <li>Connected app with personalised insights & tips</li>
                </ul>
                <div className="flex flex-col gap-3 w-full">
                <div className="flex justify-center mt-0 mb-6">
                <button
                  className="bg-[#721422] text-white font-bold text-xl px-8 py-4 rounded-full hover:bg-[#8a1a2a] hover:text-white transition cursor-pointer get-access-pulse"
                  onClick={focusHeroEmailInput}
                  type="button"
                >
                  Get Early Access
                </button>
              </div>
              </div>
              </div>
            </div>

            {/* How It Works Section */}
                                <div data-section="how-it-works" className="py-40">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-1 bg-[#721422] rounded-full"></div>
                <h2 className="font-bold text-4xl text-[#721422] text-center">
                  <span className="chunko-bold">How It Works</span>
                </h2>
                <div className="flex-1 h-1 bg-[#721422] rounded-full"></div>
              </div>
              {howItWorksSteps.slice(0, 4).map((step, stepIdx) => (
                <div key={step.number} className="mb-6">
                    {/* Step content */}
                    <div className="flex flex-col items-start text-left">
                      {/* Step number and title */}
                        <div className="flex flex-col items-center gap-3 mb-3 w-full">
                          <span className="text-3xl font-bold text-white bg-[#721422] rounded-full w-12 h-12 aspect-square flex items-center justify-center">
                            {step.number}
                          </span>
                          <div className="text-2xl font-bold text-[#721422] text-center">
                            {step.title}
                          </div>
                        </div>
                      
                      {/* Image */}
                      <div className="flex items-center justify-center w-full mb-3">
                        <Image 
                        src={step.img}
                          width={240}
                          height={240}
                          loading="lazy" 
                        alt={step.title} 
                          className={`${stepIdx === 2 ? 'w-4/5 h-auto' : 'h-60 w-auto'} object-contain`} 
                        sizes="(max-width: 768px) 240px, 240px"
                        quality={85}
                        />
                      </div>
                      
                      {/* Description */}
                      <div className="text-lg text-[#721422] leading-relaxed">
                        {stepIdx === 0 && (
                          <>
                            A discreet kit delivered to your door each month — with everything you need to check in with your <span className="font-bold">vaginal health</span> from home.
                          </>
                        )}
                      {stepIdx === 1 && (
                        <>
                          Use a small sample of discharge to test for <span className="font-bold">6 key biomarkers</span> linked to <span className="font-bold">infection</span>, <span className="font-bold">inflammation</span>, and <span className="font-bold">imbalance</span>.
                          </>
                        )}
                        {stepIdx === 2 && (
                          <>
                            Match your strip to the color guide and enter your results in the <span className="biomarker-highlight">Santelle app</span>. Get <span className="font-bold">instant, clear personalized insights</span> to understand what&apos;s going on.
                          </>
                        )}
                        {stepIdx === 3 && (
                          <>
                            See <span className="font-bold">patterns</span>, get <span className="font-bold">monthly tips</span>, and stay ahead of changes — whether you&apos;re managing <span className="font-bold">symptoms</span>, <span className="font-bold">pregnancy</span>, or just staying in tune.
                          </>
                        )}
                      </div>
                    </div>
                    
                                         {/* Divider - don&apos;t show after last step */}
                     {stepIdx < 3 && (
                       <div className="flex justify-center py-4">
                         <div className="w-20 h-0.5 bg-[#721422]/40 rounded-full"></div>
                    </div>
                  )}
                </div>
              ))}
              
              {/* Get Early Access Button */}
              <div className="flex justify-center mt-0 mb-6">
                <button
                  className="bg-[#721422] text-white font-bold text-xl px-8 py-4 rounded-full hover:bg-[#8a1a2a] hover:text-white transition cursor-pointer get-access-pulse"
                  onClick={focusHeroEmailInput}
                  type="button"
                >
                  Get Early Access
                </button>
              </div>
            </div>

            {/* Team Section */}
                                <div data-section="team" className="py-40">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-1 bg-[#721422] rounded-full"></div>
                <h2 className="font-bold text-4xl text-[#721422] text-center">
                  <span className="chunko-bold">Our Team</span>
                </h2>
                <div className="flex-1 h-1 bg-[#721422] rounded-full"></div>
              </div>

              <div className="space-y-4">
                {/* Team Member Cards */}
                <a 
                  href="https://www.linkedin.com/in/roxanne-sabbag-642a3014b/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 hover:bg-white/30 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#FBD5DB] to-[#F48CA3] rounded-full flex items-center justify-center overflow-hidden">
                        <Image
                          src="/RS.png"
                          alt="Roxanne Sabbag"
                          width={64}
                          height={64}
                          className="w-full h-full object-contain scale-170"
                          priority
                        />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-[#721422]">Roxanne Sabbag</h3>
                      <p className="text-xl font-semibold text-[#ff4fa3] mb-2">Founder & CEO</p>
                                                                                           <div className="flex items-center gap-9 justify-start">
                          <Image src="/McK.webp" alt="McKinsey & Co." width={40} height={40} className="w-10 h-auto ml-3 object-contain scale-150" />
                          <Image src="/ICL.webp" alt="Imperial College London" width={40} height={40} className="w-10 h-auto object-contain scale-150" />
                          <Image src="/INSEAD.webp" alt="INSEAD" width={50} height={50} className="w-12 h-auto object-contain scale-170" />
                         </div>
                  </div>
                </div>
                  </div>
                </a>

                <a 
                  href="https://www.linkedin.com/in/léonor-landeau-412197121/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 hover:bg-white/30 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#FBD5DB] to-[#F48CA3] rounded-full flex items-center justify-center overflow-hidden">
                        <Image
                          src="/LL.png"
                          alt="Leonor Landeau"
                          width={64}
                          height={64}
                          className="w-full h-full object-contain scale-200"
                          priority
                        />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-[#721422]">Leonor Landeau</h3>
                        <p className="text-xl font-semibold text-[#ff4fa3] mb-2">Collaborator & Advisor</p>
                                                                                                 <div className="flex items-center gap-2 justify-start">
                           <Image src="/feelmore_labs_logo.jpeg" alt="Feelmore Labs" width={40} height={40} className="w-10 h-auto object-contain scale-100" />
                           <Image src="/LSE_Logo.svg" alt="London School of Economics" width={40} height={40} className="w-10 h-auto object-contain scale-100" />
                           <Image src="/INSEAD.webp" alt="INSEAD" width={50} height={50} className="w-12 h-auto object-contain scale-170" />
                          </div>
                  </div>
                </div>
                  </div>
                </a>

                <a 
                  href="https://www.linkedin.com/in/tommaso-busolo/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 hover:bg-white/30 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#FBD5DB] to-[#F48CA3] rounded-full flex items-center justify-center overflow-hidden">
                        <Image
                          src="/TB.png"
                          alt="Tomasso Busolo"
                          width={64}
                          height={64}
                          className="w-full h-full object-contain scale-170"
                          priority
                        />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-[#721422]">Tomasso Busolo</h3>
                      <p className="text-xl font-semibold text-[#ff4fa3] mb-2">Collaborator & Advisor</p>
                                            <div className="flex items-center gap-2 justify-start">
                        <Image src="/almafutura_logo.jpeg" alt="Alma Futura" width={40} height={40} className="w-10 h-auto object-contain" />
                        <Image src="/daya_ventures_femtech_logo.jpeg" alt="Daya Ventures" width={40} height={40} className="w-10 h-auto object-contain" />
                        <Image src="/cambridge.svg" alt="University of Cambridge" width={40} height={40} className="w-10 h-auto ml-4 object-contain scale-200" />
                      </div>
                  </div>
                </div>
                  </div>
                </a>
              </div>
            </div>

          </div>
        </section>

        {/* Bottom Glassmorphic Card */}
        <section className="w-full pt-4 pb-0 px-0 md:px-0 relative z-20" style={{minWidth: '100vw', width: '100vw'}}>
          <div className="bg-white/30 backdrop-blur-lg border border-white/50 w-full">
            <div className="p-4 md:p-8 flex flex-col items-center gap-6 text-center">
              {/* Logo */}
              <div className="w-full flex justify-center mb-2">
                <Image src="/logo-dark.svg" alt="Santelle Logo" width={180} height={60} style={{objectFit: 'contain', height: 60}} loading="lazy" />
              </div>

              {/* Get Early Access Button */}
              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  setTimeout(() => {
                    window.dispatchEvent(new Event('openWaitlist'));
                    const emailInput = document.getElementById('waitlist-email') as HTMLInputElement;
                    if (emailInput) {
                      emailInput.focus();
                    }
                  }, 600);
                }}
                className="bg-[#721422] text-white font-bold text-lg px-8 py-4 rounded-full hover:bg-[#8a1a2a] transition-colors duration-200 cursor-pointer"
              >
                Get Early Access
              </button>
              {/* Divider */}
              <hr className="w-full border-t border-[#721422]/20 my-2" />
              {/* Footer Links and Copyright */}
              <div className="w-full flex flex-col md:flex-row justify-between items-center gap-2 text-sm text-[#721422] mt-2">
                <div className="flex gap-4 mb-1 md:mb-0">
                  <Link href="/privacy-policy" className="underline hover:text-[#18321f]">Privacy Policy</Link>
                  <span>|</span>
                  <Link href="/contact-us" className="underline hover:text-[#18321f]">Contact Us</Link>
                </div>
                <div className="text-[#721422]/60">© 2025 Santelle. All rights reserved.</div>
              </div>
            </div>
          </div>
        </section>

      </div>
      <script dangerouslySetInnerHTML={{__html:`window.statsCard = document.getElementById('stats');`}} />
    </main>
    </>
  );
}
