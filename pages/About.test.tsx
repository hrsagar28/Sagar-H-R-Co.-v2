import React from 'react';
import '@testing-library/jest-dom/vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import * as matchers from 'vitest-axe/matchers';
import About from './About';
import { CONTACT_INFO } from '../constants';

const mocks = vi.hoisted(() => ({
  warmContactRoute: vi.fn(),
}));

expect.extend(matchers);

vi.mock('../components/SEO', () => ({
  default: () => null,
}));

vi.mock('./about/warmContact', () => ({
  warmContactRoute: mocks.warmContactRoute,
}));

const renderAbout = () =>
  render(
    <MemoryRouter initialEntries={['/about']}>
      <main>
        <About />
      </main>
    </MemoryRouter>,
  );

describe('About', () => {
  beforeEach(() => {
    mocks.warmContactRoute.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('introduces the firm and its principal', () => {
    renderAbout();

    expect(screen.getByRole('heading', { level: 1, name: 'About the firm' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: CONTACT_INFO.founder.name })).toBeInTheDocument();
    expect(screen.getByText(CONTACT_INFO.founder.icaiMembershipNo)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: `Portrait of ${CONTACT_INFO.founder.name}` })).toBeInTheDocument();
  });

  it('lists how an engagement runs, in order', () => {
    renderAbout();

    const section = screen.getByRole('region', { name: 'How an engagement runs' });
    const steps = within(section).getAllByRole('listitem');
    expect(steps).toHaveLength(5);
    expect(steps[0]).toHaveTextContent('We agree the terms in writing');
    expect(steps[4]).toHaveTextContent('We track what is due next');
  });

  it('closes with ways to get in touch', () => {
    renderAbout();

    expect(screen.getByRole('link', { name: 'send us a message' })).toHaveAttribute('href', '/contact');
    expect(screen.getByRole('link', { name: CONTACT_INFO.phone.display })).toHaveAttribute(
      'href',
      `tel:${CONTACT_INFO.phone.value}`,
    );
    expect(screen.getByRole('link', { name: 'our services' })).toHaveAttribute('href', '/services');
  });

  it('fetches the Contact page code once the page is idle', () => {
    vi.useFakeTimers();
    renderAbout();

    expect(mocks.warmContactRoute).not.toHaveBeenCalled();
    vi.runAllTimers();
    expect(mocks.warmContactRoute).toHaveBeenCalledTimes(1);
  });

  it('renders no axe violations for static markup', async () => {
    const { container } = renderAbout();

    expect(await axe(container)).toHaveNoViolations();
  });
});
