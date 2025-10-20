'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function ContactUs() {
  return (
    <div className="relative min-h-screen w-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background - Always Video */}
      <div className="fixed inset-0 -z-10 flex items-center justify-center" style={{
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
        <div className="absolute inset-0 backdrop-blur-lg" />
      </div>
      
      {/* Temporarily Disabled Message */}
      <div className="relative z-20 w-full max-w-2xl mx-auto px-4 md:px-8 py-8 md:py-12 mt-32 md:mt-20">
        <div className="bg-white/30 backdrop-blur-2xl border border-white/50 rounded-3xl p-6 md:p-8 lg:p-12 flex flex-col gap-6 md:gap-8 transition-all duration-300 text-center">
          <div className="text-center mb-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-[#721422] chunko-bold">Contact Us</h1>
            <p className="text-lg md:text-xl text-[#721422] font-semibold mb-6">Temporarily Unavailable</p>
          </div>
          
          <div className="bg-yellow-50/50 border border-yellow-200/50 rounded-2xl p-6 md:p-8">
            <div className="text-yellow-800 text-lg md:text-xl font-semibold mb-4">
              🚧 Contact form is temporarily disabled
            </div>
            <p className="text-yellow-700 text-base md:text-lg mb-4">
              We're currently updating our contact system. Please check back soon or reach out to us through our other channels.
            </p>
            <p className="text-yellow-600 text-sm md:text-base">
              Thank you for your patience!
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
            <Link 
              href="/"
              className="bg-[#721422] text-white font-bold text-lg px-8 py-4 rounded-full hover:bg-[#8a1a2a] transition-colors duration-200 text-center"
            >
              Back to Home
            </Link>
            <Link 
              href="/waitlist"
              className="bg-white/50 text-[#721422] font-bold text-lg px-8 py-4 rounded-full hover:bg-white/70 transition-colors duration-200 text-center border-2 border-[#721422]"
            >
              Join Waitlist
            </Link>
          </div>
        </div>
      </div>
      
      {/* Bottom Glassmorphic Card */}
      <section className="w-full pt-0 pb-0 px-0 md:px-0 relative z-20" style={{minWidth: '100vw', width: '100vw'}}>
        <div className="bg-white/30 backdrop-blur-lg rounded-3xl border border-white/50 w-full">
          <div className="p-4 md:p-8 flex flex-col items-center gap-6 text-center">
            {/* Logo */}
            <div className="w-full flex justify-center mb-2">
              <Image src="/logo-dark.svg" alt="Santelle Logo" width={180} height={60} className="object-contain" style={{height: 60}} />
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
  );
} 