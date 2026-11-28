import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { FAQS } from '../constants/faq.ts';

// Audit NOV-05 and NOV-10: what every visitor downloads before the first page
// shows is the entry file and whatever it imports outright. Two things must
// stay out of that: the markdown renderer (only an article needs it) and the
// site's content (the FAQs, service pages and due dates, which only the pages
// that show them need). Both have slipped in before without any test or page
// looking different: the content through the constants barrel, and the
// markdown renderer when the bundler changed with Vite 8. Runs after
// `vite build`; a failure stops the build.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dist = path.resolve(__dirname, '..', 'dist');
const assets = path.join(dist, 'assets');

const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf-8');
const entry = /<script[^>]*\ssrc="\/assets\/([^"]+\.js)"/.exec(html)?.[1];
if (!entry) throw new Error('check-chunks: no entry script in dist/index.html');

// The entry and everything it imports statically, however deep. Imports made
// with import() are the lazy ones, and are left out on purpose.
const STATIC_IMPORT = /(?:from|import)\s*"\.\/([^"]+\.js)"/g;
const firstLoad = new Set<string>();
const visit = (file: string) => {
  if (firstLoad.has(file)) return;
  firstLoad.add(file);
  const code = fs.readFileSync(path.join(assets, file), 'utf-8');
  for (const match of code.matchAll(STATIC_IMPORT)) visit(match[1]!);
};
visit(entry);

const preloaded = [...html.matchAll(/<link[^>]*rel="modulepreload"[^>]*href="\/assets\/([^"]+)"/g)].map((m) => m[1]!);
const problems: string[] = [];

for (const file of new Set([...firstLoad, ...preloaded])) {
  if (/markdown-vendor/.test(file)) {
    problems.push(`${file} (the markdown renderer) is part of the first download`);
  }
}
const sentinel = FAQS[0]?.question;
if (!sentinel) throw new Error('check-chunks: no FAQ to look for');
for (const file of firstLoad) {
  if (fs.readFileSync(path.join(assets, file), 'utf-8').includes(sentinel)) {
    problems.push(`${file} is part of the first download and carries the FAQs (see constants/index.ts)`);
  }
}

if (problems.length > 0) {
  console.error(`check-chunks: the first download has grown.\n- ${problems.join('\n- ')}`);
  process.exit(1);
}

const kb = [...firstLoad].reduce((sum, file) => sum + fs.statSync(path.join(assets, file)).size, 0) / 1024;
console.log(`check-chunks: first download is ${[...firstLoad].join(', ')} (${Math.round(kb)} kB before compression)`);
