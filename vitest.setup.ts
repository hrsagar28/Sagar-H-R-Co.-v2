import { vi } from 'vitest';

/**
 * Global test setup.
 *
 * jsdom implements neither IntersectionObserver nor matchMedia, but the
 * Reveal component and the useReducedMotion hook call them inside effects —
 * so any test that renders a page needs both stubbed. Registered once via
 * vite.config.ts -> test.setupFiles, so individual test files no longer
 * need their own ad-hoc mocks.
 */

class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
}

window.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;

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
