export function formatArchiveDate(input: string | Date): string {
  const date = typeof input === 'string' ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return String(input);

  const month = date.toLocaleString('en-IN', { month: 'short' });
  const year = String(date.getFullYear()).slice(2);
  return `${month} · ${year}`;
}

