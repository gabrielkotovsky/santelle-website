'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const menuItems = [
  { href: '#mobile-stats', label: 'Why Santelle', section: 'stats' },
  { href: '#mobile-meet', label: 'Meet Santelle', section: 'meet' },
  { href: '#mobile-how-it-works', label: 'How It Works', section: 'how-it-works' },
  { href: '#mobile-team', label: 'Our Team', section: 'team' },
];

export default function MobileNavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [animatedBackground, setAnimatedBackground] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 1);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
          const elementTop = targetSection.getBoundingClientRect().top + window.scrollY - headerHeight;
          
          // Smooth scroll to element
          window.scrollTo({
            top: elementTop,
            behavior: 'smooth'
          });
        } else {
          // Fallback: scroll to unified card
          const elementTop = unifiedCard.offsetTop - headerHeight;
          window.scrollTo({
            top: elementTop,
            behavior: 'smooth'
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

  const handleGetAccess = () => {
    setIsOpen(false);
    
    // Wait for menu close animation, then trigger waitlist
    setTimeout(() => {
      window.dispatchEvent(new Event('openWaitlist'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Focus on mobile email input if available
      setTimeout(() => {
        const mobileEmailInput = document.getElementById('waitlist-email-mobile') as HTMLInputElement;
        const desktopEmailInput = document.getElementById('waitlist-email') as HTMLInputElement;
        
        if (mobileEmailInput) {
          mobileEmailInput.focus();
        } else if (desktopEmailInput) {
          desktopEmailInput.focus();
        }
      }, 600); // Wait for scroll to complete
    }, 300);
  };

  return (
    <>
      {/* Mobile Navigation Bar */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isOpen ? 'bg-black' : scrolled ? 'bg-white/20 backdrop-blur-lg' : 'bg-transparent'
        } safe-top border-none`}
      >
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image 
              src="/logo-dark.svg" 
              alt="Santelle Logo" 
              width={120} 
              height={40} 
              priority 
              className={`h-8 w-auto transition-all duration-300 ${
                isOpen ? 'brightness-0 invert' : ''
              }`}
            />
          </Link>

          {/* Hamburger Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="touch-target p-2 rounded-lg bg-white/20 backdrop-blur-sm"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            <div className="w-6 h-6 flex flex-col justify-center items-center">
              <span className={`block w-5 h-0.5 transition-all duration-300 ${
                isOpen ? 'rotate-45 translate-y-1 bg-white' : 'bg-black'
              }`} />
              <span className={`block w-5 h-0.5 transition-all duration-300 mt-1 ${
                isOpen ? 'opacity-0 bg-white' : 'bg-black'
              }`} />
              <span className={`block w-5 h-0.5 transition-all duration-300 mt-1 ${
                isOpen ? '-rotate-45 -translate-y-1 bg-white' : 'bg-black'
              }`} />
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
                  <Link
                    href={item.href}
                    onClick={(e) => handleSmoothScroll(e, item.href, item.section)}
                    className="block text-lg font-semibold text-white hover:text-gray-300 transition-colors duration-200 py-3 touch-target"
                    aria-label={`Navigate to ${item.label} section`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Background Toggle Button */}
          <button
            onClick={() => {
              setAnimatedBackground(!animatedBackground);
              // Dispatch event to communicate with parent component
              window.dispatchEvent(new CustomEvent('toggleBackground', { 
                detail: { animated: !animatedBackground } 
              }));
            }}
            className="w-full bg-white/20 backdrop-blur-sm text-white font-bold text-base py-3 px-6 rounded-full hover:bg-white/30 transition-colors duration-200 touch-target mb-4"
            aria-label={animatedBackground ? "Switch to static background" : "Switch to animated background"}
          >
            {animatedBackground ? "🖼️ Switch to Static" : "🎬 Switch to Animated"}
          </button>

          {/* Get Early Access Button */}
          <button
            onClick={handleGetAccess}
            className="w-full bg-white text-black font-bold text-lg py-4 px-6 rounded-full hover:bg-gray-200 transition-colors duration-200 touch-target shadow-lg"
            aria-label="Get early access to Santelle"
          >
            Get Early Access
          </button>
          
          {/* Close Menu Hint */}
          <p className="text-gray-400 text-sm text-center mt-4">
            Tap outside to close menu
          </p>
        </div>
      </div>

      {/* Safe Area Spacer */}
      <div className="h-16 safe-top" />
    </>
  );
}
