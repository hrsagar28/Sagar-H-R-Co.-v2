import React, { useState } from 'react';

interface OptimizedImageProps extends React.HTMLAttributes<HTMLDivElement> {
  src: string;
  alt: string;
  imgClassName?: string;
  priority?: boolean;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({ 
  src, 
  alt, 
  className = "", 
  imgClassName = "",
  priority = false,
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div 
      className={`relative overflow-hidden bg-brand-border/20 ${className}`}
      {...props}
    >
      {/* Loading Placeholder */}
      <div 
        className={`absolute inset-0 bg-brand-surface/50 backdrop-blur-md transition-opacity duration-700 ease-in-out z-10 ${
          isLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`} 
      />
      
      {/* Actual Image */}
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        onLoad={() => setIsLoaded(true)}
        className={`block w-full h-full object-cover transition-opacity duration-700 ease-in-out relative z-0 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${imgClassName}`}
      />
    </div>
  );
};

export default OptimizedImage;