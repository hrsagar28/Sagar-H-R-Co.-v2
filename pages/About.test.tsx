import React from 'react';
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import * as matchers from 'vitest-axe/matchers';
import About from './About';

const mocks = vi.hoisted(() => ({
  warmContactRoute: vi.fn(),
  prefetchRoute: vi.fn(),
}));

expect.extend(matchers);

beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = vi.fn(() => null);
  class MockIntersectionObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  }
  window.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;
});

vi.mock('../components/SEO', () => ({
  default: () => null,
}));

vi.mock('../hooks/useCountUp', () => ({
  useCountUp: (end: number) => ({ count: end, ref: { current: null } }),
}));

vi.mock('./about/warmContact', () => ({
  warmContactRoute: mocks.warmContactRoute,
  prefetchRoute: mocks.prefetchRoute,
}));

const mockMotionPreference = (matches: boolean) => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
};

const renderAbout = () =>
  render(
    <MemoryRouter initialEntries={['/about']}>
      <main>
        <About />
      </main>
    </MemoryRouter>
  );

describe('About', () => {
  beforeEach(() => {
    localStorage.clear();
    mocks.warmContactRoute.mockClear();
    mocks.prefetchRoute.mockClear();
    mockMotionPreference(false);
  });

  it('renders the About page hero, landmark, breadcrumbs, and CTA', () => {
    renderAbout();

    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: /breadcrumb/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /reach out/i })).toHaveAttribute('href', '/contact');
    expect(screen.getByText('2023')).toBeInTheDocument();
    expect(screen.getByText('Mysuru')).toBeInTheDocument();
  });

  it('warms the Contact route chunk when the CTA is hovered or focused', () => {
    renderAbout();
    const cta = screen.getByRole('link', { name: /reach out/i });

    fireEvent.mouseEnter(cta);
    expect(mocks.warmContactRoute).toHaveBeenCalledTimes(1);

    fireEvent.focus(cta);
    expect(mocks.warmContactRoute).toHaveBeenCalledTimes(2);
  });

  it('renders the hero without WordReveal motion when reduced motion is requested', () => {
    mockMotionPreference(true);
    renderAbout();

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent(/on the principal, briefly/i);
    expect(heading.querySelectorAll('span')).toHaveLength(1);
  });

  it('renders no axe violations for static markup', async () => {
    const { container } = renderAbout();

    expect(await axe(container)).toHaveNoViolations();
  });
});
