'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useWaitlistForm } from '../../hooks/useWaitlistForm';

export default function PrivacyPolicy() {
  const {
    formData,
    handleFormChange,
    handleFormSubmit,
    emailValidation,
    isSubmitting,
    submitStatus,
    rateLimit
  } = useWaitlistForm();

  return (
    <div className="relative min-h-screen w-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background Video */}
      <video
        className="fixed top-0 left-0 w-screen h-screen object-cover z-0"
        src="/background.mov"
        autoPlay
        loop
        muted
        playsInline
        style={{ objectFit: 'cover', objectPosition: 'center' }}
      />
      {/* Blur Overlay */}
      <div className="fixed top-0 left-0 w-screen h-screen z-10 backdrop-blur-md pointer-events-none" />
      {/* Privacy Policy Content */}
      <main className="relative z-20 max-w-4xl mx-auto px-8 py-24 min-h-[1100px] text-[#18321f] bg-white/30 backdrop-blur-2xl border border-white/30 rounded-2xl shadow-xl mt-32 mb-20 text-lg">
        <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
        <div className="text-sm text-[#721422]/60 mb-6">Last updated: July 2025</div>
        <p className="mb-4">At Santelle, we care about your privacy. This page explains how we collect, use, and protect your personal information.</p>
        <h2 className="text-xl font-semibold mt-6 mb-2">1. What we collect</h2>
        <ul className="list-disc pl-6 mb-4 text-base">
          <li>Your email address</li>
          <li>(Optional) Your name</li>
        </ul>
        <p className="mb-4">We do not collect sensitive health or personal data on this website.</p>
        <h2 className="text-xl font-semibold mt-6 mb-2">2. How we use your information</h2>
        <ul className="list-disc pl-6 mb-4 text-base">
          <li>Send updates, newsletters, and special offers</li>
          <li>Improve our website and services</li>
        </ul>
        <p className="mb-4">We will never sell or share your personal information for marketing.</p>
        <h2 className="text-xl font-semibold mt-6 mb-2">3. How we protect your data</h2>
        <p className="mb-4">We apply secure systems and practices to safeguard your information.</p>
        <h2 className="text-xl font-semibold mt-6 mb-2">4. Your rights</h2>
        <ul className="list-disc pl-6 mb-4 text-base">
          <li>Unsubscribe anytime via the link in our emails</li>
          <li>Request access or deletion of your data at <a href="mailto:hello@santelle.com" className="underline hover:text-[#511828]">hello@santelle.com</a></li>
        </ul>
        <h2 className="text-xl font-semibold mt-6 mb-2">5. Contact us</h2>
        <p>If you have questions, email us at: <a href="mailto:hello@santelle.com" className="underline hover:text-[#511828]">hello@santelle.com</a></p>
      </main>
      {/* Footer Card */}
      <section className="w-full pt-4 pb-8 px-4 md:px-8 relative z-20" style={{minWidth: '100vw', width: '100vw'}}>
        <div className="bg-white/30 backdrop-blur-lg rounded-3xl shadow-xl border border-white/30 w-full">
          <div className="p-4 md:p-8 flex flex-col items-center gap-6 text-center">
            {/* Logo */}
            <div className="w-full flex justify-center mb-2">
              <Image src="/logo-dark.png" alt="Santelle Logo" width={180} height={60} style={{objectFit: 'contain', height: 60}} />
            </div>
            {/* Mission Statement */}
            <div className="text-xl md:text-2xl font-semibold text-[#721422] mb-2">
              [MISSION STATEMENT]
            </div>
            {/* Mailing List Form */}
            <form className="w-full max-w-2xl mx-auto flex flex-col gap-2" onSubmit={handleFormSubmit}>
              <label htmlFor="footer-email" className="text-left text-base font-medium text-black mb-1 ml-2">Your email*</label>
              <div className="flex w-full">
                <input
                  type="email"
                  required
                  id="footer-email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  placeholder="your@email.com"
                  className={`flex-1 px-6 py-3 text-lg rounded-l-full border-2 border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white text-[#511828] placeholder-[#c9a6b7] ${emailValidation.error ? 'border-red-500' : emailValidation.isValid ? 'border-green-500' : 'border-pink-200'}`}
                  aria-label="Email address"
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  disabled={isSubmitting || (!!formData.email && !emailValidation.isValid) || rateLimit.blocked}
                  className={`px-8 py-3 font-semibold text-lg rounded-r-full border-2 border-l-0 border-pink-200 transition-all duration-200 min-w-[180px] focus:outline-none focus:ring-2 focus:ring-pink-300
                    ${isSubmitting ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : (!formData.email ? 'bg-[#721422] text-white hover:bg-[#8a1a2a]'
                        : (!emailValidation.isValid ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                          : 'bg-[#721422] text-white hover:bg-[#8a1a2a]'))}
                  `}
                >
                  {isSubmitting ? 'Joining...' : rateLimit.blocked ? 'Rate limited' : 'Get early access'}
                </button>
              </div>
              {/* Validation and submission feedback */}
              <div className="min-h-[28px] mt-1">
                {emailValidation.isChecking && (
                  <div className="text-pink-600 text-sm text-center">Checking email domain...</div>
                )}
                {emailValidation.error && (
                  <div className="text-red-600 text-sm text-center">{emailValidation.error}</div>
                )}
                {emailValidation.isValid && !emailValidation.isChecking && (
                  <div className="text-green-600 text-sm text-center">✓ Valid email address</div>
                )}
                {rateLimit.blocked && (
                  <div className="text-red-600 text-sm text-center">
                    Too many attempts. Please wait {Math.ceil((rateLimit.cooldownEnd - Date.now()) / 1000)} seconds before trying again.
                  </div>
                )}
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
            </form>
            {/* Divider */}
            <hr className="w-full border-t border-[#721422]/20 my-2" />
            {/* Footer Links and Copyright */}
            <div className="w-full flex flex-col md:flex-row justify-between items-center gap-2 text-sm text-[#721422] mt-2">
              <div className="flex gap-4 mb-1 md:mb-0">
                <Link href="/privacy-policy" className="underline hover:text-[#18321f]">Privacy Policy</Link>
                <span>|</span>
                <a href="/terms-of-service" className="underline hover:text-[#18321f]">Terms of Service</a>
                <span>|</span>
                <a href="/about-us" className="underline hover:text-[#18321f]">About Us</a>
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