'use client';

import { useEffect } from 'react';
import { analytics } from '@/lib/analytics';

export default function PerformanceMonitor() {
  useEffect(() => {
    // Only run in production
    if (process.env.NODE_ENV !== 'production') return;

    // Track Core Web Vitals
    const trackWebVitals = () => {
      // First Contentful Paint (FCP)
      if ('PerformanceObserver' in window) {
        try {
          const fcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry) => {
              if (entry.name === 'first-contentful-paint') {
                const fcp = entry.startTime;
                analytics.trackPerformance('FCP', fcp);
              }
            });
          });
          fcpObserver.observe({ entryTypes: ['paint'] });
        } catch (e) {
          console.warn('FCP tracking failed:', e);
        }

        // Largest Contentful Paint (LCP)
        try {
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            if (lastEntry) {
              const lcp = lastEntry.startTime;
              analytics.trackPerformance('LCP', lcp);
            }
          });
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
          console.warn('LCP tracking failed:', e);
        }

        // First Input Delay (FID)
        try {
          const fidObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry) => {
              const fid = entry.processingStart - entry.startTime;
              analytics.trackPerformance('FID', fid);
            });
          });
          fidObserver.observe({ entryTypes: ['first-input'] });
        } catch (e) {
          console.warn('FID tracking failed:', e);
        }

        // Cumulative Layout Shift (CLS)
        try {
          let clsValue = 0;
          const clsObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry: PerformanceEntry & { hadRecentInput?: boolean; value?: number }) => {
              if (!entry.hadRecentInput) {
                clsValue += entry.value || 0;
              }
            });
            analytics.trackPerformance('CLS', clsValue);
          });
          clsObserver.observe({ entryTypes: ['layout-shift'] });
        } catch (e) {
          console.warn('CLS tracking failed:', e);
        }
      }
    };

    // Track Time to First Byte (TTFB)
    const trackTTFB = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        const ttfb = navigation.responseStart - navigation.requestStart;
        analytics.trackPerformance('TTFB', ttfb);
      }
    };

    // Track Time to Interactive (TTI)
    const trackTTI = () => {
      // Simple TTI approximation using DOMContentLoaded and load events
      const domContentLoaded = performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart;
      const loadComplete = performance.timing.loadEventEnd - performance.timing.navigationStart;
      
      analytics.trackPerformance('DOMContentLoaded', domContentLoaded);
      analytics.trackPerformance('LoadComplete', loadComplete);
    };

    // Track bundle size and loading performance
    const trackBundlePerformance = () => {
      if ('performance' in window && 'getEntriesByType' in performance) {
        const resources = performance.getEntriesByType('resource');
        const jsResources = resources.filter(resource => 
          resource.name.endsWith('.js') || resource.name.includes('chunk')
        );
        
        jsResources.forEach(resource => {
          const duration = resource.duration;
          const transferSize = (resource as PerformanceResourceTiming & { transferSize?: number }).transferSize || 0;
          
          analytics.trackPerformance('JSResource', {
            name: resource.name,
            duration,
            transferSize,
            url: resource.name
          });
        });
      }
    };

    // Track memory usage (if available)
    const trackMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as Performance & { memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
        if (memory) {
          analytics.trackPerformance('MemoryUsage', {
            usedJSHeapSize: memory.usedJSHeapSize,
            totalJSHeapSize: memory.totalJSHeapSize,
            jsHeapSizeLimit: memory.jsHeapSizeLimit
          });
        }
      }
    };

    // Track network information (if available)
    const trackNetworkInfo = () => {
      if ('connection' in navigator) {
        const connection = (navigator as Navigator & { connection?: { effectiveType: string; downlink: number; rtt: number; saveData: boolean } }).connection;
        if (connection) {
          analytics.trackPerformance('NetworkInfo', {
            effectiveType: connection.effectiveType,
            downlink: connection.downlink,
            rtt: connection.rtt,
            saveData: connection.saveData
          });
        }
      }
    };

    // Initialize tracking
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        trackWebVitals();
        trackTTFB();
        trackTTI();
        trackBundlePerformance();
        trackMemoryUsage();
        trackNetworkInfo();
      });
    } else {
      trackWebVitals();
      trackTTFB();
      trackTTI();
      trackBundlePerformance();
      trackMemoryUsage();
      trackNetworkInfo();
    }

    // Track performance on page unload
    window.addEventListener('beforeunload', () => {
      // Send final performance data
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        const totalTime = navigation.loadEventEnd - navigation.navigationStart;
        analytics.trackPerformance('TotalPageLoad', totalTime);
      }
    });

    // Track long tasks
    if ('PerformanceObserver' in window) {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.duration > 50) { // Tasks longer than 50ms
              analytics.trackPerformance('LongTask', {
                duration: entry.duration,
                startTime: entry.startTime,
                name: entry.name
              });
            }
          });
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        console.warn('Long task tracking failed:', e);
      }
    }

  }, []);

  // This component doesn't render anything
  return null;
}

// Hook for custom performance tracking
export const usePerformanceTracking = () => {
  const trackCustomMetric = (name: string, value: number | object) => {
    analytics.trackPerformance(name, value);
  };

  const trackUserInteraction = (action: string, duration: number) => {
    analytics.trackPerformance('UserInteraction', {
      action,
      duration,
      timestamp: Date.now()
    });
  };

  const trackComponentRender = (componentName: string, renderTime: number) => {
    analytics.trackPerformance('ComponentRender', {
      component: componentName,
      renderTime,
      timestamp: Date.now()
    });
  };

  return {
    trackCustomMetric,
    trackUserInteraction,
    trackComponentRender
  };
};
