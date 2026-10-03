import type { ComponentType } from 'react';

export interface IconComponentProps {
  size?: number;
  className?: string;
  strokeWidth?: number;
  'aria-hidden'?: boolean | 'true' | 'false';
  focusable?: boolean | 'true' | 'false';
}

/**
 * Lucide icon components and any other icon library exposing `size` /
 * `className` / `strokeWidth` props are assignable to this type. Use this
 * for any data-driven list of icons (services, industries, contact cards)
 * so consumers can render `<item.Icon size={32} />` instead of cloning a
 * pre-built JSX node — audit S-05.
 */
export type IconComponent = ComponentType<IconComponentProps>;

export interface NavLink {
  name: string;
  path: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  Icon: IconComponent;
  link: string;
}

export interface IndustryItem {
  title: string;
  description: string;
  Icon: IconComponent;
}

export interface InsightItem {
  id: string;
  title: string;
  category: string;
  date: string;
  dateModified?: string;
  summary: string;
  slug: string;
  author: string;
  authorId: string;
  readTime: string;
  tags?: string[];
  serviceId?: string;
  featured?: boolean;
  /**
   * Curated flag (audit I-04): when set on an insight in
   * `public/data/insights.json`, that insight is preferred over a recency
   * sort for the home page's "Latest Updates" rail. If fewer than three
   * insights carry the flag, the home page falls back to the most recent.
   */
  featuredOnHome?: boolean;
  image?: string;
  wordCount?: number;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  lastUpdated?: string;
  /**
   * Curated flag (audit Q-03): when true, this FAQ is eligible for the
   * home-page "Quick answers" preview, regardless of category. Lets the
   * home selection mix categories instead of being locked to
   * "General & Onboarding".
   */
  featuredOnHome?: boolean;
}

/**
 * One service page (/services/:slug). Text in `inc`, `needs` and `incdesc` may
 * link to another service with `{slug|label}`, which the page renders as a
 * router link.
 */
export interface ServicePage {
  slug: string;
  name: string;
  /** Completes "Ask us about …" in the band at the foot of the page. */
  ask: string;
  /** Who the service is for, one sentence. */
  who: string;
  /** Four short items listed under the service on /services. */
  tags: string[];
  /** How often the work recurs ("Monthly", "As required"). */
  frequency: string;
  intro: string;
  incdesc: string;
  /** Scope of work: [heading, text] pairs. */
  inc: [string, string][];
  /** Documents and information usually needed at the start. */
  needs: string[];
  /** Ids from constants/faq.ts, shown as "Common questions". */
  faqIds: string[];
  Icon: IconComponent;
}

export interface ServiceGroup {
  name: string;
  description: string;
  slugs: string[];
}
