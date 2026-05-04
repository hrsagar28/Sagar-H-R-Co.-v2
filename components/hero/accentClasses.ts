import type { BaseHeroProps } from './types';

type AccentTone = NonNullable<BaseHeroProps['accentTone']>;

export const textAccentClass: Record<AccentTone, string> = {
  moss: 'text-brand-moss',
  brass: 'text-brand-brass',
  rust: 'text-brand-rust',
};

export const borderAccentClass: Record<AccentTone, string> = {
  moss: 'border-brand-moss',
  brass: 'border-brand-brass',
  rust: 'border-brand-rust',
};

export const bgAccentClass: Record<AccentTone, string> = {
  moss: 'bg-brand-moss',
  brass: 'bg-brand-brass',
  rust: 'bg-brand-rust',
};

export const ledgerCtaAccentClass: Record<AccentTone, string> = {
  moss: 'hero-ledger-cta-moss',
  brass: 'hero-ledger-cta-brass',
  rust: 'hero-ledger-cta-rust',
};
