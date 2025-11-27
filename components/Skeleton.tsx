import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
}) => {
  const baseClasses = "animate-pulse bg-brand-border/40";
  
  let typeClasses = "";
  if (variant === 'text') typeClasses = "rounded-md h-4";
  if (variant === 'circular') typeClasses = "rounded-full";
  if (variant === 'rectangular') typeClasses = "rounded-2xl";

  return (
    <div 
      className={`${baseClasses} ${typeClasses} ${className}`} 
      style={{ width, height }}
    />
  );
};

export default Skeleton;