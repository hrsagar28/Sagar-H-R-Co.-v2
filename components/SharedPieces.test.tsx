import React from 'react';
import '@testing-library/jest-dom/vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import NetworkStatus from './NetworkStatus';
import ErrorBoundary from './ErrorBoundary';
import RouteErrorBoundary from './RouteErrorBoundary';
import PageLoader from './PageLoader';
import Toast from './Toast';

const Thrower: React.FC<{ message: string }> = ({ message }) => {
  throw new Error(message);
};

describe('shared pieces', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('shows the offline bar, then "Back online" for a few seconds', () => {
    vi.useFakeTimers();
    render(<NetworkStatus />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(screen.getByRole('status')).toHaveTextContent(/you are offline/i);

    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    expect(screen.getByRole('status')).toHaveTextContent('Back online.');

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('offers a reload when one page fails, with a way to reach the firm', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <RouteErrorBoundary>
        <Thrower message="chunk failed" />
      </RouteErrorBoundary>,
    );

    expect(screen.getByRole('heading', { name: 'This page could not load' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reload the page' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'mail@casagar.co.in' })).toHaveAttribute(
      'href',
      'mailto:mail@casagar.co.in',
    );
  });

  it('tells the visitor plainly when the whole site fails, without claiming anyone was notified', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Thrower message="boom" />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Something went wrong' })).toBeInTheDocument();
    expect(screen.queryByText(/notified/i)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'email us about it' }).getAttribute('href')).toMatch(/^mailto:.*boom/);
  });

  it('says the site was updated when a page’s code is out of date', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Thrower message="Failed to fetch dynamically imported module: /assets/x.js" />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'The site has been updated' })).toBeInTheDocument();
  });

  it('marks the loading screen as busy for assistive tech', () => {
    const { container } = render(<PageLoader tone="ink" />);

    expect(container.firstChild).toHaveAttribute('aria-busy', 'true');
    expect(container.firstChild).toHaveClass('sx-loader', 'ink');
  });

  it('closes a pop-up message from its close button', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    render(<Toast id="t1" message="Phone number copied" variant="success" onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: 'Close message' }));
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(onClose).toHaveBeenCalledWith('t1');
  });
});
