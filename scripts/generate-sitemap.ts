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

  const sitemapPath = path.join(publicDir, 'sitemap.xml');
  fs.writeFileSync(sitemapPath, xml, 'utf-8');

  console.log(`Sitemap generated with ${entries.length} URLs -> ${sitemapPath}`);
};

generateSitemap();
