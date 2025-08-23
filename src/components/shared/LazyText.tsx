import { ReactNode, HTMLAttributes } from 'react';
import { useLazyLoad } from './useLazyLoad';

interface LazyTextProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  delay?: number;
  threshold?: number;
}

export default function LazyText({ 
  children, 
  className = '', 
  delay = 200,
  threshold = 0.1,
  ...props
}: LazyTextProps) {
  const { ref, isVisible, isLoaded } = useLazyLoad({
    threshold,
    rootMargin: '50px',
    delay
  });

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`${className} transition-all duration-700 ease-out ${
        isVisible && isLoaded 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-4'
      }`}
      {...props}
    >
      {children}
    </div>
  );
}
