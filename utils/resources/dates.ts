// Date helpers for the due-date pages. Dates are kept as YYYY-MM-DD strings
// and read as calendar days, never through a time zone.

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const parts = (iso: string): [number, number, number] => {
  const [year = 0, month = 1, day = 1] = iso.split('-').map(Number);
  return [year, month, day];
};

/** Today in the viewer's own calendar, as YYYY-MM-DD. */
export const todayIso = () => {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

/** "21 October" */
export const dayMonth = (iso: string) => {
  const [, month, day] = parts(iso);
  return `${day} ${MONTHS[month - 1] ?? ''}`;
};

/** "October 2026" */
export const monthYear = (iso: string) => {
  const [year, month] = parts(iso);
  return `${MONTHS[month - 1] ?? ''} ${year}`;
};

/** "Wednesday" */
export const weekday = (iso: string) => {
  const [year, month, day] = parts(iso);
  return DAYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()] ?? '';
};

/** Whole days from `from` to `to`. */
export const daysBetween = (from: string, to: string) => {
  const [y1, m1, d1] = parts(from);
  const [y2, m2, d2] = parts(to);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000);
};
