import React from 'react';
import '@testing-library/jest-dom/vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import * as matchers from 'vitest-axe/matchers';
import Insights from './Insights';

const seoMock = vi.hoisted(() => vi.fn(() => null));
expect.extend(matchers);

beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = vi.fn(() => null);
});

const mockInsights = [
  {
    id: '7',
    title: 'GST 2.0, One Year On',
    category: 'GST & Compliance',
    date: '2026-06-29',
    summary: 'Pricing, ITC and classification lessons for MSMEs a year into the two-slab structure.',
    slug: 'gst-2-0-one-year-on-msmes',
    author: 'CA Sagar H R',
    readTime: '5 min read',
  },
  {
    id: '1',
    title: 'The Income-tax Act, 2025 Is Now in Force',
    category: 'Income Tax',
    date: '2026-07-03',
    summary: 'A re-codification of direct tax law — new section numbers, same rates and core scheme.',
    slug: 'income-tax-act-2025-in-force',
    author: 'CA Sagar H R',
    readTime: '4 min read',
  },
  {
    id: '10',
    title: 'Capital Gains on Property',
    category: 'Real Estate Taxation',
    date: '2026-06-16',
    summary: 'A flat 12.5% without indexation, with a grandfathering option for resident sellers.',
    slug: 'capital-gains-property-12-5-vs-indexation',
    author: 'CA Sagar H R',
    readTime: '5 min read',
  },
];

vi.mock('../components/SEO', () => ({
  default: seoMock,
}));

const hookState = vi.hoisted(() => ({ loading: false, error: null as string | null }));

vi.mock('../hooks', () => ({
  useInsights: () => ({
    insights: mockInsights,
    loading: hookState.loading,
    error: hookState.error,
  }),
}));

// Insights always renders inside the App's <main> landmark.
const renderInsights = () =>
  render(
    <MemoryRouter initialEntries={['/insights']}>
      <main>
        <Insights />
      </main>
    </MemoryRouter>,
  );

describe('Insights', () => {
  beforeEach(() => {
    seoMock.mockClear();
    hookState.loading = false;
    hookState.error = null;
  });

  it('lists every article, newest first, with its date and summary', () => {
    renderInsights();

    const list = screen.getByRole('list', { name: /articles, newest first/i });
    const links = within(list).getAllByRole('link');
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/insights/income-tax-act-2025-in-force',
      '/insights/gst-2-0-one-year-on-msmes',
      '/insights/capital-gains-property-12-5-vs-indexation',
    ]);
    expect(within(links[0]!).getByText('3 July 2026')).toBeInTheDocument();
    expect(within(links[0]!).getByText(mockInsights[1]!.summary)).toBeInTheDocument();
  });

  it('describes every article in the page schema', () => {
    renderInsights();

    const calls = seoMock.mock.calls as unknown as Array<[Record<string, unknown>]>;
    const schema = calls.at(-1)?.[0].schema as { blogPost: Array<{ url: string }> };
    expect(schema.blogPost).toHaveLength(mockInsights.length);
    expect(schema.blogPost.map((post) => post.url)).toContain(
      'https://casagar.co.in/insights/income-tax-act-2025-in-force',
    );
  });

  it('says so when the articles cannot load', () => {
    hookState.error = 'Network error';
    renderInsights();

    expect(screen.getByRole('alert')).toHaveTextContent(/could not load/i);
    expect(screen.queryByRole('list', { name: /articles/i })).not.toBeInTheDocument();
  });

  it('renders no axe violations', async () => {
    const { container } = renderInsights();

    expect(await axe(container)).toHaveNoViolations();
  });
});
