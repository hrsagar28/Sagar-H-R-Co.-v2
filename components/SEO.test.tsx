import React from 'react';
import '@testing-library/jest-dom/vitest';
import { render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import SEO from './SEO';

// The served HTML carries the home page's (or, from the route files, the
// page's) title, description and share tags, marked data-fallback, for
// clients that do not run JavaScript. Once the page's own tags are in the
// head, they go (Audit SEO-01).
const addFallbacks = () => {
  document.head.insertAdjacentHTML(
    'beforeend',
    [
      '<title data-fallback>Sagar H R &amp; Co. | Chartered Accountants | Mysuru</title>',
      '<meta data-fallback name="description" content="The home page" />',
      '<meta data-fallback property="og:title" content="The home page" />',
      '<link data-fallback rel="canonical" href="https://casagar.co.in/services/gst" />',
    ].join(''),
  );
};

afterEach(() => {
  document.head.innerHTML = '';
});

describe('SEO', () => {
  it('leaves one title, one description and one canonical in the head', () => {
    addFallbacks();
    render(
      <SEO title="GST | Sagar H R & Co." description="GST work." canonicalUrl="https://casagar.co.in/services/gst" />,
    );

    expect(document.head.querySelectorAll('[data-fallback]')).toHaveLength(0);
    expect(document.querySelectorAll('title')).toHaveLength(1);
    expect(document.title).toBe('GST | Sagar H R & Co.');
    expect(document.querySelectorAll('meta[name="description"]')).toHaveLength(1);
    expect(document.querySelectorAll('meta[property="og:title"]')).toHaveLength(1);
    expect(document.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
  });

  it('names no canonical address on a page that is not to be indexed (Audit SEO-05)', () => {
    render(<SEO title="Page not found" description="Not here." noindex />);

    expect(document.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow');
    expect(document.querySelector('link[rel="canonical"]')).toBeNull();
    expect(document.querySelector('meta[property="og:url"]')).toBeNull();
  });
});
