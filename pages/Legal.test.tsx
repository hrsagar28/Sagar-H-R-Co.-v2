import React from 'react';
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Privacy from './Privacy';
import Terms from './Terms';
import Disclaimer from './Disclaimer';
import { CONTACT_INFO } from '../constants';
import { hasLightHeader } from '../components/redesign/routes';

vi.mock('../components/SEO', () => ({
  default: () => null,
}));

const renderAt = (element: React.ReactElement, entry: string) =>
  render(<MemoryRouter initialEntries={[entry]}>{element}</MemoryRouter>);

describe('legal pages', () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

  it('lists every section of the privacy policy and numbers them in order', () => {
    renderAt(<Privacy />, '/privacy');

    expect(screen.getByRole('heading', { level: 1, name: 'Privacy policy' })).toBeInTheDocument();
    const contents = screen.getByRole('navigation', { name: /sections of the privacy policy/i });
    const links = within(contents).getAllByRole('link');
    const headings = screen.getAllByRole('heading', { level: 2 });
    expect(links).toHaveLength(headings.length);
    links.forEach((link, index) => {
      const target = document.getElementById(link.getAttribute('href')!.slice(1));
      expect(target).toBeInTheDocument();
      expect(target?.querySelector('h2 .n')).toHaveTextContent(String(index + 1));
    });
  });

  it('names the grievance officer with a way to reach them', () => {
    renderAt(<Privacy />, '/privacy');

    const section = document.getElementById('grievance-officer') as HTMLElement;
    expect(within(section).getByText('CA Sagar H R')).toBeInTheDocument();
    expect(within(section).getByRole('link', { name: CONTACT_INFO.email })).toHaveAttribute(
      'href',
      `mailto:${CONTACT_INFO.email}`,
    );
    expect(within(section).getByText(/within one month/i)).toBeInTheDocument();
  });

  it('scrolls to a section from the contents list and marks it current', () => {
    renderAt(<Privacy />, '/privacy');

    const contents = screen.getByRole('navigation', { name: /sections of the privacy policy/i });
    const rights = within(contents).getByRole('link', { name: /your rights/i });
    fireEvent.click(rights);

    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
    expect(rights).toHaveAttribute('aria-current', 'true');
  });

  it('opens on the section named in the address', () => {
    renderAt(<Terms />, '/terms#liability');

    const contents = screen.getByRole('navigation', { name: /sections of the terms of service/i });
    expect(within(contents).getByRole('link', { name: /liability/i })).toHaveAttribute('aria-current', 'true');
  });

  it('links the terms to the disclaimer', () => {
    renderAt(<Terms />, '/terms');

    expect(screen.getByRole('link', { name: 'disclaimer' })).toHaveAttribute('href', '/disclaimer');
  });

  it('renders the disclaimer with its date', () => {
    renderAt(<Disclaimer />, '/disclaimer');

    expect(screen.getByRole('heading', { level: 1, name: 'Disclaimer' })).toBeInTheDocument();
    expect(screen.getByText(/last updated/i)).toHaveTextContent(/\d{1,2} \w+ \d{4}/);
  });

  it('gives the legal pages, and only them, the light header', () => {
    ['/privacy', '/terms', '/disclaimer', '/terms/'].forEach((path) => expect(hasLightHeader(path)).toBe(true));
    ['/services', '/faqs', '/contact', '/careers'].forEach((path) => expect(hasLightHeader(path)).toBe(false));
  });
});
