import React from 'react';
import '@testing-library/jest-dom/vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import * as matchers from 'vitest-axe/matchers';
import NotFound from './NotFound';
import { CONTACT_INFO } from '../constants';
import { hasLightHeader, isRedesignedRoute } from '../components/redesign/routes';

expect.extend(matchers);

vi.mock('../components/SEO', () => ({
  default: () => null,
}));

// NotFound always renders inside the App's <main> landmark.
const renderNotFound = () =>
  render(
    <MemoryRouter initialEntries={['/no-such-page']}>
      <main>
        <NotFound />
      </main>
    </MemoryRouter>,
  );

describe('NotFound', () => {
  it('says the page is missing and lists the main pages', () => {
    renderNotFound();

    expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeInTheDocument();
    const list = screen.getByRole('navigation', { name: 'Main pages' });
    const links = within(list)
      .getAllByRole('link')
      .filter((link) => link.closest('.srows'));
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/',
      '/services',
      '/insights',
      '/resources',
      '/contact',
    ]);
    expect(screen.getByRole('link', { name: CONTACT_INFO.email })).toHaveAttribute(
      'href',
      `mailto:${CONTACT_INFO.email}`,
    );
  });

  it('carries the light header itself, wherever it shows', () => {
    const { container } = renderNotFound();

    expect(container.querySelector('.rd-page.head-light')).not.toBeNull();
  });

  it('shows in the new layout on any address that has no page', () => {
    ['/no-such-page', '/resources/old-name', '/services/no-such-service'].forEach((path) =>
      expect(isRedesignedRoute(path)).toBe(true),
    );
    ['/', '/about', '/insights', '/insights/some-article', '/resources', '/resources/checklist/gst'].forEach((path) =>
      expect(isRedesignedRoute(path)).toBe(false),
    );
    expect(hasLightHeader('/no-such-page')).toBe(false);
  });

  it('renders no axe violations', async () => {
    const { container } = renderNotFound();

    expect(await axe(container)).toHaveNoViolations();
  });
});
