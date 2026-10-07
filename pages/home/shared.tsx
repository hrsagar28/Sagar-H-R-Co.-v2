import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from '../../components/redesign/icons';
import { RD_HOURS_TABLE } from '../../components/redesign/content';
import { CONTACT_INFO, SERVICE_GROUPS, getServicePage } from '../../constants';
import { CHECKLISTS, DUE_DATES, FORM_ROWS, SECTION_GROUPS, getResourceTool } from '../../constants/resources';
import { useCountUp } from '../../hooks';
import { daysBetween, dayMonth, weekday } from '../../utils/resources/dates';
import { formatLongDate, toISODate } from '../../utils/insightDates';
import type { InsightItem, ServicePage } from '../../types';

// Pieces the home page prototypes share: the data they draw on and the
// blocks that look the same in each (the services index, the articles, the
// office details).

/** The service groups, each with its pages. */
export const GROUPS = SERVICE_GROUPS.map((group) => ({
  ...group,
  pages: group.slugs.map(getServicePage).filter((page): page is ServicePage => Boolean(page)),
}));

/** The tools the home page lists, in order. */
export const HOME_TOOLS = ['income-tax-calculator', 'due-dates', 'tds-tcs-rates', 'section-finder']
  .map((slug) => getResourceTool(slug))
  .filter((tool) => tool !== undefined);

/** The main due dates (the narrow filings left out), from today on. */
export const upcomingDates = (today: string, count: number) =>
  DUE_DATES.filter((due) => due.date >= today && !due.minor).slice(0, count);

/** "Today", "Tomorrow", "In 4 days". */
export const countdown = (today: string, date: string) => {
  const days = daysBetween(today, date);
  return days <= 0 ? 'Today' : days === 1 ? 'Tomorrow' : `In ${days} days`;
};

/** "Wednesday, 7 October 2026" */
export const longDate = (iso: string) => `${weekday(iso)}, ${dayMonth(iso)} ${iso.slice(0, 4)}`;

/** Rows in the section finder: sections, forms and the TDS and TCS sections. */
export const SECTION_ROW_COUNT = SECTION_GROUPS.reduce((sum, group) => sum + group.rows.length, 0) + FORM_ROWS.length;

export const CHECKLIST_COUNT = CHECKLISTS.length;

/** The main due dates in the tax year. */
export const DUE_DATE_COUNT = DUE_DATES.filter((due) => !due.minor).length;

const HOME_INSIGHTS_COUNT = 3;

/**
 * Which articles to show (audit I-04): those marked `featuredOnHome`, then
 * the most recent, three in all.
 */
export const pickHomeInsights = (insights: readonly InsightItem[]): InsightItem[] => {
  const featured = insights.filter((insight) => insight.featuredOnHome === true);
  if (featured.length >= HOME_INSIGHTS_COUNT) return featured.slice(0, HOME_INSIGHTS_COUNT);
  const featuredIds = new Set(featured.map((insight) => insight.id));
  const recent = [...insights]
    .filter((insight) => !featuredIds.has(insight.id))
    .sort((a, b) => b.date.localeCompare(a.date));
  return [...featured, ...recent].slice(0, HOME_INSIGHTS_COUNT);
};

/** The principal's photograph. */
export const Portrait: React.FC<{ sizes: string; eager?: boolean }> = ({ sizes, eager }) => (
  <picture>
    <source
      type="image/avif"
      srcSet="/images/founder-400.avif 400w, /images/founder-800.avif 800w, /images/founder-1080.avif 1080w"
      sizes={sizes}
    />
    <source
      type="image/webp"
      srcSet="/images/founder-400.webp 400w, /images/founder-800.webp 800w, /images/founder-1080.webp 1080w"
      sizes={sizes}
    />
    <img
      src="/images/founder-800.jpg"
      srcSet="/images/founder-400.jpg 400w, /images/founder-800.jpg 800w, /images/founder-1080.jpg 1080w"
      sizes={sizes}
      alt={`${CONTACT_INFO.founder.name}, founder of ${CONTACT_INFO.name}`}
      width="800"
      height="1067"
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
    />
  </picture>
);

/** Membership and registration numbers, and languages. */
export const FirmFacts: React.FC = () => (
  <dl className="facts">
    <div>
      <dt>ICAI membership no.</dt>
      <dd>{CONTACT_INFO.founder.icaiMembershipNo}</dd>
    </div>
    <div>
      <dt>Firm registration no.</dt>
      <dd>{CONTACT_INFO.firmRegistrationNo}</dd>
    </div>
    <div>
      <dt>Languages</dt>
      <dd>{CONTACT_INFO.languages.join(', ').replace(/, ([^,]*)$/, ' and $1')}</dd>
    </div>
  </dl>
);

