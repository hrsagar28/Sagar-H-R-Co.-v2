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

// The first-paint overlay on the home page is the limestone the page opens on,
// so the page does not change colour as it appears.
const preloadBg = indexHtml.match(/#preload-hero\s*{[\s\S]*?background:\s*(#[0-9a-fA-F]{3,8})\s*;/)?.[1];
const stone = redesignCss.match(/--stone:\s*(#[0-9a-fA-F]{3,8})\s*;/)?.[1];

if (!preloadBg || !stone) {
  throw new Error('Unable to compare the #preload-hero background with --stone in redesign.css.');
}

if (preloadBg.toLowerCase() !== stone.toLowerCase()) {
  throw new Error(`Preload hero background (${preloadBg}) must match --stone (${stone}).`);
}

console.log(`CSP inline style hash is current: ${expectedToken}`);
console.log(`Preload hero background matches --stone: ${stone}`);
