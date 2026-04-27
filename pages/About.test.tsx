import React from 'react';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import About from './About';

vi.mock('../components/SEO', () => ({
  default: () => null,
}));

vi.mock('../components/hero', () => ({
  PageHero: () => <h1>On the principal, briefly.</h1>,
}));

vi.mock('../hooks/useCountUp', () => ({
  useCountUp: (end: number) => ({ count: end, ref: { current: null } }),
}));

const renderAbout = () =>
  render(
    <MemoryRouter initialEntries={['/about']}>
      <main>
        <About />
      </main>
    </MemoryRouter>
  );

describe('About', () => {
  it('renders the About page hero, landmark, breadcrumbs, and CTA', () => {
    renderAbout();

    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: /breadcrumb/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /book consultation/i })).toHaveAttribute('href', '/contact');
  });
});
