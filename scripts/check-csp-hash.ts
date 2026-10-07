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

// The first-paint overlay on the home page is the colour of the redesigned
// header band, so the page does not change colour as it appears.
const preloadBgMatch = indexHtml.match(/#preload-hero\s*{[\s\S]*?background:\s*(#[0-9a-fA-F]{3,8})\s*;/);
const nightMatch = redesignCss.match(/--night:\s*(#[0-9a-fA-F]{3,8})\s*;/);

if (!preloadBgMatch?.[1] || !nightMatch?.[1]) {
  throw new Error('Unable to compare the #preload-hero background with --night in redesign.css.');
}

if (preloadBgMatch[1].toLowerCase() !== nightMatch[1].toLowerCase()) {
  throw new Error(`Preload hero background (${preloadBgMatch[1]}) must match --night (${nightMatch[1]}).`);
}

console.log(`CSP inline style hash is current: ${expectedToken}`);
console.log(`Preload hero background matches --night: ${nightMatch[1]}`);
