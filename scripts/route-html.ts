import { SERVICE_PAGES } from '../constants/services.tsx';
import { CHECKLISTS } from '../constants/resources/checklists.ts';
import { RESOURCE_TOOLS } from '../constants/resources/tools.ts';
import { getOpenRoles } from '../constants/careers.ts';
import { CONTACT_INFO } from '../config/contact.ts';
import { PAGE_META, articleTitle, careersMeta, type PageMeta } from '../constants/pageMeta.ts';
import type { InsightItem } from '../types/index.ts';

// The pure half of scripts/generate-route-html.ts (Audit SEO-02): the table of
// public addresses with each one's title, description and share picture, and
// the function that writes them into a copy of dist/index.html. Kept apart
// from the file writing so that it can be tested.
//
// The text comes from the same places the pages read it from: the service,
// tool and checklist data, public/data/insights.json, and
// constants/pageMeta.ts for the pages whose text is fixed.

export const BASE_URL = 'https://casagar.co.in';
const DEFAULT_IMAGE = `${BASE_URL}/og/og-default.png`;

export interface RouteMeta extends PageMeta {
  route: string;
  type?: 'website' | 'article';
}

const page = (route: string, meta: PageMeta): RouteMeta => ({ route, ...meta });

export const buildRoutes = (insights: InsightItem[]): RouteMeta[] => [
  page('/services', PAGE_META.services),
  ...SERVICE_PAGES.map((service) => ({
    route: `/services/${service.slug}`,
    title: `${service.name} | ${CONTACT_INFO.name}`,
    description: service.intro,
  })),
  page('/insights', PAGE_META.insights),
  ...insights.map((insight) => ({
    route: `/insights/${insight.slug}`,
    title: articleTitle(insight.title),
    description: insight.summary,
    ogImage: insight.image ? `${BASE_URL}${insight.image}` : undefined,
    type: 'article' as const,
  })),
  page('/faqs', PAGE_META.faqs),
  page('/resources', PAGE_META.resources),
  ...RESOURCE_TOOLS.map((tool) => ({
    route: `/resources/${tool.slug}`,
    title: `${tool.name} | ${CONTACT_INFO.name}`,
    description: tool.summary,
  })),
  ...CHECKLISTS.map((checklist) => ({
    route: `/resources/checklist/${checklist.slug}`,
    title: `${checklist.title} checklist | ${CONTACT_INFO.name}`,
    description: `${checklist.summary} The documents to send us.`,
  })),
  page('/careers', careersMeta(getOpenRoles().map((role) => role.role))),
  page('/contact', PAGE_META.contact),
  page('/privacy', PAGE_META.privacy),
  page('/terms', PAGE_META.terms),
  page('/disclaimer', PAGE_META.disclaimer),
];

export const escapeHtml = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Replace the content of one `<meta name|property="…">` tag in the template. */
const setMeta = (html: string, attr: 'name' | 'property', key: string, content: string): string => {
  const pattern = new RegExp(`(<meta\\s[^>]*${attr}="${key}"[^>]*content=")[^"]*(")`, 's');
  if (!pattern.test(html)) throw new Error(`route-html: no <meta ${attr}="${key}"> in the template`);
  return html.replace(pattern, (_match, before: string, after: string) => `${before}${escapeHtml(content)}${after}`);
};

const TITLE = /<title[^>]*>[^<]*<\/title>/;

/** dist/index.html with one page's title, description, share tags and canonical. */
export const renderRouteHtml = (template: string, meta: RouteMeta): string => {
  if (!TITLE.test(template)) throw new Error('route-html: no <title> in the template');
  const url = `${BASE_URL}${meta.route}`;
  const image = meta.ogImage ?? DEFAULT_IMAGE;
  let html = template.replace(TITLE, () => `<title data-fallback>${escapeHtml(meta.title)}</title>`);
  html = setMeta(html, 'name', 'description', meta.description);
  html = setMeta(html, 'property', 'og:type', meta.type ?? 'website');
  html = setMeta(html, 'property', 'og:title', meta.title);
  html = setMeta(html, 'property', 'og:description', meta.description);
  html = setMeta(html, 'property', 'og:image', image);
  html = setMeta(html, 'name', 'twitter:title', meta.title);
  html = setMeta(html, 'name', 'twitter:description', meta.description);
  html = setMeta(html, 'name', 'twitter:image', image);
  // og:url and the canonical are not in index.html; add them beside og:image.
  // data-fallback: components/SEO.tsx removes them once the page's own are in.
  return html.replace(
    /(<meta\s[^>]*property="og:image"[^>]*>)/,
    (tag) =>
      `${tag}\n    <meta data-fallback property="og:url" content="${url}" />\n    <link data-fallback rel="canonical" href="${url}" />`,
  );
};

/**
 * Where a route's file goes, relative to dist/: `/services/gst` →
 * `services/gst.html`. Netlify serves `services/gst.html` at `/services/gst`
 * with no redirect; a `services/gst/index.html` would instead be answered
 * with a 301 to `/services/gst/`, away from the canonical address.
 */
export const routeFile = (route: string): string => `${route.replace(/^\//, '')}.html`;
