'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { analytics } from '../../lib/analytics';


export default function PrivacyPolicy() {
  // Track page view on component mount
  useEffect(() => {
    analytics.trackLegalPageView('privacy');
  }, []);

  return (
    <div className="relative min-h-screen w-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background - Always Video */}
      <div className="fixed inset-0 -z-10 flex items-center justify-center" style={{
        top: 0,
        bottom: 'env(safe-area-inset-bottom)',
        left: 'env(safe-area-inset-left)',
        right: 'env(safe-area-inset-right)'
      }}>
        {/* Desktop Video Background */}
        <video
          src="/background_desktop.mp4"
          autoPlay
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover hidden md:block"
          style={{ 
            width: '100vw',
            height: '100dvh'
          }}
        />
        
        {/* Mobile Background Image */}
        <div 
          className="absolute inset-0 w-full h-full block md:hidden"
          style={{
            backgroundImage: 'url(/background-mobile.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            width: '100vw',
            height: '100dvh'
          }}
        />
        
        {/* Overlay - Blur only, no color */}
        <div className="absolute inset-0 backdrop-blur-lg" />
      </div>
      
      {/* Privacy Policy Content */}
      <main className="relative z-20 max-w-4xl mx-auto px-8 py-24 min-h-[1100px] text-black bg-white/30 backdrop-blur-2xl border border-white/50 rounded-2xl mt-32 mb-20 text-lg">
        <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
        <div className="text-sm text-[#721422]/60 mb-6">Last updated: January 2025</div>
        
        <p className="mb-4">At Santelle (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, use our services, or interact with us.</p>
        
        <h2 className="text-xl font-semibold mt-6 mb-2">1. Information We Collect</h2>
        <h3 className="text-lg font-semibold mt-4 mb-2">1.1 Personal Information</h3>
        <ul className="list-disc pl-6 mb-4 text-base">
          <li>Email address (required for waitlist and communications)</li>
          <li>Name (optional, for personalized communications)</li>
          <li>Contact information provided through our contact form</li>
          <li>Communication preferences and marketing consent</li>
        </ul>
        
        <h3 className="text-lg font-semibold mt-4 mb-2">1.2 Technical Information</h3>
        <ul className="list-disc pl-6 mb-4 text-base">
          <li>IP address and approximate location (country/region)</li>
          <li>Browser type and version</li>
          <li>Operating system and version</li>
          <li>Device type (desktop, mobile, tablet)</li>
          <li>Screen resolution and display settings</li>
          <li>Language preference and timezone</li>
          <li>Referring website or source (if applicable)</li>
          <li>Pages visited and time spent on our website</li>
          <li>User agent string and browser capabilities</li>
          <li>Session duration and navigation patterns</li>
        </ul>
        <p className="mb-4 text-sm text-[#721422]/80">This technical information is collected automatically when you visit our website and helps us improve your experience, ensure security, and analyze website performance. This data collection does not require your explicit consent as it is necessary for the proper functioning of our website.</p>
        
        <h3 className="text-lg font-semibold mt-4 mb-2">1.3 Analytics and Tracking Data</h3>
        <ul className="list-disc pl-6 mb-4 text-base">
          <li>Google Analytics 4 tracking data (page views, user interactions, conversion events)</li>
          <li>Waitlist signup events and associated technical data</li>
          <li>Form submission events (contact forms, newsletter signups)</li>
          <li>Button click events and user interaction patterns</li>
          <li>Email domain information for analytics purposes</li>
          <li>Geographic data derived from IP addresses</li>
        </ul>
        <p className="mb-4 text-sm text-[#721422]/80">We use Google Analytics 4 to understand how visitors interact with our website. This helps us improve our services and user experience. You can opt out of Google Analytics tracking by installing the Google Analytics Opt-out Browser Add-on.</p>

        <h3 className="text-lg font-semibold mt-4 mb-2">1.4 Health Information</h3>
        <p className="mb-4">We do not collect sensitive health information on this website. Any health-related data collection will only occur through our future product offerings and will be governed by separate, comprehensive privacy policies and legal frameworks.</p>
        
        <h2 className="text-xl font-semibold mt-6 mb-2">2. How We Use Your Information</h2>
        <ul className="list-disc pl-6 mb-4 text-base">
          <li>Provide and maintain our services</li>
          <li>Process your waitlist registration and send updates</li>
          <li>Respond to your inquiries and provide customer support</li>
          <li>Send newsletters, product updates, and marketing communications (with your consent)</li>
          <li>Improve our website, services, and user experience</li>
          <li>Analyze usage patterns and trends</li>
          <li>Comply with legal obligations and protect our rights</li>
        </ul>
        
        <h3 className="text-lg font-semibold mt-4 mb-2">2.1 Technical Data Usage</h3>
        <p className="mb-4 text-base">We use the technical information we collect to:</p>
        <ul className="list-disc pl-6 mb-4 text-base">
          <li>Ensure website compatibility across different devices and browsers</li>
          <li>Optimize website performance and user experience</li>
          <li>Detect and prevent fraud, abuse, and security threats</li>
          <li>Analyze geographic distribution of our users</li>
          <li>Improve website design and functionality based on device usage patterns</li>
          <li>Monitor website performance and identify technical issues</li>
          <li>Understand user behavior and preferences</li>
        </ul>

        <h3 className="text-lg font-semibold mt-4 mb-2">2.2 Analytics Data Usage</h3>
        <p className="mb-4 text-base">We use Google Analytics 4 and our custom tracking to:</p>
        <ul className="list-disc pl-6 mb-4 text-base">
          <li>Track waitlist signup conversions and user engagement</li>
          <li>Analyze which pages and features are most popular</li>
          <li>Understand user journey and conversion funnels</li>
          <li>Measure the effectiveness of our marketing campaigns</li>
          <li>Identify opportunities to improve user experience</li>
          <li>Generate insights about our audience demographics and behavior</li>
          <li>Optimize website content and functionality based on user data</li>
        </ul>
        
        <h2 className="text-xl font-semibold mt-6 mb-2">3. Information Sharing and Disclosure</h2>
        <p className="mb-4">We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:</p>
        <ul className="list-disc pl-6 mb-4 text-base">
          <li><strong>Service Providers:</strong> With trusted third-party service providers who assist us in operating our website and providing services, including:
            <ul className="list-disc pl-6 mt-2 text-sm">
              <li>Google Analytics (for website analytics and user behavior tracking)</li>
              <li>Resend (for email delivery services)</li>
              <li>Supabase (for database and authentication services)</li>
            </ul>
          </li>
          <li><strong>Legal Requirements:</strong> When required by law, court order, or government regulation</li>
          <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
          <li><strong>Safety and Security:</strong> To protect our rights, property, or safety, or that of our users or the public</li>
        </ul>
        
        <h2 className="text-xl font-semibold mt-6 mb-2">4. Data Security</h2>
        <p className="mb-4">We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:</p>
        <ul className="list-disc pl-6 mb-4 text-base">
          <li>Encryption of data in transit and at rest</li>
          <li>Regular security assessments and updates</li>
          <li>Access controls and authentication procedures</li>
          <li>Secure hosting and infrastructure</li>
        </ul>
        
        <h2 className="text-xl font-semibold mt-6 mb-2">5. Your Rights and Choices</h2>
        <p className="mb-4">You have the following rights regarding your personal information:</p>
        <ul className="list-disc pl-6 mb-4 text-base">
          <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
          <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
          <li><strong>Deletion:</strong> Request deletion of your personal information</li>
          <li><strong>Portability:</strong> Request transfer of your data to another service</li>
          <li><strong>Objection:</strong> Object to processing of your personal information</li>
          <li><strong>Withdrawal of Consent:</strong> Withdraw consent for marketing communications at any time</li>
          <li><strong>Analytics Opt-out:</strong> Opt out of Google Analytics tracking using browser add-ons or settings</li>
        </ul>
        <p className="mb-4">To exercise these rights, please submit a <Link href="/contact-us" className="underline hover:text-[#511828]">contact form</Link> with your request.</p>
        
        <h3 className="text-lg font-semibold mt-4 mb-2">5.1 Data Retention</h3>
        <p className="mb-4">We retain your information for as long as necessary to provide our services and fulfill the purposes outlined in this Privacy Policy. Specifically:</p>
        <ul className="list-disc pl-6 mb-4 text-base">
          <li><strong>Waitlist Data:</strong> Retained until you request deletion or unsubscribe</li>
          <li><strong>Technical Data:</strong> Retained for up to 26 months for analytics purposes</li>
          <li><strong>Google Analytics Data:</strong> Subject to Google&apos;s data retention policies (typically 26 months)</li>
          <li><strong>Contact Form Data:</strong> Retained for up to 2 years for customer service purposes</li>
        </ul>
        
        <h2 className="text-xl font-semibold mt-6 mb-2">6. Marketing Communications</h2>
        <p className="mb-4">We may send you marketing communications about our products and services if you have provided consent. You can unsubscribe from these communications at any time by:</p>
        <ul className="list-disc pl-6 mb-4 text-base">
          <li>Clicking the unsubscribe link in any marketing email</li>
          <li>Submitting a <Link href="/contact-us" className="underline hover:text-[#511828]">contact form</Link> requesting removal</li>
        </ul>
        
        <h2 className="text-xl font-semibold mt-6 mb-2">7. Cookies and Tracking Technologies</h2>
        <p className="mb-4">We use cookies and similar tracking technologies to enhance your experience on our website. These technologies help us:</p>
        <ul className="list-disc pl-6 mb-4 text-base">
          <li>Remember your preferences and settings</li>
          <li>Analyze website traffic and usage patterns</li>
          <li>Provide personalized content and advertisements</li>
          <li>Improve website functionality and performance</li>
          <li>Track user interactions and conversion events</li>
          <li>Measure the effectiveness of our marketing efforts</li>
        </ul>
        <p className="mb-4">You can control cookie settings through your browser preferences. However, disabling certain cookies may affect website functionality.</p>
        
        <h3 className="text-lg font-semibold mt-4 mb-2">7.1 Google Analytics</h3>
        <p className="mb-4">We use Google Analytics 4 to collect information about how visitors use our website. Google Analytics uses cookies and similar technologies to collect and analyze information about your use of our website, including:</p>
        <ul className="list-disc pl-6 mb-4 text-base">
          <li>Pages you visit and time spent on each page</li>
          <li>Your geographic location (country/region level)</li>
          <li>Device and browser information</li>
          <li>How you arrived at our website (referrer information)</li>
          <li>User interactions and conversion events</li>
        </ul>
        <p className="mb-4">Google Analytics data is processed by Google in accordance with their <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#511828]">Privacy Policy</a>. You can opt out of Google Analytics tracking by:</p>
        <ul className="list-disc pl-6 mb-4 text-base">
          <li>Installing the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#511828]">Google Analytics Opt-out Browser Add-on</a></li>
          <li>Using browser settings to block third-party cookies</li>
          <li>Using privacy-focused browser extensions</li>
        </ul>
        
        <h2 className="text-xl font-semibold mt-6 mb-2">8. International Data Transfers</h2>
        <p className="mb-4">Your information may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable data protection laws and implement appropriate safeguards to protect your information.</p>
        
        <h2 className="text-xl font-semibold mt-6 mb-2">9. Children&apos;s Privacy</h2>
        <p className="mb-4">Our services are not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.</p>
        
        <h2 className="text-xl font-semibold mt-6 mb-2">10. Changes to This Privacy Policy</h2>
        <p className="mb-4">We may update this Privacy Policy from time to time to reflect changes in our practices or applicable laws. We will notify you of any material changes by posting the updated policy on our website and updating the &quot;Last updated&quot; date.</p>
        
        <h2 className="text-xl font-semibold mt-6 mb-2">11. Contact Us</h2>
        <p className="mb-4">If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us through our <Link href="/contact-us" className="underline hover:text-[#511828]">contact form</Link>.</p>
        
        <p className="mb-4 text-sm text-[#721422]/60">This Privacy Policy is effective as of August 2025 and will remain in effect except with respect to any changes in its provisions in the future.</p>
      </main>
        {/* Bottom Glassmorphic Card */}
        <section className="w-full pt-0 pb-0 px-0 md:px-0 relative z-20" style={{minWidth: '100vw', width: '100vw'}}>
          <div className="bg-white/30 backdrop-blur-lg rounded-3xl border border-white/50 w-full">
            <div className="p-4 md:p-8 flex flex-col items-center gap-6 text-center">
              {/* Logo */}
              <div className="w-full flex justify-center mb-2">
                <Image src="/logo-dark.svg" alt="Santelle Logo" width={180} height={60} className="object-contain" style={{height: 60}} />
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