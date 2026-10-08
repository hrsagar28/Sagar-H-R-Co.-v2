import { describe, expect, it } from 'vitest';
import type { InsightItem } from '../types';
import { buildRoutes, renderRouteHtml, routeFile } from './route-html';

const TEMPLATE = `<!doctype html><html><head>
    <title data-fallback>Sagar H R &amp; Co. | Chartered Accountants | Mysuru</title>
    <meta data-fallback name="description" content="Home description" />
    <meta data-fallback property="og:type" content="website" />
    <meta data-fallback property="og:title" content="Home title" />
    <meta data-fallback property="og:description" content="Home share text" />
    <meta data-fallback property="og:image" content="https://casagar.co.in/og/og-default.png" />
    <meta data-fallback name="twitter:card" content="summary_large_image" />
    <meta data-fallback name="twitter:title" content="Home title" />
    <meta data-fallback name="twitter:description" content="Home share text" />
    <meta data-fallback name="twitter:image" content="https://casagar.co.in/og/og-default.png" />
</head><body><div id="root"></div></body></html>`;

const INSIGHT = {
  id: '9',
  title: 'Updated returns: the four-year window',
  category: 'Income Tax',
  date: '2026-06-22',
  summary: 'Updated returns now have 48 months.',
  slug: 'itr-u-48-month-window',
  author: 'CA Sagar H R',
  authorId: 'sagar-hr',
  readTime: '5 min read',
  image: '/og/itr-u-48-month-window.png',
} satisfies InsightItem;

const routes = buildRoutes([INSIGHT]);
const routeFor = (path: string) => {
  const meta = routes.find((route) => route.route === path);
  if (!meta) throw new Error(`no route ${path}`);
  return meta;
};

describe('route HTML (Audit SEO-02)', () => {
  it('covers every page type, once each, and not the home page', () => {
    const paths = routes.map((route) => route.route);
    expect(new Set(paths).size).toBe(paths.length);
    expect(paths).toEqual(
      expect.arrayContaining(['/services', '/services/gst', '/insights/itr-u-48-month-window', '/faqs', '/contact']),
    );
    expect(paths).not.toContain('/');
  });

  it('writes a service page’s own title, description, address and canonical', () => {
    const html = renderRouteHtml(TEMPLATE, routeFor('/services/gst'));

    expect(html).toContain('<title data-fallback>GST | Sagar H R &amp; Co.</title>');
    expect(html).not.toContain('Home description');
    expect(html).not.toContain('Home title');
    expect(html).toContain('<meta data-fallback property="og:url" content="https://casagar.co.in/services/gst" />');
    expect(html).toContain('<link data-fallback rel="canonical" href="https://casagar.co.in/services/gst" />');
    expect(html.match(/<title/g)).toHaveLength(1);
  });

  it('gives an article its picture and the article type', () => {
    const html = renderRouteHtml(TEMPLATE, routeFor('/insights/itr-u-48-month-window'));

    expect(html).toContain('content="Updated returns: the four-year window | Sagar H R &amp; Co."');
    expect(html).toContain('property="og:type" content="article"');
    expect(html).toContain('property="og:image" content="https://casagar.co.in/og/itr-u-48-month-window.png"');
    expect(html).toContain('name="twitter:image" content="https://casagar.co.in/og/itr-u-48-month-window.png"');
    expect(html).toContain('name="description" content="Updated returns now have 48 months."');
  });

  it('names each file after its address, not a folder index (which Netlify answers with a redirect)', () => {
    expect(routeFile('/services/gst')).toBe('services/gst.html');
    expect(routeFile('/resources/checklist/salaried')).toBe('resources/checklist/salaried.html');
  });
});
