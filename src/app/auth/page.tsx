'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { requestEmailOtp, verifyEmailOtp } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

type GTMEventValue = string | number | boolean | null | undefined;
type GTMEventData = Record<string, GTMEventValue>;
type GTMWindow = Window & { dataLayer?: Array<GTMEventData & { event?: string }> };

// GTM Event Tracking Helper
const trackGTMEvent = (eventName: string, eventData: GTMEventData) => {
  if (typeof window !== 'undefined') {
    const dataLayer = (window as GTMWindow).dataLayer;
    if (dataLayer) {
      dataLayer.push({
        event: eventName,
        ...eventData,
      });
    }
  }
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function AuthContent() {
  const searchParams = useSearchParams();
  const lookupKey = searchParams.get('lookup_key');
  const redirectTo = searchParams.get('redirect');
  
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    // Track email submission
    trackGTMEvent('Auth_Email_Submitted', {
      has_lookup_key: !!lookupKey,
      redirect_to: redirectTo || null,
    });
    
    try {
      await requestEmailOtp(email);
      console.log('OTP sent to', email);
      
      // Track successful OTP request
      trackGTMEvent('Auth_OTP_Sent', {
        has_lookup_key: !!lookupKey,
      });
      
      setStep('otp');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error sending OTP:', err);
      setError(message || 'Échec de l’envoi du code de vérification. Veuillez réessayer.');
      
      // Track OTP send failure
      trackGTMEvent('Auth_OTP_Send_Failed', {
        error_message: message,
        has_lookup_key: !!lookupKey,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    // Track OTP verification attempt
    trackGTMEvent('Auth_OTP_Submitted', {
      has_lookup_key: !!lookupKey,
      redirect_to: redirectTo || null,
    });
    
    try {
      const session = await verifyEmailOtp(email, otp);
      console.log('Authentication successful', { session, lookupKey });
      
      // Track successful OTP verification
      trackGTMEvent('Auth_OTP_Verified', {
        has_lookup_key: !!lookupKey,
        redirect_to: redirectTo || null,
      });
      
      if (lookupKey) {
        // Fetch user from Supabase
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          setError('Impossible de récupérer votre compte après la vérification du code.');
          setIsLoading(false);
          return;
        }
        const userId = user.id;
        const userEmail = user.email;
        if (!userId || !userEmail) {
          setError('Le compte authentifié ne contient pas d’identifiant ou d’e-mail');
          setIsLoading(false);
          return;
        }
        // Submit lookup_key, user_id, email
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
        inputUid.value = userId;

        const inputEmail = document.createElement('input');
        inputEmail.type = 'hidden';
        inputEmail.name = 'email';
        inputEmail.value = userEmail;

        form.appendChild(inputLookup);
        form.appendChild(inputUid);
        form.appendChild(inputEmail);
        document.body.appendChild(form);
        form.submit();
      } else {
        // No lookup key, redirect to intended destination or home
        if (redirectTo) {
          window.location.href = redirectTo;
        } else {
          window.location.href = '/';
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error verifying OTP:', err);
      setError(message || 'Code de vérification invalide. Veuillez réessayer.');
      
      // Track OTP verification failure
      trackGTMEvent('Auth_OTP_Verification_Failed', {
        error_message: message,
        has_lookup_key: !!lookupKey,
      });
      
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
      <div className="relative z-10 w-full max-w-md mx-auto px-0 sm:px-4 py-0 sm:py-16 md:py-20">
        <div className="bg-white/40 backdrop-blur-md rounded-none sm:rounded-3xl p-6 sm:p-8 md:p-10 border border-white/30 sm:border-white/50 max-w-none min-h-[100dvh] sm:min-h-0 sm:max-w-full mx-auto flex flex-col justify-center">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-[#721422] mb-2">
              {step === 'email' ? 'Bienvenue' : 'Vérifiez votre e-mail'}
            </h1>
            <p className="text-[#721422]/70">
              {step === 'email' 
                ? 'Saisissez votre e-mail pour continuer'
                : `Nous avons envoyé un code de vérification à ${email}`
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
                  Adresse e-mail
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/60 border border-white/50 text-[#721422] placeholder-[#721422]/40 focus:outline-none focus:ring-2 focus:ring-[#721422] focus:bg-white/80 transition-all"
                  placeholder="Entrez votre e-mail"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#721422] text-white font-bold px-6 py-4 rounded-full hover:bg-[#8a1a2a] transition-colors duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Envoi du code…' : 'Continuer'}
              </button>
            </form>
          )}

          {/* OTP Step */}
          {step === 'otp' && (
            <form onSubmit={handleOtpSubmit} className="space-y-6">
              {/* OTP Field */}
              <div>
                <label htmlFor="otp" className="block text-sm font-semibold text-[#721422] mb-2">
                  Code de vérification
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
                    } catch (err: unknown) {
                      const message = err instanceof Error ? err.message : 'Échec du renvoi du code.';
                      setError(message || 'Échec du renvoi du code.');
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  disabled={isLoading}
                  className="text-sm text-[#721422] hover:text-[#8a1a2a] font-semibold transition-colors disabled:opacity-50"
                >
                  Renvoyer le code
                </button>
                <span className="text-[#721422]/50 text-sm block mt-2">
                  ou{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setStep('email');
                      setOtp('');
                      setError('');
                    }}
                    className="text-[#721422] hover:text-[#8a1a2a] font-semibold transition-colors"
                  >
                    changer d’e-mail
                  </button>
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full bg-[#721422] text-white font-bold px-6 py-4 rounded-full hover:bg-[#8a1a2a] transition-colors duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Vérification…' : 'Valider et continuer'}
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
                  setError('La connexion avec Apple n’est pas encore configurée. Merci d’utiliser l’authentification par e-mail.');
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
            En continuant, vous acceptez les{' '}
            <a href="/privacy-policy" className="underline hover:text-[#721422]">
              conditions d’utilisation
            </a>{' '}
            et la{' '}
            <a href="/privacy-policy" className="underline hover:text-[#721422]">
              politique de confidentialité
            </a>{' '}
            de Santelle.
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
        <div className="relative z-10 text-[#721422] text-xl">Chargement…</div>
      </main>
    }>
      <AuthContent />
    </Suspense>
  );
}

