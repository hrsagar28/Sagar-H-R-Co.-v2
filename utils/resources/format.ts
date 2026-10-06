// Number helpers for the Resources tools. Amounts are shown in the Indian
// grouping (₹12,34,567) and typed without it.

const WHOLE = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
const PAISE = new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** ₹12,34,567, rounded to the rupee; a negative amount as −₹12,34,567. */
export const rupees = (value: number) => {
  const whole = Math.round(value) || 0;
  return `${whole < 0 ? '−' : ''}₹${WHOLE.format(Math.abs(whole))}`;
};

/** ₹12,34,567.50, to the paisa (GST). */
export const rupeesPaise = (value: number) => `₹${PAISE.format(Math.round(value * 100) / 100 || 0)}`;

/** 12,34,567 without the symbol, for an input that is not being edited. */
export const grouped = (value: number) => WHOLE.format(value);

/**
 * Digits allowed before the decimal point: up to ₹999 crore, more than any of
 * the tools needs. Longer numbers lose precision and widen the results past
 * a phone screen.
 */
export const MAX_DIGITS = 10;

/** A typed amount: digits and at most one decimal point; anything else is dropped. */
export const cleanAmount = (text: string, maxDigits = MAX_DIGITS) => {
  const kept = text.replace(/[^\d.]/g, '');
  const [first = '', ...rest] = kept.split('.');
  const whole = first.replace(/^0+(?=\d)/, '').slice(0, maxDigits);
  return rest.length ? `${whole}.${rest.join('').slice(0, 2)}` : whole;
};

/** The number in a typed amount; empty or invalid text is 0. */
export const toAmount = (text: string) => {
  const value = Number(cleanAmount(text));
  return Number.isFinite(value) && value > 0 ? value : 0;
};

/** 12.5% → "12.5%", 0.25 → "0.25%". */
export const percent = (fraction: number) => `${Math.round(fraction * 10000) / 100}%`;

/** Round to the paisa. */
export const toPaise = (value: number) => Math.round(value * 100) / 100;
