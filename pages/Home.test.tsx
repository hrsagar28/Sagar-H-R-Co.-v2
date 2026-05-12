import React from 'react';
import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import * as matchers from 'vitest-axe/matchers';
import { ToastProvider } from '../context/ToastContext';
import { AnnounceProvider } from '../context/AnnounceContext';
import { SERVICES } from '../constants';
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
  const renderHome = () =>
    render(
      <MemoryRouter>
        <AnnounceProvider>
          <ToastProvider>
            <Home />
          </ToastProvider>
        </AnnounceProvider>
      </MemoryRouter>,
    );

  beforeAll(() => {
    HTMLCanvasElement.prototype.getContext = vi.fn(() => null);

    class MockIntersectionObserver {
      constructor(private readonly callback: IntersectionObserverCallback) {}

      observe = (target: Element) => {
        this.callback(
          [
            {
              isIntersecting: true,
              target,
              intersectionRatio: 1,
              boundingClientRect: target.getBoundingClientRect(),
              intersectionRect: target.getBoundingClientRect(),
              rootBounds: null,
              time: performance.now(),
            } as IntersectionObserverEntry,
          ],
          this as unknown as IntersectionObserver,
        );
      };
      unobserve = vi.fn();
      disconnect = vi.fn();
      takeRecords = () => [];
    }

    class MockResizeObserver {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    }

    window.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;
    window.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
  });

  beforeEach(() => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  it('has exactly one h1 naming the practice', () => {
    renderHome();

    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveAccessibleName(/Chartered Accountants in Mysuru/);
  });

  it('has no axe violations', async () => {
    const { container } = renderHome();

    await screen.findByRole('heading', { level: 2, name: /services/i });
    container.querySelectorAll('iframe').forEach((frame) => frame.remove());
    expect(await axe(container)).toHaveNoViolations();
  });

  it('renders service titles in source order', async () => {
    renderHome();

    await screen.findByRole('heading', { level: 2, name: /services/i });

    const expectedTitles = SERVICES.map((service) => service.title);

    await waitFor(() => {
      for (const title of expectedTitles) {
        expect(screen.getByRole('heading', { level: 3, name: title })).toBeInTheDocument();
      }
    });

    const serviceTitleSet = new Set(expectedTitles);
    const renderedServiceTitles = screen
      .getAllByRole('heading', { level: 3 })
      .map((heading) => heading.textContent?.trim() ?? '')
      .filter((title) => serviceTitleSet.has(title));

    expect(renderedServiceTitles).toEqual(expectedTitles);
  });
});
