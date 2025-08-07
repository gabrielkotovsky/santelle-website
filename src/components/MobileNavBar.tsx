'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const menuItems = [
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#team', label: 'Our Team' },
];

export default function MobileNavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 1);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsOpen(false);
    const id = href.replace('#', '');
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleGetAccess = () => {
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      window.dispatchEvent(new Event('openWaitlist'));
      const emailInput = document.getElementById('waitlist-email') as HTMLInputElement;
      if (emailInput) {
        emailInput.focus();
      }
    }, 600);
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
              width={80} 
              height={27} 
              priority 
              className={`h-7 w-auto transition-all duration-300 ${
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
        <div className="px-4 py-6 mt-16">
          {/* Menu Items */}
          <nav className="mb-6">
            <ul className="space-y-4">
              {menuItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={(e) => handleSmoothScroll(e, item.href)}
                    className="block text-lg font-semibold text-white hover:text-gray-300 transition-colors duration-200 py-2"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Get Early Access Button */}
          <button
            onClick={handleGetAccess}
            className="w-full bg-white text-black font-bold text-lg py-4 px-6 rounded-full hover:bg-gray-200 transition-colors duration-200 touch-target"
          >
            Get Early Access
          </button>
        </div>
      </div>

      {/* Safe Area Spacer */}
      <div className="h-16 safe-top" />
    </>
  );
}
