import React, { useState, useEffect, useMemo } from 'react';

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
  /** Responsive image sources */
  srcSet?: string;
  /** Responsive image sizes */
  sizes?: string;
  /** If true, automatically generates srcSet for Unsplash images */
  generateSrcSet?: boolean;
  /** Callback when image loads successfully */
  onLoad?: () => void;
  /** Callback when image fails to load */
  onError?: () => void;
}

/**
 * OptimizedImage Component
 * 
 * Handles progressive loading with a blur-up effect.
 * Provides fallback support, custom aspect ratio handling, and automatic srcSet generation.
 * 
 * @example
 * <OptimizedImage 
 *   src="https://images.unsplash.com/photo-..." 
 *   alt="Description" 
 *   generateSrcSet={true}
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
  srcSet,
  sizes,
  generateSrcSet = false,
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

  // Automatically generate srcSet for Unsplash images if requested
  const calculatedSrcSet = useMemo(() => {
    if (srcSet) return srcSet;
    if (!generateSrcSet) return undefined;
    
    // Check if it's an Unsplash URL
    if (src.includes('images.unsplash.com')) {
      try {
        const urlObj = new URL(src);
        const widths = [640, 1024, 1536, 2048];
        return widths.map(w => {
          // Clone the URL for each width
          const newUrl = new URL(urlObj.toString());
          newUrl.searchParams.set('w', w.toString());
          // Ensure quality and format are optimized
          if (!newUrl.searchParams.has('q')) newUrl.searchParams.set('q', '80');
          if (!newUrl.searchParams.has('auto')) newUrl.searchParams.set('auto', 'format');
          
          return `${newUrl.toString()} ${w}w`;
        }).join(', ');
      } catch (e) {
        return undefined;
      }
    }
    return undefined;
  }, [src, srcSet, generateSrcSet]);

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
        srcSet={calculatedSrcSet}
        sizes={sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
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