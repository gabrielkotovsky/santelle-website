'use client';

import Image from 'next/image';
import { useState } from 'react';

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
  const [hasError, setHasError] = useState(false);

  // Handle image error
  const handleError = () => {
    setHasError(true);
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
      {/* Main image */}
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        className="object-cover"
        priority={priority}
        sizes={sizes}
        quality={quality}
        placeholder={placeholder && blurDataURL ? placeholder : undefined}
        blurDataURL={blurDataURL}
        fill={fill}
        onError={handleError}
        onClick={onClick}
      />
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
