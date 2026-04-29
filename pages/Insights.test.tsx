import React from 'react';
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Insights from './Insights';

const seoMock = vi.hoisted(() => vi.fn(() => null));

const mockInsights = [
  {
    id: 'older-gst',
    title: 'GST Compliance Updates',
    category: 'GST & Compliance',
    date: 'August 14, 2025',
    summary: 'MFA and e-invoicing changes for GST taxpayers.',
    slug: 'gst-compliance-updates',
    author: 'CA Sagar H R',
    readTime: '5 min read',
  },
  {
    id: 'newer-tax',
    title: 'New Income Tax Bill',
    category: 'Income Tax Updates',
    date: 'August 18, 2025',
    summary: 'A simpler direct tax law for individuals and businesses.',
    slug: 'new-income-tax-bill-2025',
    author: 'CA Sagar H R',
    readTime: '6 min read',
  },
  {
    id: 'middle-economy',
    title: 'S&P Rating Upgrade',
    category: 'Economic Analysis',
    date: 'August 15, 2025',
    summary: 'India receives a sovereign credit rating upgrade.',
    slug: 'sp-rating-upgrade',
    author: 'CA Sagar H R',
    readTime: '4 min read',
  },
];

vi.mock('../components/SEO', () => ({
  default: seoMock,
}));

vi.mock('../components/hero', () => ({
  PageHero: ({ items }: { items: Array<{ title: React.ReactNode; href: string }> }) => (
    <div data-testid="page-hero">
      {items.map((item) => (
        <a key={item.href} href={item.href}>{item.title}</a>
      ))}
    </div>
  ),
}));

vi.mock('../hooks', () => ({
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
    </MemoryRouter>
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
    expect(heroLinks[0]).toHaveAttribute('href', '/insights/new-income-tax-bill-2025');
  });

  it('applies URL-provided filters and keeps schema based on the full archive', () => {
    renderInsights('/insights?cat=GST+%26+Compliance&q=mfa');

    expect(screen.getByRole('heading', { name: 'GST Compliance Updates' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'New Income Tax Bill' })).not.toBeInTheDocument();

    const schema = seoMock.mock.calls.at(-1)?.[0].schema;
    expect(schema.blogPost).toHaveLength(mockInsights.length);
    expect(schema.blogPost.map((post: { url: string }) => post.url)).toContain(
      'https://casagar.co.in/insights/new-income-tax-bill-2025'
    );
  });

  it('clears search filters and shows recent alternatives in the empty state', () => {
    renderInsights('/insights?q=not-a-match');

    expect(screen.getByText(/no articles found/i)).toBeInTheDocument();
    expect(screen.getByText('Recent insights')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /clear filters/i }));

    expect(screen.getByRole('heading', { name: 'New Income Tax Bill' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'GST Compliance Updates' })).toBeInTheDocument();
  });
});
