import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import TDSRates from './TDSRates';

vi.mock('../../components/SEO', () => ({
  default: () => null,
}));

const setWidth = (phone: boolean) => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: phone,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
};

const renderRates = () =>
  render(
    <MemoryRouter initialEntries={['/resources/tds-tcs-rates']}>
      <main>
        <TDSRates />
      </main>
    </MemoryRouter>,
  );

describe('TDSRates', () => {
  it('folds the groups on a phone with the classes the stylesheet expects (Audit DES-03)', () => {
    setWidth(true);
    const { container } = renderRates();

    expect(container.querySelectorAll('section.sec.fold').length).toBeGreaterThan(1);
    expect(container.querySelector('section.secfold')).toBeNull();
  });

  it('shows the groups open on a wide screen', () => {
    setWidth(false);
    const { container } = renderRates();

    expect(container.querySelectorAll('section.sec').length).toBeGreaterThan(1);
    expect(container.querySelector('section.fold')).toBeNull();
  });
});
