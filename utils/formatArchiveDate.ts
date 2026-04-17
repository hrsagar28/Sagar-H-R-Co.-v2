export function formatArchiveDate(input: string | Date): string {
  const d = typeof input === 'string' ? new Date(input) : input;
  const month = d.toLocaleString('en-GB', { month: 'short' });   // Jan, Feb...
  const year = String(d.getFullYear()).slice(2);                 // "26"
  return `${month} · ${year}`;
}
