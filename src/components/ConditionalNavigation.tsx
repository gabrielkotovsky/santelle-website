'use client';

import NavBar from './NavBar';
import MobileNavBar from './MobileNavBar';

export default function ConditionalNavigation() {
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
