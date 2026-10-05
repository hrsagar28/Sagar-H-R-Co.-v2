import React from 'react';
import '@testing-library/jest-dom/vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import * as matchers from 'vitest-axe/matchers';
import { FAQS, LEGACY_SERVICE_SLUGS, SERVICE_PAGES, getServicePage } from '../constants';
import ServiceDetail from './ServiceDetail';

expect.extend(matchers);

vi.mock('../components/SEO', () => ({
  default: () => null,
}));

// ServiceDetail always renders inside the App's <main> landmark, so the test
// mirrors that — it keeps page content inside a landmark for axe.
const renderServiceDetail = (slug: string) =>
  render(
    <MemoryRouter initialEntries={[`/services/${slug}`]}>
      <main>
        <Routes>
          <Route path="/services/:slug" element={<ServiceDetail />} />
        </Routes>
      </main>
    </MemoryRouter>,
  );

const SERVICE_LINK = /\{([a-z-]+)\|[^}]+\}/g;

describe('ServiceDetail', () => {
  it('renders the scope of work and the documents needed', () => {
    const gst = getServicePage('gst')!;
    renderServiceDetail('gst');

    expect(screen.getByRole('heading', { level: 1, name: gst.name })).toBeInTheDocument();
    expect(screen.getByText(`${gst.frequency}`)).toBeInTheDocument();
    gst.inc.forEach(([heading]) => {
      expect(screen.getByRole('heading', { level: 3, name: heading })).toBeInTheDocument();
    });
    const documents = screen.getByRole('region', { name: 'Documents and information' });
    expect(within(documents).getAllByRole('listitem')).toHaveLength(gst.needs.length);
  });

  it('turns {slug|label} in the text into links to other services', () => {
    renderServiceDetail('gst');

    const scope = screen.getByRole('region', { name: 'Scope of work' });
    expect(within(scope).getByRole('link', { name: 'Notices and appeals' })).toHaveAttribute(
      'href',
      '/services/notices-and-appeals',
    );
    expect(screen.queryByText(/\{notices-and-appeals/)).toBeNull();
  });

  it('links only to services and questions that exist', () => {
    const slugs = new Set(SERVICE_PAGES.map((page) => page.slug));
    const faqIds = new Set(FAQS.map((faq) => faq.id));
    SERVICE_PAGES.forEach((page) => {
      const text = [page.incdesc, ...page.inc.map(([, body]) => body), ...page.needs].join(' ');
      for (const [, slug] of text.matchAll(SERVICE_LINK)) {
        expect(slugs.has(slug!), `${page.slug} links to unknown service ${slug}`).toBe(true);
      }
      page.faqIds.forEach((id) => expect(faqIds.has(id), `${page.slug} lists unknown FAQ ${id}`).toBe(true));
    });
  });

  it('lists common questions with links into the FAQ page', () => {
    renderServiceDetail('trusts-and-npos');

    const list = screen.getByRole('list', { name: 'Common questions' });
    expect(within(list).getAllByRole('link')[0]).toHaveAttribute('href', '/faqs#trust-registration');
  });

  it('sends "Send us a message" to the contact form with the service chosen', () => {
    renderServiceDetail('nri-taxation');

    expect(screen.getByRole('link', { name: /send us a message/i })).toHaveAttribute(
      'href',
      '/contact?subject=nri-taxation#write',
    );
  });

  it('links to every other service', () => {
    renderServiceDetail('audit');

    const others = screen.getByRole('navigation', { name: 'Other services' });
    expect(within(others).getAllByRole('link')).toHaveLength(SERVICE_PAGES.length - 1);
  });

  it('redirects a retired address to the page that replaced it', () => {
    render(
      <MemoryRouter initialEntries={['/services/payroll']}>
        <Routes>
          <Route path="/services/:slug" element={<ServiceDetail />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(LEGACY_SERVICE_SLUGS.payroll).toBe('bookkeeping-and-payroll');
    expect(screen.getByRole('heading', { level: 1, name: 'Bookkeeping and payroll' })).toBeInTheDocument();
  });

  it('shows the not-found page, with its own title, for an unknown service', () => {
    const { container } = renderServiceDetail('does-not-exist');

    expect(screen.getByRole('heading', { level: 1, name: 'Service not found' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Services' })).toHaveAttribute('href', '/services');
    expect(container.querySelector('.rd-page.head-light')).not.toBeNull();
  });

  it('renders no axe violations', async () => {
    const { container } = renderServiceDetail('gst');

    expect(await axe(container)).toHaveNoViolations();
  });
});
