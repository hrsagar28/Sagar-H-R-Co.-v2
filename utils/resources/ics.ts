import type { DueDate } from '../../constants/resources/calendar';

// Due dates as an iCalendar (.ics) file, which Google Calendar, Outlook and
// Apple Calendar can all import. Each date is an all-day event with a
// reminder two days before. RFC 5545: text escaped, lines folded at 75 octets,
// CRLF line endings.

const escapeText = (text: string) =>
  text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

/** Fold a content line at 75 octets; continuation lines start with a space. */
const fold = (line: string) => {
  const bytes = new TextEncoder().encode(line);
  if (bytes.length <= 75) return line;
  const parts: string[] = [];
  let current = '';
  let size = 0;
  for (const char of line) {
    const width = new TextEncoder().encode(char).length;
    const limit = parts.length === 0 ? 75 : 74;
    if (size + width > limit) {
      parts.push(current);
      current = '';
      size = 0;
    }
    current += char;
    size += width;
  }
  parts.push(current);
  return parts.join('\r\n ');
};

const compact = (iso: string) => iso.replace(/-/g, '');

/** The day after, for an all-day event's end (DTEND is exclusive). */
const nextDay = (iso: string) => {
  const [year = 0, month = 1, day = 1] = iso.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day + 1)).toISOString().slice(0, 10);
};

const slug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** An .ics file for these dates. `stamp` is the creation time, as an ISO string. */
export const buildIcs = (dates: DueDate[], calendarName: string, stamp: string) => {
  const dtstamp = `${stamp.replace(/[-:]/g, '').slice(0, 15)}Z`;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Sagar H R & Co.//Due dates//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeText(calendarName)}`,
  ];
  for (const due of dates) {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${due.date}-${slug(due.title)}@casagar.co.in`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART;VALUE=DATE:${compact(due.date)}`,
      `DTEND;VALUE=DATE:${compact(nextDay(due.date))}`,
      `SUMMARY:${escapeText(due.title)}`,
      ...(due.detail ? [`DESCRIPTION:${escapeText(due.detail)}`] : []),
      'TRANSP:TRANSPARENT',
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${escapeText(due.title)}`,
      'TRIGGER:-P2D',
      'END:VALARM',
      'END:VEVENT',
    );
  }
  lines.push('END:VCALENDAR');
  return `${lines.map(fold).join('\r\n')}\r\n`;
};

/** Save text as a file through the browser's download. */
export const downloadText = (text: string, filename: string, type: string) => {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};
