'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

function UnsubscribePageContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  
  const [isUnsubscribing, setIsUnsubscribing] = useState(false);
  const [unsubscribeStatus, setUnsubscribeStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!email) {
      setErrorMessage('No email address provided. Please use the link from your email.');
    }
  }, [email]);

  const handleUnsubscribe = async () => {
    if (!email) {
      setErrorMessage('Email address is required');
      return;
    }

    setIsUnsubscribing(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (response.ok) {
        setUnsubscribeStatus('success');
      } else {
        setErrorMessage(result.error || 'Failed to unsubscribe. Please try again.');
        setUnsubscribeStatus('error');
      }
    } catch {
      setErrorMessage('Network error. Please check your connection and try again.');
      setUnsubscribeStatus('error');
    } finally {
      setIsUnsubscribing(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen relative flex items-center justify-center px-4">
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/background_desktop.mp4" type="video/mp4" />
          <Image src="/background_desktop_static.webp" alt="Background" fill className="object-cover" />
        </video>
        
        {/* Blur View Overlay - Same as other pages */}
        <div className="bg-white/30 absolute inset-0 backdrop-blur-lg z-5" />
        
        {/* Content Overlay */}
        <div className="relative z-10 max-w-md w-full bg-white/20 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 p-8 text-center">
          <div className="mb-6">
            <Image
              src="/logo-dark.svg"
              alt="Santelle"
              width={200}
              height={50}
              className="mx-auto"
            />
          </div>
          <h1 className="text-2xl font-bold text-[#721422] mb-4">Unsubscribe</h1>
          <p className="text-gray-600 mb-6">{errorMessage}</p>
          <Link
            href="/"
            className="inline-block bg-[#721422] text-white px-6 py-3 rounded-full hover:bg-[#8a1a2a] transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="/background_desktop.mp4" type="video/mp4" />
        <Image src="/background_desktop_static.webp" alt="Background" fill className="object-cover" />
      </video>
      
      {/* Blur View Overlay - Same as other pages */}
      <div className="bg-white/30 absolute inset-0 backdrop-blur-lg z-5" />
      
      {/* Content Overlay */}
      <div className="relative z-10 max-w-md w-full bg-white/20 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 p-8">
        <div className="text-center mb-8">
          <Image
            src="/logo-dark.svg"
            alt="Santelle"
            width={200}
            height={50}
            className="mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-[#721422] mb-2">Unsubscribe from Emails</h1>
          <p className="text-gray-600 text-sm">
            We&apos;re sorry to see you go! You&apos;ll no longer receive waitlist updates.
          </p>
        </div>

        {unsubscribeStatus === 'success' ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-green-800 mb-2">Unsubscribed Successfully</h2>
            <p className="text-green-700 mb-6">
              You&apos;ve been removed from our email list. You can always rejoin the waitlist later!
            </p>
            <Link
              href="/"
              className="inline-block bg-[#721422] text-white px-6 py-3 rounded-full hover:bg-[#8a1a2a] transition-colors"
            >
              Return to Home
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Email:</strong> {email}
              </p>
            </div>

            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Are you sure you want to unsubscribe from Santelle waitlist emails?
              </p>
              <p className="text-xs text-gray-500 mb-6">
                You&apos;ll miss out on early access alerts, exclusive health tips, and beta testing opportunities.
              </p>
            </div>

            {errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm">{errorMessage}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleUnsubscribe}
                disabled={isUnsubscribing}
                className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isUnsubscribing ? 'Unsubscribing...' : 'Yes, Unsubscribe'}
              </button>
              <Link
                href="/"
                className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-full hover:bg-gray-300 transition-colors text-center"
              >
                Cancel
              </Link>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                Changed your mind? You can always rejoin by visiting our homepage.
              </p>
              <div className="mt-3">
                <Link
                  href={`/resubscribe?email=${email}`}
                  className="text-[#721422] text-sm underline hover:no-underline transition-all"
                >
                  Or resubscribe directly here
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen relative flex items-center justify-center px-4">
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/background_desktop.mp4" type="video/mp4" />
          <Image src="/background_desktop_static.webp" alt="Background" fill className="object-cover" />
        </video>
        
        {/* Blur View Overlay - Same as other pages */}
        <div className="bg-white/30 absolute inset-0 backdrop-blur-lg z-5" />
        
        {/* Content Overlay */}
        <div className="relative z-10 max-w-md w-full bg-white/20 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 p-8 text-center">
          <div className="mb-6">
            <Image
              src="/logo-dark.svg"
              alt="Santelle"
              width={200}
              height={50}
              className="mx-auto"
            />
          </div>
          <h1 className="text-2xl font-bold text-[#721422] mb-4">Loading...</h1>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#721422] mx-auto"></div>
        </div>
      </div>
    }>
      <UnsubscribePageContent />
    </Suspense>
  );
}
