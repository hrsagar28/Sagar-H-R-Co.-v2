import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ToolPage from './ToolPage';
import { SearchIcon } from '../../components/redesign/icons';
import { FORM_ROWS, SECTION_GROUPS, TDS_TCS_GROUPS, getResourceTool, type SectionRow } from '../../constants/resources';

const TOOL = getResourceTool('section-finder')!;

interface FinderGroup {
  id: string;
  name: string;
  /** Column headings: the old and the new law. */
  cols: [string, string];
  rows: SectionRow[];
}

// The TDS and TCS rows come from the rates table, so the two pages agree.
const TDS_GROUP: FinderGroup = {
  id: 'tds',
  name: 'TDS and TCS',
  cols: ['1961 Act', '2025 Act'],
  rows: TDS_TCS_GROUPS.flatMap((group) =>
    group.rows.map((row) => ({ old: row.old, now: row.ref.replace(/^s\./, ''), subject: row.payment })),
  ),
};

const FULL_GROUPS: FinderGroup[] = [
  ...SECTION_GROUPS.map((group) => ({ ...group, cols: ['1961 Act', '2025 Act'] as [string, string] })),
  TDS_GROUP,
  { id: 'forms', name: 'Forms', cols: ['1962 Rules', '2026 Rules'], rows: FORM_ROWS },
];

/**
 * What most people come looking for, shown first so the page opens short.
 * Each entry is a group and the old number of a row in it.
 */
const COMMON: [string, string][] = [
  ['deductions', '80C, 80CCC'],
  ['deductions', '80D'],
  ['deductions', '87A'],
  ['deductions', '115BAC'],
  ['salary-property', '16'],
  ['salary-property', '24'],
  ['business', '44AB'],
  ['business', '44AD, 44ADA, 44AE'],
  ['capital-gains', '54'],
  ['capital-gains', '54F'],
  ['capital-gains', '111A'],
  ['capital-gains', '112'],
  ['capital-gains', '112A'],
  ['returns', '139'],
  ['returns', '143'],
  ['returns', '148'],
  ['interest', '234B'],
  ['interest', '234F'],
  ['forms', '16'],
  ['forms', '26AS'],
  ['forms', '15G, 15H'],
  ['forms', '3CA, 3CB, 3CD'],
];

const COMMON_GROUP: FinderGroup = {
  id: 'common',
  name: 'Most looked up',
  cols: ['Old', 'New'],
  rows: COMMON.flatMap(([groupId, old]) => {
    const group = FULL_GROUPS.find((item) => item.id === groupId);
    const row = group?.rows.find((item) => item.old === old);
    if (!group || !row) return [];
    return [group.id === 'forms' ? { ...row, old: `Form ${row.old}`, now: `Form ${row.now}` } : row];
  }),
};

const GROUPS: FinderGroup[] = [COMMON_GROUP, ...FULL_GROUPS];

/** Words a reader types that say nothing about which row they want. */
const FILLER = new Set([
  'section',
  'sec',
  's',
  'u/s',
  'us',
  'form',
  'forms',
  'no',
  'number',
  'old',
  'new',
  'of',
  'the',
]);

const code = (text: string) => text.toLowerCase().replace(/[\s.()-]+/g, '');

/** Each section or form number in a cell, such as "44AD" and "44ADA" from "44AD, 44ADA". */
const tokens = (cell: string) =>
  cell
    .split(/[,/]| and /)
    .map(code)
    .filter(Boolean);

/**
 * A word matches the subject, or the start of a section or form number in
 * either column: "80c" finds 80C and 80CCC, "393" finds every 393 row. The
 * words also match together, so "Schedule III" finds "Schedule III (Sl. No. 11)".
 */
const matches = (row: SectionRow, query: string) => {
  const words = query
    .toLowerCase()
    .replace(/[‘’"']/g, '')
    .split(/\s+/)
    .filter((word) => word && !FILLER.has(word));
  const subject = row.subject.toLowerCase();
  const numbers = [...tokens(row.old), ...tokens(row.now)];
  const starts = (text: string) => numbers.some((number) => number.startsWith(code(text)));
  return words.every((word) => subject.includes(word) || starts(word)) || (words.length > 1 && starts(words.join('')));
};

const SectionFinder: React.FC = () => {
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('common');

  const shown = useMemo(
    () =>
      // A search looks through everything unless one group has been chosen.
      (query && group === 'common'
        ? FULL_GROUPS
        : GROUPS.filter((item) => item.id === group || (group === 'all' && item.id !== 'common'))
      )
        .map((item) => ({ ...item, rows: item.rows.filter((row) => matches(row, query)) }))
        .filter((item) => item.rows.length > 0),
    [group, query],
  );
  const count = shown.reduce((sum, item) => sum + item.rows.length, 0);

  return (
    <ToolPage
      tool={TOOL}
      law="Income-tax Act, 2025 and Income-tax Rules, 2026 · Income up to 31 March 2026 stays under the 1961 Act"
    >
      <div className="seam panel spanel">
        <div className="srow">
          <SearchIcon />
          <label className="vh" htmlFor="section-search">
            Search the sections and forms
          </label>
          <input
            id="section-search"
            type="search"
            placeholder="Search, such as 80C or Form 16"
            autoComplete="off"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="topics" role="group" aria-label="Show">
          {[COMMON_GROUP, ...FULL_GROUPS, { id: 'all', name: 'Everything' }].map((item) => (
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
        {query ? `${count} ${count === 1 ? 'match' : 'matches'} found` : ''}
      </p>

      <div className="rates">
        {shown.length === 0 && (
          <div className="nores">
            <h2>Nothing matches “{query}”</h2>
            <p>Try the old number on its own, such as 54F or 26AS, or a word such as rebate.</p>
          </div>
        )}
        {shown.map((item) => (
          <section key={item.id} className="sec" aria-labelledby={`map-${item.id}`}>
            <div className="sec-h">
              <h2 id={`map-${item.id}`}>{item.name}</h2>
              <p className="desc">
                {item.rows.length} {item.rows.length === 1 ? 'entry' : 'entries'}
              </p>
            </div>
            <div className="mtab">
              <div className="mhead" aria-hidden="true">
                <span>{item.cols[0]}</span>
                <span>{item.cols[1]}</span>
                <span>What it covers</span>
              </div>
              <ul>
                {item.rows.map((row) => (
                  <li key={`${row.old}-${row.now}-${row.subject}`} className="mrow">
                    <span className="mo tnum">
                      <span className="vh">{item.cols[0]}: </span>
                      {row.old}
                    </span>
                    <span className="mn tnum">
                      <span className="vh">{item.cols[1]}: </span>
                      <span aria-hidden="true" className="arr">
                        →{' '}
                      </span>
                      {row.now}
                    </span>
                    <span className="ms">{row.subject}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ))}
      </div>

      <section className="sec band" aria-labelledby="map-notes-heading">
        <div className="sec-h">
          <h2 id="map-notes-heading">Good to know</h2>
        </div>
        <ul className="needs">
          <li>
            Income earned up to 31 March 2026 (tax year 2025-26 and earlier) stays under the 1961 Act and its forms,
            even when the return or the assessment is done later.
          </li>
          <li>
            Many old sections were merged, so one new section can cover several old ones. The numbers are a guide: the
            wording and conditions can differ in detail.
          </li>
          <li>
            TDS sections 192 to 194T are now two sections, 392 and 393, with a table of payments. The{' '}
            <Link to="/resources/tds-tcs-rates">TDS and TCS rates</Link> page gives the threshold and rate for each.
          </li>
        </ul>
      </section>
    </ToolPage>
  );
};

export default SectionFinder;
