'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const menuItems = [
  { href: '#mobile-stats', label: 'Why Santelle', section: 'stats' },
  { href: '#mobile-meet', label: 'Meet Santelle', section: 'meet' },
  { href: '#mobile-how-it-works', label: 'How It Works', section: 'how-it-works' },
  { href: '#mobile-team', label: 'Our Team', section: 'team' },
  { href: '/plans', label: 'Shop', section: null },
];

const STRIPE_PORTAL_URL = 'https://billing.stripe.com/p/login/00wdRaaLq2nT2Nv9lqcAo00';

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

export default function MobileNavBar() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Hide navbar when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setHidden(true); // Hide when scrolling down and not at top
      } else {
        setHidden(false); // Show when scrolling up or at top
      }
      
      setScrolled(currentScrollY > 1);
      setLastScrollY(currentScrollY);
    };
    
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [lastScrollY]);

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string, section?: string) => {
    e.preventDefault();
    setIsOpen(false);
    
    // Close menu with animation
    setTimeout(() => {
      // Always target the mobile unified card
      const unifiedCard = document.getElementById('mobile-unified-card');
      
      if (unifiedCard && section) {
        // Calculate offset for mobile header
        const headerHeight = 64; // Mobile header height
        
        // Find the specific section within the unified card
        const sectionElements = unifiedCard.querySelectorAll('[data-section]');
        const targetSection = Array.from(sectionElements).find(el => 
          el.getAttribute('data-section') === section
        );
        
                  if (targetSection) {
            // Use custom smooth scroll for target section
            smoothScrollTo(targetSection as HTMLElement, { 
              duration: 1200, 
              easing: 'easeInOutCubic',
              block: 'start',
              offset: headerHeight 
            });
          } else {
            // Fallback: scroll to unified card
            smoothScrollTo(unifiedCard, { 
              duration: 1200, 
              easing: 'easeInOutCubic',
              block: 'start',
              offset: headerHeight 
            });
          }
      } else {
        // Fallback: scroll to top if element not found
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    }, 300); // Wait for menu close animation
  };

  return (
    <>
      {/* Mobile Navigation Bar */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isOpen ? 'bg-black' : scrolled ? 'bg-white/20 backdrop-blur-lg' : 'bg-transparent'
        } safe-top border-none ${
          hidden ? '-translate-y-full' : 'translate-y-0'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image 
              src="/logo.svg" 
              alt="Santelle Logo" 
              width={150} 
              height={50} 
              priority 
              className={`h-12 w-auto transition-all duration-300 ${
                isOpen ? 'brightness-0 invert' : 'brightness-0'
              }`}
            />
          </Link>

          {/* Hamburger Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="touch-target p-2 relative w-8 h-8"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            {/* Hamburger Icon */}
            <div className={`absolute inset-0 flex flex-col justify-center items-center transition-opacity duration-300 ${
              isOpen ? 'opacity-0' : 'opacity-100'
            }`}>
              <span className="block w-7 h-0.5 bg-black" />
              <span className="block w-7 h-0.5 bg-black mt-1.5" />
              <span className="block w-7 h-0.5 bg-black mt-1.5" />
            </div>
            {/* X Icon */}
            <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
              isOpen ? 'opacity-100' : 'opacity-0'
            }`}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
          </button>
        </div>

      </nav>

      {/* Page Blur Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      )}

      {/* Mobile Menu Slide-in from Top */}
      <div className={`fixed top-0 left-0 right-0 bg-black z-40 transition-all duration-300 ${
        isOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}>
        <div className="px-4 py-6 mt-16 safe-top">
          {/* Menu Items */}
          <nav className="mb-6">
            <ul className="space-y-4">
              {menuItems.map((item) => (
                <li key={item.href}>
                  {item.href.startsWith('#') ? (
                    <Link
                      href={item.href}
                      onClick={(e) => handleSmoothScroll(e, item.href, item.section || undefined)}
                      className="block text-lg font-semibold text-white hover:text-gray-300 transition-colors duration-200 py-3 touch-target"
                      aria-label={`Navigate to ${item.label} section`}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => {
                        setIsOpen(false);
                        router.push(item.href);
                      }}
                      className="block text-lg font-semibold text-white hover:text-gray-300 transition-colors duration-200 py-3 touch-target"
                      aria-label={`Navigate to ${item.label}`}
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>



          {/* Auth Button */}
          {!loading && (
            !user ? (
              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push('/auth');
                }}
                className="w-full bg-white text-black font-bold text-lg py-4 px-6 rounded-full hover:bg-gray-200 transition-colors duration-200 touch-target"
                aria-label="Sign in to Santelle"
              >
                Sign In
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsOpen(false);
                  window.location.href = STRIPE_PORTAL_URL;
                }}
                className="w-full bg-white text-black font-bold text-lg py-4 px-6 rounded-full hover:bg-gray-200 transition-colors duration-200 touch-target"
                aria-label="Account settings"
              >
                Account
              </button>
            )
          )}
          
        </div>
      </div>

      {/* Safe Area Spacer */}
      <div className="h-16 safe-top" />
    </>
  );
}
