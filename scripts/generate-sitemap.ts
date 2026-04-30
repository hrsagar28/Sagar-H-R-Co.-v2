import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { SERVICES } from '../constants/services.tsx';
import { CHECKLIST_DATA } from '../constants/resources.ts';
import type { InsightItem } from '../types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://casagar.co.in';

interface SitemapEntry {
  loc: string;
  priority: string;
  changefreq: string;
  lastmod?: string;
}

const escapeXml = (value: string): string => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const getPublicInsights = (): InsightItem[] => {
  const insightsPath = path.resolve(__dirname, '..', 'public', 'data', 'insights.json');
  return JSON.parse(fs.readFileSync(insightsPath, 'utf-8')) as InsightItem[];
};

const generateFeeds = (insights: InsightItem[], publicDir: string): void => {
  const sortedInsights = [...insights].sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime());
  const buildDate = new Date().toUTCString();

  const rssItems = sortedInsights.map((insight) => `    <item>
      <title>${escapeXml(insight.title)}</title>
      <link>${BASE_URL}/insights/${escapeXml(insight.slug)}</link>
      <guid>${BASE_URL}/insights/${escapeXml(insight.slug)}</guid>
      <description>${escapeXml(insight.summary)}</description>
      <pubDate>${new Date(insight.date).toUTCString()}</pubDate>
      ${insight.tags?.map((tag) => `<category>${escapeXml(tag)}</category>`).join('\n      ') || ''}
    </item>`).join('\n');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Sagar H R &amp; Co. Insights</title>
    <link>${BASE_URL}/insights</link>
    <description>Tax, audit, GST, and business advisory insights from Sagar H R &amp; Co.</description>
    <language>en-IN</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
${rssItems}
  </channel>
</rss>
`;

  const atomEntries = sortedInsights.map((insight) => `  <entry>
    <title>${escapeXml(insight.title)}</title>
    <link href="${BASE_URL}/insights/${escapeXml(insight.slug)}"/>
    <id>${BASE_URL}/insights/${escapeXml(insight.slug)}</id>
    <updated>${new Date(insight.dateModified || insight.date).toISOString()}</updated>
    <published>${new Date(insight.date).toISOString()}</published>
    <summary>${escapeXml(insight.summary)}</summary>
    <author><name>${escapeXml(insight.author)}</name></author>
  </entry>`).join('\n');

  const atom = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Sagar H R &amp; Co. Insights</title>
  <link href="${BASE_URL}/insights"/>
  <link rel="self" href="${BASE_URL}/atom.xml"/>
  <id>${BASE_URL}/insights</id>
  <updated>${new Date(sortedInsights[0]?.dateModified || sortedInsights[0]?.date || new Date()).toISOString()}</updated>
${atomEntries}
</feed>
`;

  fs.writeFileSync(path.join(publicDir, 'rss.xml'), rss, 'utf-8');
  fs.writeFileSync(path.join(publicDir, 'atom.xml'), atom, 'utf-8');
};

const generateSitemap = (): void => {
  const entries: SitemapEntry[] = [];
  const today = new Date().toISOString().split('T')[0];
  const insights = getPublicInsights();

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

  for (const insight of insights) {
    entries.push({
      loc: `${BASE_URL}/insights/${insight.slug}`,
      priority: '0.7',
      changefreq: 'weekly',
      lastmod: insight.dateModified || insight.date,
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
    <lastmod>${entry.lastmod || today}</lastmod>
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

  const sitemapPath = path.join(publicDir, 'sitemap.xml');
  fs.writeFileSync(sitemapPath, xml, 'utf-8');
  generateFeeds(insights, publicDir);

  console.log(`Sitemap and feeds generated with ${entries.length} URLs -> ${sitemapPath}`);
};

generateSitemap();
