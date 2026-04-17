import type { Config } from 'tailwindcss';

export default {
  content: [
    "./index.html",
    "./*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./utils/**/*.{ts,tsx}",
    "./context/**/*.{ts,tsx}",
    "./constants/**/*.{ts,tsx}",
    "./config/**/*.{ts,tsx}",
    "./types/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      zIndex: {
        'base': '1',
        'dropdown': '100',
        'sticky': '200',
        'fixed': '300',
        'modal-backdrop': '400',
        'modal': '500',
        'popover': '600',
        'tooltip': '700',
        'toast': '800',
        'cursor': '900',
        'preloader': '1000',
        'network-status': '1100',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        heading: ['Fraunces', 'Georgia', 'serif'],
        serif: ['"Playfair Display"', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        brand: {
          bg: '#F2F2F0',
          surface: '#FFFFFF',
          dark: '#111111',
          black: '#0A0A0A',
          moss: '#1A4D2E',
          mossLight: '#E8F5E9',
          border: '#e7e5e4',
          stone: '#78716c',
          inverse: '#FFFFFF',
          'surface-dark': '#1e1e1e',
          'surface-dark-hover': '#161616',
        },
      },
      animation: {
        'spin-slow': 'spin 12s linear infinite',
        'marquee': 'marquee 25s linear infinite',
        'blob': 'blob 7s infinite',
        'fade-in-up': 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'expand-width': 'expandWidth 1s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        expandWidth: {
          '0%': { width: '0' },
          '100%': { width: '6rem' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
