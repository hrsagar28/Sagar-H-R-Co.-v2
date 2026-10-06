import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { ArrowRight } from '../components/redesign/icons';
import { CONTACT_INFO } from '../constants';
import { CHECKLISTS, DUE_DATES, PORTAL_GROUPS, RESOURCE_GROUPS, RESOURCE_TOOLS } from '../constants/resources';
import { SITE_URL } from '../config/site';
import { dayMonth, todayIso } from '../utils/resources/dates';

// 2026 redesign of /resources: the tools in groups, in the Services page's
// frame (heading on the left, one row per tool on the right), then the
// checklists and the government portals. The header shows the next few due
// dates. Each tool has its own page (pages/ResourceTool.tsx).

const UPCOMING_COUNT = 4;

const ExternalIcon: React.FC = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden="true"
  >
    <path d="M7 17 17 7M9 7h8v8" />
  </svg>
);

const Resources: React.FC = () => {
  const today = todayIso();
  const upcoming = DUE_DATES.filter((due) => due.date >= today && !due.minor).slice(0, UPCOMING_COUNT);

  return (
    <div className="rd-page">
      <SEO
        title={`Resources | ${CONTACT_INFO.name}`}
        description="Income tax, HRA, capital gains and GST calculators, TDS and TCS rates and due dates for tax year 2026-27, and checklists of documents, from Sagar H R & Co., Chartered Accountants, Mysuru."
        canonicalUrl={`${SITE_URL}/resources`}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Resources', url: '/resources' },
        ]}
        schema={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Resources',
          url: `${SITE_URL}/resources`,
          hasPart: RESOURCE_TOOLS.map((tool) => ({
            '@type': tool.group === 'calculators' ? 'WebApplication' : 'WebPage',
            name: tool.name,
            url: `${SITE_URL}/resources/${tool.slug}`,
          })),
        }}
      />

      <div className="phead">
        <div className="grain" aria-hidden="true" />
        <div className={`hgrid open pad ${upcoming.length ? '' : 'solo'}`}>
          <div>
            <h1 className="rise">Resources</h1>
            <p className="hsub rise d1">
              Calculators, rates and due dates for tax year 2026-27, and lists of the documents to send us.
            </p>
          </div>
          {upcoming.length > 0 && (
            <div className="rise d2">
              <p className="lbl" id="upcoming-heading">
                Coming up
              </p>
              <ul className="most soon" aria-labelledby="upcoming-heading">
                {upcoming.map((due) => (
                  <li key={`${due.date}-${due.title}`}>
                    <Link to={`/resources/due-dates#${due.date.slice(0, 7)}`}>
                      <span>
                        <span className="when">{dayMonth(due.date)}</span>
                        {due.title}
                      </span>
                      <ArrowRight size={18} />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="svclist pad">
        {RESOURCE_GROUPS.map((group) => (
          <section key={group.id} className="sec" aria-labelledby={`resource-group-${group.id}`}>
            <div className="sec-h">
              <h2 id={`resource-group-${group.id}`}>{group.name}</h2>
              <p className="desc">{group.description}</p>
            </div>
            <ul className="srows">
              {RESOURCE_TOOLS.filter((tool) => tool.group === group.id).map((tool) => (
                <li key={tool.slug}>
                  <Link to={`/resources/${tool.slug}`}>
                    <span>
                      <span className="t">{tool.name}</span>
                      <span className="d">{tool.summary}</span>
                    </span>
                    <span className="go">
                      <ArrowRight size={18} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section className="sec" aria-labelledby="checklists-heading">
          <div className="sec-h">
            <h2 id="checklists-heading">Checklists</h2>
            <p className="desc">What to send us, so the work can start without back and forth.</p>
          </div>
          <ul className="srows">
            {CHECKLISTS.map((checklist) => (
              <li key={checklist.slug}>
                <Link to={`/resources/checklist/${checklist.slug}`}>
                  <span>
                    <span className="t">{checklist.title}</span>
                    <span className="d">{checklist.summary}</span>
                  </span>
                  <span className="go">
                    <ArrowRight size={18} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="sec band" aria-labelledby="portals-heading">
          <div className="sec-h">
            <h2 id="portals-heading">Government portals</h2>
            <p className="desc">The official sites, opening in a new tab.</p>
          </div>
          <div className="portals">
            {PORTAL_GROUPS.map((group) => (
              <div key={group.name}>
                <h3>{group.name}</h3>
                <ul>
                  {group.links.map((link) => (
                    <li key={link.url}>
                      <a href={link.url} target="_blank" rel="noopener noreferrer">
                        <span>
                          <span className="t">{link.name}</span>
                          <span className="u">{link.use}</span>
                        </span>
                        <ExternalIcon />
                        <span className="vh"> (opens in a new tab)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <div className="tail">
          <span />
          <p className="still">
            If you would rather we did the working, <Link to="/contact#write">send us a message</Link> or call{' '}
            <a href={`tel:${CONTACT_INFO.phone.value}`}>{CONTACT_INFO.phone.display}</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Resources;
