import React, { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogType?: 'website' | 'article' | 'profile';
  ogImage?: string;
  schema?: object | object[];
}

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

    // Helper to update or create meta tags
    const updateMeta = (selector: string, content: string, attrName: string, attrValue: string) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Standard Meta
    updateMeta('meta[name="description"]', description, 'name', 'description');
    updateMeta('meta[name="keywords"]', keywords, 'name', 'keywords');

    // Open Graph
    updateMeta('meta[property="og:title"]', title, 'property', 'og:title');
    updateMeta('meta[property="og:description"]', description, 'property', 'og:description');
    updateMeta('meta[property="og:url"]', canonicalUrl, 'property', 'og:url');
    updateMeta('meta[property="og:type"]', ogType, 'property', 'og:type');
    updateMeta('meta[property="og:image"]', ogImage, 'property', 'og:image');

    // Twitter Card
    updateMeta('meta[name="twitter:card"]', 'summary_large_image', 'name', 'twitter:card');
    updateMeta('meta[name="twitter:title"]', title, 'name', 'twitter:title');
    updateMeta('meta[name="twitter:description"]', description, 'name', 'twitter:description');
    updateMeta('meta[name="twitter:image"]', ogImage, 'name', 'twitter:image');

    // Canonical Link
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', canonicalUrl);

    // JSON-LD Schema
    if (schema) {
      const scriptId = 'json-ld-schema';
      let script = document.getElementById(scriptId) as HTMLScriptElement;
      
      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      
      script.text = JSON.stringify(schema);
    }

    return () => {
        // Optional: Cleanup schema on unmount if needed, 
        // though usually next page overwrites it immediately.
        // const script = document.getElementById('json-ld-schema');
        // if (script) script.remove();
    };
  }, [title, description, keywords, canonicalUrl, ogType, ogImage, schema]);

  return null;
};

export default SEO;