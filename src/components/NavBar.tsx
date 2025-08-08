'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const menuItems = [
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#team', label: 'Our Team' },
];

const navLinkBase =
  'font-bold text-xl transition duration-500 flex items-center h-full';
const navLinkNormal = 'text-black hover:text-black/80';
const navLinkDimmed = 'text-black/50';
const navLinkActive = 'text-black font-bold';

export default function NavBar() {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [hidden, setHidden] = useState(false);

  // Smooth scroll handler for nav
  function handleSmoothNavScroll(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    if (href.startsWith('#')) {
      e.preventDefault();
      const id = href.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  useEffect(() => {
    const onScroll = () => {
      setHidden(false); // Never hide the navbar
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);



  return (
    <nav
      className={`w-[95%] max-w-7xl mx-auto flex items-center justify-between px-2 md:pl-8 md:pr-1 py-2 fixed left-1/2 -translate-x-1/2 z-30 h-12 md:h-14 transition-all duration-500 bg-white/10 backdrop-blur-2xl border border-white/30 rounded-2xl shadow-xl
        ${hidden ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}
      `}
      style={{
        top: 'calc(1.5rem + env(safe-area-inset-top))',
        marginTop: 'env(safe-area-inset-top)'
      }}
    >
      {/* Logo - desktop only */}
      <Link href="/" className="hidden md:flex items-center h-full">
        <Image src="/logo-dark.svg" alt="Santelle Logo" width={113} height={38} priority />
      </Link>
      {/* Logo - mobile only */}
      <Link href="/" className="flex md:hidden items-center h-full mx-auto">
        <Image src="/logo-dark.svg" alt="Santelle Logo" width={90} height={30} priority />
      </Link>
      {/* Hamburger Icon - mobile only */}
      <button
        className="flex md:hidden items-center justify-center ml-auto"
        aria-label="Open menu"
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="17" x2="20" y2="17" />
        </svg>
      </button>
      {/* Center Nav Links - desktop only */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-8 h-full hidden md:flex">
        {menuItems.map((item, idx) => (
          <Link
            key={item.href}
            href={item.href}
            className={
              navLinkBase +
              ' ' +
              (hoveredIdx === null
                ? navLinkNormal
                : hoveredIdx === idx
                ? navLinkActive
                : navLinkDimmed)
            }
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
            onClick={
              item.label === 'Our Team'
                ? (e) => {
                    e.preventDefault();
                    const el = document.getElementById('team');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }
                : item.href.startsWith('#')
                ? (e) => handleSmoothNavScroll(e, item.href)
                : undefined
            }
          >
            {item.label}
          </Link>
        ))}
      </div>
      {/* Right-aligned My Account - desktop only */}
      <div className="items-center h-full hidden md:flex">
        {/* Dark mode toggle removed */}
        <button
          className="bg-white/20 backdrop-blur-md text-black font-bold text-xl px-6 h-12 rounded-2xl hover:bg-white/40 hover:text-black transition ml-4 flex items-center justify-center"
          style={{ WebkitBackdropFilter: 'blur(12px)', background: 'rgba(255,255,255,0.12)' }}
          onClick={() => {
            if (pathname !== '/') {
              window.location.href = '/';
            } else {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setTimeout(() => {
                // Trigger the email form to open
                window.dispatchEvent(new Event('openWaitlist'));
                // Focus on the email input
                const emailInput = document.getElementById('waitlist-email') as HTMLInputElement;
                if (emailInput) {
                  emailInput.focus();
                }
              }, 600);
            }
          }}
          type="button"
        >
          Get Early Access
        </button>
      </div>
    </nav>
  );
} 