import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Import data from project constants
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

  // ── 1. Home page ──────────────────────────────────────────────
  entries.push({ loc: BASE_URL, priority: '1.0', changefreq: 'weekly' });

  // ── 2. Index pages (services & insights) ──────────────────────
  entries.push({ loc: `${BASE_URL}/services`, priority: '0.9', changefreq: 'weekly' });
  entries.push({ loc: `${BASE_URL}/insights`, priority: '0.9', changefreq: 'weekly' });

  // ── 3. Other static pages ─────────────────────────────────────
  const staticPages = ['/about', '/resources', '/faqs', '/careers', '/contact'];
  for (const page of staticPages) {
    entries.push({ loc: `${BASE_URL}${page}`, priority: '0.8', changefreq: 'monthly' });
  }

  // ── 4. Service detail pages (from constants) ──────────────────
  for (const service of SERVICES) {
    entries.push({
      loc: `${BASE_URL}/services/${service.id}`,
      priority: '0.8',
      changefreq: 'monthly',
    });
  }

  // ── 5. Insight detail pages (from constants) ──────────────────
  for (const insight of INSIGHTS_MOCK) {
    entries.push({
      loc: `${BASE_URL}/insights/${insight.slug}`,
      priority: '0.7',
      changefreq: 'weekly',
    });
  }

  // ── 6. Checklist detail pages (from constants) ────────────────
  for (const slug of Object.keys(CHECKLIST_DATA)) {
    entries.push({
      loc: `${BASE_URL}/resources/checklist/${slug}`,
      priority: '0.6',
      changefreq: 'yearly',
    });
  }

  // ── 7. Legal pages ────────────────────────────────────────────
  const legalPages = ['/disclaimer', '/privacy', '/terms'];
  for (const page of legalPages) {
    entries.push({ loc: `${BASE_URL}${page}`, priority: '0.5', changefreq: 'yearly' });
  }

  // ── Build XML ─────────────────────────────────────────────────
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (e) => `  <url>
    <loc>${e.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

  // ── Write file ────────────────────────────────────────────────
  const publicDir = path.resolve(__dirname, '..', 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const outputPath = path.join(publicDir, 'sitemap.xml');
  fs.writeFileSync(outputPath, xml, 'utf-8');

  console.log(`✅ Sitemap generated with ${entries.length} URLs → ${outputPath}`);
};

generateSitemap();
