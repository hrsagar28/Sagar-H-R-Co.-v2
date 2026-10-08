import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const indexHtml = readFileSync('index.html', 'utf8');
const netlifyToml = readFileSync('netlify.toml', 'utf8');
const redesignCss = readFileSync('components/redesign/redesign.css', 'utf8');

const styleMatch = indexHtml.match(/<style>([\s\S]*?)<\/style>/);
if (!styleMatch?.[1]) {
  throw new Error('Unable to find an inline <style> block in index.html.');
}

const computedHash = createHash('sha256').update(styleMatch[1]).digest('base64');
const expectedToken = `'sha256-${computedHash}'`;

if (!netlifyToml.includes(expectedToken)) {
  throw new Error(
    `CSP style hash is stale. Expected netlify.toml to include ${expectedToken}. ` +
      'Regenerate it after editing the inline <style> block in index.html.',
  );
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

console.log(`CSP inline style hash is current: ${expectedToken}`);
console.log(`Preload overlay matches the splash (${splashBg}), then --stone (${stone})`);
