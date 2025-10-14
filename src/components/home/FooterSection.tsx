'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function FooterSection() {
  const focusHeroEmailInput = () => {
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
    <section className="w-full pt-4 pb-0 px-0 md:px-0 relative z-20" style={{minWidth: '100vw', width: '100vw'}}>
      <div className="bg-white/30 backdrop-blur-lg border border-white/50 w-full">
        <div className="p-4 md:p-8 flex flex-col items-center gap-6 text-center">
          {/* Logo */}
          <div className="w-full flex justify-center mb-2">
            <Image src="/logo-dark.svg" alt="Santelle Logo" width={180} height={60} style={{objectFit: 'contain', height: 60}} priority />
          </div>

          {/* Take the quiz to discover your ideal plan Button */}
          <button
            onClick={focusHeroEmailInput}
            className="bg-[#721422] text-white font-bold text-lg px-8 py-4 rounded-full hover:bg-[#8a1a2a] transition-colors duration-200 cursor-pointer"
          >
            Take the quiz to discover your ideal plan
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
  );
}
