import React from 'react';
import '@testing-library/jest-dom/vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import * as matchers from 'vitest-axe/matchers';
import { ToastProvider } from '../context/ToastContext';
import { AnnounceProvider } from '../context/AnnounceContext';
import { CONTACT_INFO, SERVICE_GROUPS, getServicePage } from '../constants';
import type { InsightItem } from '../types';
import Home from './Home';

expect.extend(matchers);

const mockInsights = vi.hoisted((): InsightItem[] => [
  {
    id: 'insight-1',
    title: 'GST compliance calendar',
    slug: 'gst-compliance-calendar',
    category: 'GST',
    summary: 'A quick look at upcoming GST due dates.',
    date: '2026-05-01',
    readTime: '3 min read',
    author: 'Sagar H R',
    authorId: 'sagar-hr',
  } satisfies InsightItem,
  {
    id: 'insight-2',
    title: 'Income tax planning checklist',
    slug: 'income-tax-planning-checklist',
    category: 'Income Tax',
    summary: 'Planning notes for taxpayers before filing season.',
    date: '2026-04-25',
    readTime: '4 min read',
    author: 'Sagar H R',
    authorId: 'sagar-hr',
  } satisfies InsightItem,
  {
    id: 'insight-3',
    title: 'Audit readiness notes',
    slug: 'audit-readiness-notes',
    category: 'Audit',
    summary: 'Documents to keep ready before an audit starts.',
    date: '2026-04-18',
    readTime: '5 min read',
    author: 'Sagar H R',
    authorId: 'sagar-hr',
  } satisfies InsightItem,
]);

vi.mock('../hooks', async (importActual) => ({
  ...(await importActual<typeof import('../hooks')>()),
  useInsights: () => ({
    insights: mockInsights,
    loading: false,
    error: null,
    getInsightBySlug: vi.fn(),
  }),
}));

describe('Home page', () => {
  const renderHome = (path = '/') =>
    render(
      <MemoryRouter initialEntries={[path]}>
        <AnnounceProvider>
          <ToastProvider>
            <Home />
          </ToastProvider>
        </AnnounceProvider>
      </MemoryRouter>,
    );

  it('has exactly one h1 naming the practice', () => {
    renderHome();

    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveAccessibleName(CONTACT_INFO.name);
    expect(screen.getByText(/Chartered Accountants in Mysuru/)).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { container } = renderHome();

    await screen.findByRole('heading', { level: 2, name: 'What we do' });
    container.querySelectorAll('iframe').forEach((frame) => frame.remove());
    expect(await axe(container)).toHaveNoViolations();
  });

  it('lists every service under its group, in order', () => {
    renderHome();

    SERVICE_GROUPS.forEach((group) => {
      const list = screen.getByRole('list', { name: group.name });
      const links = within(list).getAllByRole('link');
      expect(links.map((link) => link.querySelector('.t')?.textContent)).toEqual(
        group.slugs.map((slug) => getServicePage(slug)?.name),
      );
      expect(links.map((link) => link.getAttribute('href'))).toEqual(group.slugs.map((slug) => `/services/${slug}`));
    });
  });

  it('shows the latest articles and the office details, with no call to book', () => {
    renderHome();

    const articles = screen.getByRole('region', { name: 'Latest articles' });
    expect(within(articles).getByRole('link', { name: /GST compliance calendar/ })).toHaveAttribute(
      'href',
      '/insights/gst-compliance-calendar',
    );
    const visit = screen.getByRole('region', { name: 'Visit or call' });
    expect(within(visit).getByRole('link', { name: CONTACT_INFO.phone.display })).toHaveAttribute(
      'href',
      `tel:${CONTACT_INFO.phone.value}`,
    );
    expect(screen.queryByText(/book a consultation/i)).toBeNull();
  });

  it.each(['2', '3'])('renders prototype %s with one h1 and no axe violations', async (variant) => {
    const { container } = renderHome(`/?v=${variant}`);

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('region', { name: 'Visit or call' })).toBeInTheDocument();
    container.querySelectorAll('iframe').forEach((frame) => frame.remove());
    expect(await axe(container)).toHaveNoViolations();
  });
});
