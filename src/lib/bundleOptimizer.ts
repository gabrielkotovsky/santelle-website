// Bundle optimization utilities for better code splitting and performance

// Dynamic import with retry logic
export const dynamicImport = async <T>(
  importFn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> => {
  try {
    return await importFn();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return dynamicImport(importFn, retries - 1, delay * 2);
    }
    throw error;
  }
};

// Preload critical components
export const preloadComponent = (componentPath: string) => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = componentPath;
  document.head.appendChild(link);
};

// Preload multiple components
export const preloadComponents = (componentPaths: string[]) => {
  componentPaths.forEach(path => preloadComponent(path));
};

// Lazy load with intersection observer
export const createLazyLoader = <T>(
  importFn: () => Promise<T>,
  options: {
    threshold?: number;
    rootMargin?: string;
    fallback?: React.ReactNode;
  } = {}
) => {
  const { threshold = 0.1, rootMargin = '50px 0px', fallback } = options;
  
  return {
    importFn,
    threshold,
    rootMargin,
    fallback
  };
};

// Bundle size analyzer
export const analyzeBundleSize = () => {
  if (typeof window === 'undefined') return null;
  
  const resources = performance.getEntriesByType('resource');
  const jsResources = resources.filter(resource => 
    resource.name.endsWith('.js') || resource.name.includes('chunk')
  );
  
  const bundleInfo = jsResources.map(resource => ({
    name: resource.name,
    size: (resource as PerformanceResourceTiming & { transferSize?: number }).transferSize || 0,
    duration: resource.duration,
    url: resource.name
  }));
  
  const totalSize = bundleInfo.reduce((sum, resource) => sum + resource.size, 0);
  const totalDuration = bundleInfo.reduce((sum, resource) => sum + resource.duration, 0);
  
  return {
    resources: bundleInfo,
    totalSize,
    totalDuration,
    resourceCount: bundleInfo.length
  };
};

// Performance budget checker
export const checkPerformanceBudget = (budgets: {
  maxBundleSize?: number;
  maxLoadTime?: number;
  maxFCP?: number;
  maxLCP?: number;
}) => {
  const bundleInfo = analyzeBundleSize();
  if (!bundleInfo) return null;
  
  const violations = [];
  
  if (budgets.maxBundleSize && bundleInfo.totalSize > budgets.maxBundleSize) {
    violations.push({
      metric: 'BundleSize',
      current: bundleInfo.totalSize,
      budget: budgets.maxBundleSize,
      severity: 'high'
    });
  }
  
  if (budgets.maxLoadTime && bundleInfo.totalDuration > budgets.maxLoadTime) {
    violations.push({
      metric: 'LoadTime',
      current: bundleInfo.totalDuration,
      budget: budgets.maxLoadTime,
      severity: 'medium'
    });
  }
  
  // Check Core Web Vitals if available
  if ('PerformanceObserver' in window) {
    // FCP check
    const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
    if (fcpEntry && budgets.maxFCP && fcpEntry.startTime > budgets.maxFCP) {
      violations.push({
        metric: 'FCP',
        current: fcpEntry.startTime,
        budget: budgets.maxFCP,
        severity: 'high'
      });
    }
    
    // LCP check
    const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
    if (lcpEntries.length > 0) {
      const lcp = lcpEntries[lcpEntries.length - 1].startTime;
      if (budgets.maxLCP && lcp > budgets.maxLCP) {
        violations.push({
          metric: 'LCP',
          current: lcp,
          budget: budgets.maxLCP,
          severity: 'high'
        });
      }
    }
  }
  
  return {
    violations,
    hasViolations: violations.length > 0,
    bundleInfo
  };
};

// Component loading strategy
export const ComponentLoadingStrategy = {
  // Critical components that should load immediately
  CRITICAL: 'critical',
  // Important components that should load after critical
  IMPORTANT: 'important',
  // Non-critical components that can be lazy loaded
  LAZY: 'lazy'
} as const;

// Component loading configuration
export const componentConfig = {
  // Hero section - critical for above-the-fold content
  HeroSection: {
    strategy: ComponentLoadingStrategy.CRITICAL,
    priority: 1,
    preload: true
  },
  // Stats section - important for user engagement
  StatsSection: {
    strategy: ComponentLoadingStrategy.IMPORTANT,
    priority: 2,
    preload: true
  },
  // Kit section - important for product understanding
  KitSection: {
    strategy: ComponentLoadingStrategy.IMPORTANT,
    priority: 3,
    preload: false
  },
  // How it works - can be lazy loaded
  HowItWorksSection: {
    strategy: ComponentLoadingStrategy.LAZY,
    priority: 4,
    preload: false
  },
  // Team section - can be lazy loaded
  TeamSection: {
    strategy: ComponentLoadingStrategy.LAZY,
    priority: 5,
    preload: false
  },
  // Mobile content - can be lazy loaded
  MobileUnifiedCard: {
    strategy: ComponentLoadingStrategy.LAZY,
    priority: 6,
    preload: false
  },
  // Footer - can be lazy loaded
  FooterSection: {
    strategy: ComponentLoadingStrategy.LAZY,
    priority: 7,
    preload: false
  }
};

// Get component loading priority
export const getComponentPriority = (componentName: keyof typeof componentConfig) => {
  return componentConfig[componentName]?.priority || 999;
};

// Get component loading strategy
export const getComponentStrategy = (componentName: keyof typeof componentConfig) => {
  return componentConfig[componentName]?.strategy || ComponentLoadingStrategy.LAZY;
};

// Should component be preloaded
export const shouldPreloadComponent = (componentName: keyof typeof componentConfig) => {
  return componentConfig[componentName]?.preload || false;
};

// Optimize component loading based on strategy
export const optimizeComponentLoading = (componentName: keyof typeof componentConfig) => {
  const config = componentConfig[componentName];
  if (!config) return null;
  
  switch (config.strategy) {
    case ComponentLoadingStrategy.CRITICAL:
      return {
        priority: true,
        preload: true,
        lazy: false
      };
    case ComponentLoadingStrategy.IMPORTANT:
      return {
        priority: false,
        preload: config.preload,
        lazy: false
      };
    case ComponentLoadingStrategy.LAZY:
      return {
        priority: false,
        preload: false,
        lazy: true
      };
    default:
      return {
        priority: false,
        preload: false,
        lazy: true
      };
  }
};
