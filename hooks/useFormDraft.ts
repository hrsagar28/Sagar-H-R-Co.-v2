
import { useState, useEffect, useCallback, useRef } from 'react';
import { logger } from '../utils/logger';

interface UseFormDraftOptions {
  ttlDays?: number;
  requireConsent?: boolean;
  clearOnPagehideWithoutConsent?: boolean;
}

type DraftConsent = 'accepted' | 'essential' | null;

const getDraftConsent = (): DraftConsent => {
  const dashedConsent = localStorage.getItem('cookie-consent');
  const underscoredConsent = localStorage.getItem('cookie_consent');

  if (dashedConsent === 'accepted' || underscoredConsent === 'granted') return 'accepted';
  if (
    dashedConsent === 'essential' ||
    dashedConsent === 'essential-only' ||
    dashedConsent === 'declined' ||
    underscoredConsent === 'declined'
  ) {
    return 'essential';
  }

  return null;
};

const parseDraft = <T,>(key: string, ttlDays: number): { values: T; savedAt: Date } | null => {
  const item = localStorage.getItem(key);
  if (!item) return null;

  try {
    const parsed = JSON.parse(item);
    const timestamp = Number(parsed.timestamp);
    if (!parsed.values || !Number.isFinite(timestamp)) {
      localStorage.removeItem(key);
      return null;
    }

    const savedAt = new Date(timestamp);
    const ageInDays = (Date.now() - savedAt.getTime()) / (1000 * 60 * 60 * 24);
    if (ageInDays > ttlDays) {
      localStorage.removeItem(key);
      return null;
    }

    return { values: parsed.values as T, savedAt };
  } catch {
    localStorage.removeItem(key);
    return null;
  }
};

/**
 * Hook to auto-save form progress to localStorage.
 * 
 * @template T
 * @param {string} key - Unique storage key for the form.
 * @param {T} currentValues - Current form values to observe.
 * @param {number} [debounceMs=1000] - Debounce time in ms before saving.
 * @param {UseFormDraftOptions} [options] - Retention and consent controls.
 * @returns {object} Draft management methods and state.
 */
export function useFormDraft<T>(
  key: string,
  currentValues: T,
  debounceMs: number = 1000,
  options: UseFormDraftOptions = {}
) {
  const [hasDraft, setHasDraft] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const isFirstRender = useRef(true);
  const {
    ttlDays = 14,
    requireConsent = true,
    clearOnPagehideWithoutConsent = true
  } = options;

  // Check for draft on mount
  useEffect(() => {
    if (requireConsent && getDraftConsent() === 'essential') {
      localStorage.removeItem(key);
      return;
    }

    const draft = parseDraft<T>(key, ttlDays);
    if (draft) {
      setHasDraft(true);
      setLastSaved(draft.savedAt);
    }
  }, [key, requireConsent, ttlDays]);

  // Auto-save
  useEffect(() => {
    if (isFirstRender.current) {
        isFirstRender.current = false;
        return;
    }

    const handler = setTimeout(() => {
      if (requireConsent && getDraftConsent() !== 'accepted') {
        return;
      }

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
  }, [currentValues, key, debounceMs, requireConsent]);

  useEffect(() => {
    if (!clearOnPagehideWithoutConsent || !requireConsent) return;

    const handlePagehide = () => {
      if (getDraftConsent() !== 'accepted') {
        localStorage.removeItem(key);
      }
    };

    window.addEventListener('pagehide', handlePagehide);
    return () => window.removeEventListener('pagehide', handlePagehide);
  }, [clearOnPagehideWithoutConsent, key, requireConsent]);

  const loadDraft = useCallback((): T | null => {
    if (requireConsent && getDraftConsent() === 'essential') {
      localStorage.removeItem(key);
      return null;
    }

    return parseDraft<T>(key, ttlDays)?.values || null;
  }, [key, requireConsent, ttlDays]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(key);
    setHasDraft(false);
    setLastSaved(null);
  }, [key]);

  return { hasDraft, loadDraft, clearDraft, lastSaved };
}
