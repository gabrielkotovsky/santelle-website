// Google Analytics 4 utilities for Santelle
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: Record<string, unknown>[];
  }
}

// Initialize Google Analytics
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || '';

// Track page views
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag && GA_TRACKING_ID) {
    window.gtag('config', GA_TRACKING_ID, {
      page_location: url,
    });
  }
};

// Track custom events
export const trackEvent = (action: string, parameters?: {
  event_category?: string;
  event_label?: string;
  value?: number;
  [key: string]: unknown;
}) => {
  if (typeof window !== 'undefined' && window.gtag && GA_TRACKING_ID) {
    window.gtag('event', action, {
      event_category: parameters?.event_category || 'engagement',
      event_label: parameters?.event_label,
      value: parameters?.value,
      ...parameters,
    });
  }
};

// Specific tracking functions for Santelle events
export const analytics = {
  // Waitlist signup tracking
  trackWaitlistSignup: (email: string, technicalData?: Record<string, unknown>) => {
    trackEvent('waitlist_signup', {
      event_category: 'conversion',
      event_label: 'waitlist',
      custom_parameters: {
        email_domain: email.split('@')[1],
        device_type: technicalData && typeof technicalData === 'object' && 'device' in technicalData 
          ? (technicalData.device as Record<string, unknown>)?.type as string 
          : 'unknown',
        browser: technicalData && typeof technicalData === 'object' && 'browser' in technicalData 
          ? (technicalData.browser as Record<string, unknown>)?.name as string 
          : 'unknown',
        os: technicalData && typeof technicalData === 'object' && 'os' in technicalData 
          ? (technicalData.os as Record<string, unknown>)?.name as string 
          : 'unknown',
        country: technicalData && typeof technicalData === 'object' && 'country' in technicalData 
          ? technicalData.country as string 
          : 'unknown',
      }
    });
  },

  // Contact form submission
  trackContactSubmission: (formType: 'contact' | 'waitlist') => {
    trackEvent('form_submission', {
      event_category: 'conversion',
      event_label: formType,
    });
  },

  // Page navigation
  trackPageView: (pageName: string) => {
    trackEvent('page_view', {
      event_category: 'engagement',
      event_label: pageName,
    });
  },

  // Button clicks
  trackButtonClick: (buttonName: string, location: string) => {
    trackEvent('button_click', {
      event_category: 'engagement',
      event_label: buttonName,
      custom_parameters: {
        button_location: location,
      }
    });
  },

  // Email interactions
  trackEmailClick: (emailType: 'waitlist' | 'contact') => {
    trackEvent('email_click', {
      event_category: 'engagement',
      event_label: emailType,
    });
  },

  // Video interactions
  trackVideoInteraction: (action: 'play' | 'pause' | 'complete', videoName: string) => {
    trackEvent(`video_${action}`, {
      event_category: 'engagement',
      event_label: videoName,
    });
  },

  // Privacy policy and legal pages
  trackLegalPageView: (pageType: 'privacy' | 'contact') => {
    trackEvent('legal_page_view', {
      event_category: 'compliance',
      event_label: pageType,
    });
  },

  // Enhanced ecommerce for future use
  trackPurchaseIntent: (productName: string, price: number) => {
    trackEvent('add_to_cart', {
      event_category: 'ecommerce',
      currency: 'EUR',
      value: price,
      items: [{
        item_id: 'santelle-kit',
        item_name: productName,
        category: 'health-testing',
        price: price,
        quantity: 1,
      }]
    });
  },
};

// Helper function to check if analytics is available
export const isAnalyticsAvailable = (): boolean => {
  return typeof window !== 'undefined' && 
         typeof window.gtag === 'function' &&
         Array.isArray(window.dataLayer) &&
         !!GA_TRACKING_ID;
};
