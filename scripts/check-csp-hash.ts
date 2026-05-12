import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const indexHtml = readFileSync('index.html', 'utf8');
const netlifyToml = readFileSync('netlify.toml', 'utf8');
const starFieldSource = readFileSync('components/home/StarField.tsx', 'utf8');

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

const preloadBgMatch = indexHtml.match(/#preload-hero\s*{[\s\S]*?background:\s*(#[0-9a-fA-F]{3,8})\s*;/);
const starFieldBgMatch = starFieldSource.match(/export const STARFIELD_BG = ['"](#[0-9a-fA-F]{3,8})['"]/);

if (!preloadBgMatch?.[1] || !starFieldBgMatch?.[1]) {
  throw new Error('Unable to compare #preload-hero background with STARFIELD_BG.');
}

if (preloadBgMatch[1].toLowerCase() !== starFieldBgMatch[1].toLowerCase()) {
  throw new Error(`Preload hero background (${preloadBgMatch[1]}) must match STARFIELD_BG (${starFieldBgMatch[1]}).`);
}

console.log(`CSP inline style hash is current: ${expectedToken}`);
console.log(`Preload hero background matches STARFIELD_BG: ${starFieldBgMatch[1]}`);
