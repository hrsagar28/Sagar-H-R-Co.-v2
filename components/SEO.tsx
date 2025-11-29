
import React, { useEffect } from 'react';

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
  /** URL for the social share image. Default provided. */
  ogImage?: string;
  /** Structured Data (JSON-LD) object(s) */
  schema?: object | object[];
}

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
  canonicalUrl = window.location.href,
  ogType = 'website',
  ogImage = 'https://casagar.co.in/og-image.jpg',
  schema
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

    // Open Graph
    updateMeta('property', 'og:title', title);
    updateMeta('property', 'og:description', description);
    updateMeta('property', 'og:url', canonicalUrl);
    updateMeta('property', 'og:type', ogType);
    updateMeta('property', 'og:image', ogImage);

    // Twitter Card
    updateMeta('name', 'twitter:card', 'summary_large_image');
    updateMeta('name', 'twitter:title', title);
    updateMeta('name', 'twitter:description', description);
    updateMeta('name', 'twitter:image', ogImage);

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

    // JSON-LD Schema
    const scriptId = 'json-ld-schema';
    // Remove existing schema script to prevent duplicates on re-render/route change
    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
        existingScript.remove();
    }

    if (schema) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      script.text = JSON.stringify(schema);
      document.head.appendChild(script);
    }

    return () => {
        // Optional: We could clean up, but keeping meta tags until next SEO component mounts 
        // is usually better for persistence during transitions.
        // However, we strictly remove the schema to avoid stale structured data.
        const s = document.getElementById(scriptId);
        if (s) s.remove();
    };
  }, [title, description, keywords, canonicalUrl, ogType, ogImage, schema]);

  return null;
};

export default SEO;
