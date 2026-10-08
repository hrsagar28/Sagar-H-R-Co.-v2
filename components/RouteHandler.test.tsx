import React, { useEffect } from 'react';
import { act, render } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import RouteHandler, { routeAnnouncement } from './RouteHandler';

const announce = vi.hoisted(() => vi.fn());

vi.mock('../hooks', () => ({
  useAnnounce: () => ({ announce }),
}));

const router: { navigate: ReturnType<typeof useNavigate> } = { navigate: () => undefined };
const Navigator = () => {
  const navigate = useNavigate();
  useEffect(() => {
    router.navigate = navigate;
  }, [navigate]);
  return null;
};
const navigate = (to: string | number) => (typeof to === 'number' ? router.navigate(to) : router.navigate(to));

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <RouteHandler />
      <Navigator />
    </MemoryRouter>,
  );

describe('RouteHandler', () => {
  beforeEach(() => {
    sessionStorage.clear();
    announce.mockClear();
    window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      callback(0);
      return 0;
    });
    // A page tall enough for any saved position.
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 10000, configurable: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('opens a new page at the top', () => {
    renderAt('/services');

    expect(window.scrollTo).toHaveBeenLastCalledWith({ top: 0, left: 0, behavior: 'instant' });
  });

  it('returns to the saved position on back (Audit UX-01)', () => {
    renderAt('/services');
    sessionStorage.setItem('scroll:/services', '640');

    act(() => navigate('/services/gst'));
    expect(window.scrollTo).toHaveBeenLastCalledWith({ top: 0, left: 0, behavior: 'instant' });

    act(() => navigate(-1));
    expect(window.scrollTo).toHaveBeenLastCalledWith({ top: 640, left: 0, behavior: 'instant' });
  });

  it('announces the page by name', () => {
    renderAt('/faqs');

    expect(announce).toHaveBeenCalledWith('Navigated to FAQ');
  });
});

describe('routeAnnouncement', () => {
  it('keeps abbreviations in capitals (Audit A11Y-06)', () => {
    expect(routeAnnouncement('/services/gst')).toBe('Navigated to Service: GST');
    expect(routeAnnouncement('/services/tds-and-tcs')).toBe('Navigated to Service: TDS and TCS');
    expect(routeAnnouncement('/services/nri-taxation')).toBe('Navigated to Service: NRI taxation');
    expect(routeAnnouncement('/')).toBe('Navigated to Home');
  });
});
