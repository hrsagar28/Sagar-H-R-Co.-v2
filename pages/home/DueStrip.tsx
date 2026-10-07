import React, { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from '../../components/redesign/icons';
import {
  DUE_CATEGORIES,
  DUE_DATES,
  DUE_DATES_FROM,
  DUE_DATES_TO,
  RESOURCES_TAX_YEAR,
  type DueCategory,
  type DueDate,
} from '../../constants/resources';
import { useReducedMotion } from '../../hooks';
import { dayMonth, daysBetween, monthYear, todayIso, weekday } from '../../utils/resources/dates';

// The home page's due dates: every main due date from today to the end of next
// month, one column per day, scrolling sideways; a filter by area; and a bar for
// how far into the tax year we are. The dates are the Resources calendar
// (constants/resources/calendar.ts), so the two never disagree.

const CATEGORY_LABEL = new Map(DUE_CATEGORIES.map((category) => [category.id, category.label]));
const MONTH_SHORT = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
const YEAR_DAYS = daysBetween(DUE_DATES_FROM, DUE_DATES_TO) + 1;

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

/** How far into the tax year a date is, as a percentage. */
const share = (iso: string) => {
  const day = Math.min(Math.max(daysBetween(DUE_DATES_FROM, iso), 0), YEAR_DAYS);
  return (day / YEAR_DAYS) * 100;
};

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

  const show = (category: 'all' | DueCategory) => {
    setShown(category);
    if (scroller.current) scroller.current.scrollLeft = 0;
  };

  const move = (direction: 1 | -1) => {
    const element = scroller.current;
    if (!element) return;
    element.scrollBy({ left: direction * element.clientWidth * 0.75, behavior: reduced ? 'auto' : 'smooth' });
  };

  const dayOfYear = daysBetween(DUE_DATES_FROM, today) + 1;
  const inYear = today >= DUE_DATES_FROM && today <= DUE_DATES_TO;

  return (
    <section className="hdue" aria-labelledby="home-due-heading">
      <div className="hdue-h pad">
        <div>
          <h2 id="home-due-heading">Upcoming due dates</h2>
          <p>
            {dayMonth(today)} to {dayMonth(until)} {until.slice(0, 4)}. Karnataka dates where a state date applies.
          </p>
        </div>
        <div className="hdue-ctl">
          <div className="topics keep" role="group" aria-label="Show">
            {[{ id: 'all' as const, label: 'All' }, ...DUE_CATEGORIES].map((category) => (
              <button
                key={category.id}
                type="button"
                className="topic"
                aria-pressed={shown === category.id}
                onClick={() => show(category.id)}
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
      </div>

      {days.length > 0 ? (
        // The arrows above move it by keyboard; browsers also let the strip
        // itself take focus and scroll with the arrow keys.
        <div className="hdue-scroll" ref={scroller} role="region" aria-label="Due dates by day">
          <ol className="hdue-days">
            {days.map((day, index) => {
              const opensMonth = index === 0 || days[index - 1]?.date.slice(0, 7) !== day.date.slice(0, 7);
              return (
                <li key={day.date} className={opensMonth ? 'mstart' : undefined}>
                  {opensMonth && (
                    <span className="hdue-m" aria-hidden="true">
                      {monthYear(day.date)}
                    </span>
                  )}
                  <div className="hdue-day">
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
                          <span className="t">{due.title}</span>
                          {due.detail && <span className="d">{due.detail}</span>}
                          <span className="c">{CATEGORY_LABEL.get(due.category)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      ) : (
        <p className="hdue-none pad">Nothing due in this area until the end of next month.</p>
      )}

      <div className="hdue-f pad">
        {inYear && (
          <div className="hyear">
            <p>
              Tax year {RESOURCES_TAX_YEAR}: day {dayOfYear} of {YEAR_DAYS}.
            </p>
            <div className="hyear-bar" aria-hidden="true">
              <span className="past" style={{ width: `${share(today)}%` }} />
              <span
                className="now"
                style={{ left: `${share(today)}%`, width: `${Math.max(share(until) - share(today), 0.6)}%` }}
              />
              <ol>
                {MONTH_SHORT.map((month) => (
                  <li key={month}>{month}</li>
                ))}
              </ol>
            </div>
          </div>
        )}
        <p className="hmore">
          <Link to="/resources/due-dates">All due dates for {RESOURCES_TAX_YEAR}</Link>
        </p>
      </div>
    </section>
  );
};

export default DueStrip;
