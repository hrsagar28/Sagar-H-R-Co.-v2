import React from 'react';
import '@testing-library/jest-dom/vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import * as matchers from 'vitest-axe/matchers';
import { CLIENT_SECTORS, SERVICE_GROUPS, SERVICE_PAGES } from '../constants';
import Services from './Services';

expect.extend(matchers);

vi.mock('../components/SEO', () => ({
  default: () => null,
}));

const renderServices = () =>
  render(
    <MemoryRouter initialEntries={['/services']}>
      <main>
        <Services />
      </main>
    </MemoryRouter>,
  );

describe('Services', () => {
  it('puts every service in exactly one group', () => {
    const grouped = SERVICE_GROUPS.flatMap((group) => group.slugs);
    expect([...grouped].sort()).toEqual(SERVICE_PAGES.map((page) => page.slug).sort());
  });

  it('lists each group with its services, linking to their pages', () => {
    renderServices();

    expect(screen.getByRole('heading', { level: 1, name: 'Services' })).toBeInTheDocument();
    SERVICE_GROUPS.forEach((group) => {
      const section = screen.getByRole('region', { name: group.name });
      const links = within(section).getAllByRole('link');
      expect(links).toHaveLength(group.slugs.length);
      group.slugs.forEach((slug, index) => {
        expect(links[index]).toHaveAttribute('href', `/services/${slug}`);
      });
    });
  });

  it('shows who each service is for and what it includes', () => {
    renderServices();

    const gst = SERVICE_PAGES[0]!;
    const link = screen.getByRole('link', { name: new RegExp(`^${gst.name}`) });
    expect(link).toHaveTextContent(gst.who);
    gst.tags.forEach((tag) => expect(link).toHaveTextContent(tag));
  });

  it('lists the kinds of client and ends with "and many more"', () => {
    renderServices();

    const section = screen.getByRole('region', { name: 'Who we work with' });
    const items = within(section).getAllByRole('listitem');
    expect(items).toHaveLength(CLIENT_SECTORS.length + 1);
    expect(items[items.length - 1]).toHaveTextContent('and many more');
  });

  it('renders no axe violations', async () => {
    const { container } = renderServices();

    expect(await axe(container)).toHaveNoViolations();
  });
});
