import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

type BigCTATone = 'moss' | 'ink' | 'paper' | 'paper-on-dark' | 'brass' | 'accent';

interface ToneClasses {
  /** Classes for the outer pill — border colour and resting text colour. */
  container: string;
  /** Background colour of the fill-in-from-zero hover layer. */
  fillBg: string;
  /** Text-colour override applied when the fill layer is visible. */
  labelOnFill: string;
}

/**
 * Tone → class-bundle map. Audit B-02: previously a switch statement
 * returning the same shape from each branch; the Record form keeps
 * TypeScript's exhaustiveness check (a new tone added to BigCTATone has
 * to add a matching entry here or TS errors at this declaration) and
 * removes the implicit `undefined` return type the switch had.
 */
const TONE_CLASSES: Record<BigCTATone, ToneClasses> = {
  accent: {
    container: 'border-brand-accent text-brand-accent',
    fillBg: 'bg-brand-accent',
    labelOnFill: 'group-hover:text-brand-ink',
  },
  moss: {
    container: 'border-brand-moss text-brand-moss',
    fillBg: 'bg-brand-moss',
    labelOnFill: 'group-hover:text-brand-paper',
  },
  ink: {
    container: 'border-brand-ink text-brand-ink',
    fillBg: 'bg-brand-ink',
    labelOnFill: 'group-hover:text-brand-paper',
  },
  paper: {
    container: 'border-brand-paper text-brand-paper',
    fillBg: 'bg-brand-paper',
    labelOnFill: 'group-hover:text-brand-ink',
  },
  'paper-on-dark': {
    container: 'border-brand-paper bg-transparent text-brand-paper',
    fillBg: 'bg-brand-paper',
    labelOnFill: 'group-hover:text-brand-ink',
  },
  brass: {
    container: 'border-brand-brass text-brand-brass',
    fillBg: 'bg-brand-brass',
    labelOnFill: 'group-hover:text-brand-ink',
  },
};

export interface BigCTAProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  to?: string;
  href?: string;
  tone?: BigCTATone;
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
  disabled,
  ...buttonProps
}: BigCTAProps) {
  'use memo';
  const getSizeClasses = () => {
    if (size === 'md') return 'px-6 py-3 text-base';
    return 'px-10 py-5 text-[1.15rem]';
  };

  const tones = TONE_CLASSES[tone];
  const isDisabled = Boolean(disabled);
  const interactiveClasses = isDisabled ? 'cursor-not-allowed opacity-70' : '';
  const hoverFillClass = isDisabled ? 'scale-0' : 'group-hover:scale-100';
  const hoverLabelClass = isDisabled ? '' : tones.labelOnFill;
  const hoverIconClass = isDisabled ? '' : 'group-hover:translate-x-1';
  const classes = `group relative inline-flex items-center justify-center gap-3 rounded-full overflow-hidden border font-serif italic transition-colors duration-500 ease-out-expo disabled:cursor-not-allowed disabled:opacity-70 ${interactiveClasses} ${tones.container} ${getSizeClasses()} ${className}`;
  const fillBgClass = tones.fillBg;

  // Audit B-01: the previous disabled <Link>/<a> branches rendered a
  // <span role="button" tabIndex={-1} aria-disabled>. role="button" makes
  // screen readers treat it as activatable, and Enter can still fire a
  // synthetic click on a focusable span. The HTML5 `inert` attribute
  // takes the element and all descendants out of the focus order, click
  // dispatch, and accessibility tree in one shot — exactly what we need
  // for a non-functional "looks like a button" placeholder.
  const disabledSpanProps = {
    'aria-disabled': true as const,
    inert: true as unknown as boolean, // React type lag — `inert` is valid HTML.
  };

  const InnerContent = () => (
    <>
      <span
        aria-hidden
        className={`absolute inset-0 scale-0 rounded-full transition-transform duration-500 ease-out-expo ${hoverFillClass} ${fillBgClass}`}
      />
      <span className={`relative z-10 transition-colors duration-500 ease-out-expo ${hoverLabelClass}`}>
        {children}
      </span>
      <span
        className={`relative z-10 transition-transform duration-500 ease-out-expo ${hoverIconClass} ${hoverLabelClass}`}
      >
        {icon ?? <ArrowRight size={size === 'md' ? 16 : 20} strokeWidth={1.5} />}
      </span>
    </>
  );

  if (to) {
    if (isDisabled) {
      return (
        <span className={classes} aria-label={ariaLabel} {...disabledSpanProps}>
          <InnerContent />
        </span>
      );
    }

    return (
      <Link to={to} className={classes} aria-label={ariaLabel}>
        <InnerContent />
      </Link>
    );
  }

  if (href) {
    if (isDisabled) {
      return (
        <span className={classes} aria-label={ariaLabel} {...disabledSpanProps}>
          <InnerContent />
        </span>
      );
    }

    return (
      <a
        href={href}
        className={classes}
        aria-label={ariaLabel ? `${ariaLabel} (opens in new window)` : 'External link (opens in new window)'}
        target="_blank"
        rel="noopener noreferrer"
      >
        <InnerContent />
      </a>
    );
  }

  return (
    <button className={classes} aria-label={ariaLabel} aria-disabled={isDisabled} disabled={disabled} {...buttonProps}>
      <InnerContent />
    </button>
  );
}
