'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import NavBar from './NavBar';
import MobileNavBar from './MobileNavBar';

const shouldHideNavigation = (pathname: string | null) => {
  if (!pathname) return false;
  if (
    pathname === '/complete-profile' ||
    pathname === '/unsubscribe' ||
    pathname === '/resubscribe' ||
    pathname === '/account'
  ) {
    return true;
  }

  if (pathname.startsWith('/quiz') || pathname.startsWith('/plans')) {
    return true;
  }

  return false;
};

export default function ConditionalNavigation() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Don't render anything until client-side hydration is complete
  if (!mounted) {
    if (shouldHideNavigation(pathname)) {
      return null;
    }

    return (
      <>
        {/* Desktop Navigation */}
        <div className="hidden md:block">
          <NavBar />
        </div>
        
        {/* Mobile Navigation */}
        <div className="block md:hidden">
          <MobileNavBar />
        </div>
      </>
    );
  }
  
  // Hide navigation on complete-profile, unsubscribe, resubscribe, and account pages after hydration
  if (shouldHideNavigation(pathname)) {
    return null;
  }

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden md:block">
        <NavBar />
      </div>
      
      {/* Mobile Navigation */}
      <div className="block md:hidden">
        <MobileNavBar />
      </div>
    </>
  );
}
