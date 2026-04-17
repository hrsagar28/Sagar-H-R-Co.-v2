import React from 'react';

interface SectionSymbolProps {
  color?: string;
  className?: string;
}

export const SectionSymbol: React.FC<SectionSymbolProps> = ({ color, className = '' }) => {
  return (
    <span 
      className={`font-serif italic mr-1 ${className}`} 
      style={color ? { color } : undefined}
    >
      §
    </span>
  );
};
