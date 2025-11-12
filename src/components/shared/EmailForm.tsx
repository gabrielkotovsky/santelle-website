'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import { analytics } from '@/lib/analytics';

interface EmailFormProps {
  variant?: 'hero' | 'mobile' | 'footer';
  onSubmitSuccess?: () => void;
}

export default function EmailForm({ variant = 'hero', onSubmitSuccess }: EmailFormProps) {
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

  const emailFormRef = useRef<HTMLFormElement>(null);

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
          email: formData.email,
          screenData: {
            width: window.screen.width,
            height: window.screen.height
          }
        })
      });

      if (!subscribeResponse.ok) {
        const errorData = await subscribeResponse.json();
        throw new Error(errorData.error || 'Failed to subscribe to waitlist');
      }

      // Track waitlist signup with Google Analytics
      analytics.trackWaitlistSignup(formData.email, {
        device: { type: 'desktop' },
        browser: { name: navigator.userAgent },
        timestamp: new Date().toISOString()
      });
      
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
        
        // Call success callback if provided
        if (onSubmitSuccess) {
          onSubmitSuccess();
        }
      }, 3000);
    } catch (error) {
      console.error('Submission error:', error);
      setIsSubmitting(false);
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 3000);
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

  // Desktop Hero Email Form
  if (variant === 'hero') {
    return (
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
                  priority
                />
              )}
            </button>
          </div>
          
          {/* Validation feedback */}
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
    );
  }

  // Mobile Email Form
  if (variant === 'mobile') {
    return (
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
                  priority
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
    );
  }

  // Footer Email Form (simplified)
  return (
    <form
      ref={emailFormRef}
      className="flex flex-col items-center gap-4"
      onSubmit={handleFormSubmit}
    >
      <div className="flex w-full max-w-md">
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleFormChange}
          placeholder="your@email.com"
          className="flex-1 px-4 py-3 rounded-l-full border border-[#721422] focus:outline-none focus:ring-2 focus:ring-[#721422]/20"
          required
          disabled={isSubmitting}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-3 bg-[#721422] text-white rounded-r-full hover:bg-[#8a1a2a] transition-colors"
        >
          {isSubmitting ? 'Joining...' : 'Join'}
        </button>
      </div>
      
      {submitStatus === 'success' && (
        <div className="text-green-600 text-sm">✓ Added to waitlist!</div>
      )}
      {submitStatus === 'error' && (
        <div className="text-red-600 text-sm">Something went wrong. Please try again.</div>
      )}
    </form>
  );
}
