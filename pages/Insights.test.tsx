import React from 'react';
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
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

vi.mock('../components/hero', () => ({
  PageHero: ({ items }: { items: Array<{ title: React.ReactNode; href: string }> }) => (
    <div data-testid="page-hero">
      {items.map((item) => (
        <a key={item.href} href={item.href}>
          {item.title}
        </a>
      ))}
    </div>
  ),
}));

vi.mock('../hooks', () => ({
  useAnnounce: () => ({
    announce: vi.fn(),
  }),
  useInsights: () => ({
    insights: mockInsights,
    loading: false,
    error: null,
  }),
}));

const renderInsights = (initialEntry = '/insights') =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Insights />
    </MemoryRouter>,
  );

describe('Insights', () => {
  beforeEach(() => {
    seoMock.mockClear();
  });

  it('renders category filters, search controls, and sorted hero links', () => {
    renderInsights();

    const filterTabs = screen.getByRole('tablist', { name: /filter insights by category/i });
    expect(within(filterTabs).getByRole('tab', { name: 'All' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByLabelText(/search insights/i)).toHaveAttribute('aria-controls', 'insights-results');

    const heroLinks = within(screen.getByTestId('page-hero')).getAllByRole('link');
    expect(heroLinks[0]).toHaveAttribute('href', '/insights/income-tax-act-2025-in-force');
  });

  it('applies URL-provided filters and keeps schema based on the full archive', () => {
    renderInsights('/insights?cat=GST+%26+Compliance&q=classification');

    expect(screen.getByRole('heading', { name: 'GST 2.0, One Year On' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'The Income-tax Act, 2025 Is Now in Force' })).not.toBeInTheDocument();

    const calls = seoMock.mock.calls as unknown as Array<[Record<string, unknown>]>;
    const lastCall = calls.at(-1);
    expect(lastCall).toBeDefined();
    const schema = lastCall?.[0].schema as { blogPost: Array<{ url: string }> };
    expect(schema.blogPost).toHaveLength(mockInsights.length);
    expect(schema.blogPost.map((post: { url: string }) => post.url)).toContain(
      'https://casagar.co.in/insights/income-tax-act-2025-in-force',
    );
  });

  it('clears search filters and shows recent alternatives in the empty state', () => {
    renderInsights('/insights?q=not-a-match');

    expect(screen.getByText(/no articles found/i)).toBeInTheDocument();
    expect(screen.getByText('Recent insights')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /clear filters/i }));

    expect(screen.getByRole('heading', { name: 'The Income-tax Act, 2025 Is Now in Force' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'GST 2.0, One Year On' })).toBeInTheDocument();
  });

  it('renders no axe violations for the loaded archive', async () => {
    const { container } = renderInsights();

    expect(await axe(container)).toHaveNoViolations();
  });
});
