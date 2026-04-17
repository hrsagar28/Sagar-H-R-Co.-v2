import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const { Link } = ReactRouterDOM;

export interface BigCTAProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  to?: string;
  href?: string;
  tone?: 'moss' | 'ink' | 'paper' | 'brass';
  size?: 'md' | 'lg';
  children: React.ReactNode;
  ariaLabel?: string;
  icon?: React.ReactNode;
}

export function BigCTA({
  to,
  href,
  tone = 'moss',
  size = 'lg',
  children,
  ariaLabel,
  icon,
  className = '',
  ...buttonProps
}: BigCTAProps) {
  const getToneClasses = () => {
    switch (tone) {
      case 'moss':
        return {
          container: 'border-brand-moss text-brand-moss',
          fillBg: 'bg-brand-moss',
          labelOnFill: 'text-brand-paper',
        };
      case 'ink':
        return {
          container: 'border-brand-ink text-brand-ink',
          fillBg: 'bg-brand-ink',
          labelOnFill: 'text-brand-paper',
        };
      case 'paper':
        return {
          container: 'border-brand-paper text-brand-paper',
          fillBg: 'bg-brand-paper',
          labelOnFill: 'text-brand-ink',
        };
      case 'brass':
        return {
          container: 'border-brand-brass text-brand-brass',
          fillBg: 'bg-brand-brass',
          labelOnFill: 'text-brand-ink',
        };
    }
  };

  const getSizeClasses = () => {
    if (size === 'md') return 'px-6 py-3 text-base';
    return 'px-10 py-5 text-[1.15rem]';
  };

  const tones = getToneClasses();
  const classes = `group relative inline-flex items-center justify-center gap-3 rounded-full overflow-hidden border font-serif italic transition-colors duration-500 ease-out-expo ${tones.container} ${getSizeClasses()} ${className}`;
  const fillBgClass = tones.fillBg;
  const labelOnFillClass = `group-hover:${tones.labelOnFill}`;

  const InnerContent = () => (
    <>
      <span aria-hidden className={`absolute inset-0 scale-0 rounded-full transition-transform duration-500 ease-out-expo group-hover:scale-100 ${fillBgClass}`} />
      <span className={`relative z-10 transition-colors duration-500 ease-out-expo ${labelOnFillClass}`}>{children}</span>
      <span className={`relative z-10 transition-transform duration-500 ease-out-expo group-hover:translate-x-1 ${labelOnFillClass}`}>
        {icon ?? <ArrowRight size={size === 'md' ? 16 : 20} strokeWidth={1.5} />}
      </span>
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} aria-label={ariaLabel}>
        <InnerContent />
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} aria-label={ariaLabel} target="_blank" rel="noopener noreferrer">
        <InnerContent />
      </a>
    );
  }

  return (
    <button className={classes} aria-label={ariaLabel} {...buttonProps}>
      <InnerContent />
    </button>
  );
}
