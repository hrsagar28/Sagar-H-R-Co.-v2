import { describe, expect, it } from 'vitest';
import { DUE_DATES, DUE_DATES_FROM, DUE_DATES_TO } from './calendar';

const on = (date: string) => DUE_DATES.filter((due) => due.date === date).map((due) => due.title);

describe('due dates for 2026-27', () => {
  it('stays inside the year and in date order', () => {
    expect(DUE_DATES.every((due) => due.date >= DUE_DATES_FROM && due.date <= DUE_DATES_TO)).toBe(true);
    const dates = DUE_DATES.map((due) => due.date);
    expect(dates).toEqual([...dates].sort());
  });

  it('has every month’s TDS deposit and GSTR-3B', () => {
    const months = new Set(
      DUE_DATES.filter((due) => due.title.startsWith('GSTR-3B for') && !due.title.includes(' to ')).map((due) =>
        due.date.slice(0, 7),
      ),
    );
    expect(months.size).toBe(12);
    expect(DUE_DATES.filter((due) => due.title.startsWith('Pay TDS')).length).toBe(12);
  });

  it('keeps the 1961 dates for March 2026', () => {
    expect(on('2026-04-07')).toContain('Pay TCS collected in March 2026');
    expect(on('2026-04-30')).toContain('Pay TDS deducted in March 2026');
    expect(on('2026-04-21')).toContain('GSTR-3B for March 2026');
  });

  it('puts Form 141 thirty days after the month ends', () => {
    expect(on('2027-03-02')).toContain('Form 141 for January 2027');
    expect(on('2026-11-30')).toContain('Form 141 for October 2026');
  });

  it('carries the extended audit dates', () => {
    expect(on('2026-10-21')).toEqual(
      expect.arrayContaining([
        'Tax audit report for 2025-26',
        'Audit report of trusts and NPOs for 2025-26 (Forms 10B and 10BB)',
      ]),
    );
    expect(on('2026-11-21')).toContain('Income tax return for 2025-26, audit cases');
  });

  it('has GSTR-4 on 30 June and no annual director KYC', () => {
    expect(on('2026-06-30')).toContain('GSTR-4 for 2025-26');
    expect(DUE_DATES.some((due) => /DIR-3/.test(due.title))).toBe(false);
  });
});
