
import React, { useEffect } from 'react';
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

const toAbsoluteUrl = (url: string) => url.startsWith('http') ? url : `${SITE_URL}${url.startsWith('/') ? '' : '/'}${url}`;

/**
 * SEO Component
 * 
 * Manages document head elements including title, meta tags, Open Graph tags,
 * and JSON-LD structured data for search engine optimization.
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
  keywords = "Chartered Accountant, Mysuru, Audit, Tax, GST, Business Advisory, CA Firm",
  canonicalUrl = getDefaultCanonicalUrl(),
  ogType = 'website',
  noindex = false,
  ogImage = `${SITE_URL}/og-image.jpg`,
  schema,
  breadcrumbs,
  article,
  service,
  faqs,
  alternates
}) => {
  useEffect(() => {
    // Update Title
    document.title = title;

    // Helper to strictly find and update, or create meta tags
    const updateMeta = (nameAttr: string, nameVal: string, content: string) => {
      let element = document.querySelector(`meta[${nameAttr}="${nameVal}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(nameAttr, nameVal);
        document.head.appendChild(element);
      }
      // Only update if content is different to minimize DOM thrashing
      if (element.getAttribute('content') !== content) {
        element.setAttribute('content', content);
      }
    };

    // Standard Meta
    updateMeta('name', 'description', description);
    updateMeta('name', 'keywords', keywords);
    updateMeta('name', 'robots', noindex ? 'noindex, follow' : 'index, follow');

    // Open Graph
    updateMeta('property', 'og:title', title);
    updateMeta('property', 'og:description', description);
    updateMeta('property', 'og:url', canonicalUrl);
    updateMeta('property', 'og:type', ogType);
    updateMeta('property', 'og:image', ogImage);
    updateMeta('property', 'og:locale', 'en_IN');

    document.querySelectorAll('meta[data-dynamic-article-meta]').forEach((articleMeta) => articleMeta.remove());
    if (article) {
      const addArticleMeta = (property: string, content: string) => {
        const articleMeta = document.createElement('meta');
        articleMeta.setAttribute('data-dynamic-article-meta', 'true');
        articleMeta.setAttribute('property', property);
        articleMeta.setAttribute('content', content);
        document.head.appendChild(articleMeta);
      };

      addArticleMeta('article:published_time', article.datePublished);
      addArticleMeta('article:modified_time', article.dateModified || article.datePublished);
      addArticleMeta('article:author', article.author);
      if (article.section) addArticleMeta('article:section', article.section);
      article.tags?.forEach((tag) => addArticleMeta('article:tag', tag));
    }

    // Twitter Card
    updateMeta('name', 'twitter:card', 'summary_large_image');
    updateMeta('name', 'twitter:title', title);
    updateMeta('name', 'twitter:description', description);
    updateMeta('name', 'twitter:image', ogImage);
    updateMeta('name', 'twitter:site', '@casagarhr');
    updateMeta('name', 'twitter:creator', '@casagarhr');

    // Canonical Link
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    if (link.getAttribute('href') !== canonicalUrl) {
      link.setAttribute('href', canonicalUrl);
    }

    document.querySelectorAll('link[data-dynamic-alternate]').forEach((alternate) => alternate.remove());
    alternates?.forEach((alternate) => {
      const alternateLink = document.createElement('link');
      alternateLink.setAttribute('data-dynamic-alternate', 'true');
      alternateLink.setAttribute('rel', alternate.rel || 'alternate');
      if (alternate.type) alternateLink.setAttribute('type', alternate.type);
      if (alternate.title) alternateLink.setAttribute('title', alternate.title);
      alternateLink.setAttribute('href', alternate.href.startsWith('http') ? alternate.href : `${SITE_URL}${alternate.href.startsWith('/') ? '' : '/'}${alternate.href}`);
      document.head.appendChild(alternateLink);
    });

    // Clean up all existing dynamic JSON-LD tags
    const existingScripts = document.querySelectorAll('script[data-dynamic-schema]');
    existingScripts.forEach(script => script.remove());

    const addSchema = (id: string, data: object) => {
      const script = document.createElement('script');
      script.id = `json-ld-${id}`;
      script.setAttribute('data-dynamic-schema', 'true');
      script.type = 'application/ld+json';
      script.text = stringifyJsonLd(data);
      document.head.appendChild(script);
    };

    if (schema) {
      addSchema('schema', schema);
    }

    if (breadcrumbs && breadcrumbs.length > 0) {
      addSchema('breadcrumbs', {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((item, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": item.name,
          "item": item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url.startsWith('/') ? '' : '/'}${item.url}`
        }))
      });
    }

    if (article) {
      addSchema('article', {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": article.headline,
        "inLanguage": "en-IN",
        "author": {
          "@type": "Person",
          "name": article.author,
          ...(article.authorUrl ? { "url": article.authorUrl } : {}),
          ...(article.authorSameAs?.length ? { "sameAs": article.authorSameAs } : {})
        },
        "publisher": {
          "@type": "Organization",
          "name": "Sagar H R & Co.",
          "logo": {
            "@type": "ImageObject",
            "url": `${SITE_URL}/logo.png`
          }
        },
        "datePublished": article.datePublished,
        ...(article.dateModified ? { "dateModified": article.dateModified } : {}),
        ...(article.section ? { "articleSection": article.section } : {}),
        ...(article.tags?.length ? { "keywords": article.tags.join(', ') } : {}),
        ...(article.wordCount ? { "wordCount": article.wordCount } : {}),
        "image": article.image ? toAbsoluteUrl(article.image) : ogImage,
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": canonicalUrl
        }
      });
    }

    if (service) {
      addSchema('service', {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": service.name,
        "description": service.description,
        "provider": {
          "@id": `${SITE_URL}/#organization`
        },
        ...(service.areaServed ? {
          "areaServed": {
            "@type": "City",
            "name": service.areaServed
          }
        } : {})
      });
    }

    if (faqs && faqs.length > 0) {
      const faqPageDateModified = faqs
        .map((faq) => faq.dateModified)
        .filter((date): date is string => Boolean(date))
        .sort((left, right) => new Date(right).getTime() - new Date(left).getTime())[0];

      addSchema('faqs', {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        ...(faqPageDateModified ? { "dateModified": faqPageDateModified } : {}),
        "mainEntity": faqs.map(faq => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer,
            ...(faq.dateModified ? { "dateModified": faq.dateModified } : {})
          }
        }))
      });
    }

    return () => {
        document.querySelectorAll('script[data-dynamic-schema]').forEach(s => s.remove());
        document.querySelectorAll('link[data-dynamic-alternate]').forEach(s => s.remove());
        document.querySelectorAll('meta[data-dynamic-article-meta]').forEach(s => s.remove());
    };
  }, [title, description, keywords, canonicalUrl, ogType, noindex, ogImage, schema, breadcrumbs, article, service, faqs, alternates]);

  return null;
};

export default SEO;
