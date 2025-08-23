'use client';

import { useState, useEffect, useRef, ReactNode } from 'react';

interface LazyLoaderProps {
  children: ReactNode;
  threshold?: number;
  rootMargin?: string;
  fallback?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onVisible?: () => void;
  onHidden?: () => void;
}

export default function LazyLoader({
  children,
  threshold = 0.1,
  rootMargin = '50px 0px',
  fallback,
  className = '',
  style,
  onVisible,
  onHidden
}: LazyLoaderProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentRef = ref.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsIntersecting(true);
            if (!hasLoaded) {
              setHasLoaded(true);
              setIsVisible(true);
              onVisible?.();
            }
          } else {
            setIsIntersecting(false);
            onHidden?.();
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(currentRef);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, hasLoaded, onVisible, onHidden]);

  // Default fallback with loading animation
  const defaultFallback = fallback || (
    <div className="w-full min-h-[200px] flex items-center justify-center bg-white/20 backdrop-blur-lg rounded-3xl border border-white/50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#721422] mx-auto mb-3"></div>
        <p className="text-[#721422] text-sm">Loading content...</p>
      </div>
    </div>
  );

  return (
    <div ref={ref} className={className} style={style}>
      {isVisible ? (
        <div className={`transition-all duration-500 ease-out ${
          isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-4'
        }`}>
          {children}
        </div>
      ) : (
        <div className="transition-all duration-300 ease-out">
          {defaultFallback}
        </div>
      )}
    </div>
  );
}

// Specialized lazy loading components
export const LazySection = ({ children, ...props }: LazyLoaderProps) => (
  <LazyLoader
    {...props}
    threshold={0.2}
    rootMargin="100px 0px"
    fallback={
      <div className="w-full min-h-screen flex items-center justify-center bg-white/20 backdrop-blur-lg rounded-3xl border border-white/50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#721422] mx-auto mb-4"></div>
          <p className="text-[#721422] text-lg">Loading section...</p>
        </div>
      </div>
    }
  >
    {children}
  </LazyLoader>
);

export const LazyCard = ({ children, ...props }: LazyLoaderProps) => (
  <LazyLoader
    {...props}
    threshold={0.3}
    rootMargin="50px 0px"
    fallback={
      <div className="w-full h-64 bg-gradient-to-br from-[#FBD5DB] to-[#F48CA3] rounded-lg animate-pulse"></div>
    }
  >
    {children}
  </LazyLoader>
);

export const LazyImage = ({ children, ...props }: LazyLoaderProps) => (
  <LazyLoader
    {...props}
    threshold={0.1}
    rootMargin="200px 0px"
    fallback={
      <div className="w-full h-full bg-gradient-to-br from-[#FBD5DB] to-[#F48CA3] animate-pulse rounded-lg"></div>
    }
  >
    {children}
  </LazyLoader>
);

// Hook for custom lazy loading logic
export const useLazyLoad = (options: {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
} = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { threshold = 0.1, rootMargin = '50px 0px', triggerOnce = true } = options;

  useEffect(() => {
    const currentRef = ref.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (triggerOnce && !hasTriggered) {
              setHasTriggered(true);
            }
          } else if (!triggerOnce) {
            setIsVisible(false);
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(currentRef);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce, hasTriggered]);

  return { ref, isVisible, hasTriggered };
};
