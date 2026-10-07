import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from '../../components/redesign/icons';
import { CLIENT_SECTORS, CONTACT_INFO } from '../../constants';
import { DUE_DATES, DUE_DATES_FROM, REBATE, STANDARD_DEDUCTION } from '../../constants/resources';
import { dayMonth, monthYear, todayIso } from '../../utils/resources/dates';
import { formatLongDate, toISODate } from '../../utils/insightDates';
import type { InsightItem } from '../../types';
import {
  CHECKLIST_COUNT,
  CountUp,
  DUE_DATE_COUNT,
  FirmFacts,
  Portrait,
  SECTION_ROW_COUNT,
  ServiceIndex,
  VisitBand,
  countdown,
  longDate,
  upcomingDates,
} from './shared';

// Prototype 1: built around the date. The header gives today's date, the next
// deadline in large type with a countdown, the three after it, and the year's
// due dates month by month.

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** The twelve months of the tax year, as YYYY-MM. */
const MONTHS = Array.from({ length: 12 }, (_, index) => {
  const start = new Date(`${DUE_DATES_FROM}T00:00:00Z`);
  const date = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + index, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
});

const daysInMonth = (month: string) => {
  const [year = 0, mon = 1] = month.split('-').map(Number);
  return new Date(Date.UTC(year, mon, 0)).getUTCDate();
};

/** The main due dates, by month. */
const BY_MONTH = DUE_DATES.filter((due) => !due.minor).reduce<Record<string, number[]>>((months, due) => {
  const month = due.date.slice(0, 7);
  (months[month] ??= []).push(Number(due.date.slice(8, 10)));
  return months;
}, {});

const position = (month: string, day: number) => `${((day - 0.5) / daysInMonth(month)) * 100}%`;

