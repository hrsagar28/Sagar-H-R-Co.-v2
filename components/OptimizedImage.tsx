import React, { useState, useEffect } from 'react';

interface OptimizedImageProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Source URL of the image */
  src: string;
  /** Alt text for accessibility */
  alt: string;
  /** Additional classes for the image element itself */
  imgClassName?: string;
  /** If true, uses eager loading. Default: false (lazy) */
  priority?: boolean;
  /** Fallback image URL if primary src fails */
  fallbackSrc?: string;
  /** CSS aspect-ratio property (e.g., "16/9") */
  aspectRatio?: string;
  /** Callback when image loads successfully */
  onLoad?: () => void;
  /** Callback when image fails to load */
  onError?: () => void;
}

/**
 * OptimizedImage Component
 * 
 * Handles progressive loading with a blur-up effect.
 * Provides fallback support and custom aspect ratio handling.
 * 
 * @example
 * <OptimizedImage 
 *   src="/path/to/image.jpg" 
 *   alt="Description" 
 *   aspectRatio="16/9" 
 *   className="rounded-xl" 
 * />
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({ 
  src, 
  alt, 
  className = "", 
  imgClassName = "",
  priority = false,
  fallbackSrc,
  aspectRatio,
  onLoad,
  onError,
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    setCurrentSrc(src);
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };

  const handleError = () => {
    setHasError(true);
    if (fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    }
    if (onError) onError();
  };

  return (
    <div 
      className={`relative overflow-hidden bg-brand-border/20 ${className}`}
      style={aspectRatio ? { aspectRatio } : undefined}
      {...props}
    >
      {/* Loading Placeholder / Blur Effect */}
      <div 
        className={`absolute inset-0 bg-brand-surface/50 backdrop-blur-md transition-opacity duration-700 ease-in-out z-10 ${
          isLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`} 
      />
      
      {/* Actual Image */}
      <img
        src={currentSrc}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        // @ts-ignore - fetchPriority is supported in React 19 but types might lag or vary
        fetchPriority={priority ? "high" : "auto"}
        decoding={priority ? "sync" : "async"}
        onLoad={handleLoad}
        onError={handleError}
        className={`block w-full h-full object-cover transition-all duration-700 ease-in-out relative z-0 ${
          isLoaded ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-sm scale-105'
        } ${imgClassName}`}
      />
    </div>
  );
};

export default OptimizedImage;