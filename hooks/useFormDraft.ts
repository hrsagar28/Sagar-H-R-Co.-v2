
import { useState, useEffect, useCallback, useRef } from 'react';
import { logger } from '../utils/logger';

/**
 * Hook to auto-save form progress to localStorage.
 * 
 * @template T
 * @param {string} key - Unique storage key for the form.
 * @param {T} currentValues - Current form values to observe.
 * @param {number} [debounceMs=1000] - Debounce time in ms before saving.
 * @returns {object} Draft management methods and state.
 */
export function useFormDraft<T>(
  key: string,
  currentValues: T,
  debounceMs: number = 1000
) {
  const [hasDraft, setHasDraft] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const isFirstRender = useRef(true);

  // Check for draft on mount
  useEffect(() => {
    const item = localStorage.getItem(key);
    if (item) {
        setHasDraft(true);
        try {
            const parsed = JSON.parse(item);
            if (parsed.timestamp) setLastSaved(new Date(parsed.timestamp));
        } catch {}
    }
  }, [key]);

  // Auto-save
  useEffect(() => {
    if (isFirstRender.current) {
        isFirstRender.current = false;
        return;
    }

    const handler = setTimeout(() => {
      const payload = {
        values: currentValues,
        timestamp: Date.now()
      };
      
      try {
        localStorage.setItem(key, JSON.stringify(payload));
        setLastSaved(new Date());
        setHasDraft(true);
      } catch (e) {
        if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
           logger.warn('Failed to save draft: localStorage quota exceeded');
           // Notify user once per session or throttle this to avoid spamming toasts
           // Using simple dispatch here
           window.dispatchEvent(new CustomEvent('app-toast', { 
              detail: { 
                message: 'Auto-save failed: Browser storage full.', 
                variant: 'warning' 
              } 
           }));
        }
      }
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [currentValues, key, debounceMs]);

  const loadDraft = useCallback((): T | null => {
    const item = localStorage.getItem(key);
    if (!item) return null;
    try {
      return JSON.parse(item).values;
    } catch {
      return null;
    }
  }, [key]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(key);
    setHasDraft(false);
    setLastSaved(null);
  }, [key]);

  return { hasDraft, loadDraft, clearDraft, lastSaved };
}
