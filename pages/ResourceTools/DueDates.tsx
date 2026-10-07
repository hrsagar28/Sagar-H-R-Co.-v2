import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import ToolPage from './ToolPage';
import { DUE_CATEGORIES, DUE_DATES, getResourceTool, type DueCategory } from '../../constants/resources';
import { dayMonth, inDays, monthYear, todayIso, weekday } from '../../utils/resources/dates';
import { buildIcs, downloadText } from '../../utils/resources/ics';

const TOOL = getResourceTool('due-dates')!;

const CATEGORY_LABEL = new Map(DUE_CATEGORIES.map((category) => [category.id, category.label]));
const NEXT_COUNT = 5;
const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_KEYS = [...new Set(DUE_DATES.map((due) => due.date.slice(0, 7)))];

/** "this month and next" (the default), one month ("2026-11"), or the whole year. */
type View = 'soon' | 'year' | string;

const monthAfter = (key: string) => {
  const [year = 0, month = 1] = key.split('-').map(Number);
  return month === 12 ? `${year + 1}-01` : `${year}-${String(month + 1).padStart(2, '0')}`;
};

const DueDates: React.FC = () => {
  const { hash } = useLocation();
  const today = todayIso();
  const thisMonth = today.slice(0, 7);
  const [shown, setShown] = useState<'all' | DueCategory>('all');
  // A link such as /resources/due-dates#2026-10 opens on that month.
  const [view, setView] = useState<View>(() => (MONTH_KEYS.includes(hash.slice(1)) ? hash.slice(1) : 'soon'));
  const [withMinor, setWithMinor] = useState(false);
  const [showPast, setShowPast] = useState(false);

  const filtered = useMemo(
    () => DUE_DATES.filter((due) => (shown === 'all' || due.category === shown) && (withMinor || !due.minor)),
    [shown, withMinor],
  );
  const upcoming = filtered.filter((due) => due.date >= today);
  const next = upcoming.slice(0, NEXT_COUNT);
  const minorCount = DUE_DATES.filter(
    (due) => due.minor && due.date >= today && (shown === 'all' || due.category === shown),
  ).length;
  const stripMonths = MONTH_KEYS.filter((key) => key >= thisMonth);

  let visible = filtered;
  if (view === 'soon') {
    const soon = [thisMonth, monthAfter(thisMonth)];
    visible = upcoming.filter((due) => soon.includes(due.date.slice(0, 7)));
  } else if (view === 'year') {
    visible = showPast ? filtered : upcoming;
  } else {
    visible = filtered.filter((due) => due.date.startsWith(view));
  }
  const pastCount = filtered.length - upcoming.length;

  const byMonth = new Map<string, typeof visible>();
  for (const due of visible) {
    const key = due.date.slice(0, 7);
    byMonth.set(key, [...(byMonth.get(key) ?? []), due]);
  }
  const months = [...byMonth.entries()];

  useEffect(() => {
    const id = hash.slice(1);
    if (!id) return;
    document.getElementById(`m-${id}`)?.scrollIntoView({ block: 'start' });
  }, [hash]);

  const saveCalendar = () => {
    const label = shown === 'all' ? 'all' : (CATEGORY_LABEL.get(shown) ?? shown);
    const name = `Due dates 2026-27${shown === 'all' ? '' : ` (${label})`}`;
    downloadText(
      buildIcs(upcoming, name, new Date().toISOString()),
      `due-dates-2026-27${shown === 'all' ? '' : `-${shown}`}.ics`,
      'text/calendar',
    );
  };

  return (
    <ToolPage tool={TOOL} law="1 April 2026 to 31 March 2027 · Karnataka where a state date applies">
      <div className="seam panel spanel dnext">
        <p className="lbl" id="next-heading">
          Next due
        </p>
        {next.length > 0 ? (
          <ol className="nextlist" aria-labelledby="next-heading">
            {next.map((due) => (
              <li key={`${due.date}-${due.title}`}>
                <span className="when">
                  <b>{dayMonth(due.date)}</b>
                  <span>{inDays(today, due.date)}</span>
                </span>
                <span className="what">{due.title}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="sub">Nothing left in this list for 2026-27. The 2027-28 dates will be added in April 2027.</p>
        )}
        <div className="topics" role="group" aria-label="Show">
          {[{ id: 'all' as const, label: 'All' }, ...DUE_CATEGORIES].map((category) => (
            <button
              key={category.id}
              type="button"
              className="topic"
              aria-pressed={shown === category.id}
              onClick={() => setShown(category.id)}
            >
              {category.label}
            </button>
          ))}
        </div>
        <div className="dtools">
          <label className="check">
            <input type="checkbox" checked={withMinor} onChange={(event) => setWithMinor(event.target.checked)} />
            <span>
              Include filings few businesses need{minorCount > 0 ? ` (${minorCount})` : ''}, such as GSTR-7 and IFF
            </span>
          </label>
          {upcoming.length > 0 && (
            <button type="button" className="link-btn" onClick={saveCalendar}>
              Add these {upcoming.length} dates to your calendar
            </button>
          )}
        </div>
      </div>

      <nav className="mstrip" aria-label="Months">
        <button type="button" aria-pressed={view === 'soon'} onClick={() => setView('soon')}>
          This month and next
        </button>
        {stripMonths.map((key) => (
          <button key={key} type="button" aria-pressed={view === key} onClick={() => setView(key)}>
            {SHORT_MONTHS[Number(key.slice(5)) - 1]} {key.slice(2, 4)}
          </button>
        ))}
        <button type="button" aria-pressed={view === 'year'} onClick={() => setView('year')}>
          Whole year
        </button>
      </nav>

      <div className="cal">
        {view === 'year' && pastCount > 0 && (
          <p className="pastnote">
            <button type="button" className="link-btn" onClick={() => setShowPast((value) => !value)}>
              {showPast ? 'Hide the dates that have passed' : `Show the ${pastCount} dates that have passed`}
            </button>
          </p>
        )}
        {months.length === 0 && <p className="sub">No dates in this view. Try another month or the whole year.</p>}
        {months.map(([key, dues]) => (
          <section key={key} className="sec mon" id={`m-${key}`} aria-labelledby={`month-${key}`}>
            <div className="sec-h">
              <h2 id={`month-${key}`}>{monthYear(`${key}-01`)}</h2>
            </div>
            <ul className="dues">
              {dues.map((due) => (
                <li key={`${due.date}-${due.title}`} className={due.date < today ? 'past' : undefined}>
                  <span className="when">
                    <b className="tnum">{Number(due.date.slice(8))}</b>
                    <span>{weekday(due.date).slice(0, 3)}</span>
                  </span>
                  <span className="what">
                    <span className="t">{due.title}</span>
                    {due.detail && <span className="n">{due.detail}</span>}
                  </span>
                  <span className="cat">{CATEGORY_LABEL.get(due.category)}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
        {view === 'soon' && months.length > 0 && (
          <p className="pastnote more">
            <button type="button" className="link-btn" onClick={() => setView('year')}>
              Show the rest of the year
            </button>
          </p>
        )}
      </div>

      <section className="sec band" aria-labelledby="dates-notes-heading">
        <div className="sec-h">
          <h2 id="dates-notes-heading">Good to know</h2>
        </div>
        <ul className="needs">
          <li>
            Returns for 2025-26 (income earned up to 31 March 2026) are filed under the Income-tax Act, 1961, with its
            old forms. Everything for 2026-27 onwards is under the Income-tax Act, 2025.
          </li>
          <li>Company dates assume the annual general meeting was held on 30 September 2026.</li>
          <li>
            The calendar file adds each date as an all-day event with a reminder two days before. It does not update
            itself: download it again after an extension.
          </li>
          <li>Extensions are announced by notification or circular. We update this list when they are.</li>
        </ul>
      </section>
    </ToolPage>
  );
};

export default DueDates;
