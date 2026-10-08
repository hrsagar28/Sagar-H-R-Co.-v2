import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { ArrowRight, SearchIcon } from '../components/redesign/icons';
import { PAGE_META } from '../constants/pageMeta';
import { CHECKLISTS, DUE_DATES, PORTAL_GROUPS, RESOURCE_GROUPS, RESOURCE_TOOLS } from '../constants/resources';
import { SITE_URL } from '../config/site';
import { dayMonth, todayIso } from '../utils/resources/dates';

// 2026 redesign of /resources: the tools in groups, in the Services page's
// frame (heading on the left, one row per tool on the right), then the
// checklists and the government portals. The header shows the next few due
// dates. Each tool has its own page (pages/ResourceTool.tsx).

const UPCOMING_COUNT = 4;

/** Every word of the search appears in the text. */
const found = (query: string, ...texts: string[]) => {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const haystack = texts.join(' ').toLowerCase();
  return words.every((word) => haystack.includes(word));
};

/**
 * The filter buttons, as on the FAQ page: one stays pressed and only its
 * section shows; while searching, each shows how many matches it holds.
 */
const FILTERS: { id: string; name: string }[] = [
  { id: 'all', name: 'All' },
  ...RESOURCE_GROUPS.map((group) => ({ id: group.id, name: group.name })),
  { id: 'checklists', name: 'Checklists' },
  { id: 'portals', name: 'Government portals' },
];

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
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const searchRef = useRef<HTMLInputElement>(null);

  const tools = RESOURCE_TOOLS.filter((tool) => found(query, tool.name, tool.summary));
  const checklists = CHECKLISTS.filter((checklist) => found(query, checklist.title, checklist.summary));
  const portals = PORTAL_GROUPS.map((group) => ({
    ...group,
    links: group.links.filter((link) => found(query, link.name, link.use, group.name)),
  })).filter((group) => group.links.length > 0);

  // Matches under each filter, and in all.
  const counts: Record<string, number> = {
    ...Object.fromEntries(
      RESOURCE_GROUPS.map((group) => [group.id, tools.filter((tool) => tool.group === group.id).length]),
    ),
    checklists: checklists.length,
    portals: portals.reduce((sum, group) => sum + group.links.length, 0),
  };
  counts.all = Object.values(counts).reduce((sum, value) => sum + value, 0);
  const count = counts[filter] ?? 0;
  const showing = (id: string) => filter === 'all' || filter === id;

  const filterName = FILTERS.find((item) => item.id === filter)?.name ?? '';
  const where = filter === 'all' ? '' : ` in ${filterName}`;
  const noun = (n: number) => (n === 1 ? 'resource' : 'resources');
  let status = '';
  if (query && count) status = `${count} ${noun(count)}${where} ${count === 1 ? 'matches' : 'match'} “${query}”.`;
  else if (!query && filter !== 'all') status = `Showing ${count} ${noun(count)} in ${filterName}.`;

  return (
    <div className="rd-page">
      <SEO
        title={PAGE_META.resources.title}
        description={PAGE_META.resources.description}
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
        <div className={`hgrid pad ${upcoming.length ? '' : 'solo'}`}>
          <div>
            <h1 className="rise">Resources</h1>
            <p className="hsub rise d1">
              Calculators, rates, due dates and the new section numbers for tax year 2026-27, and lists of the documents
              to send us.
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

      <div className="pad">
        <div className="seam panel spanel">
          <div className="srow" role="search">
            <SearchIcon />
            <label className="vh" htmlFor="resource-search">
              Search the resources
            </label>
            <input
              ref={searchRef}
              id="resource-search"
              type="search"
              placeholder="Search, such as HRA, NRI or GST"
              autoComplete="off"
              enterKeyHint="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape' && query) {
                  event.preventDefault();
                  setQuery('');
                }
              }}
            />
            {query && (
              <button
                className="link-btn"
                type="button"
                onClick={() => {
                  setQuery('');
                  searchRef.current?.focus();
                }}
              >
                Clear
              </button>
            )}
          </div>
          <div className="topics keep" role="group" aria-label="Show">
            {FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`topic ${query && !counts[item.id] ? 'empty' : ''}`}
                aria-pressed={filter === item.id}
                onClick={() => setFilter(item.id)}
              >
                <span>{item.name}</span>
                {query && <span className="c">{counts[item.id]}</span>}
              </button>
            ))}
          </div>
          {status && (
            <p className="sstatus">
              {status}
              {filter !== 'all' && (
                <button type="button" className="link-btn" onClick={() => setFilter('all')}>
                  Show all
                </button>
              )}
            </p>
          )}
        </div>
      </div>
      <p className="vh" role="status" aria-live="polite">
        {query || filter !== 'all' ? `${count} ${noun(count)} shown` : ''}
      </p>

      <div className="svclist pad">
        {count === 0 && (
          <div className="nores">
            <h2>
              Nothing matches “{query}”{where}
            </h2>
            {filter !== 'all' && counts.all > 0 ? (
              <p>
                There {counts.all === 1 ? 'is a match' : `are ${counts.all} matches`} in the others.{' '}
                <button type="button" className="link-btn" onClick={() => setFilter('all')}>
                  Show all
                </button>
              </p>
            ) : (
              <p>Try one word, such as rent, property or registration.</p>
            )}
          </div>
        )}
        {RESOURCE_GROUPS.filter((group) => showing(group.id) && tools.some((tool) => tool.group === group.id)).map(
          (group) => (
            <section key={group.id} className="sec" aria-labelledby={`resource-group-${group.id}`}>
              <div className="sec-h">
                <h2 id={`resource-group-${group.id}`}>{group.name}</h2>
                <p className="desc">{group.description}</p>
              </div>
              <ul className="srows">
                {tools
                  .filter((tool) => tool.group === group.id)
                  .map((tool) => (
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
          ),
        )}

        {showing('checklists') && checklists.length > 0 && (
          <section className="sec" aria-labelledby="checklists-heading">
            <div className="sec-h">
              <h2 id="checklists-heading">Checklists</h2>
              <p className="desc">What to send us, so the work can start without back and forth.</p>
            </div>
            <ul className="srows">
              {checklists.map((checklist) => (
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
        )}

        {showing('portals') && portals.length > 0 && (
          <section className="sec band" aria-labelledby="portals-heading">
            <div className="sec-h">
              <h2 id="portals-heading">Government portals</h2>
              <p className="desc">The official sites, opening in a new tab.</p>
            </div>
            <div className="portals">
              {portals.map((group) => (
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
        )}
      </div>
    </div>
  );
};

export default Resources;
