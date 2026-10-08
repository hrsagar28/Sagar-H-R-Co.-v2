import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useRateLimit } from './useRateLimit';

const options = { maxAttempts: 3, windowMs: 60_000, storageKey: 'test_limit' };

describe('useRateLimit', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('works when the browser blocks site data (Audit UX-02)', () => {
    const denied = () => {
      throw new DOMException('Access is denied for this document.', 'SecurityError');
    };
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(denied);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(denied);

    const { result } = renderHook(() => useRateLimit(options));
    expect(result.current.canSubmit).toBe(true);

    // Still counted within the page, just not kept across a reload.
    act(() => {
      result.current.recordAttempt();
      result.current.recordAttempt();
      result.current.recordAttempt();
    });
    expect(result.current.canSubmit).toBe(false);
  });

  it('remembers attempts across a reload', () => {
    localStorage.setItem(options.storageKey, JSON.stringify([Date.now(), Date.now(), Date.now()]));

    const { result } = renderHook(() => useRateLimit(options));
    expect(result.current.canSubmit).toBe(false);
  });
});
