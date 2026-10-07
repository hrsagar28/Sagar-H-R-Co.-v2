import React from 'react';
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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
  // The due dates run from "today", so the tests fix the date.
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 9, 8, 10, 0));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

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

  it('has exactly one h1, naming the practice', () => {
    renderHome();

    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveAccessibleName(`${CONTACT_INFO.name}, Chartered Accountants in Mysuru`);
    expect(screen.getByRole('link', { name: `Call ${CONTACT_INFO.phone.display}` })).toHaveAttribute(
      'href',
      `tel:${CONTACT_INFO.phone.value}`,
    );
  });

  it('has no axe violations', async () => {
    const { container } = renderHome();

    await screen.findByRole('heading', { level: 2, name: 'Services' });
    expect(await axe(container)).toHaveNoViolations();
  });

  it('shows the due dates from today to the end of next month, and filters them', () => {
    renderHome();

    const due = screen.getByRole('region', { name: 'Upcoming due dates' });
    expect(within(due).getByText(/8 October to 30 November 2026/)).toBeInTheDocument();
    const days = within(due).getByRole('region', { name: 'Due dates by day' });
    expect(within(days).getByRole('heading', { name: /Sunday 11 October 2026\W+in 3 days/ })).toBeInTheDocument();
    expect(within(days).getAllByText('GSTR-1 for September 2026').length).toBeGreaterThan(0);
    expect(within(days).queryByText(/October 2025|December 2026/)).toBeNull();

    fireEvent.click(within(due).getByRole('button', { name: 'Payroll' }));
    expect(within(due).getByRole('button', { name: 'Payroll' })).toHaveAttribute('aria-pressed', 'true');
    expect(within(days).queryByText('GSTR-1 for September 2026')).toBeNull();
    within(days)
      .getAllByText(/^(GST|Income tax|TDS and TCS|Company and LLP|Payroll)$/)
      .forEach((label) => expect(label).toHaveTextContent('Payroll'));
    expect(within(due).getByText('Tax year 2026-27: day 191 of 365.')).toBeInTheDocument();
  });

  it('lists every service under its group, in order', () => {
    renderHome();

    SERVICE_GROUPS.forEach((group) => {
      const list = screen.getByRole('list', { name: group.name });
      const links = within(list).getAllByRole('link');
      expect(links.map((link) => link.textContent)).toEqual(group.slugs.map((slug) => getServicePage(slug)?.name));
      expect(links.map((link) => link.getAttribute('href'))).toEqual(group.slugs.map((slug) => `/services/${slug}`));
    });
  });

  it('introduces the firm with its registration details', () => {
    renderHome();

    const about = screen.getByRole('region', { name: 'About the firm' });
    expect(within(about).getByText(CONTACT_INFO.firmRegistrationNo)).toBeInTheDocument();
    expect(within(about).getByText(`ACA, no. ${CONTACT_INFO.founder.icaiMembershipNo}`)).toBeInTheDocument();
    const steps = screen.getByRole('region', { name: 'How an engagement runs' });
    expect(within(steps).getAllByRole('listitem')).toHaveLength(5);
  });

  it('shows the latest articles and three questions, with no call to book', () => {
    renderHome();

    const articles = screen.getByRole('region', { name: 'Insights' });
    expect(within(articles).getByRole('link', { name: 'GST compliance calendar' })).toHaveAttribute(
      'href',
      '/insights/gst-compliance-calendar',
    );
    expect(within(articles).getAllByRole('link', { name: /Income tax planning|Audit readiness/ })).toHaveLength(2);
    const faqs = screen.getByRole('region', { name: 'Frequently asked questions' });
    expect(within(faqs).getByRole('link', { name: 'How are your fees worked out?' })).toHaveAttribute(
      'href',
      '/faqs#service-fees',
    );
    expect(screen.queryByText(/book a consultation/i)).toBeNull();
  });
});
