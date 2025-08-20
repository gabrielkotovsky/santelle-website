'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const menuItems = [
  { href: '#stats', label: 'Why Santelle' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#team', label: 'Our Team' },
];

const navLinkBase =
  'font-bold transition duration-500 flex items-center h-full';
const navLinkNormal = 'text-black hover:text-black/80';
const navLinkDimmed = 'text-black/50';
const navLinkActive = 'text-black font-bold';

// Custom smooth scroll function with easing options
function smoothScrollTo(element: HTMLElement, options: {
  duration?: number;
  easing?: 'linear' | 'easeInQuad' | 'easeOutQuad' | 'easeInOutQuad' | 'easeInCubic' | 'easeOutCubic' | 'easeInOutCubic';
  offset?: number;
  block?: 'start' | 'center' | 'end';
} = {}) {
  const { duration = 1000, easing = 'easeInOutCubic', offset = 0, block = 'start' } = options;
  
  const startPosition = window.pageYOffset;
  const elementRect = element.getBoundingClientRect();
  const elementTop = elementRect.top + window.pageYOffset;
  
  // Calculate target position based on block alignment
  let targetPosition: number;
  if (block === 'center') {
    targetPosition = elementTop - (window.innerHeight / 2) + (elementRect.height / 2) - offset;
  } else if (block === 'end') {
    targetPosition = elementTop - window.innerHeight + elementRect.height - offset;
  } else {
    // 'start' - align to top
    targetPosition = elementTop - offset;
  }
  
  const distance = targetPosition - startPosition;
  let startTime: number | null = null;

  // Easing functions
  const easingFunctions = {
    linear: (t: number) => t,
    easeInQuad: (t: number) => t * t,
    easeOutQuad: (t: number) => t * (2 - t),
    easeInOutQuad: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeInCubic: (t: number) => t * t * t,
    easeOutCubic: (t: number) => (--t) * t * t + 1,
    easeInOutCubic: (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
  };

  function animation(currentTime: number) {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);
    
    const easedProgress = easingFunctions[easing](progress);
    const newPosition = startPosition + distance * easedProgress;
    
    window.scrollTo(0, newPosition);
    
    if (progress < 1) {
      requestAnimationFrame(animation);
    }
  }

  requestAnimationFrame(animation);
}

export default function NavBar() {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [hidden, setHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Smooth scroll handler for nav
  function handleSmoothNavScroll(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    if (href.startsWith('#')) {
      e.preventDefault();
      const id = href.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        smoothScrollTo(el, { 
          duration: 1200, 
          easing: 'easeInOutCubic',
          block: 'center'
        });
      }
    }
  }

  useEffect(() => {
    const onScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Hide navbar when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setHidden(true); // Hide when scrolling down and not at top
      } else {
        setHidden(false); // Show when scrolling up or at top
      }
      
      setLastScrollY(currentScrollY);
    };
    
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [lastScrollY]);

  return (
    <nav
      className={`w-[95%] max-w-7xl mx-auto flex items-center justify-between px-2 md:pl-8 md:pr-1 py-2 fixed left-1/2 -translate-x-1/2 z-30 h-12 md:h-14 transition-transform duration-500 bg-white/10 backdrop-blur-2xl border border-white/30 rounded-2xl shadow-none
        ${hidden ? '-translate-y-[200%] pointer-events-none' : 'translate-y-0'}
      `}
      style={{
        top: 'calc(1.5rem + env(safe-area-inset-top))',
        marginTop: 'env(safe-area-inset-top)'
      }}
    >
      {/* Logo - desktop only */}
      <Link href="/" className="hidden md:flex items-center h-full">
        <Image 
          src="/logo-dark.svg" 
          alt="Santelle Logo" 
          width={113} 
          height={38} 
          priority 
          style={{
            width: 'clamp(80px, 8vw, 113px)',
            height: 'auto'
          }}
        />
      </Link>
      {/* Logo - mobile only */}
      <Link href="/" className="flex md:hidden items-center h-full mx-auto">
        <Image 
          src="/logo-dark.svg" 
          alt="Santelle Logo" 
          width={90} 
          height={30} 
          priority 
          style={{
            width: 'clamp(60px, 6vw, 90px)',
            height: 'auto'
          }}
        />
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
            style={{
              fontSize: 'clamp(0.875rem, 1.2vw, 1.125rem)'
            }}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
            onClick={
              item.label === 'Our Team'
                ? (e) => {
                    e.preventDefault();
                    const el = document.getElementById('team');
                    if (el) {
                      smoothScrollTo(el, { 
                        duration: 1200, 
                        easing: 'easeInOutCubic',
                        block: 'start',
                        offset: 100 
                      });
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
      {/* Right-aligned buttons - desktop only */}
      <div className="items-center h-full hidden md:flex">

        
        {/* Get Early Access Button */}
        <button
          className="bg-white/20 backdrop-blur-md text-black font-bold px-6 h-12 rounded-2xl hover:bg-white/40 hover:text-black transition flex items-center justify-center"
          style={{ 
            WebkitBackdropFilter: 'blur(12px)', 
            background: 'rgba(255,255,255,0.12)',
            fontSize: 'clamp(0.75rem, 1vw, 1.25rem)',
            paddingLeft: 'clamp(1rem, 1.5vw, 1.5rem)',
            paddingRight: 'clamp(1rem, 1.5vw, 1.5rem)',
            height: 'clamp(2.5rem, 4vw, 3rem)'
          }}
          onClick={() => {
            if (pathname !== '/') {
              window.location.href = '/';
            } else {
              // Use the same function as other Get Early Access buttons
              window.dispatchEvent(new Event('openWaitlist'));
              window.scrollTo({ top: 0, behavior: 'smooth' });
              const emailInput = document.getElementById('waitlist-email') as HTMLInputElement;
              if (emailInput) {
                emailInput.focus();
              }
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