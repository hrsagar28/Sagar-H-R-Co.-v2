import React from 'react';

export type HeroVariant = 'basic' | 'split' | 'folio' | 'ledger' | 'frontispiece' | 'archive' | 'directory';

export interface BaseHeroProps {
  eyebrow?: string;
  title: React.ReactNode;
  blurb?: string;
  accentTone?: 'moss' | 'brass' | 'rust';    // default derives from zone
}
export interface BasicHeroProps extends BaseHeroProps {
  variant?: 'basic';
  tag?: string; subtitle?: string; description?: string; className?: string;
}
export interface SplitHeroProps extends BaseHeroProps {
  variant: 'split';
  meta: Array<{ label: string; value: React.ReactNode }>;   // 2–4 entries, qualitative OK
}
export interface FolioHeroProps extends BaseHeroProps {
  variant: 'folio';
  number: string;               // e.g. "I.", "II."
  sideText?: string;
}
export interface LedgerHeroProps extends BaseHeroProps {
  variant: 'ledger';
  stats: Array<{ num: React.ReactNode; label: string }>;
  ctaLabel?: string; ctaHref?: string;
}
export interface FrontispieceHeroProps extends BaseHeroProps {
  variant: 'frontispiece';
  metaStrip?: string[];
  ornament?: string;                          // default "§"
}
export interface ArchiveHeroProps extends BaseHeroProps {
  variant: 'archive';
  items: Array<{ num: string; title: React.ReactNode; date: string; href: string }>;
  totalLabel?: string;
}
export interface DirectoryHeroProps extends BaseHeroProps {
  variant: 'directory';
  coordinates?: React.ReactNode;
  contacts: Array<{ label: string; value: string; href?: string }>;
  ghostWord?: string;                         // default "Engage."
}
export type PageHeroProps = BasicHeroProps | SplitHeroProps | FolioHeroProps | LedgerHeroProps | FrontispieceHeroProps | ArchiveHeroProps | DirectoryHeroProps;


