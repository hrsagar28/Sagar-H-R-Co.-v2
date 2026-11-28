// @vitest-environment node
import fs from 'fs';
import path from 'path';
import { beforeAll, describe, expect, it } from 'vitest';
import type { InsightItem } from '../types';
import { buildRoutes } from './route-html';
import { renderStaticBody, seedArticles } from './static-body';

// Audit NOV-04: the text written into each served file. Rendered here as the
// build renders it: no browser, no window.

const insights = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '..', 'public', 'data', 'insights.json'), 'utf-8'),
) as InsightItem[];

const text = (html: string) =>
  html
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ');
const internalLinks = (html: string) => html.match(/<a\b[^>]*href="\/[^"]*"/g) ?? [];

describe('static page text (Audit NOV-04)', () => {
  beforeAll(() => seedArticles(insights));

  it('renders every public address in one piece, with one heading, real text and links to other pages', async () => {
    for (const route of ['/', ...buildRoutes(insights).map((meta) => meta.route)]) {
      const html = await renderStaticBody(route);

      expect(html.match(/<h1\b/g), route).toHaveLength(1);
      expect(text(html).split(' ').length, route).toBeGreaterThan(150);
      expect(internalLinks(html).length, route).toBeGreaterThanOrEqual(15);
      // Nothing that needs the application to finish it, and nothing the head already has.
      expect(html, route).not.toMatch(/<template\b|\$RC\(|hidden id="S:/);
      expect(html, route).not.toMatch(/<title>|<meta\b|<link\b|<iframe\b/);
      expect(text(html), route).not.toMatch(/\bLoading\b/);
    }
  }, 60_000);

  it('carries a service page’s scope of work and its structured data', async () => {
    const html = await renderStaticBody('/services/gst');

    expect(text(html)).toContain('Scope of work');
    expect(text(html)).toContain('GSTR-1');
    expect(html).toContain('"@type":"Service"');
  });

  it('carries the answers on the FAQ page, not only the questions', async () => {
    const html = await renderStaticBody('/faqs');

    expect(text(html)).toContain('How are your fees worked out?');
    expect(text(html)).toContain('fixed quote in writing');
  });

  it('carries an article’s body, which a browser would fetch separately', async () => {
    const article = insights[0]!;
    const html = await renderStaticBody(`/insights/${article.slug}`);
    const body = fs.readFileSync(
      path.resolve(__dirname, '..', 'public', 'content', 'insights', `${article.slug}.md`),
      'utf-8',
    );
    // A run of plain words from the middle of the article.
    const sample = body
      .split('\n')
      .find((line) => /^[A-Z][a-z]+( [a-z]+){6,}/.test(line))!
      .split(' ')
      .slice(0, 6)
      .join(' ');

    expect(text(html)).toContain(article.title);
    expect(text(html)).toContain(sample);
  });

  it('lists the articles on the Insights page and the home page', async () => {
    for (const route of ['/insights', '/']) {
      expect(text(await renderStaticBody(route)), route).toContain(insights[0]!.title);
    }
  });
});