/** The groups with the number their first service takes, for numbering through. */
const NUMBERED = GROUPS.map((group, index) => ({
  ...group,
  start: GROUPS.slice(0, index).reduce((sum, previous) => sum + previous.pages.length, 0),
}));

/**
 * Every service, numbered through, under its group: large type, with who it
 * is for beside it on a wide screen.
 */
export const ServiceIndex: React.FC<{ idPrefix: string }> = ({ idPrefix }) => (
  <div className="sidx">
    {NUMBERED.map((group, index) => (
      <div key={group.name} className="sidx-g">
        <h3 className="lbl" id={`${idPrefix}-group-${index}`}>
          {group.name}
        </h3>
        <ul aria-labelledby={`${idPrefix}-group-${index}`}>
          {group.pages.map((page, pageIndex) => (
            <li key={page.slug}>
              <Link to={`/services/${page.slug}`}>
                <span className="n" aria-hidden="true">
                  {String(group.start + pageIndex + 1).padStart(2, '0')}
                </span>
                <span className="t">{page.name}</span>
                <span className="w">{page.who}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    ))}
  </div>
);

/** A figure that counts up once it scrolls into view; read out at its final value. */
export const CountUp: React.FC<{ value: number; format?: (n: number) => string }> = ({
  value,
  format = (n) => n.toLocaleString('en-IN'),
}) => {
  const { count, ref } = useCountUp<HTMLSpanElement>(value, 1.4);
  return (
    <>
      <span ref={ref} aria-hidden="true">
        {format(count)}
      </span>
      <span className="vh">{format(value)}</span>
    </>
  );
};

/** The latest articles as rows. */
export const ArticleRows: React.FC<{ insights: InsightItem[] }> = ({ insights }) => (
  <ul className="srows">
    {insights.map((insight) => (
      <li key={insight.id}>
        <Link to={`/insights/${insight.slug}`}>
          <span>
            <span className="t">{insight.title}</span>
            <span className="i">
              <time dateTime={toISODate(insight.date)}>{formatLongDate(insight.date)}</time>
              <span aria-hidden="true"> · </span>
              <span className="vh">, </span>
              {insight.category}
            </span>
          </span>
          <span className="go">
            <ArrowRight size={18} />
          </span>
        </Link>
      </li>
    ))}
  </ul>
);

const [ADDRESS_LINE_1, ADDRESS_LINE_2] = CONTACT_INFO.address.lines;

/** The office: address, phone and email, hours and the map, on the sand band. */
export const VisitBand: React.FC = () => (
  <section className="next sand pad visit" aria-labelledby="home-visit-heading">
    <h2 className="next-h" id="home-visit-heading">
      Visit or call
    </h2>
    <div className="vgrid">
      <div className="vinfo">
        <div className="blk">
          <h3 className="lbl">Office</h3>
          <address>
            {ADDRESS_LINE_1}
            <br />
            {ADDRESS_LINE_2}
          </address>
          <p className="vlink">
            <a href={CONTACT_INFO.geo.mapShareUrl} target="_blank" rel="noopener noreferrer">
              Get directions<span className="vh"> (opens Google Maps in a new tab)</span>
            </a>
          </p>
        </div>
        <div className="blk">
          <h3 className="lbl">Phone and email</h3>
          <p className="vline">
            <a href={`tel:${CONTACT_INFO.phone.value}`}>{CONTACT_INFO.phone.display}</a>
          </p>
          <p className="vline">
            <a href={`mailto:${CONTACT_INFO.email}`}>{CONTACT_INFO.email}</a>
          </p>
        </div>
        <div className="blk">
          <h3 className="lbl">Office hours</h3>
          <table className="hours">
            <tbody>
              {RD_HOURS_TABLE.map((row) => (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  <td>{row.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Muted to sit with the palette until hovered or focused.
          data-hide-cursor makes the custom cursor step aside for the
          browser's own over the embedded map (CustomCursor.tsx). */}
      <div className="map" data-hide-cursor="true">
        <iframe
          title={`Map showing the office of ${CONTACT_INFO.name}`}
          src={CONTACT_INFO.geo.mapEmbedUrl}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allow="geolocation 'none'"
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          allowFullScreen
        />
      </div>
    </div>
    <p className="more">
      Questions first? <Link to="/faqs">Read the FAQs</Link> or <Link to="/contact#write">write to us</Link>.
    </p>
  </section>
);
