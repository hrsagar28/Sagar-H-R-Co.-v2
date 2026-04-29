import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { SERVICES } from '../constants/services.tsx';
import { INSIGHTS_MOCK } from '../constants/insights.ts';
import { CHECKLIST_DATA } from '../constants/resources.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://casagar.co.in';

interface SitemapEntry {
  loc: string;
  priority: string;
  changefreq: string;
}

const escapeXml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const stripHtml = (value: string): string => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const generateSitemap = (): void => {
  const entries: SitemapEntry[] = [];
  const today = new Date().toISOString().split('T')[0];

  entries.push({ loc: BASE_URL, priority: '1.0', changefreq: 'weekly' });
  entries.push({ loc: `${BASE_URL}/services`, priority: '0.9', changefreq: 'weekly' });
  entries.push({ loc: `${BASE_URL}/insights`, priority: '0.9', changefreq: 'weekly' });

  for (const page of ['/about', '/resources', '/faqs', '/careers', '/contact']) {
    entries.push({ loc: `${BASE_URL}${page}`, priority: '0.8', changefreq: 'monthly' });
  }

  for (const service of SERVICES) {
    entries.push({
      loc: `${BASE_URL}${service.link}`,
      priority: '0.8',
      changefreq: 'monthly',
    });
  }

  for (const insight of INSIGHTS_MOCK) {
    entries.push({
      loc: `${BASE_URL}/insights/${insight.slug}`,
      priority: '0.7',
      changefreq: 'weekly',
    });
  }

  for (const slug of Object.keys(CHECKLIST_DATA)) {
    entries.push({
      loc: `${BASE_URL}/resources/checklist/${slug}`,
      priority: '0.6',
      changefreq: 'yearly',
    });
  }

  for (const page of ['/disclaimer', '/privacy', '/terms']) {
    entries.push({ loc: `${BASE_URL}${page}`, priority: '0.5', changefreq: 'yearly' });
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (entry) => `  <url>
    <loc>${entry.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

  const publicDir = path.resolve(__dirname, '..', 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const sortedInsights = [...INSIGHTS_MOCK].sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime());
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml('Sagar H R & Co. Insights')}</title>
    <link>${BASE_URL}/insights</link>
    <description>${escapeXml('Tax, GST, audit, and business compliance insights from Sagar H R & Co.')}</description>
    <language>en-IN</language>
    <atom:link href="${BASE_URL}/rss.xml" rel="self" type="application/rss+xml" />
${sortedInsights
  .map((insight) => `    <item>
      <title>${escapeXml(insight.title)}</title>
      <link>${BASE_URL}/insights/${insight.slug}</link>
      <guid>${BASE_URL}/insights/${insight.slug}</guid>
      <pubDate>${new Date(insight.date).toUTCString()}</pubDate>
      <author>${escapeXml(insight.author)}</author>
      <category>${escapeXml(insight.category)}</category>
      <description>${escapeXml(stripHtml(insight.summary))}</description>
    </item>`)
  .join('\n')}
  </channel>
</rss>
`;

  const jsonFeed = {
    version: 'https://jsonfeed.org/version/1.1',
    title: 'Sagar H R & Co. Insights',
    home_page_url: `${BASE_URL}/insights`,
    feed_url: `${BASE_URL}/feed.json`,
    language: 'en-IN',
    items: sortedInsights.map((insight) => ({
      id: `${BASE_URL}/insights/${insight.slug}`,
      url: `${BASE_URL}/insights/${insight.slug}`,
      title: insight.title,
      summary: stripHtml(insight.summary),
      date_published: new Date(insight.date).toISOString(),
      authors: [{ name: insight.author }],
      tags: [insight.category],
    })),
  };

  const sitemapPath = path.join(publicDir, 'sitemap.xml');
  fs.writeFileSync(sitemapPath, xml, 'utf-8');
  fs.writeFileSync(path.join(publicDir, 'rss.xml'), rss, 'utf-8');
  fs.writeFileSync(path.join(publicDir, 'feed.json'), `${JSON.stringify(jsonFeed, null, 2)}\n`, 'utf-8');

  console.log(`Sitemap generated with ${entries.length} URLs -> ${sitemapPath}`);
  console.log(`Feeds generated -> ${path.join(publicDir, 'rss.xml')} and ${path.join(publicDir, 'feed.json')}`);
};

generateSitemap();

