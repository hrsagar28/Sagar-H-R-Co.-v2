import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import type { InsightItem } from '../types/index.ts';
import { buildRoutes, renderNotFoundHtml, renderRouteHtml, routeFile, withStaticBody } from './route-html.ts';
import { renderStaticBody, seedArticles } from './static-body.tsx';

// Audit SEO-02: writes dist/<route>.html for every public address other than
// the home page, with that page's title, description and share tags in place
// of the home page's, so that WhatsApp, search engines and other clients that
// do not run JavaScript see the right text. Runs after `vite build`.
//
// Netlify serves a file that exists for the requested path in preference to
// the `/*` rewrite in netlify.toml (rewrites do not shadow existing files).
// The application boots on each of them exactly as it does on index.html.
//
// Audit NOV-04: each file, and index.html for the home page, also carries the
// page's text inside #root (scripts/static-body.tsx), for clients that do not
// run JavaScript. dist/404.html is the plain template, for addresses that
// have no page.

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const dist = path.join(repoRoot, 'dist');

const insights = JSON.parse(
  fs.readFileSync(path.join(repoRoot, 'public', 'data', 'insights.json'), 'utf-8'),
) as InsightItem[];
const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf-8');
seedArticles(insights);

fs.writeFileSync(path.join(dist, '404.html'), renderNotFoundHtml(template));

let written = 0;
let bytes = 0;
for (const meta of buildRoutes(insights)) {
  const file = path.join(dist, routeFile(meta.route));
  const html = withStaticBody(renderRouteHtml(template, meta), await renderStaticBody(meta.route));
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  written += 1;
  bytes += html.length;
}

// The home page: index.html keeps its own title and description.
const home = withStaticBody(template, await renderStaticBody('/'));
fs.writeFileSync(path.join(dist, 'index.html'), home);
bytes += home.length;

console.log(
  `generate-route-html: wrote ${written} route files, index.html and 404.html under dist/ (${Math.round(bytes / 1024)} kB with the pages' text)`,
);
