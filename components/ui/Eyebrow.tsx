import React from 'react';

interface EyebrowProps {
  children: React.ReactNode;
  tone?: 'moss' | 'brass' | 'rust' | 'stone';
  className?: string;
  as?: 'div' | 'span' | 'p';
}

const toneMap = {
  moss: { text: 'text-brand-moss', slug: 'bg-brand-moss' },
  brass: { text: 'text-[#b8924c]', slug: 'bg-[#b8924c]' },
  rust: { text: 'text-[#8b3a2f]', slug: 'bg-[#8b3a2f]' },
  stone: { text: 'text-brand-stone', slug: 'bg-brand-stone' }
};

export const Eyebrow: React.FC<EyebrowProps> = ({
  children,
  tone = 'moss',
  className = '',
  as: As = 'div'
}) => {
  const { text, slug } = toneMap[tone];
  return (
    <As className={`inline-flex items-center gap-3 font-mono uppercase tracking-[0.2em] text-[0.7rem] ${text} ${className}`}>
      <span aria-hidden="true" className={`w-6 h-[1px] md:w-8 ${slug}`}></span>
      {children}
    </As>
  );
};
