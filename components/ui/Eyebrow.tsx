import React from 'react';

interface EyebrowProps {
  children: React.ReactNode;
  tone?: 'moss' | 'brass' | 'rust' | 'stone';
  className?: string;
  as?: 'div' | 'span' | 'p';
}

const toneMap = {
  moss: 'text-brand-moss',
  brass: 'text-brand-brass',
  rust: 'text-brand-rust',
  stone: 'text-brand-stone',
};

export const Eyebrow: React.FC<EyebrowProps> = ({ children, tone = 'moss', className = '', as: As = 'div' }) => {
  return (
    <As
      className={`inline-flex items-center font-mono text-[0.7rem] uppercase tracking-[0.2em] ${toneMap[tone]} ${className}`}
    >
      {children}
    </As>
  );
};
