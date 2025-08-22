'use client';

import { useLoading } from '../lib/loadingContext';
import NavBar from './NavBar';
import MobileNavBar from './MobileNavBar';

export default function ConditionalNavigation() {
  const { isLoading } = useLoading();

  // Don't render navigation while loading
  if (isLoading) {
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
