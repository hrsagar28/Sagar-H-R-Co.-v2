import React from 'react';
import '@testing-library/jest-dom/vitest';
import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CONTACT_INFO } from '../constants';
import Preloader from './Preloader';

// The first-visit splash is kept at the owner's request, exactly as it was
// (see the note in Preloader.tsx). These tests hold its behaviour in place.

const lessMotion = (matches: boolean) => {
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

describe('Preloader (the first-visit splash)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    sessionStorage.clear();
    lessMotion(false);
  });
  afterEach(() => {
    vi.useRealTimers();
    sessionStorage.clear();
    lessMotion(false);
  });

  it('shows the firm’s name and tagline, lifts after a second and a half, and is gone at two', () => {
    const { container } = render(<Preloader />);

    const splash = container.firstElementChild;
    expect(splash).toHaveTextContent('Sagar');
    expect(splash).toHaveTextContent('H R & Co.');
    expect(splash).toHaveTextContent(CONTACT_INFO.tagline);
    // Decorative: its wordmark must not reach assistive technology.
    expect(splash).toHaveAttribute('aria-hidden', 'true');
    expect(splash).toHaveClass('translate-y-0');

    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(splash).toHaveClass('-translate-y-full');

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(container).toBeEmptyDOMElement();
    expect(sessionStorage.getItem('preloader_done')).toBe('1');
  });

  it('shows once per browser tab', () => {
    sessionStorage.setItem('preloader_done', '1');
    const { container } = render(<Preloader />);

    expect(container).toBeEmptyDOMElement();
  });

  it('does not show to readers who ask for less motion', () => {
    lessMotion(true);
    const { container } = render(<Preloader />);

    expect(container).toBeEmptyDOMElement();
  });
});
