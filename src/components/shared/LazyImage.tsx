import Image, { ImageProps } from 'next/image';
import { useLazyLoad } from './useLazyLoad';

interface LazyImageProps extends Omit<ImageProps, 'priority'> {
  placeholder?: string;
  showPlaceholder?: boolean;
}

export default function LazyImage({ 
  src, 
  alt, 
  placeholder = '/placeholder.svg', 
  showPlaceholder = false,
  className = '',
  ...props 
}: LazyImageProps) {
  const { ref, isVisible, isLoaded } = useLazyLoad({
    threshold: 0.1,
    rootMargin: '100px'
  });

  if (!isVisible) {
    return (
      <div 
        ref={ref}
        className={`bg-gray-200 animate-pulse ${className}`}
        style={{
          width: props.width || 300,
          height: props.height || 300
        }}
      />
    );
  }

  if (isVisible && !isLoaded && showPlaceholder) {
    return (
      <Image
        src={placeholder}
        alt={`Loading ${alt}...`}
        className={`${className} opacity-50`}
        {...props}
      />
    );
  }

  return (
    <Image
      ref={ref}
      src={src}
      alt={alt}
      className={`${className} transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
      {...props}
    />
  );
}
