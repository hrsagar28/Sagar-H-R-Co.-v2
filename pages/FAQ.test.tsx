import React from 'react';
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CATEGORY_ORDER, FAQS } from '../constants';
import FAQ from './FAQ';

vi.mock('../components/SEO', () => ({
  default: () => null,
}));

vi.mock('../components/hero', () => ({
  PageHero: () => <div data-testid="page-hero" />,
}));

const renderFaq = (initialEntry = '/faqs') =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <FAQ />
    </MemoryRouter>
  );

describe('FAQ', () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
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

  it('renders all configured categories and FAQ questions', () => {
    renderFaq();

    CATEGORY_ORDER.forEach((category) => {
      expect(screen.getByRole('heading', { level: 2, name: category })).toBeInTheDocument();
    });

    FAQS.forEach((faq) => {
      expect(screen.getByRole('button', { name: faq.question })).toBeInTheDocument();
    });
  });

  it('renders accordion buttons with accessible relationships and toggles their panel', () => {
    renderFaq();

    const questionButton = screen.getByRole('button', {
      name: /what is the process for engaging with your firm/i,
    });

    expect(questionButton.closest('h3')).toBeInTheDocument();
    expect(questionButton).toHaveAttribute('aria-expanded', 'false');

    const panelId = questionButton.getAttribute('aria-controls');
    expect(panelId).toBeTruthy();

    const panel = document.getElementById(panelId as string);
    expect(panel).toHaveAttribute('role', 'region');
    expect(panel).toHaveAttribute('aria-labelledby', questionButton.id);
    expect(panel).toHaveAttribute('hidden');

    fireEvent.click(questionButton);

    expect(questionButton).toHaveAttribute('aria-expanded', 'true');
    expect(panel).not.toHaveAttribute('hidden');

    fireEvent.click(questionButton);

    expect(questionButton).toHaveAttribute('aria-expanded', 'false');
    expect(panel).toHaveAttribute('hidden');
  });

  it('renders authored markdown inside answers as rich content', () => {
    renderFaq();

    const questionButton = screen.getByRole('button', {
      name: /what is the process for engaging with your firm/i,
    });

    fireEvent.click(questionButton);

    const resourcesLink = screen.getByRole('link', { name: 'Resources' });
    expect(resourcesLink).toHaveAttribute('href', '/resources');
    expect(screen.queryByText(/\[Resources\]\(\/resources\)/i)).not.toBeInTheDocument();
  });

  it('keeps only one FAQ item open at a time', () => {
    renderFaq();

    const firstButton = screen.getByRole('button', {
      name: /what is the process for engaging with your firm/i,
    });
    const secondButton = screen.getByRole('button', {
      name: /do you provide services outside of mysuru/i,
    });

    fireEvent.click(firstButton);
    expect(firstButton).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(secondButton);
    expect(secondButton).toHaveAttribute('aria-expanded', 'true');
    expect(firstButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('supports arrow, home, and end keyboard navigation across FAQ headers', () => {
    renderFaq();

    const buttons = FAQS.map((faq) => screen.getByRole('button', { name: faq.question }));
    const firstButton = buttons[0];
    const secondButton = buttons[1];
    const lastButton = buttons[buttons.length - 1];

    firstButton.focus();
    fireEvent.keyDown(firstButton, { key: 'ArrowDown' });
    expect(secondButton).toHaveFocus();

    fireEvent.keyDown(secondButton, { key: 'End' });
    expect(lastButton).toHaveFocus();

    fireEvent.keyDown(lastButton, { key: 'Home' });
    expect(firstButton).toHaveFocus();
  });

  it('renders category jump links and scrolls matching fragment targets into view', async () => {
    renderFaq('/faqs#income-tax-planning');

    const topNav = screen.getByRole('navigation', { name: 'FAQ category jump links' });
    const jumpLink = within(topNav).getByRole('link', { name: /income tax & planning/i });
    expect(jumpLink).toHaveAttribute('href', '#income-tax-planning');

    const categoryHeading = document.getElementById('income-tax-planning');
    expect(categoryHeading).toBeInTheDocument();

    await waitFor(() => {
      expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
    });
  });

  it('opens the matching FAQ when deep-linked by question id', async () => {
    renderFaq('/faqs#gst-registration-mandatory');

    const targetButton = screen.getByRole('button', { name: /is gst registration mandatory for my business/i });

    await waitFor(() => {
      expect(targetButton).toHaveAttribute('aria-expanded', 'true');
    });
  });

  it('routes the consultation CTA to the contact page', () => {
    renderFaq();

    expect(screen.getByRole('link', { name: /schedule a consultation/i })).toHaveAttribute('href', '/contact');
  });
});
