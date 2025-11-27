import { useState, useEffect, useCallback, useRef } from 'react';

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
      localStorage.setItem(key, JSON.stringify(payload));
      setLastSaved(new Date());
      setHasDraft(true);
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