import fs from 'fs';
import path from 'path';
import React from 'react';
import { prerenderToNodeStream } from 'react-dom/static';
// From 'react-router-dom', as the pages import it: two copies of the router
// (one per package name) would not see each other's <Router>.
import { Route, Routes, StaticRouter } from 'react-router-dom';

import { AnnounceProvider } from '../context/AnnounceContext.tsx';
import { ToastProvider } from '../context/ToastContext.tsx';
import { seedInsights } from '../hooks/useInsights.ts';
import { seedArticleBody } from '../hooks/useArticleBody.ts';
import { CONTACT_INFO } from '../config/contact.ts';
import {
  RD_FOOTER_EXPLORE,
  RD_FOOTER_RESOURCES,
  RD_LEGAL_LINKS,
  RD_PRIMARY_LINKS,
} from '../components/redesign/content.ts';
import type { InsightItem } from '../types/index.ts';

import Home from '../pages/Home.tsx';
import Services from '../pages/Services.tsx';
import ServiceDetail from '../pages/ServiceDetail.tsx';
import Insights from '../pages/Insights.tsx';
import InsightDetail from '../pages/InsightDetail.tsx';
import FAQ from '../pages/FAQ.tsx';
import Resources from '../pages/Resources.tsx';
import ChecklistDetail from '../pages/ChecklistDetail.tsx';
import ResourceTool from '../pages/ResourceTool.tsx';
import Careers from '../pages/Careers.tsx';
import Contact from '../pages/Contact.tsx';
import Disclaimer from '../pages/Disclaimer.tsx';
import Privacy from '../pages/Privacy.tsx';
import Terms from '../pages/Terms.tsx';

// Audit NOV-04: each page's text, as plain HTML, for the file served at its
// address (scripts/generate-route-html.ts puts it inside #root). Clients that
// do not run JavaScript (the crawlers behind AI assistants, some search
// engines) then get the words and the links instead of an empty page. In a
// browser the application starts as before and replaces this markup; it is
// never shown, because the first-paint overlay covers it until then (index.tsx).
//
// The pages themselves are rendered, so the text cannot drift from the site.
// Only the page is rendered, not App.tsx: the layout, its stylesheet and the
// browser-only shell stay out. A plain header and footer of links stand in for
// them, so that every page leads to the others.

const repoRoot = path.resolve(import.meta.dirname, '..');

/** Hands the articles to the hooks that would fetch them in a browser. */
export const seedArticles = (insights: InsightItem[]) => {
  seedInsights(insights);
  for (const insight of insights) {
    const file = path.join(repoRoot, 'public', 'content', 'insights', `${insight.slug}.md`);
    if (fs.existsSync(file)) seedArticleBody(insight.slug, fs.readFileSync(file, 'utf-8'));
  }
};

const links = (items: { label: string; to: string }[]) =>
  items.map((item) => (
    <li key={item.to}>
      <a href={item.to}>{item.label}</a>
    </li>
  ));

const Page: React.FC<{ route: string }> = ({ route }) => (
  <AnnounceProvider>
    <ToastProvider>
      <StaticRouter location={route}>
        <header>
          <a href="/">{CONTACT_INFO.name}</a>
          <nav aria-label="Main">
            <ul>
              {links(RD_PRIMARY_LINKS)}
              <li>
                <a href="/contact">Contact us</a>
              </li>
            </ul>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/:slug" element={<ServiceDetail />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/insights/:slug" element={<InsightDetail />} />
            <Route path="/faqs" element={<FAQ />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/resources/checklist/:slug" element={<ChecklistDetail />} />
            <Route path="/resources/:tool" element={<ResourceTool />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/disclaimer" element={<Disclaimer />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
          </Routes>
        </main>
        <footer>
          <p>
            {CONTACT_INFO.name}, {CONTACT_INFO.tagline}
          </p>
          <address>
            {CONTACT_INFO.address.lines.join(', ')}, {CONTACT_INFO.address.state}, {CONTACT_INFO.address.country}
          </address>
          <p>
            <a href={`tel:${CONTACT_INFO.phone.value}`}>{CONTACT_INFO.phone.display}</a>{' '}
            <a href={`mailto:${CONTACT_INFO.email}`}>{CONTACT_INFO.email}</a>
          </p>
          <nav aria-label="Site">
            <ul>{links([...RD_FOOTER_EXPLORE, ...RD_FOOTER_RESOURCES, ...RD_LEGAL_LINKS])}</ul>
          </nav>
        </footer>
      </StaticRouter>
    </ToastProvider>
  </AnnounceProvider>
);

const collect = async (stream: NodeJS.ReadableStream): Promise<string> => {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString('utf-8');
};

/**
 * The head already carries the page's title, description and share tags
 * (renderRouteHtml), so the copies the SEO component renders are dropped, as
 * are things that only work with the application running: the map, the
 * forms' inputs and buttons, loading placeholders. The JSON-LD stays: a
 * crawler that does not run JavaScript gets the structured data too.
 */
const tidy = (html: string) =>
  html
    .replace(/<title>[\s\S]*?<\/title>/g, '')
    .replace(/<meta\b[^>]*>/g, '')
    .replace(/<link\b[^>]*>/g, '')
    .replace(/<iframe\b[\s\S]*?<\/iframe>/g, '')
    .replace(/<!--[\s\S]*?-->/g, '');

const render = async (route: string) => {
  const { prelude } = await prerenderToNodeStream(<Page route={route} />, {
    // Never set a large part aside to be swapped in by a script: the served
    // file runs no inline script (the CSP), and the text must be in place.
    progressiveChunkSize: Number.MAX_SAFE_INTEGER,
  });
  return tidy(await collect(prelude));
};

/** React's markers for a part that arrived after its placeholder (a lazy-loaded tool, the first time). */
const STREAMED = /<template\b|\$RC\(|hidden id="S:/;

/** The page at `route` as plain HTML, for inside #root. */
export const renderStaticBody = async (route: string): Promise<string> => {
  let html = await render(route);
  // A tool page is lazy-loaded (pages/ResourceTool.tsx). The first render
  // writes its placeholder and then the page beside it, with a script to swap
  // them; by the second render the page's code has loaded and it is written
  // in place.
  if (STREAMED.test(html)) html = await render(route);
  if (STREAMED.test(html)) {
    throw new Error(`static-body: ${route} did not render in one piece`);
  }
  return html;
};
