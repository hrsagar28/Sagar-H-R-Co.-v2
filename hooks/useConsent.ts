import { useEffect, useState } from 'react';

type ConsentKey = 'cookie_consent' | 'maps_embed_consent';

const getGranted = (key: ConsentKey) => (
  typeof window !== 'undefined' && window.localStorage.getItem(key) === 'granted'
);

const getValue = (key: ConsentKey) => (
  typeof window !== 'undefined' ? window.localStorage.getItem(key) : null
);

export function useConsent(key: ConsentKey) {
  const [value, setValue] = useState<string | null>(() => getValue(key));
  const granted = value === 'granted';

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === key) setValue(event.newValue);
    };

    const onCustom = (event: Event) => {
      const detail = (event as CustomEvent<{ key?: string; value?: string }>).detail;
      if (detail?.key === key) setValue(detail.value ?? null);
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener('cookie-consent-change', onCustom as EventListener);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('cookie-consent-change', onCustom as EventListener);
    };
  }, [key]);

  const grant = () => {
    localStorage.setItem(key, 'granted');
    setValue('granted');
    window.dispatchEvent(new CustomEvent('cookie-consent-change', { detail: { key, value: 'granted' } }));
  };

  const revoke = () => {
    localStorage.removeItem(key);
    setValue(null);
    window.dispatchEvent(new CustomEvent('cookie-consent-change', { detail: { key, value: 'revoked' } }));
  };

  return { granted, value, grant, revoke };
}
