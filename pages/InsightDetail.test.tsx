import React from 'react';
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import * as matchers from 'vitest-axe/matchers';
import InsightDetail from './InsightDetail';

expect.extend(matchers);

vi.mock('../components/SEO', () => ({
  default: () => null,
}));

const insights: Array<Record<string, unknown> & { title: string; slug: string; dateModified?: string }> = [
  {
    id: '6',
    title: 'Presumptive taxation under the 2025 Act',
    category: 'Income Tax',
    date: '2026-06-17',
    summary: 'Sections 44AD, 44ADA and 44AE fold into Section 58.',
    slug: 'presumptive-taxation',
    author: 'CA Sagar H R',
    readTime: '4 min read',
    tags: ['income-tax'],
  },
  {
    id: '9',
    title: 'The 48-month ITR-U window',
    category: 'Income Tax',
    date: '2026-06-22',
    summary: 'Updated returns now have 48 months.',
    slug: 'itr-u',
    author: 'CA Sagar H R',
    readTime: '5 min read',
    tags: ['income-tax'],
  },
];

const BODY = `Opening paragraph.

## One section instead of three

Text of the first section.

## Professionals

| Limit | Amount |
| ----- | ------ |
| Receipts | ₹75 lakh |

---

_General information only._`;

const state = vi.hoisted(() => ({ body: '' as string, error: false }));

vi.mock('../hooks', () => ({
  useInsights: () => ({
    insights,
    loading: false,
    error: null,
    getInsightBySlug: (slug: string) => insights.find((item) => item.slug === slug),
  }),
  useArticleBody: () => ({ content: state.body, loading: false, error: state.error, refetch: vi.fn() }),
  useReducedMotion: () => true,
}));

// InsightDetail always renders inside the App's <main> landmark.
const renderArticle = (slug: string) =>
  render(
    <MemoryRouter initialEntries={[`/insights/${slug}`]}>
      <main>
        <Routes>
          <Route path="/insights/:slug" element={<InsightDetail />} />
        </Routes>
      </main>
    </MemoryRouter>,
  );

describe('InsightDetail', () => {
  beforeEach(() => {
    state.body = BODY;
    state.error = false;
    window.IntersectionObserver = class {
      observe() {}
      disconnect() {}
      unobserve() {}
      takeRecords() {
        return [];
      }
      root = null;
      rootMargin = '';
      thresholds = [];
    } as unknown as typeof IntersectionObserver;
  });

  it('shows the article as one column: byline, sections, share link and small print', () => {
    renderArticle('presumptive-taxation');

    expect(screen.getByRole('heading', { level: 1, name: insights[0]!.title })).toBeInTheDocument();
    expect(screen.getByText(/By CA Sagar H R/).closest('p')).toHaveTextContent('17 June 2026');
    expect(screen.queryByRole('navigation', { name: /sections/i })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'One section instead of three' })).toBeInTheDocument();
    expect(document.getElementById('professionals')).toBeInTheDocument();
    expect(screen.getByText('Opening paragraph.')).toBeInTheDocument();
    expect(screen.getByRole('table')).toHaveTextContent('₹75 lakh');
    expect(screen.getByRole('button', { name: /share this article/i })).toBeInTheDocument();
    expect(screen.getByText('General information only.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /all insights/i })).toHaveAttribute('href', '/insights');
  });

  it('copies the link when shared from a computer', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    window.matchMedia = vi.fn().mockReturnValue({ matches: false }) as unknown as typeof window.matchMedia;
    renderArticle('presumptive-taxation');

    fireEvent.click(screen.getByRole('button', { name: /share this article/i }));

    expect(await screen.findByText('Link copied')).toBeInTheDocument();
    expect(writeText).toHaveBeenCalledWith('https://casagar.co.in/insights/presumptive-taxation');
  });

  it('shows the revision date once an article has been updated', () => {
    insights[0]!.dateModified = '2026-10-05';
    renderArticle('presumptive-taxation');
    delete insights[0]!.dateModified;

    expect(screen.getByText(/By CA Sagar H R/).closest('p')).toHaveTextContent('Updated 5 October 2026');
  });

  it('suggests other articles underneath', () => {
    renderArticle('presumptive-taxation');

    const more = screen.getByRole('region', { name: 'More insights' });
    expect(within(more).getByRole('link')).toHaveAttribute('href', '/insights/itr-u');
  });

  it('offers to try again when the text cannot load', () => {
    state.body = '';
    state.error = true;
    renderArticle('presumptive-taxation');

    expect(screen.getByText(/could not load/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('shows the not-found page for an unknown article', () => {
    renderArticle('no-such-article');

    expect(screen.getByRole('heading', { level: 1, name: 'Article not found' })).toBeInTheDocument();
  });

  it('renders no axe violations', async () => {
    const { container } = renderArticle('presumptive-taxation');

    expect(await axe(container)).toHaveNoViolations();
  });
});
