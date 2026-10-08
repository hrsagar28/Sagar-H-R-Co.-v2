import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import type { InsightItem } from '../types/index.ts';
import { buildRoutes, renderRouteHtml, routeFile } from './route-html.ts';

// Audit SEO-02: writes dist/<route>.html for every public address other than
// the home page, with that page's title, description and share tags in place
// of the home page's, so that WhatsApp, search engines and other clients that
// do not run JavaScript see the right text. Runs after `vite build`.
//
// Netlify serves a file that exists for the requested path in preference to
// the `/* -> /index.html` rewrite in netlify.toml (rewrites do not shadow
// existing files), so these take effect with no change there. The application
// boots on each of them exactly as it does on index.html.

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const dist = path.join(repoRoot, 'dist');

const insights = JSON.parse(
  fs.readFileSync(path.join(repoRoot, 'public', 'data', 'insights.json'), 'utf-8'),
) as InsightItem[];
const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf-8');

let written = 0;
for (const meta of buildRoutes(insights)) {
  const file = path.join(dist, routeFile(meta.route));
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, renderRouteHtml(template, meta));
  written += 1;
}

console.log(`generate-route-html: wrote ${written} route files under dist/`);
