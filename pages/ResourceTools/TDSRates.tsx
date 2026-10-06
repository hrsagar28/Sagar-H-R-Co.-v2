import React, { useEffect, useMemo, useState } from 'react';
import ToolPage from './ToolPage';
import { SearchIcon } from '../../components/redesign/icons';
import { TDS_DUE_DATES, TDS_NOTES, TDS_TCS_GROUPS, getResourceTool, type RateRow } from '../../constants/resources';

const TOOL = getResourceTool('tds-tcs-rates')!;

const normalise = (text: string) => text.toLowerCase().replace(/[\s.()-]+/g, '');

/** Matches words of the payment, the payer, the old section ("194J") or the new reference ("393(1)"). */
const matches = (row: RateRow, query: string) => {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const haystack = `${row.payment} ${row.payer ?? ''} ${row.note ?? ''}`.toLowerCase();
  const codes = normalise(`${row.old} ${row.ref}`);
  return words.every((word) => haystack.includes(word) || codes.includes(normalise(word)));
};

const PHONE = '(max-width: 900px)';

/** Whether the screen is phone-width, kept current as it changes. */
const usePhone = () => {
  const [phone, setPhone] = useState(() => typeof window !== 'undefined' && window.matchMedia(PHONE).matches);
  useEffect(() => {
    const list = window.matchMedia(PHONE);
    const change = () => setPhone(list.matches);
    list.addEventListener('change', change);
    return () => list.removeEventListener('change', change);
  }, []);
  return phone;
};

const TDSRates: React.FC = () => {
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('all');
  // On a phone the groups start closed, each with its count, so the five
  // headings fit on a screen. A search or a chosen group opens them.
  const phone = usePhone();
  const [opened, setOpened] = useState<Set<string>>(new Set());
  const toggle = (id: string) =>
    setOpened((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const groups = useMemo(
    () =>
      TDS_TCS_GROUPS.filter((item) => group === 'all' || item.id === group)
        .map((item) => ({ ...item, rows: item.rows.filter((row) => matches(row, query)) }))
        .filter((item) => item.rows.length > 0),
    [group, query],
  );
  const count = groups.reduce((sum, item) => sum + item.rows.length, 0);

  return (
    <ToolPage tool={TOOL} law="Tax year 2026-27 · Sections 392 to 394 of the Income-tax Act, 2025">
      <div className="seam panel spanel">
        <div className="srow">
          <SearchIcon />
          <label className="vh" htmlFor="tds-search">
            Search the rates
          </label>
          <input
            id="tds-search"
            type="search"
            placeholder="Search, such as rent or 194J"
            autoComplete="off"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="topics" role="group" aria-label="Show">
          {[{ id: 'all', name: 'All' }, ...TDS_TCS_GROUPS].map((item) => (
            <button
              key={item.id}
              type="button"
              className="topic"
              aria-pressed={group === item.id}
              onClick={() => setGroup(item.id)}
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>

      <p className="vh" role="status" aria-live="polite">
        {query ? `${count} ${count === 1 ? 'payment' : 'payments'} found` : ''}
      </p>

      <div className="rates">
        {groups.length === 0 && (
          <div className="nores">
            <h2>No payment matches “{query}”</h2>
            <p>Try another word, or search by the old section number, such as 194C.</p>
          </div>
        )}
        {groups.map((item) => {
          const closable = phone && !query && group === 'all';
          const open = !closable || opened.has(item.id);
          return (
            <section key={item.id} className={`sec${closable ? 'fold' : ''}`} aria-labelledby={`rates-${item.id}`}>
              <div className="sec-h">
                <h2 id={`rates-${item.id}`}>
                  {closable ? (
                    <button
                      type="button"
                      className="foldbtn"
                      aria-expanded={open}
                      aria-controls={`rates-body-${item.id}`}
                      onClick={() => toggle(item.id)}
                    >
                      <span>{item.name}</span>
                      <span className="cnt">{item.rows.length}</span>
                    </button>
                  ) : (
                    item.name
                  )}
                </h2>
                {open && <p className="desc">{item.description}</p>}
              </div>
              <div className="rtab" id={`rates-body-${item.id}`} hidden={!open}>
                <div className="rhead" aria-hidden="true">
                  <span>Payment</span>
                  <span>Threshold</span>
                  <span>Rate</span>
                  <span>Section</span>
                </div>
                <ul>
                  {item.rows.map((row) => (
                    <li key={row.id} className="rrow">
                      <div className="rp">
                        <span className="t">{row.payment}</span>
                        {row.payer && (
                          <span className="n">
                            {item.id === 'tcs' ? 'Collected by' : 'Deducted by'} {row.payer}
                          </span>
                        )}
                        {row.note && <span className="n">{row.note}</span>}
                      </div>
                      <div className="rc">
                        <span className="k">Threshold</span>
                        {row.threshold}
                      </div>
                      <div className="rc rate tnum">
                        <span className="k">Rate</span>
                        {row.rate}
                      </div>
                      <div className="rc ref">
                        <span className="k">Section</span>
                        {row.ref}
                        <span className="was">Formerly {row.old}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          );
        })}
      </div>

      <section className="sec" aria-labelledby="tds-dates-heading">
        <div className="sec-h">
          <h2 id="tds-dates-heading">Due dates and forms</h2>
          <p className="desc">Rules 215, 218 and 219 of the Income-tax Rules, 2026.</p>
        </div>
        <ul className="inc">
          {TDS_DUE_DATES.map((item) => (
            <li key={item.what}>
              <h3>{item.when}</h3>
              <p>{item.what}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="sec band" aria-labelledby="tds-notes-heading">
        <div className="sec-h">
          <h2 id="tds-notes-heading">Good to know</h2>
        </div>
        <ul className="needs">
          {TDS_NOTES.map((note) => (
            <li key={note}>{note}</li>
          ))}
          <li>Surcharge and cess are not added to TDS on payments to residents, except on salary.</li>
        </ul>
      </section>
    </ToolPage>
  );
};

export default TDSRates;