/** The year at a glance: each month with a mark for each due date, and today. */
const MonthStrip: React.FC<{ today: string }> = ({ today }) => {
  const current = today.slice(0, 7);
  return (
    <nav className="ystrip" aria-label="Due dates by month">
      <ol>
        {MONTHS.map((month) => {
          const days = BY_MONTH[month] ?? [];
          const state = month < current ? 'past' : month === current ? 'now' : undefined;
          return (
            <li key={month} className={state}>
              <Link
                to={`/resources/due-dates#${month}`}
                aria-label={`${monthYear(`${month}-01`)}: ${days.length} due dates`}
              >
                <span className="ym" aria-hidden="true">
                  {MONTH_SHORT[Number(month.slice(5)) - 1]}
                </span>
                <span className="yt" aria-hidden="true">
                  {days.map((day, index) => (
                    <i key={`${day}-${index}`} style={{ left: position(month, day) }} />
                  ))}
                  {month === current && (
                    <b className="ynow" style={{ left: position(month, Number(today.slice(8, 10))) }} />
                  )}
                </span>
                <span className="yc" aria-hidden="true">
                  {days.length}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

const NO_TAX_SALARY = REBATE.new.incomeLimit + STANDARD_DEDUCTION.new;

const FIGURES = [
  {
    value: NO_TAX_SALARY,
    format: (n: number) => `₹${n.toLocaleString('en-IN')}`,
    text: 'of salary with no income tax in the new regime, in 2026-27.',
    to: '/resources/income-tax-calculator',
    tool: 'Income tax calculator',
  },
  {
    value: DUE_DATE_COUNT,
    text: 'due dates this tax year, for GST, TDS, income tax, companies and payroll.',
    to: '/resources/due-dates',
    tool: 'Due dates',
  },
  {
    value: SECTION_ROW_COUNT,
    text: 'sections and forms of the old law, with their new numbers.',
    to: '/resources/section-finder',
    tool: 'Old and new section numbers',
  },
  {
    value: CHECKLIST_COUNT,
    text: 'checklists of the documents to send for each kind of work.',
    to: '/resources',
    tool: 'Checklists',
  },
];

const HomeDate: React.FC<{ insights: InsightItem[] }> = ({ insights }) => {
  const today = todayIso();
  const [next, ...then] = upcomingDates(today, 4);

  return (
    <>
      <div className="phead hd">
        <div className="grain" aria-hidden="true" />
        <div className="hd-in pad">
          <div className="hd-top rise">
            <div>
              <h1>{CONTACT_INFO.name}</h1>
              <p className="hd-sub">
                Chartered Accountants in Mysuru: income tax, GST, audit, and company and trust work.
              </p>
            </div>
            <p className="hd-line">
              <time dateTime={today}>{longDate(today)}</time>
            </p>
          </div>

          {next && (
            <div className="hd-main">
              <div className="hd-next rise d1">
                <p className="lbl">Next due date · {dayMonth(next.date)}</p>
                <p className="hd-big">
                  <Link to={`/resources/due-dates#${next.date.slice(0, 7)}`}>{next.title}</Link>
                </p>
                <p className="hd-count">{countdown(today, next.date)}</p>
              </div>
              <div className="rise d2">
                <p className="lbl" id="hd-then-heading">
                  After that
                </p>
                <ul className="most soon" aria-labelledby="hd-then-heading">
                  {then.map((due) => (
                    <li key={`${due.date}-${due.title}`}>
                      <Link to={`/resources/due-dates#${due.date.slice(0, 7)}`}>
                        <span>
                          <span className="when">
                            {dayMonth(due.date)} · {countdown(today, due.date).toLowerCase()}
                          </span>
                          {due.title}
                        </span>
                        <ArrowRight size={18} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <MonthStrip today={today} />
        </div>
      </div>

      <section className="hblock pad" aria-labelledby="home-services-heading">
        <div className="hblock-h">
          <h2 id="home-services-heading">What we do</h2>
          <p>Tax, audit, company law and accounting, on a yearly retainer or as a single assignment.</p>
        </div>
        <ServiceIndex idPrefix="hd" />
        <p className="smore">
          <Link to="/services">
            All services, with what each covers <ArrowRight size={16} />
          </Link>
        </p>
      </section>

      <section className="hfirm pad" aria-labelledby="home-firm-heading">
        <div className="hfirm-photo">
          <Portrait sizes="(max-width: 900px) 60vw, 40vw" />
        </div>
        <div className="hfirm-text">
          <p className="lbl">The firm</p>
          <h2 id="home-firm-heading">{CONTACT_INFO.founder.name}</h2>
          <p className="role">
            Founder and principal. In practice in {CONTACT_INFO.address.city} since {CONTACT_INFO.stats.established}.
          </p>
          <p className="bio">{CONTACT_INFO.founder.bio}</p>
          <FirmFacts />
          <p className="smore">
            <Link to="/about">
              About the firm <ArrowRight size={16} />
            </Link>
          </p>
        </div>
      </section>

      <section className="hblock pad" aria-labelledby="home-tools-heading">
        <div className="hblock-h">
          <h2 id="home-tools-heading">Tools and checklists</h2>
          <p>For tax year 2026-27, under the Income-tax Act, 2025.</p>
        </div>
        <ul className="hfig">
          {FIGURES.map((figure) => (
            <li key={figure.tool}>
              <Link to={figure.to}>
                <span className="fv">
                  <CountUp value={figure.value} format={figure.format} />
                </span>
                <span className="ft">{figure.text}</span>
                <span className="fl">
                  {figure.tool} <ArrowRight size={16} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="hblock pad" aria-labelledby="home-sectors-heading">
        <div className="hblock-h">
          <h2 id="home-sectors-heading">Who we work with</h2>
        </div>
        <p className="hflow">
          {CLIENT_SECTORS.map((sector) => (
            <React.Fragment key={sector}>
              <span>{sector}</span>
              <span className="sep" aria-hidden="true">
                {' '}
                ·{' '}
              </span>
              <span className="vh">, </span>
            </React.Fragment>
          ))}
          <em>and many more.</em>
        </p>
      </section>

      {insights.length > 0 && (
        <section className="hblock pad" aria-labelledby="home-articles-heading">
          <div className="hblock-h">
            <h2 id="home-articles-heading">Latest articles</h2>
            <p>Notes on changes in tax law, and what they mean in practice.</p>
          </div>
          <ul className="hart">
            {insights.map((insight) => (
              <li key={insight.id}>
                <Link to={`/insights/${insight.slug}`}>
                  <span className="am">
                    <time dateTime={toISODate(insight.date)}>{formatLongDate(insight.date)}</time>
                    <span aria-hidden="true"> · </span>
                    <span className="vh">, </span>
                    {insight.category}
                  </span>
                  <span className="t">{insight.title}</span>
                  <span className="d">{insight.summary}</span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="smore">
            <Link to="/insights">
              All articles <ArrowRight size={16} />
            </Link>
          </p>
        </section>
      )}

      <VisitBand />
    </>
  );
};

export default HomeDate;
