import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Reconstruct __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://casagar.co.in';

// Static routes from constants.tsx
const staticRoutes = [
  '',
  '/about',
  '/services',
  '/insights',
  '/resources',
  '/faqs',
  '/careers',
  '/contact'
];

// Service IDs from constants.tsx
const services = [
  'gst',
  'income-tax',
  'company-law',
  'litigation',
  'advisory',
  'audit',
  'bookkeeping',
  'payroll'
];

// Insight Slugs from constants.tsx
const insights = [
  'new-income-tax-bill-2025',
  'gst-reforms-2.0',
  'tds-tcs-changes-2025',
  'house-property-income',
  'gst-compliance-updates',
  'sp-rating-upgrade'
];

// Checklist IDs from constants.tsx
const checklists = [
  'new-client',
  'salaried',
  'capital-gains',
  'business-presumptive',
  'business-audit',
  'gst'
];

const generateSitemap = () => {
  const urls = [];
  const date = new Date().toISOString().split('T')[0];

  // Add Static Routes
  staticRoutes.forEach(route => {
    const loc = route === '' ? BASE_URL : `${BASE_URL}${route}`;
    urls.push({ loc, priority: route === '' ? '1.0' : '0.8', freq: 'weekly' });
  });

  // Add Dynamic Routes
  services.forEach(slug => {
    urls.push({ loc: `${BASE_URL}/services/${slug}`, priority: '0.9', freq: 'monthly' });
  });

  insights.forEach(slug => {
    urls.push({ loc: `${BASE_URL}/insights/${slug}`, priority: '0.7', freq: 'monthly' });
  });

  checklists.forEach(slug => {
    urls.push({ loc: `${BASE_URL}/resources/checklist/${slug}`, priority: '0.6', freq: 'yearly' });
  });

  // Generate XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>${u.freq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  // Create public directory if it doesn't exist (ensuring script robustness)
  const publicDir = path.join(__dirname, 'public');
  if (!fs.existsSync(publicDir)){
      fs.mkdirSync(publicDir);
  }

  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);
  console.log(`Sitemap generated with ${urls.length} URLs at public/sitemap.xml`);
};

generateSitemap();