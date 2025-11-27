import React, { useState, useEffect } from 'react';

interface OptimizedImageProps extends React.HTMLAttributes<HTMLDivElement> {
  src: string;
  alt: string;
  imgClassName?: string;
  priority?: boolean;
  fallbackSrc?: string;
  aspectRatio?: string;
  onLoad?: () => void;
  onError?: () => void;
}

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