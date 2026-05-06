import type { Config } from 'tailwindcss';
import baseConfig from './tailwind.config';

export default {
  ...baseConfig,
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
    './utils/**/*.{ts,tsx}',
    './context/**/*.{ts,tsx}',
    './constants/**/*.{ts,tsx}',
    './config/**/*.{ts,tsx}',
    './types/**/*.{ts,tsx}',
  ],
} satisfies Config;
