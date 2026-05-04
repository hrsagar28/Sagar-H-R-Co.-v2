import { useState, useEffect, useCallback, useRef } from 'react';
import { logger } from '../utils/logger';

interface UseFormDraftOptions {
  ttlDays?: number;
  requireConsent?: boolean;
  clearOnPagehideWithoutConsent?: boolean;
}

type DraftConsent = 'accepted' | 'essential' | null;
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

const parseDraft = async <T>(key: string, ttlDays: number): Promise<{ values: T; savedAt: Date } | null> => {
  const item = localStorage.getItem(key);
  if (!item) return null;

  try {
    const parsed = JSON.parse(item) as StoredDraft;
    const timestamp = Number(parsed.timestamp);
    if ((!parsed.values && !parsed.encrypted) || !Number.isFinite(timestamp)) {
      localStorage.removeItem(key);
      return null;
    }

    const savedAt = new Date(timestamp);
    const ageInDays = (Date.now() - savedAt.getTime()) / (1000 * 60 * 60 * 24);
    if (ageInDays > ttlDays) {
      localStorage.removeItem(key);
      return null;
    }

    const values = parsed.encrypted ? await decryptValues<T>(parsed.encrypted) : (parsed.values as T);
    if (!values) {
      localStorage.removeItem(key);
      return null;
    }

    return { values, savedAt };
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
  options: UseFormDraftOptions = {},
) {
  const [hasDraft, setHasDraft] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const isFirstRender = useRef(true);
  const { ttlDays = 14, requireConsent = true, clearOnPagehideWithoutConsent = true } = options;

  // Check for draft on mount
  useEffect(() => {
    if (requireConsent && getDraftConsent() === 'essential') {
      localStorage.removeItem(key);
      return;
    }

    void parseDraft<T>(key, ttlDays).then((draft) => {
      if (draft) {
        setHasDraft(true);
        setLastSaved(draft.savedAt);
      }
    });
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

      const saveDraft = async () => {
        const payload = {
          encrypted: await encryptValues(currentValues),
          timestamp: Date.now(),
        };

        try {
          localStorage.setItem(key, JSON.stringify(payload));
          setLastSaved(new Date());
          setHasDraft(true);
        } catch (e) {
          if (
            e instanceof DOMException &&
            (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')
          ) {
            logger.warn('Failed to save draft: localStorage quota exceeded');
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

  const loadDraft = useCallback(async (): Promise<T | null> => {
    if (requireConsent && getDraftConsent() === 'essential') {
      localStorage.removeItem(key);
      return null;
    }

    return (await parseDraft<T>(key, ttlDays))?.values || null;
  }, [key, requireConsent, ttlDays]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(key);
    setHasDraft(false);
    setLastSaved(null);
  }, [key]);

  return { hasDraft, loadDraft, clearDraft, lastSaved };
}
