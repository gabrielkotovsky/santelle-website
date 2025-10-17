'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { requestEmailOtp, verifyEmailOtp } from '@/lib/auth';

function AuthContent() {
  const searchParams = useSearchParams();
  const lookupKey = searchParams.get('lookup_key');
  
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await requestEmailOtp(email);
      console.log('OTP sent to', email);
      setStep('otp');
    } catch (err: any) {
      console.error('Error sending OTP:', err);
      setError(err.message || 'Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const session = await verifyEmailOtp(email, otp);
      console.log('Authentication successful', { session, lookupKey });
      
      // Proceed to Stripe checkout
      if (lookupKey) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/.netlify/functions/create-checkout-session';
        
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'lookup_key';
        input.value = lookupKey;
        
        form.appendChild(input);
        document.body.appendChild(form);
        form.submit();
      }
    } catch (err: any) {
      console.error('Error verifying OTP:', err);
      setError(err.message || 'Invalid verification code. Please try again.');
      setIsLoading(false);
    }
  };

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

      {/* Content */}
      <div className="relative z-10 w-[95%] max-w-md mx-auto px-4 py-16">
        <div className="bg-white/40 backdrop-blur-md rounded-3xl p-8 md:p-10 border border-white/50">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-[#721422] mb-2">
              {step === 'email' ? 'Welcome' : 'Verify Your Email'}
            </h1>
            <p className="text-[#721422]/70">
              {step === 'email' 
                ? 'Enter your email to continue'
                : `We sent a verification code to ${email}`
              }
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl">
              {error}
            </div>
          )}

          {/* Email Step */}
          {step === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-[#721422] mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/60 border border-white/50 text-[#721422] placeholder-[#721422]/40 focus:outline-none focus:ring-2 focus:ring-[#721422] focus:bg-white/80 transition-all"
                  placeholder="Enter your email"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#721422] text-white font-bold px-6 py-4 rounded-full hover:bg-[#8a1a2a] transition-colors duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Sending code...' : 'Continue'}
              </button>
            </form>
          )}

          {/* OTP Step */}
          {step === 'otp' && (
            <form onSubmit={handleOtpSubmit} className="space-y-6">
              {/* OTP Field */}
              <div>
                <label htmlFor="otp" className="block text-sm font-semibold text-[#721422] mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-3 rounded-xl bg-white/60 border border-white/50 text-[#721422] placeholder-[#721422]/40 focus:outline-none focus:ring-2 focus:ring-[#721422] focus:bg-white/80 transition-all text-center text-2xl tracking-widest font-mono"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>

              {/* Resend Code */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={async () => {
                    setError('');
                    setIsLoading(true);
                    try {
                      await requestEmailOtp(email);
                      // Show success message
                      setError('');
                    } catch (err: any) {
                      setError(err.message || 'Failed to resend code.');
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  disabled={isLoading}
                  className="text-sm text-[#721422] hover:text-[#8a1a2a] font-semibold transition-colors disabled:opacity-50"
                >
                  Resend verification code
                </button>
                <span className="text-[#721422]/50 text-sm block mt-2">
                  or{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setStep('email');
                      setOtp('');
                      setError('');
                    }}
                    className="text-[#721422] hover:text-[#8a1a2a] font-semibold transition-colors"
                  >
                    change email
                  </button>
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full bg-[#721422] text-white font-bold px-6 py-4 rounded-full hover:bg-[#8a1a2a] transition-colors duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Verifying...' : 'Verify & Continue'}
              </button>
            </form>
          )}

          {/* Divider - Only show on email step */}
          {step === 'email' && !isLoading && (
            <>
              <div className="my-6 flex items-center">
                <div className="flex-1 border-t border-[#721422]/30"></div>
                <span className="px-4 text-sm text-[#721422]/70">or</span>
                <div className="flex-1 border-t border-[#721422]/30"></div>
              </div>

              {/* Social Login Buttons */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={async () => {
                    // TODO: Implement Apple Sign-In with proper identity token and nonce
                    console.log('Apple login clicked', { lookupKey });
                    setError('Apple Sign-In is not yet configured. Please use email authentication.');
                  }}
                  className="w-full bg-white/60 hover:bg-white/80 border border-white/50 text-[#721422] font-semibold px-6 py-3 rounded-full transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  <span>Continue with Apple</span>
                </button>
              </div>
            </>
          )}

          {/* Terms and Privacy */}
          <p className="mt-6 text-xs text-center text-[#721422]/60">
            By continuing, you agree to Santelle&apos;s{' '}
            <a href="/privacy-policy" className="underline hover:text-[#721422]">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy-policy" className="underline hover:text-[#721422]">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}

export default function AuthPage() {
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
      <AuthContent />
    </Suspense>
  );
}

