'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import confetti from 'canvas-confetti';
import { analytics } from '@/lib/analytics';

function WaitlistContent() {
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan');
  
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [emailValidation, setEmailValidation] = useState<{ isValid: boolean; message: string }>({ 
    isValid: true, 
    message: '' 
  });
  const [rateLimit, setRateLimit] = useState<{ blocked: boolean; remainingTime: number }>({ 
    blocked: false, 
    remainingTime: 0 
  });
  const [validationTimeout, setValidationTimeout] = useState<NodeJS.Timeout | null>(null);

  // Rate limit countdown
  useEffect(() => {
    if (rateLimit.blocked && rateLimit.remainingTime > 0) {
      const timer = setTimeout(() => {
        setRateLimit(prev => ({
          ...prev,
          remainingTime: prev.remainingTime - 1
        }));
      }, 1000);
      return () => clearTimeout(timer);
    } else if (rateLimit.remainingTime === 0) {
      setRateLimit({ blocked: false, remainingTime: 0 });
    }
  }, [rateLimit]);

  const validateEmail = useCallback(async (emailToValidate: string) => {
    // Basic format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailToValidate)) {
      setEmailValidation({ isValid: false, message: 'Please enter a valid email address' });
      return;
    }

    try {
      // Domain validation via Google DNS
      const domain = emailToValidate.split('@')[1];
      const dnsResponse = await fetch(`https://dns.google/resolve?name=${domain}&type=MX`);
      const dnsData = await dnsResponse.json();
      
      if (dnsData.Status !== 0 || !dnsData.Answer) {
        setEmailValidation({ isValid: false, message: 'This email domain does not exist' });
        return;
      }
      
      setEmailValidation({ isValid: true, message: '' });
    } catch (error) {
      console.error('Email validation error:', error);
      setEmailValidation({ isValid: true, message: '' });
    }
  }, []);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    
    if (validationTimeout) {
      clearTimeout(validationTimeout);
    }
    
    if (newEmail) {
      const timeout = setTimeout(() => {
        validateEmail(newEmail);
      }, 500);
      setValidationTimeout(timeout);
    } else {
      setEmailValidation({ isValid: true, message: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rateLimit.blocked) {
      return;
    }

    if (!emailValidation.isValid) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Save to quiz table with the plan
      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          signup: true,
          answers: {
            q1: null,
            q2: null,
            q3: null,
            q4: null
          },
          plan
        })
      });

      if (!response.ok) {
        throw new Error('Failed to join waitlist');
      }

      // Track analytics
      analytics.trackWaitlistSignup(email, {
        device: { type: 'desktop' },
        browser: { name: navigator.userAgent },
        source: 'waitlist_page'
      });

      // Show success
      setSubmitStatus('success');
      setEmail('');
      
      // Confetti animation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Set rate limit
      setRateLimit({ blocked: true, remainingTime: 60 });
      
    } catch (error) {
      console.error('Waitlist submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

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
      <div className="relative z-10 w-[95%] max-w-7xl mx-auto px-4 py-16">
        <div className="bg-white/40 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/50 max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-[#721422] mb-4 text-center">
            Join the waitlist
          </h1>
          <p className="text-lg text-[#721422]/80 mb-4 text-center">
            Enter your email to get early access and exclusive updates.
          </p>
          {plan && (
            <div className="text-center mb-8">
              <span className="inline-block bg-[#721422] text-white px-6 py-2 rounded-full font-semibold">
                Selected: {plan}
              </span>
            </div>
          )}
          
          {submitStatus === 'success' ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-[#721422] mb-2">
                You&apos;re on the waitlist!
              </h2>
              <p className="text-[#721422]/80">
                We&apos;ll be in touch soon with your early access.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="Enter your email"
                  required
                  disabled={rateLimit.blocked}
                  className={`w-full px-6 py-4 rounded-full border-2 focus:outline-none focus:ring-2 focus:ring-[#721422] transition-all ${
                    !emailValidation.isValid && email
                      ? 'border-red-500 bg-red-50'
                      : 'border-[#721422]/30 bg-white/50'
                  } ${rateLimit.blocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
                {!emailValidation.isValid && email && (
                  <p className="text-red-600 text-sm mt-2 ml-4">{emailValidation.message}</p>
                )}
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting || rateLimit.blocked || !emailValidation.isValid}
                className="w-full bg-[#721422] text-white font-bold px-8 py-4 rounded-full hover:bg-[#8a1a2a] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Joining...' : rateLimit.blocked ? `Wait ${rateLimit.remainingTime}s` : 'Join Waitlist'}
              </button>
              
              {submitStatus === 'error' && (
                <p className="text-red-600 text-center">
                  Something went wrong. Please try again.
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

export default function WaitlistPage() {
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
      <WaitlistContent />
    </Suspense>
  );
}

