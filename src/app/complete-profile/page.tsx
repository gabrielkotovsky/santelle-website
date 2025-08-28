'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

function CompleteProfilePageContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  
  const [formData, setFormData] = useState({
    firstName: '',
    source: '',
    sourceOther: '',
    age_range: '',
    interest: '',
    purchasing_intent: '',
    communication_channel: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!email) {
      setErrorMessage('No email address provided. Please use the link from your welcome email.');
    }
  }, [email]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setErrorMessage('Email address is required');
      return;
    }

    if (!formData.firstName.trim()) {
      setErrorMessage('First name is required');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/collect-additional-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          firstName: formData.firstName.trim(),
          source: formData.source === 'Other' && formData.sourceOther.trim() ? formData.sourceOther.trim() : formData.source.trim() || null,
          age_range: formData.age_range || null,
          interest: formData.interest || null,
          purchasing_intent: formData.purchasing_intent || null,
          communication_channel: formData.communication_channel || null
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        // Reset form
        setFormData({ 
          firstName: '', 
          source: '', 
          sourceOther: '',
          age_range: '',
          interest: '',
          purchasing_intent: '',
          communication_channel: ''
        });
      } else {
        setErrorMessage(result.error || 'Failed to update profile. Please try again.');
        setSubmitStatus('error');
      }
    } catch {
      setErrorMessage('Network error. Please check your connection and try again.');
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen relative flex items-center justify-center px-4">
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/background_desktop.mp4" type="video/mp4" />
          <Image src="/background_desktop_static.webp" alt="Background" fill className="object-cover" />
        </video>
        
        {/* Blur View Overlay - Same as other pages */}
        <div className="bg-white/30 absolute inset-0 backdrop-blur-lg z-5" />
        
        {/* Content Overlay */}
        <div className="relative z-10 max-w-md w-full bg-white/20 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 p-8 text-center">
          <div className="mb-6">
            <Image
              src="/logo-dark.svg"
              alt="Santelle"
              width={200}
              height={50}
              className="mx-auto"
            />
          </div>
          <h1 className="text-2xl font-bold text-[#721422] mb-4">Profile Completion</h1>
          <p className="text-gray-600 mb-6">{errorMessage}</p>
          <Link
            href="/"
            className="inline-block bg-[#721422] text-white px-6 py-3 rounded-full hover:bg-[#8a1a2a] transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="/background_desktop.mp4" type="video/mp4" />
        <Image src="/background_desktop_static.webp" alt="Background" fill className="object-cover" />
      </video>
      
      {/* Blur View Overlay - Same as other pages */}
      <div className="bg-white/30 absolute inset-0 backdrop-blur-lg z-5" />
      
      {/* Content Overlay */}
      <div className="relative z-10 max-w-md w-full bg-white/20 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 p-8">
        <div className="text-center mb-8">
          <Image
            src="/logo-dark.svg"
            alt="Santelle"
            width={200}
            height={50}
            className="mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-[#721422] mb-2">Complete Your Profile</h1>
          <p className="text-gray-600 text-sm">
            Help us get to know you better!
          </p>
        </div>

        {submitStatus === 'success' ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-green-800 mb-2">Profile Updated!</h2>
            <Link
              href="/"
              className="inline-block bg-[#721422] text-white px-6 py-3 rounded-full hover:bg-[#8a1a2a] transition-colors"
            >
              Return to Home
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#721422]/20 focus:border-[#721422] transition-colors"
                placeholder="Enter your first name"
                required
                disabled={isSubmitting}
              />
            </div>



            <div>
              <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-2">
                How did you hear about us?
              </label>
              <select
                id="source"
                name="source"
                value={formData.source}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#721422]/20 focus:border-[#721422] transition-colors"
                disabled={isSubmitting}
              >
                <option value="">Select an option</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Instagram">Instagram</option>
                <option value="Friend">Friend</option>
                <option value="Other">Other</option>
              </select>
              
              {formData.source === 'Other' && (
                <div className="mt-3">
                  <input
                    type="text"
                    id="sourceOther"
                    name="sourceOther"
                    value={formData.sourceOther || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#721422]/20 focus:border-[#721422] transition-colors"
                    placeholder="Please specify..."
                    disabled={isSubmitting}
                  />
                </div>
              )}
            </div>

            <div>
              <label htmlFor="age_range" className="block text-sm font-medium text-gray-700 mb-2">
                Your Age Range
              </label>
              <select
                id="age_range"
                name="age_range"
                value={formData.age_range}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#721422]/20 focus:border-[#721422] transition-colors"
                disabled={isSubmitting}
              >
                <option value="">Select your age range</option>
                <option value="18-24">18–24</option>
                <option value="25-34">25–34</option>
                <option value="35-44">35–44</option>
                <option value="45-54">45–54</option>
                <option value="55-64">55–64</option>
                <option value="65+">65+</option>
              </select>
            </div>

            <div>
              <label htmlFor="interest" className="block text-sm font-medium text-gray-700 mb-2">
                What Interests You Most about Santelle?
              </label>
              <select
                id="interest"
                name="interest"
                value={formData.interest}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#721422]/20 focus:border-[#721422] transition-colors"
                disabled={isSubmitting}
              >
                <option value="">Choose one</option>
                <option value="Instant at-home answers">Instant At-Home Answers</option>
                <option value="Ongoing tracking & trends">Tracking & Prevention</option>
                <option value="AI Interpretation">AI-Powered Interpretation</option>
                <option value="Fertility & TTC support">Fertility / TTC support</option>
                <option value="Community & Education">Community & Education</option>
              </select>
            </div>

            <div>
              <label htmlFor="purchasing_intent" className="block text-sm font-medium text-gray-700 mb-2">
                Interest in Using Santelle
              </label>
              <select
                id="purchasing_intent"
                name="purchasing_intent"
                value={formData.purchasing_intent}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#721422]/20 focus:border-[#721422] transition-colors"
                disabled={isSubmitting}
              >
                <option value="">Select your interest level</option>
                <option value="Monthly subscription">Excited for a monthly subscription</option>
                <option value="Occasional purchase">Might purchase occasionally</option>
                <option value="Just exploring">Just exploring for now</option>
                <option value="Not interested">Not interested in purchasing</option>
              </select>
            </div>

            <div>
              <label htmlFor="communication_channel" className="block text-sm font-medium text-gray-700 mb-2">
                Stay Connected
              </label>
              <select
                id="communication_channel"
                name="communication_channel"
                value={formData.communication_channel}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#721422]/20 focus:border-[#721422] transition-colors"
                disabled={isSubmitting}
              >
                <option value="">Select your preferred channel</option>
                <option value="Email">Email updates</option>
                <option value="WhatsApp">WhatsApp messages</option>
                <option value="Social Media">Follow on social media</option>
              </select>
            </div>

            {errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm">{errorMessage}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#721422] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#8a1a2a] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Updating...' : 'Complete Profile'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function CompleteProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen relative flex items-center justify-center px-4">
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/background_desktop.mp4" type="video/mp4" />
          <Image src="/background_desktop_static.webp" alt="Background" fill className="object-cover" />
        </video>
        
        {/* Blur View Overlay - Same as other pages */}
        <div className="bg-white/30 absolute inset-0 backdrop-blur-lg z-5" />
        
        {/* Content Overlay */}
        <div className="relative z-10 max-w-md w-full bg-white/20 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 p-8 text-center">
          <div className="mb-6">
            <Image
              src="/logo-dark.svg"
              alt="Santelle"
              width={200}
              height={50}
              className="mx-auto"
            />
          </div>
          <h1 className="text-2xl font-bold text-[#721422] mb-4">Loading...</h1>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#721422] mx-auto"></div>
        </div>
      </div>
    }>
      <CompleteProfilePageContent />
    </Suspense>
  );
}
