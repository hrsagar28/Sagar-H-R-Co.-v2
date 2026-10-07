import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from '../../components/redesign/icons';
import { CLIENT_SECTORS, CONTACT_INFO } from '../../constants';
import { dayMonth, todayIso } from '../../utils/resources/dates';
import type { InsightItem } from '../../types';
import {
  ArticleRows,
  FirmFacts,
  HOME_TOOLS,
  Portrait,
  ServiceIndex,
  VisitBand,
  countdown,
  upcomingDates,
} from './shared';

// Prototype 3: portrait and principle. A dark first screen with the
// principal's photograph and one line on how the firm works, then the
// services, how an engagement runs, and the rest.

const HomePortrait: React.FC<{ insights: InsightItem[] }> = ({ insights }) => {
  const today = todayIso();
  const upcoming = upcomingDates(today, 4);

  return (
    <>
      <div className="phead hp">
        <div className="grain" aria-hidden="true" />
        <div className="hp-in pad">
          <div className="hp-text">
            <h1 className="rise">
              {CONTACT_INFO.name} <span>Chartered Accountants in Mysuru</span>
            </h1>
            <p className="hp-line rise d1">We read the law before we answer.</p>
            <p className="hsub rise d2">
              Income tax, GST, audit, and company and trust work, for individuals, businesses and institutions. In
              practice since {CONTACT_INFO.stats.established}.
            </p>
            <p className="hlinks rise d2">
              <Link to="/services">
                Our services <ArrowRight size={16} />
              </Link>
              <Link to="/about">
                About the firm <ArrowRight size={16} />
              </Link>
            </p>
          </div>
          <figure className="hp-photo rise d1">
            <Portrait sizes="(max-width: 900px) 70vw, 36vw" eager />
            <figcaption>{CONTACT_INFO.founder.name}, founder and principal</figcaption>
          </figure>
        </div>
      </div>

      <section className="hblock pad" aria-labelledby="home-services-heading">
        <div className="hblock-h">
          <h2 id="home-services-heading">What we do</h2>
          <p>Tax, audit, company law and accounting, on a yearly retainer or as a single assignment.</p>
        </div>
        <ServiceIndex idPrefix="hp" />
        <p className="smore">
          <Link to="/services">
            All services, with what each covers <ArrowRight size={16} />
          </Link>
        </p>
      </section>

      <section className="next pad hp-how" aria-labelledby="hp-how-heading">
        <h2 className="next-h" id="hp-how-heading">
          How an engagement runs
        </h2>
        <ol className="steps">
          <li>
            <span className="sn" aria-hidden="true">
              1
            </span>
            <h3>We discuss the work</h3>
            <p>The deadlines, the documents and what is involved, on a short call or at the office.</p>
          </li>
          <li>
            <span className="sn" aria-hidden="true">
              2
            </span>
            <h3>You receive a written quote</h3>
            <p>It sets out a fixed fee and the scope of the work.</p>
          </li>
          <li>
            <span className="sn" aria-hidden="true">
              3
            </span>
            <h3>We send a checklist</h3>
            <p>Once you agree, a list of the documents we need, so the work starts without back and forth.</p>
          </li>
        </ol>
        <div className="hp-facts">
          <FirmFacts />
        </div>
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

      <section className="hblock pad hp-two" aria-label="Due dates and tools">
        <div>
          <h2 id="hp-dates-heading">Coming up</h2>
          <ul className="hp-dates" aria-labelledby="hp-dates-heading">
            {upcoming.map((due) => (
              <li key={`${due.date}-${due.title}`}>
                <Link to={`/resources/due-dates#${due.date.slice(0, 7)}`}>
                  <span className="when">
                    {dayMonth(due.date)} · {countdown(today, due.date).toLowerCase()}
                  </span>
                  <span className="t">{due.title}</span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="smore">
            <Link to="/resources/due-dates">
              All due dates <ArrowRight size={16} />
            </Link>
          </p>
        </div>
        <div>
          <h2 id="hp-tools-heading">Tools and checklists</h2>
          <ul className="hp-tools" aria-labelledby="hp-tools-heading">
            {HOME_TOOLS.map((tool) => (
              <li key={tool.slug}>
                <Link to={`/resources/${tool.slug}`}>
                  <span className="t">{tool.name}</span>
                  <ArrowRight size={16} />
                </Link>
              </li>
            ))}
            <li>
              <Link to="/resources">
                <span className="t">Checklists, and every other tool</span>
                <ArrowRight size={16} />
              </Link>
            </li>
          </ul>
        </div>
      </section>

      {insights.length > 0 && (
        <section className="hblock pad" aria-labelledby="home-articles-heading">
          <div className="hblock-h">
            <h2 id="home-articles-heading">Latest articles</h2>
            <p>Notes on changes in tax law, and what they mean in practice.</p>
          </div>
          <ArticleRows insights={insights} />
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

export default HomePortrait;
