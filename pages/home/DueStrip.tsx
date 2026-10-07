import React, { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from '../../components/redesign/icons';
import {
  DUE_CATEGORIES,
  DUE_DATES,
  DUE_DATES_TO,
  RESOURCES_TAX_YEAR,
  type DueCategory,
  type DueDate,
} from '../../constants/resources';
import { useReducedMotion } from '../../hooks';
import { dayMonth, daysBetween, monthYear, todayIso, weekday } from '../../utils/resources/dates';

// The home page's due dates: every main due date from today to the end of next
// month, one column per day, scrolling sideways, with a filter by area. The
// dates are the Resources calendar (constants/resources/calendar.ts), so the
// two never disagree.

const CATEGORY_LABEL = new Map(DUE_CATEGORIES.map((category) => [category.id, category.label]));

/** A day with this many filings or more gets a double-width column, so the strip stays low. */
const WIDE_FROM = 3;

/** The last day of the month after the one `iso` falls in, no later than the end of the tax year. */
const endOfNextMonth = (iso: string) => {
  const [year = 0, month = 1] = iso.split('-').map(Number);
  const end = new Date(Date.UTC(year, month + 1, 0)).toISOString().slice(0, 10);
  return end < DUE_DATES_TO ? end : DUE_DATES_TO;
};

const inDays = (today: string, date: string) => {
  const days = daysBetween(today, date);
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `In ${days} days`;
};

/** Keeps "GSTR-1" and "2025-26" whole: a browser may otherwise break the line after the hyphen. */
const keepTogether = (text: string) =>
  text.split(/(\S*[-–]\S*)/).map((part, index) =>
    index % 2 === 1 ? (
      // The split leaves the hyphenated words at the odd positions.
      <span key={index} className="nowrap">
        {part}
      </span>
    ) : (
      part
    ),
  );

interface Day {
  date: string;
  dues: DueDate[];
}

const DueStrip: React.FC = () => {
  const today = todayIso();
  const until = endOfNextMonth(today);
  const [shown, setShown] = useState<'all' | DueCategory>('all');
  const scroller = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const days = useMemo(() => {
    const byDate = new Map<string, DueDate[]>();
    for (const due of DUE_DATES) {
      if (due.minor || due.date < today || due.date > until) continue;
      if (shown !== 'all' && due.category !== shown) continue;
      byDate.set(due.date, [...(byDate.get(due.date) ?? []), due]);
    }
    return [...byDate.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, dues]): Day => ({ date, dues }));
  }, [today, until, shown]);

  const move = (direction: 1 | -1) => {
    const element = scroller.current;
    if (!element) return;
    element.scrollBy({
      left: direction * Math.max(240, element.clientWidth * 0.7),
      behavior: reduced ? 'auto' : 'smooth',
    });
  };

  return (
    <section className="hdue" aria-labelledby="home-due-heading">
      <div className="hdue-h pad">
        <h2 className="hh" id="home-due-heading">
          Upcoming due dates
        </h2>
        <div className="hchips" role="group" aria-label="Show">
          {[{ id: 'all' as const, label: 'All' }, ...DUE_CATEGORIES].map((category) => (
            <button
              key={category.id}
              type="button"
              className="hchip"
              aria-pressed={shown === category.id}
              onClick={() => setShown(category.id)}
            >
              {category.label}
            </button>
          ))}
        </div>
        <div className="hdue-nav">
          <button type="button" aria-label="Earlier dates" onClick={() => move(-1)}>
            <ArrowLeft size={16} />
          </button>
          <button type="button" aria-label="Later dates" onClick={() => move(1)}>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* The two buttons above move the strip from the keyboard. Keyed by the
          area shown, so choosing another starts a new strip at its first date:
          with scroll snapping, the browser would otherwise hold the old strip
          on the day it was at. */}
      <div key={shown} className="hdue-scroll" ref={scroller} role="region" aria-label="Due dates by day">
        <ol className="hdue-days">
          {days.map((day, index) => {
            const opensMonth = index === 0 || days[index - 1]?.date.slice(0, 7) !== day.date.slice(0, 7);
            const dayClass = ['hdue-day', day.dues.length >= WIDE_FROM ? 'wide' : '', day.date === today ? 'today' : '']
              .filter(Boolean)
              .join(' ');
            return (
              <li key={day.date}>
                {opensMonth && (
                  <span className="hdue-m" aria-hidden="true">
                    <span>{monthYear(day.date)}</span>
                  </span>
                )}
                <div className={dayClass}>
                  <p className="hdue-top" aria-hidden="true">
                    <span>{weekday(day.date)}</span>
                    <span>{inDays(today, day.date)}</span>
                  </p>
                  <p className="hdue-n" aria-hidden="true">
                    {Number(day.date.slice(8, 10))}
                  </p>
                  <h3 className="vh">
                    <time dateTime={day.date}>
                      {weekday(day.date)} {dayMonth(day.date)} {day.date.slice(0, 4)}
                    </time>
                    , {inDays(today, day.date).toLowerCase()}
                  </h3>
                  <ul>
                    {day.dues.map((due) => (
                      <li key={due.title}>
                        <span className="t">{keepTogether(due.title)}</span>
                        {due.detail && <span className="d">{due.detail}</span>}
                        <span className="c">{CATEGORY_LABEL.get(due.category)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            );
          })}
          <li className="hdue-all">
            {days.length === 0 && <p>Nothing due in this area until the end of next month.</p>}
            <Link to="/resources/due-dates">All due dates for {RESOURCES_TAX_YEAR}</Link>
            <span>GST, income tax, TDS, company, LLP and payroll due dates for the year.</span>
          </li>
        </ol>
      </div>
    </section>
  );
};

export default DueStrip;
