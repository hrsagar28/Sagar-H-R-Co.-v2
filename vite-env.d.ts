/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FORM_ENDPOINT?: string;
  readonly VITE_GA_MEASUREMENT_ID?: string;
  readonly VITE_BOTPOISON_PUBLIC_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

type GtagCommand = 'js' | 'config' | 'event' | 'consent' | 'set';
type Gtag = (command: GtagCommand, target: string | Date, config?: Record<string, unknown>) => void;

interface Window {
  dataLayer?: unknown[][];
  gtag?: Gtag;
}
