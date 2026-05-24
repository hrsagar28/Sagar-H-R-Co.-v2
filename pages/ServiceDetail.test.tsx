import React from 'react';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import * as matchers from 'vitest-axe/matchers';
import { SERVICE_DETAILS } from '../constants';
import ServiceDetail from './ServiceDetail';

expect.extend(matchers);

vi.mock('../components/SEO', () => ({
  default: () => null,
}));

vi.mock('../components/hero', () => ({
  PageHero: ({ title, eyebrow }: { title: React.ReactNode; eyebrow?: string }) => (
    <header data-testid="service-hero">
      {eyebrow ? <p data-testid="service-eyebrow">{eyebrow}</p> : null}
      <h1>{title}</h1>
    </header>
  ),
}));

vi.mock('../components/Reveal', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = vi.fn(() => null);
  class MockIntersectionObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  }
  window.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;
});

beforeEach(() => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
});

// ServiceDetail always renders inside the App's <main> landmark, so the
// test mirrors that — it keeps page content inside a landmark for axe.
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

// Test fixture, captured with a guard so TypeScript narrows away `undefined`
// (SERVICE_DETAILS is a Record keyed by string, so indexed access is
// `ServiceDetailContent | undefined` under noUncheckedIndexedAccess).
const gstDetail = SERVICE_DETAILS.gst;
if (!gstDetail) {
  throw new Error('Test fixture missing: SERVICE_DETAILS.gst');
}

describe('ServiceDetail', () => {
  it('renders the hero and content for a known service', () => {
    renderServiceDetail('gst');

    expect(screen.getByTestId('service-hero')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText(gstDetail.longDescription)).toBeInTheDocument();
  });

  it('keeps a correct heading hierarchy with no skipped levels (Audit SV-03)', () => {
    renderServiceDetail('gst');

    // Section headings are h2 (previously h3, skipping a level after the h1).
    expect(screen.getByRole('heading', { level: 2, name: /overview/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /services included/i })).toBeInTheDocument();

    // Feature titles sit one level below their section heading (h3, previously h4).
    gstDetail.features.forEach((feature) => {
      expect(screen.getByRole('heading', { level: 3, name: feature.title })).toBeInTheDocument();
    });

    expect(screen.queryByRole('heading', { level: 4 })).toBeNull();
  });

  it('derives a readable eyebrow from the discipline (Audit SV-16)', () => {
    renderServiceDetail('income-tax');

    // Was the raw slug ("Practice · INCOME-TAX"); now a clean label.
    expect(screen.getByTestId('service-eyebrow')).toHaveTextContent('Practice · Direct Tax');
  });

  it('falls back to NotFound for an unknown slug', () => {
    renderServiceDetail('does-not-exist');

    expect(screen.getByRole('heading', { name: /page not found/i })).toBeInTheDocument();
  });

  it('renders no axe violations for a service page', async () => {
    const { container } = renderServiceDetail('gst');

    expect(await axe(container)).toHaveNoViolations();
  });
});
