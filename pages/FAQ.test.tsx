import React from 'react';
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CATEGORY_ORDER, FAQS } from '../constants';
import FAQ from './FAQ';

vi.mock('../components/SEO', () => ({
  default: () => null,
}));

const renderFaq = (initialEntry = '/faqs') =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <FAQ />
    </MemoryRouter>,
  );

const questionText = (id: string) => FAQS.find((faq) => faq.id === id)?.question ?? '';
const questionButton = (id: string) => screen.getByRole('button', { name: questionText(id) });

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

  it('renders every section and every question', () => {
    renderFaq();

    CATEGORY_ORDER.forEach((category) => {
      expect(screen.getByRole('heading', { level: 2, name: category })).toBeInTheDocument();
    });

    FAQS.forEach((faq) => {
      expect(screen.getByRole('button', { name: faq.question })).toBeInTheDocument();
    });
  });

  it('renders accordion buttons with accessible relationships and toggles the answer', () => {
    renderFaq();

    const button = questionButton('engagement-process');

    expect(button.closest('h3')).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-expanded', 'false');

    const panelId = button.getAttribute('aria-controls');
    expect(panelId).toBeTruthy();
    const panel = document.getElementById(panelId as string);
    expect(panel).toBeInTheDocument();

    // The answer is mounted lazily — absent until the question is first opened.
    expect(panel?.querySelector('.rd-answer')).not.toBeInTheDocument();

    fireEvent.click(button);

    expect(button).toHaveAttribute('aria-expanded', 'true');
    const answer = panel?.querySelector('.rd-answer');
    expect(answer).toBeInTheDocument();
    expect(answer).not.toHaveAttribute('inert');

    fireEvent.click(button);

    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(panel?.querySelector('.rd-answer')).toHaveAttribute('inert');
  });

  it('renders authored markdown inside answers as links', () => {
    renderFaq();

    fireEvent.click(questionButton('engagement-process'));

    expect(screen.getByRole('link', { name: 'Resources' })).toHaveAttribute('href', '/resources');
    expect(screen.queryByText(/\[Resources\]\(\/resources\)/i)).not.toBeInTheDocument();
  });

  it('lets several answers stay open at once', () => {
    renderFaq();

    const first = questionButton('engagement-process');
    const second = questionButton('services-outside-mysuru');

    fireEvent.click(first);
    fireEvent.click(second);

    expect(first).toHaveAttribute('aria-expanded', 'true');
    expect(second).toHaveAttribute('aria-expanded', 'true');
  });

  it('supports arrow, home, and end keyboard navigation across questions', () => {
    renderFaq();

    const buttons = FAQS.map((faq) => screen.getByRole('button', { name: faq.question }));
    const [firstButton, secondButton] = buttons;
    const lastButton = buttons[buttons.length - 1];
    if (!firstButton || !secondButton || !lastButton) throw new Error('expected FAQ buttons');

    firstButton.focus();
    fireEvent.keyDown(firstButton, { key: 'ArrowDown' });
    expect(secondButton).toHaveFocus();

    fireEvent.keyDown(secondButton, { key: 'End' });
    expect(lastButton).toHaveFocus();

    fireEvent.keyDown(lastButton, { key: 'Home' });
    expect(firstButton).toHaveFocus();
  });

  it('scrolls to a section named in the fragment', async () => {
    const { container } = renderFaq('/faqs#income-tax-planning');

    expect(document.getElementById('income-tax-planning')).toBeInTheDocument();
    expect(container.querySelector('#faq-picker-list a[href="#income-tax-planning"]')).toBeInTheDocument();

    await waitFor(() => {
      expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
    });
  });

  it('opens the matching question when deep-linked by id', () => {
    renderFaq('/faqs#gst-registration-mandatory');

    expect(questionButton('gst-registration-mandatory')).toHaveAttribute('aria-expanded', 'true');
  });

  it('sends retired question ids to the answer that replaced them', () => {
    renderFaq('/faqs#gst-notice');

    expect(questionButton('income-tax-notice')).toHaveAttribute('aria-expanded', 'true');
  });

  it('filters the questions as you search', () => {
    renderFaq();

    fireEvent.change(screen.getByRole('searchbox', { name: /search the faqs/i }), {
      target: { value: questionText('gst-registration-mandatory') },
    });

    expect(questionButton('gst-registration-mandatory').closest('.qi')).not.toHaveAttribute('hidden');
    expect(document.getElementById('engagement-process')).toHaveAttribute('hidden');
    expect(screen.getByText(/match(es)? “/)).toBeInTheDocument();
  });

  it('shows one topic at a time', () => {
    renderFaq();

    fireEvent.click(screen.getByRole('button', { name: 'GST' }));

    const gstCount = FAQS.filter((faq) => faq.category === 'GST').length;
    expect(screen.getByText(`Showing ${gstCount} questions on GST.`)).toBeInTheDocument();
    expect(document.getElementById('engagement-process')).toHaveAttribute('hidden');
  });

  it('offers to send an unanswered question to the contact form', () => {
    renderFaq();

    fireEvent.change(screen.getByRole('searchbox', { name: /search the faqs/i }), {
      target: { value: 'zzzz qqqq' },
    });

    expect(screen.getByRole('heading', { name: 'No questions match “zzzz qqqq”.' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /ask us this question/i })).toHaveAttribute('href', '/contact#write');
  });
});
