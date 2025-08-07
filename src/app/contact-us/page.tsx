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
    } catch (error) {
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
      isValid: formatValid && domainValid,
      isChecking: false,
      error: domainValid ? '' : 'This email domain appears to be invalid',
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
    if (!emailValidation.isValid) {
      setError(emailValidation.error || 'Please enter a valid email address.');
      return;
    }
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to send');
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
      {/* Contact Form Content */}
      <form
        className="relative z-20 w-full max-w-xl bg-white/30 backdrop-blur-2xl border border-white/30 rounded-lg shadow-xl p-8 flex flex-col gap-6 mt-24 mb-16"
        onSubmit={handleSubmit}
      >
        <h1 className="text-3xl font-bold mb-2 text-[#18321f]">Hi there! Got a question? We&apos;d love to hear from you.</h1>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Name"
          className="px-4 py-3 rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-lg bg-white text-[#511828] placeholder-[#c9a6b7]"
        />
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email*"
          required
          className="px-4 py-3 rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-lg bg-white text-[#511828] placeholder-[#c9a6b7]"
        />
        {/* Email validation feedback */}
        <div className="min-h-[24px] -mt-4 mb-2">
          {emailValidation.isChecking && (
            <div className="text-pink-600 text-sm text-center">Checking email domain...</div>
          )}
          {emailValidation.error && (
            <div className="text-red-600 text-sm text-center">{emailValidation.error}</div>
          )}
          {emailValidation.isValid && !emailValidation.isChecking && (
            <div className="text-green-600 text-sm text-center">✓ Valid email address</div>
          )}
        </div>
        <select
          name="subject"
          value={form.subject}
          onChange={handleChange}
          className="px-4 py-3 rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-lg bg-white text-[#511828] placeholder-[#c9a6b7]"
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
          rows={5}
          className="px-4 py-3 rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-lg bg-white text-[#511828] placeholder-[#c9a6b7] resize-none"
        />
        <label className="flex items-center gap-2 text-[#18321f] text-base">
          <input
            type="checkbox"
            name="updates"
            checked={form.updates}
            onChange={handleChange}
            className="accent-pink-400 w-5 h-5 rounded"
          />
          I want to receive updates from Santelle.
        </label>
        {error && <div className="text-red-600 text-sm text-center">{error}</div>}
        {status === 'success' && <div className="text-green-600 text-center font-semibold">Message sent! We&apos;ll be in touch soon.</div>}
        <button
          type="submit"
          className="bg-[#721422] text-white font-bold text-lg px-8 py-3 rounded-full hover:bg-[#8a1a2a] transition-all duration-200 mt-2"
        >
          Send Message
        </button>
        <div className="text-xs text-[#721422]/60 mt-2 text-center">
          *We&apos;ll use your details only to respond to you. See our{' '}
          <Link href="/privacy-policy" className="underline hover:text-[#511828]">Privacy Policy</Link>.
        </div>
      </form>
      
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
  );
} 