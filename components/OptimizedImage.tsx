import React, { useState, useEffect, useMemo, useRef } from 'react';

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
  /** Intrinsic image width, forwarded to the img element */
  width?: number | string;
  /** Intrinsic image height, forwarded to the img element */
  height?: number | string;
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
  /** Optional AVIF source for picture element */
  srcAvif?: string;
  /** Optional responsive AVIF sources for picture element */
  srcAvifSet?: string;
  /** Optional WebP source for picture element */
  srcWebp?: string;
  /** Optional responsive WebP sources for picture element */
  srcWebpSet?: string;
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
  width,
  height,
  srcSet,
  sizes,
  generateSrcSet = false,
  onLoad,
  onError,
  srcAvif,
  srcAvifSet,
  srcWebp,
  srcWebpSet,
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setCurrentSrc(src);
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  // Check if image is already loaded (e.g. from cache)
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      setIsLoaded(true);
      if (onLoad) onLoad();
    }
  }, []);

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
      {srcAvif || srcWebp || srcAvifSet || srcWebpSet ? (
        <picture>
          {(srcAvifSet || srcAvif) && <source srcSet={srcAvifSet || srcAvif} type="image/avif" sizes={sizes} />}
          {(srcWebpSet || srcWebp) && <source srcSet={srcWebpSet || srcWebp} type="image/webp" sizes={sizes} />}
          <img
            ref={imgRef}
            src={currentSrc}
            srcSet={calculatedSrcSet}
            sizes={sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
            alt={alt}
            width={width}
            height={height}
            loading={priority ? "eager" : "lazy"}
            {...({ fetchpriority: priority ? "high" : "auto" } as React.ImgHTMLAttributes<HTMLImageElement>)}
            decoding={priority ? "sync" : "async"}
            onLoad={handleLoad}
            onError={handleError}
            className={`block w-full h-full object-cover transition-all duration-700 ease-in-out relative z-0 ${
              priority && (srcAvif || srcWebp || srcAvifSet || srcWebpSet)
                ? 'opacity-100 scale-100'
                : isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            } ${imgClassName}`}
          />
        </picture>
      ) : (
        <img
          ref={imgRef}
          src={currentSrc}
          srcSet={calculatedSrcSet}
          sizes={sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? "eager" : "lazy"}
          {...({ fetchpriority: priority ? "high" : "auto" } as React.ImgHTMLAttributes<HTMLImageElement>)}
          decoding={priority ? "sync" : "async"}
          onLoad={handleLoad}
          onError={handleError}
          className={`block w-full h-full object-cover transition-all duration-700 ease-in-out relative z-0 ${
            isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          } ${imgClassName}`}
        />
      )}
    </div>
  );
};

export default OptimizedImage;
