import { useState, useEffect, useCallback, useRef } from 'react';
import { logger } from '../utils/logger';

type StoredDraft = {
  timestamp: number;
  values?: unknown;
  encrypted?: {
    v: 1;
    iv: string;
    ciphertext: string;
  };
};

const DRAFT_SALT_KEY = 'form_draft_session_salt';

const bytesToBase64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));
const base64ToBytes = (value: string) => Uint8Array.from(atob(value), (char) => char.charCodeAt(0));

const getSessionSalt = () => {
  let salt = sessionStorage.getItem(DRAFT_SALT_KEY);
  if (!salt) {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    salt = bytesToBase64(bytes);
    sessionStorage.setItem(DRAFT_SALT_KEY, salt);
  }
  return salt;
};

const getDraftKey = async () => {
  const material = new TextEncoder().encode(`${window.location.origin}:${getSessionSalt()}`);
  const digest = await crypto.subtle.digest('SHA-256', material);
  return crypto.subtle.importKey('raw', digest, 'AES-GCM', false, ['encrypt', 'decrypt']);
};

const encryptValues = async <T>(values: T) => {
  const iv = new Uint8Array(12);
  crypto.getRandomValues(iv);
  const encoded = new TextEncoder().encode(JSON.stringify(values));
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await getDraftKey(), encoded);

  return {
    v: 1 as const,
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(new Uint8Array(encrypted)),
  };
};

const decryptValues = async <T>(encrypted: StoredDraft['encrypted']): Promise<T | null> => {
  if (!encrypted) return null;

  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: base64ToBytes(encrypted.iv) },
    await getDraftKey(),
    base64ToBytes(encrypted.ciphertext),
  );

  return JSON.parse(new TextDecoder().decode(plaintext)) as T;
};

const parseDraft = async <T>(key: string): Promise<{ values: T; savedAt: Date } | null> => {
  const item = sessionStorage.getItem(key);
  if (!item) return null;

  try {
    const parsed = JSON.parse(item) as StoredDraft;
    const timestamp = Number(parsed.timestamp);
    if ((!parsed.values && !parsed.encrypted) || !Number.isFinite(timestamp)) {
      sessionStorage.removeItem(key);
      return null;
    }

    const values = parsed.encrypted ? await decryptValues<T>(parsed.encrypted) : (parsed.values as T);
    if (!values) {
      sessionStorage.removeItem(key);
      return null;
    }

    return { values, savedAt: new Date(timestamp) };
  } catch {
    sessionStorage.removeItem(key);
    return null;
  }
};

/**
 * Keeps an unfinished form so that a reload or a stray click doesn't lose it.
 *
 * The draft lives in sessionStorage, which the browser clears when the tab is
 * closed, so nothing is left behind on a shared computer and no consent banner
 * is needed. It is encrypted with a key derived from a per-session salt; that
 * keeps it from casual view in the browser's storage, not from code already
 * running on the page.
 *
 * @template T
 * @param {string} key - Unique storage key for the form.
 * @param {T} currentValues - Current form values to observe.
 * @param {number} [debounceMs=1000] - Debounce time in ms before saving.
 * @returns {object} Draft management methods and state.
 */
export function useFormDraft<T>(key: string, currentValues: T, debounceMs: number = 1000) {
  const [hasDraft, setHasDraft] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const isFirstRender = useRef(true);

  // Check for a draft on mount.
  useEffect(() => {
    // Drafts used to be kept in localStorage for up to 14 days (with consent
    // from the old cookie banner). Clear any left behind.
    try {
      localStorage.removeItem(key);
    } catch {
      // storage unavailable
    }

    void parseDraft<T>(key).then((draft) => {
      if (draft) {
        setHasDraft(true);
        setLastSaved(draft.savedAt);
      }
    });
  }, [key]);

  // Auto-save
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const handler = setTimeout(() => {
      const saveDraft = async () => {
        const payload = {
          encrypted: await encryptValues(currentValues),
          timestamp: Date.now(),
        };

        try {
          sessionStorage.setItem(key, JSON.stringify(payload));
          setLastSaved(new Date());
          setHasDraft(true);
        } catch (e) {
          if (
            e instanceof DOMException &&
            (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')
          ) {
            logger.warn('Failed to save draft: sessionStorage quota exceeded');
            window.dispatchEvent(
              new CustomEvent('app-toast', {
                detail: {
                  message: 'Auto-save failed: Browser storage full.',
                  variant: 'warning',
                },
              }),
            );
          }
        }
      };

      void saveDraft();
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [currentValues, key, debounceMs]);

  const loadDraft = useCallback(async (): Promise<T | null> => (await parseDraft<T>(key))?.values || null, [key]);

  const clearDraft = useCallback(() => {
    sessionStorage.removeItem(key);
    setHasDraft(false);
    setLastSaved(null);
  }, [key]);

  return { hasDraft, loadDraft, clearDraft, lastSaved };
}
