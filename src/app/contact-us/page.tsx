'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const subjects = [
  '',
  'General Inquiry',
  'Partnership',
  'Press/Media',
  'Support',
  'Account Deletion',
  'Other',
];

export default function ContactUs() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    updates: false,
  });
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const [emailValidation, setEmailValidation] = useState({
    isValid: false,
    isChecking: false,
    error: '',
    domainValid: false
  });

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
    } catch {
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
    setEmailValidation(prev => ({ ...prev, isChecking: true }));
    const domainValid = await validateEmailDomain(email);
    setEmailValidation({
      isValid: formatValid, // Only require format validation, domain validation is optional
      isChecking: false,
      error: domainValid ? '' : 'Domain validation failed, but you can still submit',
      domainValid
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let fieldValue: string | boolean = value;
    if (type === 'checkbox') {
      fieldValue = (e.target as HTMLInputElement).checked;
    }
    setForm((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));
    if (name === 'email') {
      validateEmail(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.message) {
      setError('Please fill in all required fields.');
      return;
    }
    // Only check basic email format, not domain validation for submission
    if (!validateEmailFormat(form.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to send');
      }
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
      setForm({ name: '', email: '', subject: '', message: '', updates: false });
      setEmailValidation({
        isValid: false,
        isChecking: false,
        error: '',
        domainValid: false
      });
    } catch {
      setError('Something went wrong. Please try again.');
      setStatus('error');
    }
  };

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
            objectFit: 'cover', 
            objectPosition: 'center',
            width: '100vw',
            height: '100dvh'
          }}
        />
        
        {/* Mobile Video Background */}
        <video
          src="/background_mobile.mp4"
          autoPlay
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover block md:hidden"
          style={{
            objectFit: 'cover', 
            objectPosition: 'center',
            width: '100vw',
            height: '100dvh'
          }}
        />
        
        {/* Overlay - Blur only, no color */}
        <div className="absolute inset-0 backdrop-blur-lg" />
      </div>
      
      {/* Contact Form Content */}
      <div className="relative z-20 w-full max-w-2xl mx-auto px-4 md:px-8 py-8 md:py-12 mt-32 md:mt-20">
        <form
          className="bg-white/30 backdrop-blur-2xl border border-white/50 rounded-3xl p-6 md:p-8 lg:p-12 flex flex-col gap-6 md:gap-8 transition-all duration-300"
          style={{
            minHeight: 'clamp(600px, 70vh, 800px)',
            maxHeight: 'clamp(800px, 90vh, 1200px)'
          }}
          onSubmit={handleSubmit}
        >
          <div className="text-center mb-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-[#721422] chunko-bold">Contact Us</h1>
            <p className="text-lg md:text-xl text-[#721422] font-semibold">Hi there! Got a question? We&apos;d love to hear from you.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Name"
              className="px-4 md:px-6 py-3 md:py-4 rounded-2xl border-2 border-white/30 focus:outline-none focus:ring-4 focus:ring-[#721422]/20 focus:border-[#721422] text-base md:text-lg bg-white/50 backdrop-blur-sm text-[#721422] placeholder-[#721422]/60 font-medium transition-all duration-300"
            />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email*"
              required
              className="px-4 md:px-6 py-3 md:py-4 rounded-2xl border-2 border-white/30 focus:outline-none focus:ring-4 focus:ring-[#721422]/20 focus:border-[#721422] text-base md:text-lg bg-white/50 backdrop-blur-sm text-[#721422] placeholder-[#721422]/60 font-medium transition-all duration-300"
            />
          </div>
          
          {/* Email validation feedback */}
          <div className="min-h-[20px] md:min-h-[24px] -mt-2">
            {emailValidation.isChecking && (
              <div className="text-[#ff4fa3] text-sm text-center font-medium">Checking email domain...</div>
            )}
            {emailValidation.error && (
              <div className="text-red-500 text-sm text-center font-medium">{emailValidation.error}</div>
            )}
            {emailValidation.isValid && !emailValidation.isChecking && (
              <div className="text-green-600 text-sm text-center font-medium">✓ Valid email address</div>
            )}
          </div>
          
          <select
            name="subject"
            value={form.subject}
            onChange={handleChange}
            className="px-4 md:px-6 py-3 md:py-4 rounded-2xl border-2 border-white/30 focus:outline-none focus:ring-4 focus:ring-[#721422]/20 focus:border-[#721422] text-base md:text-lg bg-white/50 backdrop-blur-sm text-[#721422] font-medium transition-all duration-300 appearance-none"
            style={{
              backgroundImage: 'none'
            }}
          >
            <option value="">Subject</option>
            {subjects.slice(1).map((subj) => (
              <option key={subj} value={subj}>{subj}</option>
            ))}
          </select>
          
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Message*"
            required
            rows={4}
            className="px-4 md:px-6 py-3 md:py-4 rounded-2xl border-2 border-white/30 focus:outline-none focus:ring-4 focus:ring-[#721422]/20 focus:border-[#721422] text-base md:text-lg bg-white/50 backdrop-blur-sm text-[#721422] placeholder-[#721422]/60 font-medium resize-none transition-all duration-300 flex-1"
            style={{
              minHeight: 'clamp(120px, 20vh, 200px)',
              maxHeight: 'clamp(200px, 30vh, 300px)'
            }}
          />
          
          <label className="flex items-center gap-3 text-[#721422] text-base md:text-lg font-medium cursor-pointer">
            <input
              type="checkbox"
              name="updates"
              checked={form.updates}
              onChange={handleChange}
              className="w-4 md:w-5 h-4 md:h-5 rounded border-2 border-[#721422] text-[#721422] focus:ring-2 focus:ring-[#721422]/20 cursor-pointer"
            />
            I want to receive updates from Santelle.
          </label>
          
          {error && (
            <div className="text-red-500 text-center font-semibold text-base md:text-lg bg-red-50/50 rounded-2xl p-3 md:p-4 border border-red-200/50">
              {error}
            </div>
          )}
          {status === 'success' && (
            <div className="text-green-600 text-center font-semibold text-base md:text-lg bg-green-50/50 rounded-2xl p-3 md:p-4 border border-green-200/50">
              Message sent! We&apos;ll be in touch soon.
            </div>
          )}
          
          <button
            type="submit"
            className="bg-[#721422] text-white font-bold text-lg md:text-xl px-6 md:px-8 py-3 md:py-4 rounded-full hover:bg-[#8a1a2a] transition-all duration-300 cursor-pointer focus:outline-none focus:ring-4 focus:ring-[#721422]/20 transform hover:scale-105 active:scale-95 mt-auto"
          >
            Send Message
          </button>
          
          <div className="text-xs md:text-sm text-[#721422]/60 text-center font-medium">
            *We&apos;ll use your details only to respond to you. See our{' '}
            <Link href="/privacy-policy" className="underline hover:text-[#721422] transition-colors duration-200">Privacy Policy</Link>.
          </div>
        </form>
      </div>
      
      {/* Bottom Glassmorphic Card */}
      <section className="w-full pt-0 pb-0 px-0 md:px-0 relative z-20" style={{minWidth: '100vw', width: '100vw'}}>
        <div className="bg-white/30 backdrop-blur-lg rounded-3xl border border-white/50 w-full">
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
  );
} 