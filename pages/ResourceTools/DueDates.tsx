import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import ToolPage from './ToolPage';
import { DUE_CATEGORIES, DUE_DATES, getResourceTool, type DueCategory } from '../../constants/resources';
import { dayMonth, daysBetween, monthYear, todayIso, weekday } from '../../utils/resources/dates';

const TOOL = getResourceTool('due-dates')!;

const CATEGORY_LABEL = new Map(DUE_CATEGORIES.map((category) => [category.id, category.label]));
const NEXT_COUNT = 5;

const inDays = (today: string, date: string) => {
  const days = daysBetween(today, date);
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `In ${days} days`;
};

const DueDates: React.FC = () => {
  const { hash } = useLocation();
  const [shown, setShown] = useState<'all' | DueCategory>('all');
  const [showPast, setShowPast] = useState(false);
  const today = todayIso();

  const filtered = useMemo(() => DUE_DATES.filter((due) => shown === 'all' || due.category === shown), [shown]);
  const next = filtered.filter((due) => due.date >= today && !due.minor).slice(0, NEXT_COUNT);
  const visible = showPast ? filtered : filtered.filter((due) => due.date >= today);
  const pastCount = filtered.length - filtered.filter((due) => due.date >= today).length;

  const byMonth = new Map<string, typeof visible>();
  for (const due of visible) {
    const key = due.date.slice(0, 7);
    byMonth.set(key, [...(byMonth.get(key) ?? []), due]);
  }
  const months = [...byMonth.entries()];

  // A link such as /resources/due-dates#2026-10 opens at that month.
  useEffect(() => {
    const id = hash.slice(1);
    if (!id) return;
    const target = document.getElementById(`m-${id}`);
    if (target) target.scrollIntoView({ block: 'start' });
  }, [hash]);

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
      </div>

      <div className="cal">
        {pastCount > 0 && (
          <p className="pastnote">
            <button type="button" className="link-btn" onClick={() => setShowPast((value) => !value)}>
              {showPast ? 'Hide the dates that have passed' : `Show the ${pastCount} dates that have passed`}
            </button>
          </p>
        )}
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
      </div>

      <section className="sec" aria-labelledby="dates-notes-heading">
        <div className="sec-h">
          <h2 id="dates-notes-heading">Good to know</h2>
        </div>
        <ul className="needs">
          <li>
            Returns for 2025-26 (income earned up to 31 March 2026) are filed under the Income-tax Act, 1961, with its
            old forms. Everything for 2026-27 onwards is under the Income-tax Act, 2025.
          </li>
          <li>Company dates assume the annual general meeting was held on 30 September 2026.</li>
          <li>Extensions are announced by notification or circular. We update this list when they are.</li>
        </ul>
      </section>
    </ToolPage>
  );
};

export default DueDates;
