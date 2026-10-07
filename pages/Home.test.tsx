import React from 'react';
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import * as matchers from 'vitest-axe/matchers';
import { ToastProvider } from '../context/ToastContext';
import { AnnounceProvider } from '../context/AnnounceContext';
import { CONTACT_INFO, FAQS, SERVICE_GROUPS, getServicePage } from '../constants';
import { COMMON_SECTIONS } from '../constants/resources';
import { RD_HOURS_SUMMARY } from '../components/redesign/content';
import { ABOUT_PATH } from '../components/redesign/routes';
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

  it('has exactly one h1, the firm’s name', () => {
    renderHome();

    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent(`${CONTACT_INFO.name} Chartered Accountants, Mysuru`);
    expect(screen.getByRole('link', { name: `Call ${CONTACT_INFO.phone.display}` })).toHaveAttribute(
      'href',
      `tel:${CONTACT_INFO.phone.value}`,
    );
  });

  it('has no axe violations', async () => {
    const { container } = renderHome();

    await screen.findByRole('heading', { level: 2, name: 'Services' });
    // The embedded map is Google's page: axe checks this document, not what loads in the frame.
    expect(await axe(container, { iframes: false })).toHaveNoViolations();
  });

  it('shows the due dates from today to the end of next month, and filters them', () => {
    renderHome();

    const due = screen.getByRole('region', { name: 'Upcoming due dates' });
    const days = () => within(due).getByRole('region', { name: 'Due dates by day' });
    expect(within(days()).getByRole('heading', { name: /Sunday 11 October 2026\W+in 3 days/ })).toBeInTheDocument();
    // A title is split so that "GSTR-1" never breaks at its hyphen, so it is read off the element.
    const titles = () => Array.from(days().querySelectorAll('.hdue-day .t')).map((title) => title.textContent);
    expect(titles()).toContain('GSTR-1 for September 2026');
    expect(within(days()).queryByText(/October 2025|December 2026/)).toBeNull();
    // No line of dates under the heading, and no tax-year bar.
    expect(within(due).queryByText(/Karnataka dates|Tax year/)).toBeNull();
    expect(within(days()).getByRole('link', { name: 'All due dates for 2026-27' })).toHaveAttribute(
      'href',
      '/resources/due-dates',
    );

    fireEvent.click(within(due).getByRole('button', { name: 'Payroll' }));
    expect(within(due).getByRole('button', { name: 'Payroll' })).toHaveAttribute('aria-pressed', 'true');
    expect(titles()).not.toContain('GSTR-1 for September 2026');
    expect(titles().length).toBeGreaterThan(0);
    within(days())
      .getAllByText(/^(GST|Income tax|TDS and TCS|Company and LLP|Payroll)$/)
      .forEach((label) => expect(label).toHaveTextContent('Payroll'));
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

  it('introduces the firm with its registration details and how an engagement runs', () => {
    const { container } = renderHome();

    const about = screen.getByRole('region', { name: 'About the firm' });
    // The menu, the footer and the old /about address lead to this section.
    expect(about).toHaveAttribute('id', 'about');
    expect(container.querySelector(ABOUT_PATH.slice(1))).toBe(about);
    expect(within(about).getByText(CONTACT_INFO.firmRegistrationNo)).toBeInTheDocument();
    expect(within(about).getByText(`ACA, no. ${CONTACT_INFO.founder.icaiMembershipNo}`)).toBeInTheDocument();
    expect(within(about).getByText(CONTACT_INFO.languages.join(', '))).toBeInTheDocument();
    expect(within(about).getByRole('heading', { level: 3, name: 'How an engagement runs' })).toBeInTheDocument();
    expect(within(about).getAllByRole('heading', { level: 4 })).toHaveLength(5);
  });

  it('brings the About section into view when the address asks for it', async () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    renderHome(ABOUT_PATH);

    await waitFor(() => expect(scrollTo).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'instant' })));
    scrollTo.mockRestore();
  });

  it('shows the latest articles, with no call to book', () => {
    renderHome();

    const articles = screen.getByRole('region', { name: 'Insights' });
    expect(within(articles).getByRole('link', { name: 'GST compliance calendar' })).toHaveAttribute(
      'href',
      '/insights/gst-compliance-calendar',
    );
    expect(within(articles).getAllByRole('link', { name: /Income tax planning|Audit readiness/ })).toHaveLength(2);
    expect(within(articles).getByRole('link', { name: 'All insights' })).toHaveAttribute('href', '/insights');
    expect(screen.queryByText(/book a consultation/i)).toBeNull();
  });

  it('answers the featured questions in place, in the FAQ page’s words', () => {
    renderHome();

    const faqs = screen.getByRole('region', { name: 'Frequently asked questions' });
    const featured = FAQS.filter((faq) => faq.featuredOnHome);
    expect(featured.length).toBeGreaterThan(0);
    expect(
      within(faqs)
        .getAllByRole('button')
        .map((button) => button.textContent),
    ).toEqual(featured.map((faq) => faq.question));

    const fees = within(faqs).getByRole('button', { name: 'How are your fees worked out?' });
    expect(fees).toHaveAttribute('aria-expanded', 'false');
    const answer = document.getElementById(fees.getAttribute('aria-controls') ?? '');
    expect(answer).toHaveTextContent(FAQS.find((faq) => faq.id === 'service-fees')?.answer ?? 'missing');
    // Closed answers stay out of the tab order and the accessibility tree.
    expect(answer?.querySelector('.rd-answer')).toHaveAttribute('inert');
    fireEvent.click(fees);
    expect(fees).toHaveAttribute('aria-expanded', 'true');
    expect(answer?.querySelector('.rd-answer')).not.toHaveAttribute('inert');
    fireEvent.click(fees);
    expect(fees).toHaveAttribute('aria-expanded', 'false');

    expect(within(faqs).getByRole('link', { name: 'All FAQs' })).toHaveAttribute('href', '/faqs');
  });

  it('shows the new number for a section or form of the old law', () => {
    renderHome();

    const numbers = screen.getByRole('region', { name: 'Section numbers under the Income-tax Act, 2025' });
    const sections = within(numbers).getByRole('group', { name: 'Commonly used sections of the 1961 Act' });
    const forms = within(numbers).getByRole('group', { name: 'Commonly used forms of the 1962 Rules' });
    // The choices are the section finder's "Most looked up" list.
    expect(
      [...within(sections).getAllByRole('button'), ...within(forms).getAllByRole('button')].map(
        (button) => button.textContent,
      ),
    ).toEqual(COMMON_SECTIONS.map((row) => row.old));

    const first = COMMON_SECTIONS[0];
    expect(within(sections).getByRole('button', { name: first?.old })).toHaveAttribute('aria-pressed', 'true');
    expect(within(numbers).getByText(first?.subject ?? 'missing')).toBeInTheDocument();

    fireEvent.click(within(sections).getByRole('button', { name: '87A' }));
    expect(within(numbers).getByText('Section of the 2025 Act')).toBeInTheDocument();
    expect(within(numbers).getByText('156')).toBeInTheDocument();
    expect(within(numbers).getByText('Rebate')).toBeInTheDocument();

    fireEvent.click(within(forms).getByRole('button', { name: '26AS' }));
    expect(within(numbers).getByText('Form under the 2026 Rules')).toBeInTheDocument();
    expect(within(numbers).getByText('168')).toBeInTheDocument();
    expect(within(numbers).getByRole('link', { name: 'All sections and forms' })).toHaveAttribute(
      'href',
      '/resources/section-finder',
    );
  });

  it('closes with the office: address, hours, the ways to write and the map', () => {
    renderHome();

    const office = screen.getByRole('region', { name: 'Office' });
    CONTACT_INFO.address.lines.forEach((line) => expect(within(office).getByText(line)).toBeInTheDocument());
    expect(within(office).getByText(RD_HOURS_SUMMARY)).toBeInTheDocument();
    expect(within(office).queryByText(/office is (open|closed)/i)).toBeNull();
    expect(within(office).getByRole('link', { name: CONTACT_INFO.email })).toHaveAttribute(
      'href',
      `mailto:${CONTACT_INFO.email}`,
    );
    expect(within(office).getByRole('link', { name: /WhatsApp/ })).toHaveAttribute(
      'href',
      CONTACT_INFO.social.whatsapp,
    );
    expect(within(office).getByTitle(`Map showing the office of ${CONTACT_INFO.name}`)).toHaveAttribute(
      'src',
      CONTACT_INFO.geo.mapEmbedUrl,
    );
    expect(within(office).getByRole('link', { name: /Get directions/ })).toHaveAttribute(
      'href',
      CONTACT_INFO.geo.mapShareUrl,
    );
  });
});
