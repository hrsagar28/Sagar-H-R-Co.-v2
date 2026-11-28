import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// Two checks, run at two points of `npm run build`.
//
//   tsx scripts/check-csp-hash.ts           before the build: the overlay's colours
//   tsx scripts/check-csp-hash.ts --built   after the build: the fingerprint in the CSP
//
// The second one reads the finished pages in dist/, not index.html, and that
// is the point of it (Audit NOV-14). The build rewrites the inline <style>
// (Vite 8 minifies it), so the block a browser receives is not the block in
// index.html, and its fingerprint is different. When the check compared
// against index.html it passed while every browser refused the block: the
// first-paint overlay lost its styling on the live site and no longer covered
// the static page text (Audit NOV-04).
const BUILT = process.argv.includes('--built');
const netlifyToml = readFileSync('netlify.toml', 'utf8');

if (BUILT) {
  const csp = netlifyToml.match(/Content-Security-Policy = "([^"]+)"/)?.[1] ?? '';
  const allowed = csp.match(/style-src-elem([^;]*)/)?.[1] ?? '';
  const pages = (readdirSync('dist', { recursive: true }) as string[]).filter((file) => file.endsWith('.html'));
  if (pages.length === 0) throw new Error('No built pages in dist/. Run this after the build.');

  const wanted = new Map<string, string>();
  let covered = 0;
  for (const page of pages) {
    const html = readFileSync(join('dist', page), 'utf8');
    for (const match of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)) {
      const css = match[1] ?? '';
      const token = `'sha256-${createHash('sha256').update(css).digest('base64')}'`;
      if (!allowed.includes(token)) wanted.set(token, page);
    }
    if (html.includes('id="preload-hero"') && /<style\b[^>]*>[^<]*#preload-hero\s*\{/.test(html)) covered += 1;
  }

  if (wanted.size > 0) {
    const list = [...wanted].map(([token, page]) => `  ${token}  (first seen in dist/${page})`).join('\n');
    throw new Error(
      'CSP style hash is stale: browsers will refuse an inline <style> block in the built pages, ' +
        'and the first-paint overlay will stop covering the page.\n' +
        `Put this in style-src-elem in netlify.toml, in place of the old sha256 token:\n${list}`,
    );
  }
  if (covered !== pages.length) {
    throw new Error(
      `${pages.length - covered} of ${pages.length} built pages lack the #preload-hero overlay or its inline <style>.`,
    );
  }
  console.log(`CSP inline style hash matches the ${pages.length} built pages: ${allowed.trim()}`);
  process.exit(0);
}

const indexHtml = readFileSync('index.html', 'utf8');
const redesignCss = readFileSync('components/redesign/redesign.css', 'utf8');

if (!/<style>[\s\S]*?#preload-hero[\s\S]*?<\/style>/.test(indexHtml)) {
  throw new Error('Unable to find the inline <style> block for #preload-hero in index.html.');
}

// The first-paint overlay starts in the black of the first-visit splash
// (components/Preloader.tsx) and turns to the limestone the home page opens
// on, so the screen does not change colour as either appears.
const preloaderSource = readFileSync('components/Preloader.tsx', 'utf8');
const hex = '(#[0-9a-fA-F]{3,8})';
const overlayBg = indexHtml.match(new RegExp(`#preload-hero\\s*{[^}]*?background:\\s*${hex}\\s*;`))?.[1];
const overlayPageBg = indexHtml.match(new RegExp(`#preload-hero\\.page\\s*{[^}]*?background:\\s*${hex}\\s*;`))?.[1];
const splashBg = preloaderSource.match(new RegExp(`bg-\\[${hex}\\]`))?.[1];
const stone = redesignCss.match(new RegExp(`--stone:\\s*${hex}\\s*;`))?.[1];

if (!overlayBg || !overlayPageBg || !splashBg || !stone) {
  throw new Error('Unable to compare the #preload-hero colours with the splash and --stone in redesign.css.');
}

if (overlayBg.toLowerCase() !== splashBg.toLowerCase()) {
  throw new Error(`Preload overlay (${overlayBg}) must match the splash in Preloader.tsx (${splashBg}).`);
}
if (overlayPageBg.toLowerCase() !== stone.toLowerCase()) {
  throw new Error(`Preload overlay .page (${overlayPageBg}) must match --stone (${stone}).`);
}
const reducedBg = indexHtml.match(
  new RegExp(`prefers-reduced-motion: reduce\\)\\s*{\\s*#preload-hero\\s*{[^}]*?background:\\s*${hex}\\s*;`),
)?.[1];
if (reducedBg?.toLowerCase() !== stone.toLowerCase()) {
  throw new Error(`Preload overlay for reduced motion (${reducedBg}) must match --stone (${stone}).`);
}

console.log(`Preload overlay matches the splash (${splashBg}), then --stone (${stone})`);
