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

export const useRateLimit = ({ maxAttempts, windowMs, storageKey }: UseRateLimitOptions): UseRateLimitReturn => {
  const [attempts, setAttempts] = useState<number[]>([]);
  const [now, setNow] = useState(Date.now());

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

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const recentAttempts = attempts.filter(timestamp => now - timestamp < windowMs);
  const canSubmit = recentAttempts.length < maxAttempts;
  const attemptsRemaining = Math.max(0, maxAttempts - recentAttempts.length);
  const oldestAttempt = recentAttempts.length > 0 ? recentAttempts[0] : null;
  const resetTime = oldestAttempt ? new Date(oldestAttempt + windowMs) : null;
  const timeUntilReset = resetTime ? Math.max(0, Math.ceil((resetTime.getTime() - now) / 1000)) : 0;

  const recordAttempt = useCallback(() => {
    const newTimestamp = Date.now();
    // Refresh list based on current state to ensure accuracy
    const currentValid = attempts.filter(ts => Date.now() - ts < windowMs);
    const newAttempts = [...currentValid, newTimestamp];
    setAttempts(newAttempts);
    localStorage.setItem(storageKey, JSON.stringify(newAttempts));
  }, [attempts, windowMs, storageKey]);

  return { canSubmit, attemptsRemaining, resetTime, recordAttempt, timeUntilReset };
};