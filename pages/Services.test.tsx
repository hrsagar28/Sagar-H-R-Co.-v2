import React from 'react';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import * as matchers from 'vitest-axe/matchers';
import { INDUSTRIES, SERVICES } from '../constants';
import Services from './Services';

expect.extend(matchers);

vi.mock('../components/SEO', () => ({
  default: () => null,
}));

vi.mock('../components/hero', () => ({
  PageHero: ({ title }: { title: React.ReactNode }) => (
    <header data-testid="services-hero">
      <h1>{title}</h1>
    </header>
  ),
}));

vi.mock('../components/Reveal', () => ({
  default: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
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

const renderServices = () =>
  render(
    <MemoryRouter initialEntries={['/services']}>
      <Services />
    </MemoryRouter>
  );

describe('Services', () => {
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

  it('renders the services hero', () => {
    renderServices();

    expect(screen.getByTestId('services-hero')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/four disciplines, one practice/i);
  });

  it('renders all service cards with expected links', () => {
    renderServices();

    SERVICES.forEach((service) => {
      expect(screen.getByRole('link', { name: `View details for ${service.title}` })).toHaveAttribute('href', service.link);
    });
  });

  it('renders the industries section', () => {
    renderServices();

    expect(screen.getByRole('heading', { name: /industries we serve/i })).toBeInTheDocument();
    INDUSTRIES.forEach((industry) => {
      expect(screen.getByRole('link', { name: `Discuss ${industry.title} services` })).toHaveAttribute('href', '/contact');
    });
  });

  it('renders the consultation banner', () => {
    renderServices();

    expect(screen.getByRole('heading', { name: /professional assistance/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /engage on a matter/i })).toHaveAttribute('href', '/contact');
  });

  it('renders no axe violations for static markup', async () => {
    const { container } = renderServices();

    expect(await axe(container)).toHaveNoViolations();
  });
});
