import React from 'react';
import { CONTACT_INFO, SERVICE_GROUPS, getServicePage } from '../../constants';
import type { InsightItem, ServicePage } from '../../types';

// Data and pieces for the home page (pages/Home.tsx).

/** The service groups, each with its pages. */
export const GROUPS = SERVICE_GROUPS.map((group) => ({
  ...group,
  pages: group.slugs.map(getServicePage).filter((page): page is ServicePage => Boolean(page)),
}));

const HOME_INSIGHTS_COUNT = 3;

/**
 * Which articles to show (audit I-04): those marked `featuredOnHome`, then
 * the most recent, three in all.
 */
export const pickHomeInsights = (insights: readonly InsightItem[]): InsightItem[] => {
  const featured = insights.filter((insight) => insight.featuredOnHome === true);
  if (featured.length >= HOME_INSIGHTS_COUNT) return featured.slice(0, HOME_INSIGHTS_COUNT);
  const featuredIds = new Set(featured.map((insight) => insight.id));
  const recent = [...insights]
    .filter((insight) => !featuredIds.has(insight.id))
    .sort((a, b) => b.date.localeCompare(a.date));
  return [...featured, ...recent].slice(0, HOME_INSIGHTS_COUNT);
};

/** The principal's photograph. */
export const Portrait: React.FC<{ sizes: string }> = ({ sizes }) => (
  <picture>
    <source
      type="image/avif"
      srcSet="/images/founder-400.avif 400w, /images/founder-800.avif 800w, /images/founder-1080.avif 1080w"
      sizes={sizes}
    />
    <source
      type="image/webp"
      srcSet="/images/founder-400.webp 400w, /images/founder-800.webp 800w, /images/founder-1080.webp 1080w"
      sizes={sizes}
    />
    <img
      src="/images/founder-800.jpg"
      srcSet="/images/founder-400.jpg 400w, /images/founder-800.jpg 800w, /images/founder-1080.jpg 1080w"
      sizes={sizes}
      alt={`${CONTACT_INFO.founder.name}, proprietor of ${CONTACT_INFO.name}`}
      width="800"
      height="1067"
      loading="lazy"
      decoding="async"
    />
  </picture>
);
