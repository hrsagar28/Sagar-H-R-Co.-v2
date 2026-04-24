
import { useState, useEffect, useCallback } from 'react';
import { logger } from '../utils/logger';

interface UseRateLimitOptions {
  maxAttempts: number;
  windowMs: number;
  storageKey: string;
}

interface UseRateLimitReturn {
  canSubmit: boolean;
  attemptsRemaining: number;
  resetTime: Date | null;
  recordAttempt: () => void;
  timeUntilReset: number;
}

/**
 * Hook to enforce client-side rate limiting on actions (e.g., form submissions).
 * Persists attempts to localStorage to survive page reloads.
 * 
 * @param {UseRateLimitOptions} options - Configuration for rate limiting.
 * @returns {UseRateLimitReturn} Rate limit state and methods.
 */
export const useRateLimit = ({ maxAttempts, windowMs, storageKey }: UseRateLimitOptions): UseRateLimitReturn => {
  const [attempts, setAttempts] = useState<number[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const validAttempts = parsed.filter((timestamp: number) => Date.now() - timestamp < windowMs);
          setAttempts(validAttempts);
        }
      } catch (e) {
        logger.error("Error parsing rate limit data", e);
      }
    }
  }, [storageKey, windowMs]);

  const now = Date.now();
  const recentAttempts = attempts.filter(timestamp => now - timestamp < windowMs);
  const canSubmit = recentAttempts.length < maxAttempts;
  const attemptsRemaining = Math.max(0, maxAttempts - recentAttempts.length);
  const oldestAttempt = recentAttempts.length > 0 ? recentAttempts[0] : null;
  const resetTime = oldestAttempt ? new Date(oldestAttempt + windowMs) : null;
  const timeUntilReset = resetTime ? Math.max(0, Math.ceil((resetTime.getTime() - now) / 1000)) : 0;

  useEffect(() => {
    if (canSubmit || !resetTime) return;

    const timeoutMs = Math.max(0, resetTime.getTime() - Date.now()) + 50;
    const timeout = setTimeout(() => {
      setAttempts(prev => prev.filter(timestamp => Date.now() - timestamp < windowMs));
    }, timeoutMs);

    return () => clearTimeout(timeout);
  }, [canSubmit, resetTime, windowMs]);

  const recordAttempt = useCallback(() => {
    const newTimestamp = Date.now();
    setAttempts(prev => {
      const currentValid = prev.filter(ts => newTimestamp - ts < windowMs);
      const newAttempts = [...currentValid, newTimestamp];

      try {
        localStorage.setItem(storageKey, JSON.stringify(newAttempts));
      } catch (e) {
        if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
          logger.warn('Failed to update rate limit: localStorage quota exceeded');
        }
      }

      return newAttempts;
    });
  }, [windowMs, storageKey]);

  return { canSubmit, attemptsRemaining, resetTime, recordAttempt, timeUntilReset };
};
