'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  fill?: boolean;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  sizes,
  quality = 85,
  placeholder = 'blur',
  blurDataURL,
  fill = false,
  style,
  onClick
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Set loading state after mount to avoid hydration mismatch
  useEffect(() => {
    setIsLoading(true);
  }, []);

  // Generate blur placeholder if not provided
  const generateBlurPlaceholder = () => {
    if (blurDataURL) return blurDataURL;
    
    // Only generate canvas placeholder on client side
    if (typeof window !== 'undefined') {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          const gradient = ctx.createLinearGradient(0, 0, 32, 32);
          gradient.addColorStop(0, '#FBD5DB');
          gradient.addColorStop(0.5, '#F48CA3');
          gradient.addColorStop(1, '#721422');
          
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, 32, 32);
          
          return canvas.toDataURL();
        }
      } catch (e) {
        // Fallback if canvas fails
      }
    }
    
    // Static SVG fallback for server-side rendering
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjRkJENURCIi8+Cjwvc3ZnPgo=';
  };

  // Handle image load
  const handleLoad = () => {
    setIsLoading(false);
  };

  // Handle image error
  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  // Error fallback
  if (hasError) {
    return (
      <div 
        className={`bg-gradient-to-br from-[#FBD5DB] to-[#F48CA3] flex items-center justify-center ${className || ''}`}
        style={{
          width: fill ? '100%' : width,
          height: fill ? '100%' : height,
          ...style
        }}
        onClick={onClick}
      >
        <div className="text-center text-[#721422] text-sm">
          <div className="w-8 h-8 mx-auto mb-2">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
            </svg>
          </div>
          <p>Image unavailable</p>
        </div>
      </div>
    );
  }

  return (
          <div className={`relative ${className || ''}`} style={style}>
      {/* Loading placeholder */}
      {isLoading && (
        <div 
          className="absolute inset-0 bg-gradient-to-br from-[#FBD5DB] to-[#F48CA3] animate-pulse"
          style={{
            width: fill ? '100%' : width,
            height: fill ? '100%' : height,
          }}
        />
      )}
      
      {/* Main image */}
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'} object-cover`}
        priority={priority}
        sizes={sizes}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={generateBlurPlaceholder()}
        fill={fill}
        onLoad={handleLoad}
        onError={handleError}
        onClick={onClick}
        style={{}}
      />
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#721422]"></div>
        </div>
      )}
    </div>
  );
}

// Specialized image components for common use cases
export const HeroImage = (props: Omit<OptimizedImageProps, 'priority' | 'sizes'>) => (
  <OptimizedImage
    {...props}
    priority={true}
    sizes="100vw"
    quality={90}
  />
);

export const ContentImage = (props: Omit<OptimizedImageProps, 'sizes' | 'quality'>) => (
  <OptimizedImage
    {...props}
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    quality={85}
  />
);

export const ThumbnailImage = (props: Omit<OptimizedImageProps, 'sizes' | 'quality'>) => (
  <OptimizedImage
    {...props}
    sizes="(max-width: 768px) 100px, 150px"
    quality={75}
  />
);
