import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from '../../components/redesign/icons';
import { CLIENT_SECTORS, CONTACT_INFO } from '../../constants';
import { REBATE, RESOURCES_TAX_YEAR, SPECIAL_RATES } from '../../constants/resources';
import { daysBetween, dayMonth, todayIso, weekday } from '../../utils/resources/dates';
import { formatLongDate, toISODate } from '../../utils/insightDates';
import type { InsightItem } from '../../types';
import { GROUPS, HOME_TOOLS, Portrait, VisitBand, longDate, upcomingDates } from './shared';

// Prototype 2: a newspaper front page. A masthead with the date, then
// columns: the practice and its services, the week's due dates, and a few
// figures from the law; below, the latest article opened like a lead story.

const lakh = (amount: number) => `₹${(amount / 100000).toLocaleString('en-IN')} lakh`;

/** Three figures from the law, each true for the whole tax year. */
const FACTS = [
  {
    figure: lakh(REBATE.new.incomeLimit),
    text: 'of income with no tax in the new regime, through the rebate under section 156.',
  },
  {
    figure: `${SPECIAL_RATES.ltcg * 100}%`,
    text: `tax on long-term capital gains; on listed shares and equity funds, above ${lakh(SPECIAL_RATES.ltcgEquityExemption)} a year.`,
  },
  {
    figure: '1 April 2026',
    text: 'the Income-tax Act, 2025 came into force. "Tax year" replaces the previous and assessment years.',
  },
];

const HomePaper: React.FC<{ insights: InsightItem[] }> = ({ insights }) => {
  const today = todayIso();
  const upcoming = upcomingDates(today, 6);
  // "This week" if anything falls in the next seven days, otherwise "Coming up".
  const thisWeek = upcoming.filter((due) => daysBetween(today, due.date) <= 7);
  const listed = thisWeek.length >= 2 ? thisWeek.slice(0, 5) : upcoming.slice(0, 4);
  const [lead, ...also] = insights;

  return (
    <div className="paper">
      <div className="mast pad">
        <p className="mast-line rise">
          <span>{CONTACT_INFO.address.city}</span>
          <time dateTime={today}>{longDate(today)}</time>
          <span>Tax year {RESOURCES_TAX_YEAR}</span>
        </p>
        <h1 className="mast-name rise d1">{CONTACT_INFO.name}</h1>
        <p className="mast-sub rise d1">Chartered Accountants</p>
      </div>

      <div className="front pad">
        <section className="col lead" aria-labelledby="paper-lead-heading">
          <p className="kick">The practice</p>
          <h2 id="paper-lead-heading">Income tax, GST, audit, and company and trust work, from an office in Mysuru.</h2>
          <p className="stand">
            For salaried people and pensioners, non-resident Indians, businesses, institutions and trusts, on a yearly
            retainer or as a single assignment.
          </p>
          <div className="byline">
            <Portrait sizes="64px" />
            <p>
              <strong>{CONTACT_INFO.founder.name}</strong>, founder and principal. ICAI membership no.{' '}
              {CONTACT_INFO.founder.icaiMembershipNo}; in practice since {CONTACT_INFO.stats.established}.{' '}
              <Link to="/about">About the firm</Link>
            </p>
          </div>

          <h3 className="kick inside">Our services</h3>
          <div className="inside-grid">
            {GROUPS.map((group, index) => (
              <div key={group.name}>
                <h4 id={`paper-group-${index}`}>{group.name}</h4>
                <ul aria-labelledby={`paper-group-${index}`}>
                  {group.pages.map((page) => (
                    <li key={page.slug}>
                      <Link to={`/services/${page.slug}`}>{page.name}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="col week" aria-labelledby="paper-week-heading">
          <h2 className="kick" id="paper-week-heading">
            {thisWeek.length >= 2 ? 'This week' : 'Coming up'}
          </h2>
          <ul>
            {listed.map((due) => (
              <li key={`${due.date}-${due.title}`}>
                <Link to={`/resources/due-dates#${due.date.slice(0, 7)}`}>
                  <span className="dd" aria-hidden="true">
                    {Number(due.date.slice(8, 10))}
                  </span>
                  <span className="dw">
                    <span className="vh">{dayMonth(due.date)}, </span>
                    <span className="wd">
                      {weekday(due.date)}, {dayMonth(due.date).split(' ')[1]}
                    </span>
                    <span className="dt">{due.title}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="colmore">
            <Link to="/resources/due-dates">
              The year&rsquo;s due dates <ArrowRight size={14} />
            </Link>
          </p>
        </section>

        <section className="col law" aria-labelledby="paper-law-heading">
          <h2 className="kick" id="paper-law-heading">
            In the law
          </h2>
          <ul>
            {FACTS.map((fact) => (
              <li key={fact.figure}>
                <span className="fg">{fact.figure}</span>
                <span className="fx">{fact.text}</span>
              </li>
            ))}
          </ul>
          <h3 className="kick">Reference desk</h3>
          <ul className="desk">
            {HOME_TOOLS.map((tool) => (
              <li key={tool.slug}>
                <Link to={`/resources/${tool.slug}`}>{tool.name}</Link>
              </li>
            ))}
            <li>
              <Link to="/resources">Checklists of documents</Link>
            </li>
          </ul>
        </section>
      </div>

      {lead && (
        <section className="desk-row pad" aria-labelledby="home-articles-heading">
          <h2 className="kick" id="home-articles-heading">
            Latest articles
          </h2>
          <div className="desk-grid">
            <article className="story">
              <p className="am">
                <time dateTime={toISODate(lead.date)}>{formatLongDate(lead.date)}</time>
                <span aria-hidden="true"> · </span>
                <span className="vh">, </span>
                {lead.category}
              </p>
              <h3>
                <Link to={`/insights/${lead.slug}`}>{lead.title}</Link>
              </h3>
              <p className="drop">{lead.summary}</p>
              <p className="colmore">
                <Link to={`/insights/${lead.slug}`}>
                  Read the article <ArrowRight size={14} />
                </Link>
              </p>
            </article>
            <ul className="also">
              {also.map((insight) => (
                <li key={insight.id}>
                  <p className="am">
                    <time dateTime={toISODate(insight.date)}>{formatLongDate(insight.date)}</time>
                    <span aria-hidden="true"> · </span>
                    <span className="vh">, </span>
                    {insight.category}
                  </p>
                  <Link to={`/insights/${insight.slug}`}>{insight.title}</Link>
                </li>
              ))}
              <li className="allarts">
                <Link to="/insights">
                  All articles <ArrowRight size={14} />
                </Link>
              </li>
            </ul>
          </div>
        </section>
      )}

      <section className="who-row pad" aria-labelledby="paper-who-heading">
        <h2 className="kick" id="paper-who-heading">
          Who we work with
        </h2>
        <ul className="who-cols">
          {CLIENT_SECTORS.map((sector) => (
            <li key={sector}>{sector}</li>
          ))}
          <li className="more">and many more</li>
        </ul>
      </section>

      <VisitBand />
    </div>
  );
};

export default HomePaper;
