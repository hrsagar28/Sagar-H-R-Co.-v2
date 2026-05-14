import React from 'react';
import { stringifyJsonLd } from '../utils/jsonLd';
import { SITE_URL } from '../config/site';

interface SEOProps {
  /** Page title - appears in browser tab and search results */
  title: string;
  /** Meta description - summary for search results */
  description: string;
  /** Meta keywords (comma-separated). Default provided. */
  keywords?: string;
  /** Canonical URL to prevent duplicate content issues. Default: window.location.href */
  canonicalUrl?: string;
  /** Open Graph type (e.g., 'website', 'article'). Default: 'website' */
  ogType?: 'website' | 'article' | 'profile';
  /** Prevent search engines from indexing the current client-rendered route. */
  noindex?: boolean;
  /** URL for the social share image. Default provided. */
  ogImage?: string;
  /** Structured Data (JSON-LD) object(s) */
  schema?: object | object[];
  /** Breadcrumb navigation schema */
  breadcrumbs?: Array<{ name: string; url: string }>;
  /** Article / BlogPosting schema */
  article?: {
    headline: string;
    author: string;
    authorUrl?: string;
    authorSameAs?: string[];
    datePublished: string;
    dateModified?: string;
    image?: string;
    section?: string;
    tags?: string[];
    wordCount?: number;
  };
  /** Service schema */
  service?: { name: string; description: string; areaServed?: string };
  /** FAQPage schema */
  faqs?: Array<{ question: string; answer: string; dateModified?: string }>;
  /** Alternate feed/document links */
  alternates?: Array<{ rel?: string; type?: string; title?: string; href: string }>;
}

const getDefaultCanonicalUrl = () => {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
  return `${SITE_URL}${pathname}`;
};

const toAbsoluteUrl = (url: string) =>
  url.startsWith('http') ? url : `${SITE_URL}${url.startsWith('/') ? '' : '/'}${url}`;

/**
 * SEO Component
 *
 * Renders native React 19 document metadata. React hoists title, meta, link,
 * and JSON-LD script elements into the document head and reconciles them.
 *
 * @example
 * <SEO
 *   title="Home | My Site"
 *   description="Welcome to my site"
 *   schema={{ "@context": "https://schema.org", "@type": "WebSite", ... }}
 * />
 */
const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords = 'Chartered Accountant, Mysuru, Audit, Tax, GST, Business Advisory, CA Firm',
  canonicalUrl = getDefaultCanonicalUrl(),
  ogType = 'website',
  noindex = false,
  ogImage = `${SITE_URL}/og/og-default.png`,
  schema,
  breadcrumbs,
  article,
  service,
  faqs,
  alternates,
}) => {
  const breadcrumbSchema =
    breadcrumbs && breadcrumbs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: breadcrumbs.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: toAbsoluteUrl(item.url),
          })),
        }
      : null;

  const articleSchema = article
    ? {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.headline,
        inLanguage: 'en-IN',
        author: {
          '@type': 'Person',
          name: article.author,
          ...(article.authorUrl ? { url: article.authorUrl } : {}),
          ...(article.authorSameAs?.length ? { sameAs: article.authorSameAs } : {}),
        },
        publisher: {
          '@type': 'Organization',
          name: 'Sagar H R & Co.',
          logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
        },
        datePublished: article.datePublished,
        ...(article.dateModified ? { dateModified: article.dateModified } : {}),
        ...(article.section ? { articleSection: article.section } : {}),
        ...(article.tags?.length ? { keywords: article.tags.join(', ') } : {}),
        ...(article.wordCount ? { wordCount: article.wordCount } : {}),
        image: article.image ? toAbsoluteUrl(article.image) : ogImage,
        mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
      }
    : null;

  const serviceSchema = service
    ? {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: service.name,
        description: service.description,
        provider: { '@id': `${SITE_URL}/#organization` },
        ...(service.areaServed ? { areaServed: { '@type': 'City', name: service.areaServed } } : {}),
      }
    : null;

  const faqPageDateModified = faqs
    ?.map((faq) => faq.dateModified)
    .filter((date): date is string => Boolean(date))
    .sort((left, right) => new Date(right).getTime() - new Date(left).getTime())[0];

  const faqSchema =
    faqs && faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          ...(faqPageDateModified ? { dateModified: faqPageDateModified } : {}),
          mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
              ...(faq.dateModified ? { dateModified: faq.dateModified } : {}),
            },
          })),
        }
      : null;

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content={noindex ? 'noindex, follow' : 'index, follow'} />

      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content="en_IN" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:site" content="@casagarhr" />
      <meta name="twitter:creator" content="@casagarhr" />

      {article && (
        <>
          <meta property="article:published_time" content={article.datePublished} />
          <meta property="article:modified_time" content={article.dateModified || article.datePublished} />
          <meta property="article:author" content={article.author} />
          {article.section ? <meta property="article:section" content={article.section} /> : null}
          {article.tags?.map((tag) => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {alternates?.map((alt) => (
        <link
          key={alt.href}
          rel={alt.rel || 'alternate'}
          {...(alt.type ? { type: alt.type } : {})}
          {...(alt.title ? { title: alt.title } : {})}
          href={toAbsoluteUrl(alt.href)}
        />
      ))}

      {schema && <script type="application/ld+json">{stringifyJsonLd(schema)}</script>}
      {breadcrumbSchema && <script type="application/ld+json">{stringifyJsonLd(breadcrumbSchema)}</script>}
      {articleSchema && <script type="application/ld+json">{stringifyJsonLd(articleSchema)}</script>}
      {serviceSchema && <script type="application/ld+json">{stringifyJsonLd(serviceSchema)}</script>}
      {faqSchema && <script type="application/ld+json">{stringifyJsonLd(faqSchema)}</script>}
    </>
  );
};

export default SEO;
