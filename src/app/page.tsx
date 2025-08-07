'use client';

import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';
import Head from 'next/head';

import confetti from 'canvas-confetti';
import Link from 'next/link';

const HERO_HEIGHT = '100vh';

const menuItems = [
  { href: '#memberships', label: 'Memberships' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#why-santelle', label: 'Why Santelle' },
  { href: '#products', label: 'Products' },
  { href: '#reviews', label: 'Reviews' },
  { href: '#support', label: 'Support' },
];

export default function Home() {
  const [onHero, setOnHero] = useState(true);
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [heroContentVisible, setHeroContentVisible] = useState(true); // NEW STATE
  const [headerFadeOpacity, setHeaderFadeOpacity] = useState(1);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const waitlistRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const howItWorksCardsRef = useRef<HTMLDivElement>(null);
  const emailFormRef = useRef<HTMLFormElement>(null);

  // Animation state for stats card lines
  const [showStatsLine1, setShowStatsLine1] = useState(true);
  const [showStatsLine1b, setShowStatsLine1b] = useState(true);
  const [showStatsLine2, setShowStatsLine2] = useState(true);
  const [showStatsLine3, setShowStatsLine3] = useState(true);
  const [statsInView, setStatsInView] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(true);

  // Animation control refs
  const animationStep = useRef(0); // 0: not started, 1: line1, 2: line2, 3: line3, 4: done
  const animationStart = useRef<number | null>(null);
  const elapsed = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Animation durations (ms)
  const delays = [400, 4800, 3000]; // initial, between 1-2, between 2-3
  const fadeDuration = 1200;

  // Helper to clear timer
  function clearAnimTimeout() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }

  // Smooth scroll handler
  function handleSmoothScroll(e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>, sectionId: string) {
    e.preventDefault();
    if (sectionId === 'how-it-works' && howItWorksCardsRef.current) {
      const block = (typeof window !== 'undefined' && window.innerWidth < 768) ? 'start' : 'center';
      howItWorksCardsRef.current.scrollIntoView({ behavior: 'smooth', block });
      return;
    }
    const el = document.getElementById(sectionId);
    if (el) {
      const block = sectionId === 'stats' ? 'center' : (window.innerWidth < 768 ? 'start' : 'center');
      el.scrollIntoView({ behavior: 'smooth', block });
    }
  }

  // Add a helper for span click to scroll to stats
  function handleSpanScrollToStats(e: React.MouseEvent<HTMLSpanElement>) {
    e.preventDefault();
    const el = document.getElementById('stats');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  // Sync showSecureLabel with waitlistOpen, but delay label change on close
  useEffect(() => {
    // The label will now change directly based on waitlistOpen
  }, [waitlistOpen]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const maxScroll = documentHeight - windowHeight;
      const progress = maxScroll > 0 ? (scrollY / maxScroll) * 100 : 0;
      setScrollProgress(progress);
      setOnHero(window.scrollY < window.innerHeight - 60);
      
      // Calculate header fade opacity based on scroll to stats card (desktop only)
      if (window.innerWidth >= 768) {
      const statsCard = document.getElementById('stats');
      if (statsCard) {
        const statsCardTop = statsCard.offsetTop;
        const fadeStart = windowHeight * 0.5; // Start fading when halfway down the viewport
        const fadeEnd = statsCardTop - windowHeight * 0.3; // End fading when stats card is 30% up the viewport
        
        if (scrollY <= fadeStart) {
          setHeaderFadeOpacity(1);
        } else if (scrollY >= fadeEnd) {
          setHeaderFadeOpacity(0);
        } else {
          const fadeRange = fadeEnd - fadeStart;
          const fadeProgress = (scrollY - fadeStart) / fadeRange;
          setHeaderFadeOpacity(Math.max(0, 1 - fadeProgress));
        }
        }
      } else {
        // On mobile, keep header content always visible
        setHeaderFadeOpacity(1);
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
      setWaitlistOpen(true);
    }
    window.addEventListener('openWaitlist', openWaitlistListener);
    return () => window.removeEventListener('openWaitlist', openWaitlistListener);
  }, []);

  useEffect(() => {
    // Intersection Observer to trigger animation when stats card is in view
    const statsEl = statsRef.current;
    if (!statsEl) return;
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        setStatsInView(entry.isIntersecting);
      },
      { threshold: 0.3 }
    );
    observer.observe(statsEl);
    return () => {
      observer.disconnect();
    };
  }, []);

  // Animation effect - disabled for immediate display
  useEffect(() => {
    // All lines are now shown immediately, no animation needed
    return;
  }, []);

  // How It Works stacked card state
  const [cardOrder, setCardOrder] = useState([0, 1, 2, 3]);
  const [cardFade, setCardFade] = useState([false, false, false, false]);
  const [cardSlideIn, setCardSlideIn] = useState([false, false, false, false]);
  const [cardOffsets, setCardOffsets] = useState([0, 0, 0, 0]);
  const howItWorksSteps = [
    {
      number: 1,
      title: 'Receive your kit',
      desc: 'A discreet kit delivered to your door each month — with everything you need to check in with your vaginal health from home.',
      img: '/kit.png',
    },
    {
      number: 2,
      title: 'Test in Minutes',
      desc: 'Use a small sample of discharge to test for 6 key biomarkers linked to infection, inflammation, and imbalance.',
      img: '/step2.png',
    },
    {
      number: 3,
      title: 'Enter Your Results in the App',
      desc: 'Match your strip to the color guide and enter your results in the Santelle app. Get instant, clear personalized insights to understand what’s going on.',
      img: '/step3.png',
    },
    {
      number: 4,
      title: 'Track, Learn & Take Control',
      desc: 'See patterns, get monthly tips, and stay ahead of changes — whether you’re managing symptoms, pregnancy, or just staying in tune.',
      img: '/step4.png',
    },
    {
      number: 5,
      title: 'About the 6 Key Biomarkers',
      desc: '', // Will render custom content
      img: '/kit.png', // Placeholder, can be changed
    },
  ];

  // Add state to control biomarker card
  const [showBiomarkerCard, setShowBiomarkerCard] = useState(false);
  // Add state for biomarker card slide-out
  const [biomarkerSlideOut, setBiomarkerSlideOut] = useState(false);

  // Add state for cycling stats
  const [currentStatIdx, setCurrentStatIdx] = useState(0);
  const extraStats = [
    [
      '500 million women experience vaginal infections annually',
      '',
    ],
    [
      '84% of women are unaware that they have Bacterial Vaginosis',
      '',
    ],
    [
      '15% of untreated BV cases may lead to pelvic inflammatory disease.',
      '',
    ],
  ];
  const showArrows = animationComplete && (currentStatIdx > 0 || currentStatIdx < extraStats.length);

  // Typewriter effect state
  const [typedText, setTypedText] = useState('');
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (currentStatIdx === 0) return;
    setTypedText('');
    setTyping(true);
    const stat = extraStats[currentStatIdx-1][0];
    let i = 0;
    const interval = setInterval(() => {
      setTypedText(stat.slice(0, i + 1));
      i++;
      if (i === stat.length) {
        clearInterval(interval);
        setTyping(false);
      }
    }, 18);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStatIdx]);

  // Calculate card offsets after hydration to prevent hydration mismatch
  useEffect(() => {
    const newOffsets = cardOrder.map((_, stackIdx) => 
      (typeof window !== 'undefined' && window.innerWidth < 768) ? 0 : stackIdx * 24
    );
    setCardOffsets(newOffsets);
  }, [cardOrder]);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
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

  // Confetti effect function
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
      validateEmail(e.target.value);
    }
  };

  // Email validation functions
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
      const remainingTime = Math.ceil((rateLimit.cooldownEnd - now) / 1000);
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

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>, cardIndex: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePosition({ x, y });
    setHoveredCard(cardIndex);
  };

  const handleCardMouseLeave = () => {
    setHoveredCard(null);
  };

  // Function to focus the hero section's email input
  const focusHeroEmailInput = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      setShowEmailForm(true);
      const emailInput = document.getElementById('waitlist-email') as HTMLInputElement;
      if (emailInput) {
        emailInput.focus();
      }
    }, 600);
  };

  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [showScrollPercent, setShowScrollPercent] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 1);
      setHidden(false); // Never hide the navbar
      setShowScrollPercent(true);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => setShowScrollPercent(false), 1000);
    };
    window.addEventListener('scroll', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  // Update cooldown timer display
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

  // Section navigation with arrow keys
  const sectionOrder = ['hero', 'stats', 'kit', 'how-it-works', 'team', 'footer'];
  useEffect(() => {
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
          nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
        {/* Video background and overlay restored */}
        <div className="absolute inset-0 -z-10 flex items-center justify-center" style={{
          top: 0,
          bottom: 'env(safe-area-inset-bottom)',
          left: 'env(safe-area-inset-left)',
          right: 'env(safe-area-inset-right)'
        }}>
          <video
            src="/background.mov"
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{ 
              objectFit: 'cover', 
              objectPosition: 'center',
              width: '100vw',
              height: '100dvh'
            }}
          />
          <div className="absolute inset-0 bg-brand-blue/40 backdrop-blur-sm" />
        </div>
        {/* Desktop Hero Content */}
        <div className="hidden md:flex flex-col items-center justify-center w-full h-full absolute top-0 left-0 z-10">
          <div className="flex flex-col items-end w-[680px] max-w-full mx-auto" style={{ opacity: headerFadeOpacity, transition: 'opacity 0.3s ease-out' }}>
            <Image
              src="/logo-dark.svg"
              alt="Santelle Logo"
              width={1020}
              height={360}
              priority
            />
            <div className="mt-2 mb-2 text-black text-2xl md:text-4xl text-right w-full">To Her Health</div>
            </div>
            
          {/* Desktop Get Early Access Button */}
            {!showEmailForm && (
              <button
                className="bg-[#721422] text-white font-bold text-xl md:text-2xl px-8 py-4 md:px-12 md:py-6 rounded-full shadow-lg hover:bg-[#8a1a2a] transition-all duration-500 ease-in-out cursor-pointer get-access-pulse mt-5"
                style={{ opacity: Math.max(0, 1 - scrollProgress / 30) }}
                onClick={() => setShowEmailForm(true)}
              >
                Get Early Access
              </button>
            )}
            
          {/* Desktop Email Form */}
            {showEmailForm && (
              <form
                ref={emailFormRef}
                className="flex flex-col items-center w-full max-w-2xl mt-0 px-4 md:px-0 transition-all duration-500 ease-in-out"
                style={{ opacity: Math.max(0, 1 - scrollProgress / 30) }}
                onSubmit={handleFormSubmit}
              >
                <label htmlFor="waitlist-email" className="self-start mb-1 text-[#721422] font-medium text-base pl-2">Your email*</label>
                <div className="relative w-full">
                  <div className="get-access-pulse flex w-full">
                      <input
                      id="waitlist-email"
                      name="email"
                        type="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      placeholder="your@email.com"
                      className={`flex-1 px-4 py-3 md:px-8 md:py-5 rounded-l-full border ${
                        emailValidation.error ? 'border-red-500' : 
                        emailValidation.isValid ? 'border-green-500' : 
                        'border-[#ececec]'
                      } bg-white text-[#721422] text-base md:text-xl outline-none focus:ring-2 focus:ring-[#721422]/20 transition caret-[#ff4fa3]`}
                      required
                      disabled={isSubmitting}
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting || (!!formData.email && !emailValidation.isValid) || rateLimit.blocked}
                      className={`px-6 py-3 md:px-10 md:py-5 font-semibold rounded-r-full text-sm md:text-base border transition focus:outline-none focus:ring-2 focus:ring-[#721422]/30
                        ${isSubmitting ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                          : (!formData.email ? 'bg-[#721422] text-white border-[#721422]/40 hover:bg-[#8a1a2a] hover:text-white'
                            : (!emailValidation.isValid ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                              : 'bg-[#721422] text-white border-[#721422]/40 hover:bg-[#8a1a2a] hover:text-white'))}
                      `}
                      style={{ WebkitBackdropFilter: 'blur(12px)' }}
                    >
                      {isSubmitting ? 'Joining...' : rateLimit.blocked ? 'Rate limited' : 'Get early access'}
                    </button>
                  </div>
                  {/* Validation feedback - absolutely positioned */}
                  <div className="absolute top-full left-0 right-0 mt-2">
                    {emailValidation.isChecking && (
                      <div className="text-blue-600 text-sm text-center">Checking email domain...</div>
                    )}
                    {emailValidation.error && (
                      <div className="text-red-600 text-sm text-center">{emailValidation.error}</div>
                    )}
                    {emailValidation.isValid && !emailValidation.isChecking && (
                      <div className="text-green-600 text-sm text-center">✓ Valid email address</div>
                    )}
                    {/* Rate limiting feedback */}
                    {rateLimit.blocked && (
                      <div className="text-red-600 text-sm text-center">
                        Too many attempts. Please wait {Math.ceil((rateLimit.cooldownEnd - Date.now()) / 1000)} seconds before trying again.
                      </div>
                    )}
                    {/* Submit status */}
                    {submitStatus === 'success' && (
                      <div className="text-green-600 text-lg font-semibold text-center mt-2">
                    ✓ You&apos;ve been added to the waitlist!
                      </div>
                    )}
                    {submitStatus === 'error' && (
                      <div className="text-red-600 text-lg font-semibold text-center mt-2">
                        {rateLimit.blocked ? 'Too many submission attempts. Please wait before trying again.' : 'Something went wrong. Please try again.'}
                      </div>
                    )}
                  </div>
                </div>
              </form>
            )}
        </div>

        {/* Mobile Hero Content */}
        <div className="flex md:hidden flex-col items-start justify-center w-full h-full absolute top-0 left-0 z-10 px-6">
                      {/* Mobile "Discover Santelle" text and button - centered vertically */}
            <div className="flex flex-col items-start justify-center flex-1 w-full">
            <span 
              className="italic text-[#000000] text-3xl font-medium text-left leading-relaxed mb-6 chunko-bold"
              style={{ 
                opacity: Math.max(0, 1 - scrollProgress / 15),
                transform: `translateY(${Math.min(scrollProgress / 2, 20)}px)`,
                transition: 'opacity 0.3s ease-out, transform 0.3s ease-out'
              }}
            >
              Discover Santelle, your vaginal health companion
            </span>
            
                        {/* Mobile Get Early Access Button - just below the text */}
            {!showEmailForm && (
              <button
                className="bg-[#721422] text-white font-bold text-sm px-6 py-4 rounded-full shadow-lg hover:bg-[#8a1a2a] transition-all duration-300 ease-in-out cursor-pointer get-access-pulse touch-target"
                style={{ 
                  opacity: Math.max(0, 1 - scrollProgress / 15),
                  transform: `translateY(${Math.min(scrollProgress / 2, 20)}px)`,
                  transition: 'opacity 0.3s ease-out, transform 0.3s ease-out'
                }}
                onClick={() => setShowEmailForm(true)}
              >
                Get Early Access
              </button>
            )}
            
            {/* Mobile Email Form */}
            {showEmailForm && (
              <form
                ref={emailFormRef}
                className="w-full transition-all duration-500 ease-in-out"
                style={{ 
                  opacity: Math.max(0, 1 - scrollProgress / 15),
                  transform: `translateY(${Math.min(scrollProgress / 2, 20)}px)`,
                  transition: 'opacity 0.3s ease-out, transform 0.3s ease-out'
                }}
                onSubmit={handleFormSubmit}
              >
                
                <div className="relative w-full">
                  <input
                    id="waitlist-email-mobile"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    placeholder="your@email.com"
                    className={`w-full px-6 py-4 rounded-full border ${
                      emailValidation.error ? 'border-red-500' : 
                      emailValidation.isValid ? 'border-green-500' : 
                      'border-[#ececec]'
                    } bg-white text-[#721422] text-base outline-none focus:ring-2 focus:ring-[#721422]/20 transition caret-[#ff4fa3]`}
                    required
                    disabled={isSubmitting}
                  />
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
            )}
          </div>
        </div>
        {/* Hero section blur overlay */}
        <div
          className="absolute inset-0 z-40 pointer-events-none" 
                   style={{
            backdropFilter: `blur(${Math.min(scrollProgress / 20 * 8, 8)}px)`,
            WebkitBackdropFilter: `blur(${Math.min(scrollProgress / 20 * 8, 8)}px)`
          }}
            />
        {/* Desktop Bottom Section */}
        <div className="hidden md:flex absolute left-0 w-full flex-col items-center justify-center gap-4 z-20 bottom-0 md:bottom-20 lg:bottom-20" style={{ opacity: Math.max(0, 1 - scrollProgress / 30) }}>
          <span className="italic text-[#721422] text-xl md:text-3xl text-center">Discover Santelle, your vaginal health companion</span>
                <button
            className="mt-2 bg-white text-[#511828] font-bold text-lg md:text-xl px-8 py-3 rounded-full shadow-lg border-2 border-[#511828] focus:outline-none focus:ring-4 focus:ring-[#18321f]/40 transition-all duration-300 cursor-pointer hover:bg-[#511828] hover:text-white"
            type="button"
            onClick={() => {
              const el = document.getElementById('stats');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }}
          >
            Explore Santelle Now
                </button>
          <span className="flex justify-center mt-2">
              <span
              className="cursor-pointer hover:scale-110 transition-transform duration-200"
              onClick={() => {
                const el = document.getElementById('stats');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }}
            >
              <svg width="70" height="70" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
          <section id="stats" ref={statsRef} className="hidden md:flex w-screen min-h-screen flex-col justify-center items-center gap-2 p-0 m-0 -mt-8 md:-mt-26">
            <div className="px-4 md:px-8 py-8 md:py-12 w-full flex justify-center items-center">
              <div className="bg-white/30 backdrop-blur-lg rounded-3xl shadow-xl px-4 py-6 md:px-8 md:py-12 flex flex-col justify-center items-center text-center w-screen" style={{minHeight: '100vh', minWidth: '100vw', width: '100vw'}}>
                <div
                  className="block md:inline-flex md:flex-row items-center md:items-start text-4xl md:text-6xl font-bold mb-2 text-center md:text-left relative cursor-pointer"
                  onClick={() => {
                    if (!animationComplete) return;
                    setCurrentStatIdx(idx => (idx + 1) % (extraStats.length + 1));
                  }}
                >
                  {currentStatIdx === 0 ? (
                    <>
                      <span 
                        className={`transition-opacity duration-[1200ms] text-2xl md:text-5xl ${showStatsLine1 ? 'opacity-100' : 'opacity-0'} cursor-pointer hover:scale-105 transition-transform duration-200 select-none`} 
                        style={{color: '#721422'}}
                        onClick={() => {
                          setCurrentStatIdx(idx => (idx + 1) % (extraStats.length + 1));
                        }}
                        title="Click to see more stats"
                      >
                        Vaginal infections affect 3 in 4 women. 50% are recurrent.
                        <span className="inline-block ml-2 text-sm opacity-60">(click for more)</span>
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="opacity-100 text-2xl md:text-5xl" style={{color: '#721422', minHeight: 0}}>
                        {typedText}
                        <span className="inline-block w-2 animate-pulse align-baseline" style={{opacity: typing ? 1 : 0}}>|</span>
                      </span>
                      {extraStats[currentStatIdx-1][1] && (
                        <span className="opacity-100 md:ml-2 mt-2 md:mt-0" style={{color: '#ff4fa3', display: 'block'}}>{extraStats[currentStatIdx-1][1]}</span>
                      )}
                    </>
                  )}
              </div>
                <div className={`text-2xl md:text-3xl text-[#721422] mb-3 transition-opacity duration-[1200ms] ${showStatsLine2 ? 'opacity-100' : 'opacity-0'}`}>Left untreated, this can lead to <span className="text-[#721422] font-bold">infertility</span>, <span className="text-[#721422] font-bold">pregnancy complications</span>, and <span className="text-[#721422] font-bold">long-term discomfort</span>.</div>
                <div className={`text-3xl md:text-4xl font-bold text-[#FD9EAA] mt-10 transition-opacity duration-[1200ms] ${showStatsLine3 ? 'opacity-100' : 'opacity-0'}`}>It’s time to take charge of your vaginal health — with insights, not guesswork.</div>
              <button
                onClick={e => handleSmoothScroll(e, 'kit')}
                className="mx-auto mt-10 flex items-center justify-center bg-white text-[#000000] font-bold text-base md:text-xl px-8 py-4 rounded-full shadow-lg border-2 border-[#511828] focus:outline-none focus:ring-4 focus:ring-[#18321f]/40 transition-all duration-300 cursor-pointer hover:bg-[#511828] hover:text-white"
                aria-label="Scroll to kit section"
              >
                Discover how Santelle supports you
              </button>
              </div>
            </div>
          </section>
        {/* Desktop Kit Image Section */}
          <section id="kit" className="hidden md:flex w-full min-h-screen h-screen items-center justify-center mb-20 md:mb-20">
            <div className="bg-white/30 backdrop-blur-lg rounded-3xl shadow-xl p-0 md:p-0 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-12 w-screen" style={{minHeight: '100vh', minWidth: '100vw', width: '100vw'}}>
          <div className="md:w-1/2 flex justify-center md:justify-end items-center p-0 py-2 md:py-0">
            <Image
              src="/kit.png"
              alt="Santelle Kit"
              width={600}
              height={600}
              className="w-full max-w-[28.8rem] md:w-[900px] md:max-w-[54rem] h-auto object-contain drop-shadow-lg"
              priority
            />
          </div>
          <div className="md:w-1/2 flex flex-col items-center md:items-start justify-center">
                <h2 className="font-bold text-5xl md:text-7xl md:text-7xl text-[#721422] mb-0 text-left">
                  <span className="chunko-bold">Meet Santelle</span><br className="hidden md:block" />
                  <span className="block md:inline font-normal text-2xl md:text-2xl md:text-5xl mt-0">Your Vaginal Health Companion</span>
                </h2>
            <p className="text-xl md:text-4xl text-[#721422] mb-2 text-center md:text-left">Easy, discreet, and empowering.</p>
                <p className="text-base md:text-2xl text-[#721422] text-center md:text-left mb-4 ">
               The Santelle Starter Kit is more than a test.<br/>
               It’s your monthly vaginal wellness ritual.<br/>
               Our at-home kit gives you lab-quality insights.<br/>
               No clinic visit, no waiting rooms, no shame.
            </p>
                <p className="text-base md:text-2xl text-[#721422] text-center md:text-left mb-6 ">
              With Santelle, you take quiet control of your intimate health, proactively.
            </p>
                <ul className="list-disc pl-6 text-[#721422] mb-6 space-y-2 text-left text-sm md:text-lg ">
              <li>Instant results from home</li>
              <li>Multi-biomarker analysis, not just pH</li>
              <li>Connected app for tracking & personalized insights</li>
            </ul>
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto justify-center md:justify-start">
              <a
                href="#how-it-works"
                className="how-it-works-btn inline-block bg-white text-[#511828] font-bold text-2xl px-12 py-2 md:py-5 rounded-full shadow-lg border-2 border-[#511828] focus:outline-none focus:ring-4 focus:ring-[#18321f]/40 transition-all duration-300 cursor-pointer w-full max-w-xs mx-auto md:mx-0 md:w-auto text-center hover:bg-[#511828] hover:text-white"
                onClick={e => handleSmoothScroll(e, 'how-it-works')}
              >
                How It Works
              </a>
              <button
                className="bg-[#721422] text-white font-bold text-2xl px-12 py-2 md:py-5 rounded-full hover:bg-[#8a1a2a] hover:text-white transition cursor-pointer get-access-pulse w-full max-w-xs mx-auto md:mx-0 md:w-auto"
                onClick={focusHeroEmailInput}
                type="button"
              >
                Get Early Access
              </button>
            </div>
              </div>
          </div>
        </section>

        {/* Desktop Product Intro Section */}
          <section id="how-it-works" className="hidden md:flex w-full py-20 mt-0 flex-col items-center gap-12 min-h-screen" style={{minWidth: '100vw', width: '100vw'}}>
            <h2 className="hidden md:block font-bold text-5xl md:text-7xl md:text-8xl text-[#721422] mb-0 md:mb-10 text-center">
              <span className="chunko-bold">How It Works</span>
            </h2>
            <div ref={howItWorksCardsRef} className="hidden md:block w-full max-w-7xl mx-auto space-y-8">
               {howItWorksSteps.slice(0, 4).map((step, stepIdx) => {
                 const isBiomarkerCard = showBiomarkerCard && stepIdx === 1;
                 const isStep2Replaced = showBiomarkerCard && stepIdx === 1;
                 return (
                   <div
                     key={isBiomarkerCard ? 'biomarker' : step.number}
                     className={`w-full flex flex-col md:flex-row items-center justify-between bg-white/30 backdrop-blur-lg rounded-3xl shadow-xl px-4 py-8 md:px-8 md:py-16 ${isBiomarkerCard ? 'gap-0 md:gap-0' : 'gap-4 md:gap-8'} transition-all duration-500`}
                   >
                    {/* Top: Step number and heading */}
                    {!isBiomarkerCard && (
                      <div className="flex flex-row items-center gap-4 md:gap-8 w-full md:w-auto mb-2 md:mb-0">
                        <span className="text-4xl md:text-7xl font-bold text-white bg-[#721422] rounded-full w-12 h-12 md:w-20 md:h-20 aspect-square flex items-center justify-center">
                          {step.number}
                        </span>
                        <div className="text-2xl md:text-4xl font-bold">
                          {step.title}
                        </div>
                      </div>
                    )}
                    {/* Middle: Image */}
                    <div className={`flex-shrink-0 flex-grow-0 flex items-center justify-center w-full md:w-auto h-48 md:h-56 ${isBiomarkerCard ? 'my-1 md:my-0' : 'my-2 md:my-0'}`}>
                      <img src={isBiomarkerCard ? '/step2.png' : step.img} alt={isBiomarkerCard ? 'Biomarkers' : step.title} className="h-48 md:h-56 w-auto object-contain mx-auto" />
                    </div>
                    {/* Bottom: Description */}
                    <div className={`text-xl md:text-3xl w-full ${isBiomarkerCard ? 'text-center' : 'text-center md:text-left'}`}>
                      {stepIdx === 0 && (
                        <>
                          A discreet kit delivered to your door each month — with everything you need to check in with your <span className="font-bold">vaginal health</span> from home.
                        </>
                      )}
                      {stepIdx === 1 && !isBiomarkerCard && (
                        <>
                          Use a small sample of discharge to test for <span className="biomarker-highlight" onClick={e => { e.stopPropagation(); setShowBiomarkerCard(true); }}>6 key biomarkers</span> linked to <span className="font-bold">infection</span>, <span className="font-bold">inflammation</span>, and <span className="font-bold">imbalance</span>.
                        </>
                      )}
                      {stepIdx === 1 && isBiomarkerCard && (
                        <>
                          <div className="text-left max-w-4xl mx-auto">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <ul className="list-disc pl-6 space-y-3 text-lg">
                                <li><span className="font-bold">pH:</span> A higher-than-normal vaginal pH (&gt;4.5) may indicate bacterial vaginosis or other infections due to disrupted microbial balance.</li>
                                <li><span className="font-bold">H₂O₂ (Hydrogen Peroxide):</span> Hydrogen peroxide is produced by healthy Lactobacillus species and helps maintain vaginal acidity and protect against infections.</li>
                                <li><span className="font-bold">LE (Leukocyte Esterase):</span> The presence of leukocyte esterase signals inflammation or infection, often due to an immune response.</li>
                              </ul>
                              <ul className="list-disc pl-6 space-y-3 text-lg">
                                <li><span className="font-bold">SNA (Sialidase Activity):</span> Elevated sialidase activity is a biomarker for bacterial vaginosis, produced by anaerobic bacteria like Gardnerella vaginalis.</li>
                                <li><span className="font-bold">β-G (Beta-Glucuronidase):</span> This enzyme, when elevated, suggests bacterial overgrowth or imbalance in the vaginal microbiome.</li>
                                <li><span className="font-bold">B-G (Beta-Glucosidase):</span> Increased beta-glucosidase activity can be a sign of microbial dysbiosis and is linked to conditions like bacterial vaginosis.</li>
                              </ul>
                            </div>
                            <div className="text-center mt-8">
                              <button className="px-8 py-3 bg-[#721422] text-white rounded-full font-bold text-xl hover:bg-[#8a1a2a] transition" onClick={e => { e.stopPropagation(); setShowBiomarkerCard(false); }}>Back</button>
                            </div>
                          </div>
                        </>
                      )}
                      {stepIdx === 2 && (
                        <>
                          Match your strip to the color guide and enter your results in the <span className="biomarker-highlight">Santelle app</span>. Get <span className="font-bold">instant, clear personalized insights</span> to understand what’s going on.
                        </>
                      )}
                      {stepIdx === 3 && (
                        <>
                          See <span className="font-bold">patterns</span>, get <span className="font-bold">monthly tips</span>, and stay ahead of changes — whether you’re managing <span className="font-bold">symptoms</span>, <span className="font-bold">pregnancy</span>, or just staying in tune.
                        </>
                      )}

                    </div>
                  </div>
                );
              })}

            </div>

            {/* Mobile: Single card with dividers */}
            <div className="block md:hidden w-full max-w-7xl mx-auto">
              <div className="bg-white/30 backdrop-blur-lg rounded-3xl shadow-xl p-6">
                {howItWorksSteps.slice(0, 4).map((step, stepIdx) => {
                  const isBiomarkerCard = showBiomarkerCard && stepIdx === 1;
                  return (
                    <div key={isBiomarkerCard ? 'biomarker' : step.number}>
                      {/* Step content */}
                      <div className="flex flex-col items-center text-center py-6">
                        {/* Step number and title */}
                        {!isBiomarkerCard && (
                          <div className="flex flex-col items-center gap-4 mb-4">
                            <span className="text-3xl font-bold text-white bg-[#721422] rounded-full w-16 h-16 aspect-square flex items-center justify-center">
                              {step.number}
                            </span>
                            <div className="text-xl font-bold text-[#721422]">
                              {step.title}
                            </div>
                          </div>
                        )}
                        
                        {/* Image */}
                        <div className="flex items-center justify-center w-full h-32 mb-4">
                          <img src={isBiomarkerCard ? '/step2.png' : step.img} alt={isBiomarkerCard ? 'Biomarkers' : step.title} className="h-32 w-auto object-contain" />
                        </div>
                        
                        {/* Description */}
                        <div className="text-base text-[#721422] leading-relaxed">
                          {stepIdx === 0 && (
                            <>
                              A discreet kit delivered to your door each month — with everything you need to check in with your <span className="font-bold">vaginal health</span> from home.
                            </>
                          )}
                          {stepIdx === 1 && !isBiomarkerCard && (
                            <>
                              Use a small sample of discharge to test for <span className="biomarker-highlight" onClick={e => { e.stopPropagation(); setShowBiomarkerCard(true); }}>6 key biomarkers</span> linked to <span className="font-bold">infection</span>, <span className="font-bold">inflammation</span>, and <span className="font-bold">imbalance</span>.
                            </>
                          )}
                          {stepIdx === 1 && isBiomarkerCard && (
                            <>
                              <div className="text-left">
                                <div className="space-y-3 text-sm">
                                  <div><span className="font-bold">pH:</span> A higher-than-normal vaginal pH (&gt;4.5) may indicate bacterial vaginosis or other infections due to disrupted microbial balance.</div>
                                  <div><span className="font-bold">H₂O₂ (Hydrogen Peroxide):</span> Hydrogen peroxide is produced by healthy Lactobacillus species and helps maintain vaginal acidity and protect against infections.</div>
                                  <div><span className="font-bold">LE (Leukocyte Esterase):</span> The presence of leukocyte esterase signals inflammation or infection, often due to an immune response.</div>
                                  <div><span className="font-bold">SNA (Sialidase Activity):</span> Elevated sialidase activity is a biomarker for bacterial vaginosis, produced by anaerobic bacteria like Gardnerella vaginalis.</div>
                                  <div><span className="font-bold">β-G (Beta-Glucuronidase):</span> This enzyme, when elevated, suggests bacterial overgrowth or imbalance in the vaginal microbiome.</div>
                                  <div><span className="font-bold">B-G (Beta-Glucosidase):</span> Increased beta-glucosidase activity can be a sign of microbial dysbiosis and is linked to conditions like bacterial vaginosis.</div>
                                </div>
                                <div className="text-center mt-6">
                                  <button className="px-6 py-2 bg-[#721422] text-white rounded-full font-bold text-sm hover:bg-[#8a1a2a] transition" onClick={e => { e.stopPropagation(); setShowBiomarkerCard(false); }}>Back</button>
                                </div>
                              </div>
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
                          <div className="w-16 h-0.5 bg-[#721422]/30 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  );
                })}
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

        {/* Desktop Team/Leadership Section */}
        <section id="team" className="hidden md:flex w-full py-5 px-8 lg:px-32 flex-col items-center gap-12 min-h-screen" style={{minWidth: '100vw', width: '100vw'}}>
          <h2 className="font-bold text-5xl md:text-7xl text-[#721422] mb-10 text-center">
            <span className="chunko-bold">Our Team</span>
          </h2>
          {/* Logos Row */}
          <div className="flex flex-row justify-center items-center gap-8 md:gap-12 mb-8 w-full">
            <Image src="/ICL.png" alt="Imperial College London" width={240} height={90} style={{width: 240, height: 'auto', objectFit: 'contain'}} />
            <Image src="/INSEAD.png" alt="INSEAD" width={240} height={90} style={{width: 240, height: 'auto', objectFit: 'contain'}} />
            <Image src="/McK.png" alt="McKinsey & Co." width={240} height={90} style={{width: 240, height: 'auto', objectFit: 'contain'}} />
            <Image src="/Nabta.png" alt="Nabta" width={240} height={90} style={{width: 240, height: 'auto', objectFit: 'contain'}} />
            <Image src="/P&G.png" alt="P&G" width={240} height={90} style={{width: 240, height: 'auto', objectFit: 'contain'}} />
          </div>
                      <div className="w-full px-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 justify-items-center">
                {/* Left: Leonor Landeau */}
                <div 
                  className="bg-white/30 backdrop-blur-lg rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl hover:bg-white/40 cursor-pointer relative"
                  onMouseMove={(e) => handleCardMouseMove(e, 0)}
                  onMouseLeave={handleCardMouseLeave}
                  style={{
                    background: hoveredCard === 0 ?
                      `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.13) 28%, rgba(255,255,255,0.06) 60%, rgba(255,255,255,0.01) 100%),
     radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.0) 60%),
     rgba(255,255,255,0.3)` :
    'rgba(255,255,255,0.3)',
  transform: hoveredCard === 0 ?
    `perspective(900px) rotateX(${-(mousePosition.y - 192) * 0.02}deg) rotateY(${(mousePosition.x - 160) * 0.02}deg)` :
    'none',
}}
                >
                  <div className="w-full h-96 bg-gradient-to-br from-[#FBD5DB] to-[#F48CA3] flex items-center justify-center overflow-hidden">
                    <Image
                      src="/LL.png"
                      alt="Leonor Landeau"
                      width={320}
                      height={320}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-[#721422] mb-2">Leonor Landeau</h3>
                    <p className="text-lg font-semibold text-[#ff4fa3] mb-3">Collaborator & Advisor</p>
                    <p className="text-sm text-[#721422]/80 leading-relaxed">
                      Product Manager<br/>
                      Health tech<br/>
                      Expertise in startups, scale-ups, wearables<br/>
                      Marketing Data Science
                    </p>
                  </div>
                </div>

                {/* Center: Roxanne Sabbag */}
                <div 
                  className="bg-white/30 backdrop-blur-lg rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl hover:bg-white/40 cursor-pointer relative"
                  onMouseMove={(e) => handleCardMouseMove(e, 1)}
                  onMouseLeave={handleCardMouseLeave}
                  style={{
                    background: hoveredCard === 1 ?
                      `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.13) 28%, rgba(255,255,255,0.06) 60%, rgba(255,255,255,0.01) 100%),
     radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.0) 60%),
     rgba(255,255,255,0.3)` :
    'rgba(255,255,255,0.3)',
  transform: hoveredCard === 1 ?
    `perspective(900px) rotateX(${-(mousePosition.y - 192) * 0.02}deg) rotateY(${(mousePosition.x - 160) * 0.02}deg)` :
    'none',
}}
                >
                  <div className="w-full h-96 bg-gradient-to-br from-[#FBD5DB] to-[#F48CA3] flex items-center justify-center overflow-hidden">
                    <Image
                      src="/RS.png"
                      alt="Roxanne Sabbag"
                      width={320}
                      height={320}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-[#721422] mb-2">Roxanne Sabbag</h3>
                    <p className="text-lg font-semibold text-[#ff4fa3] mb-3">Founder & CEO</p>
                    <p className="text-sm text-[#721422]/80 leading-relaxed">
                      Biomedical Engineer, Imperial College London<br/>
                      Life Sciences Strategy Consultant, McKinsey & Co.<br/>
                      Contributor to McKinsey Women&apos;s Health Initiative<br/>
                      Experienced in Equity Storytelling & Fundraising
                    </p>
                  </div>
                </div>

                {/* Right: Tomasso Busolo */}
                <div 
                  className="bg-white/30 backdrop-blur-lg rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl hover:bg-white/40 cursor-pointer relative"
                  onMouseMove={(e) => handleCardMouseMove(e, 2)}
                  onMouseLeave={handleCardMouseLeave}
                  style={{
                    background: hoveredCard === 2 ?
                      `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.13) 28%, rgba(255,255,255,0.06) 60%, rgba(255,255,255,0.01) 100%),
     radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.0) 60%),
     rgba(255,255,255,0.3)` :
    'rgba(255,255,255,0.3)',
  transform: hoveredCard === 2 ?
    `perspective(900px) rotateX(${-(mousePosition.y - 192) * 0.02}deg) rotateY(${(mousePosition.x - 160) * 0.02}deg)` :
    'none',
}}
                >
                  <div className="w-full h-96 bg-gradient-to-br from-[#FBD5DB] to-[#F48CA3] flex items-center justify-center overflow-hidden">
                    <Image
                      src="/TB.png"
                      alt="Tomasso Busolo"
                      width={320}
                      height={320}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-[#721422] mb-2">Tomasso Busolo</h3>
                    <p className="text-lg font-semibold text-[#ff4fa3] mb-3">Collaborator & Advisor</p>
                    <p className="text-sm text-[#721422]/80 leading-relaxed">
                      PhD in Materials Science<br/>
                      Founder of Smart Underwear start-up ALMA<br/>
                      Product Innovation
                    </p>
                  </div>
                </div>
              </div>
          </div>
        </section>

        {/* Mobile Unified Card - All Sections */}
        <section className="block md:hidden w-full py-8">
          <div className="bg-white/30 backdrop-blur-lg rounded-3xl shadow-xl p-6">
            
            {/* Stats Section */}
            <div className="py-6">
              <div className="text-left">
                <div className="text-2xl font-bold text-[#721422] mb-4">
                  Vaginal infections affect 3 in 4 women. 50% are recurrent.
                </div>
                <div className="text-lg text-[#721422] mb-4">
                  Left untreated, this can lead to <span className="font-bold">infertility</span>, <span className="font-bold">pregnancy complications</span>, and <span className="font-bold">long-term discomfort</span>.
                </div>
                <div className="text-xl font-bold text-[#FD9EAA] mb-6">
                  It&apos;s time to take charge of your vaginal health — with insights, not guesswork.
                </div>
              </div>
            </div>

            {/* Kit Section */}
            <div className="py-6">
              <div className="flex flex-col items-start text-left">
                <div className="flex items-center gap-4 mb-4">
                  <h2 className="font-bold text-3xl text-[#721422]">
                    <span className="chunko-bold">Meet Santelle</span>
                  </h2>
                  <div className="flex-1 h-2 bg-[#721422] rounded-full" style={{backgroundColor: '#721422'}}></div>
                </div>
                <div className="mb-4 self-center">
                  <Image
                    src="/kit.png"
                    alt="Santelle Kit"
                    width={300}
                    height={300}
                    className="w-full max-w-[200px] h-auto object-contain drop-shadow-lg"
                    priority
                  />
                </div>
                <div className="text-xl text-[#721422] text-center mb-4">
                  Your Vaginal Health Companion
                </div>
                <p className="text-base text-[#721422] mb-4">Easy, discreet, and empowering.</p>
                <p className="text-sm text-[#721422] mb-4 leading-relaxed">
                  The Santelle Starter Kit is more than a test<br/>
                  It&apos;s your monthly vaginal wellness ritual<br/>
                  Our at-home kit gives you lab-quality insights<br/>
                  No clinic visit, no waiting rooms, no shame
                </p>
                <p className="text-sm text-[#721422] mb-4 leading-relaxed">
                  With Santelle, you take quiet control of your intimate health, proactively.
                </p>
                <ul className="list-disc pl-6 text-[#721422] mb-6 space-y-1 text-sm text-left">
                  <li>Instant results from home</li>
                  <li>Multi-biomarker analysis, not just pH</li>
                  <li>Connected app for tracking & personalized insights</li>
                </ul>
                <div className="flex flex-col gap-3 w-full">
                <button
                    className="bg-[#721422] text-white font-bold text-base px-6 py-3 rounded-full hover:bg-[#8a1a2a] hover:text-white transition cursor-pointer get-access-pulse"
                    onClick={focusHeroEmailInput}
                    type="button"
                  >
                    Get Early Access
                </button>
              </div>
              </div>
            </div>

            {/* How It Works Section */}
            <div className="py-6">
              <div className="flex items-center gap-4 mb-6">
                <h2 className="font-bold text-3xl text-[#721422] text-left">
                  <span className="chunko-bold">How It Works</span>
                </h2>
                <div className="flex-1 h-1 bg-[#721422]/50 rounded-full"></div>
              </div>
              {howItWorksSteps.slice(0, 4).map((step, stepIdx) => {
                const isBiomarkerCard = showBiomarkerCard && stepIdx === 1;
                return (
                  <div key={isBiomarkerCard ? 'biomarker' : step.number} className="mb-6">
                    {/* Step content */}
                    <div className="flex flex-col items-start text-left">
                      {/* Step number and title */}
                      {!isBiomarkerCard && (
                        <div className="flex flex-col items-center gap-3 mb-3 w-full">
                          <span className="text-2xl font-bold text-white bg-[#721422] rounded-full w-12 h-12 aspect-square flex items-center justify-center">
                            {step.number}
                          </span>
                          <div className="text-lg font-bold text-[#721422] text-center">
                            {step.title}
                          </div>
                        </div>
                      )}
                      
                      {/* Image */}
                      <div className="flex items-center justify-center w-full mb-3">
                        <img 
                          src={isBiomarkerCard ? '/step2.png' : step.img} 
                          alt={isBiomarkerCard ? 'Biomarkers' : step.title} 
                          className={`${stepIdx === 2 ? 'w-4/5 h-auto' : 'h-60 w-auto'} object-contain`} 
                        />
                      </div>
                      
                      {/* Description */}
                      <div className="text-sm text-[#721422] leading-relaxed">
                        {stepIdx === 0 && (
                          <>
                            A discreet kit delivered to your door each month — with everything you need to check in with your <span className="font-bold">vaginal health</span> from home.
                          </>
                        )}
                        {stepIdx === 1 && !isBiomarkerCard && (
                          <>
                            Use a small sample of discharge to test for <span className="biomarker-highlight" onClick={e => { e.stopPropagation(); setShowBiomarkerCard(true); }}>6 key biomarkers</span> linked to <span className="font-bold">infection</span>, <span className="font-bold">inflammation</span>, and <span className="font-bold">imbalance</span>.
                          </>
                        )}
                        {stepIdx === 1 && isBiomarkerCard && (
                          <>
                            <div className="text-left">
                              <div className="space-y-2 text-xs">
                                <div><span className="font-bold">pH:</span> A higher-than-normal vaginal pH (&gt;4.5) may indicate bacterial vaginosis or other infections due to disrupted microbial balance.</div>
                                <div><span className="font-bold">H₂O₂ (Hydrogen Peroxide):</span> Hydrogen peroxide is produced by healthy Lactobacillus species and helps maintain vaginal acidity and protect against infections.</div>
                                <div><span className="font-bold">LE (Leukocyte Esterase):</span> The presence of leukocyte esterase signals inflammation or infection, often due to an immune response.</div>
                                <div><span className="font-bold">SNA (Sialidase Activity):</span> Elevated sialidase activity is a biomarker for bacterial vaginosis, produced by anaerobic bacteria like Gardnerella vaginalis.</div>
                                <div><span className="font-bold">β-G (Beta-Glucuronidase):</span> This enzyme, when elevated, suggests bacterial overgrowth or imbalance in the vaginal microbiome.</div>
                                <div><span className="font-bold">B-G (Beta-Glucosidase):</span> Increased beta-glucosidase activity can be a sign of microbial dysbiosis and is linked to conditions like bacterial vaginosis.</div>
              </div>
                              <div className="text-center mt-4">
                                <button className="px-4 py-2 bg-[#721422] text-white rounded-full font-bold text-xs hover:bg-[#8a1a2a] transition" onClick={e => { e.stopPropagation(); setShowBiomarkerCard(false); }}>Back</button>
                    </div>
                            </div>
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
                );
              })}
            </div>

            {/* Team Section */}
            <div className="py-6">
              <div className="flex items-center gap-4 mb-6">
                <h2 className="font-bold text-3xl text-[#721422] text-left">
                  <span className="chunko-bold">Our Team</span>
                </h2>
                <div className="flex-1 h-1 bg-[#721422]/50 rounded-full"></div>
              </div>
              
              {/* Logos Carousel */}
              <div className="relative overflow-hidden mb-6">
                <div className="flex animate-scroll-left">
                  {/* First set of logos */}
                  <div className="flex items-center gap-6 flex-shrink-0 px-4">
                    <Image src="/ICL.png" alt="Imperial College London" width={100} height={38} style={{width: 100, height: 'auto', objectFit: 'contain'}} />
                    <Image src="/INSEAD.png" alt="INSEAD" width={100} height={38} style={{width: 100, height: 'auto', objectFit: 'contain'}} />
                    <Image src="/McK.png" alt="McKinsey & Co." width={100} height={38} style={{width: 100, height: 'auto', objectFit: 'contain'}} />
                    <Image src="/Nabta.png" alt="Nabta" width={100} height={38} style={{width: 100, height: 'auto', objectFit: 'contain'}} />
                    <Image src="/P&G.png" alt="P&G" width={100} height={38} style={{width: 100, height: 'auto', objectFit: 'contain'}} />
                  </div>
                  {/* Duplicate set for seamless loop */}
                  <div className="flex items-center gap-6 flex-shrink-0 px-4">
                    <Image src="/ICL.png" alt="Imperial College London" width={100} height={38} style={{width: 100, height: 'auto', objectFit: 'contain'}} />
                    <Image src="/INSEAD.png" alt="INSEAD" width={100} height={38} style={{width: 100, height: 'auto', objectFit: 'contain'}} />
                    <Image src="/McK.png" alt="McKinsey & Co." width={100} height={38} style={{width: 100, height: 'auto', objectFit: 'contain'}} />
                    <Image src="/Nabta.png" alt="Nabta" width={100} height={38} style={{width: 100, height: 'auto', objectFit: 'contain'}} />
                    <Image src="/P&G.png" alt="P&G" width={100} height={38} style={{width: 100, height: 'auto', objectFit: 'contain'}} />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Team Member Cards */}
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#FBD5DB] to-[#F48CA3] rounded-full flex items-center justify-center overflow-hidden">
                      <Image src="/RS.png" alt="Roxanne Sabbag" width={48} height={48} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#721422]">Roxanne Sabbag</h3>
                      <p className="text-sm font-semibold text-[#ff4fa3]">Founder & CEO</p>
                    </div>
                  </div>
                  <p className="text-xs text-[#721422]/80 leading-relaxed">
                    Biomedical Engineer, Imperial College London, Life Sciences Strategy Consultant, McKinsey & Co., Contributor to McKinsey Women&apos;s Health Initiative, Experienced in Equity Storytelling & Fundraising
                  </p>
                </div>

                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#FBD5DB] to-[#F48CA3] rounded-full flex items-center justify-center overflow-hidden">
                      <Image src="/LL.png" alt="Leonor Landeau" width={48} height={48} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#721422]">Leonor Landeau</h3>
                      <p className="text-sm font-semibold text-[#ff4fa3]">Collaborator & Advisor</p>
                    </div>
                  </div>
                  <p className="text-xs text-[#721422]/80 leading-relaxed">
                    Product Manager, Health tech, Expertise in startups, scale-ups, wearables, Marketing Data Science
                  </p>
                </div>

                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#FBD5DB] to-[#F48CA3] rounded-full flex items-center justify-center overflow-hidden">
                      <Image src="/TB.png" alt="Tomasso Busolo" width={48} height={48} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#721422]">Tomasso Busolo</h3>
                      <p className="text-sm font-semibold text-[#ff4fa3]">Collaborator & Advisor</p>
                    </div>
                  </div>
                  <p className="text-xs text-[#721422]/80 leading-relaxed">
                    PhD in Materials Science, Founder of Smart Underwear start-up ALMA, Product Innovation
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Bottom Glassmorphic Card */}
        <section className="w-full pt-4 pb-8 px-4 md:px-8 relative z-20" style={{minWidth: '100vw', width: '100vw'}}>
          <div className="bg-white/30 backdrop-blur-lg rounded-3xl shadow-xl border border-white/30 w-full">
            <div className="p-4 md:p-8 flex flex-col items-center gap-6 text-center">
              {/* Logo */}
              <div className="w-full flex justify-center mb-2">
                <Image src="/logo-dark.svg" alt="Santelle Logo" width={180} height={60} style={{objectFit: 'contain', height: 60}} />
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
