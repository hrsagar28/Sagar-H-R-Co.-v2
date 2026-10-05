import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { ArrowRight } from '../components/redesign/icons';
import { CONTACT_INFO } from '../constants';
import { SITE_URL } from '../config/site';
import { useInsights } from '../hooks';
import { formatLongDate, toISODate } from '../utils/insightDates';

// 2026 redesign of /insights: the dark header, then every article in one
// ruled list, newest first, with the date beside each title. No search or
// category filter: with a handful of articles they only get in the way.
// Rendered inside RedesignLayout.

const DESCRIPTION = 'Notes on changes in income tax and GST law, by CA Sagar H R of Sagar H R & Co., Mysuru.';

const Insights: React.FC = () => {
  const { insights, loading, error } = useInsights();

  const sorted = useMemo(
    () => [...insights].sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime()),
    [insights],
  );

  const schema = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'Blog',
      '@id': `${SITE_URL}/insights`,
      name: `${CONTACT_INFO.name} - Insights`,
      description: DESCRIPTION,
      publisher: { '@id': `${SITE_URL}/#organization` },
      blogPost: sorted.map((insight) => ({
        '@type': 'BlogPosting',
        '@id': `${SITE_URL}/insights/${insight.slug}`,
        url: `${SITE_URL}/insights/${insight.slug}`,
        headline: insight.title,
        description: insight.summary,
        datePublished: toISODate(insight.date),
        dateModified: toISODate(insight.dateModified || insight.date),
        author: { '@type': 'Person', name: insight.author },
        articleSection: insight.category,
        ...(insight.wordCount ? { wordCount: insight.wordCount } : {}),
        image: insight.image || `${SITE_URL}/og/og-default.png`,
      })),
    }),
    [sorted],
  );

  return (
    <div className="rd-page">
      <SEO
        title={`Insights | ${CONTACT_INFO.name}`}
        description={DESCRIPTION}
        canonicalUrl={`${SITE_URL}/insights`}
        schema={schema}
        alternates={[
          { type: 'application/rss+xml', title: `${CONTACT_INFO.name} RSS Feed`, href: '/rss.xml' },
          { type: 'application/atom+xml', title: `${CONTACT_INFO.name} Atom Feed`, href: '/atom.xml' },
        ]}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Insights', url: '/insights' },
        ]}
      />

      <div className="phead">
        <div className="grain" aria-hidden="true" />
        <div className="hgrid open solo pad">
          <div>
            <h1 className="rise">Insights</h1>
            <p className="hsub rise d1">Notes on changes in income tax and GST law, and what they mean in practice.</p>
          </div>
        </div>
      </div>

      <div className="alist pad">
        {loading ? (
          <div className="askel" aria-busy="true">
            <span className="skel-line" />
            <span className="skel-line" />
            <span className="skel-line" />
            <p className="vh" role="status">
              Loading the articles
            </p>
          </div>
        ) : error ? (
          <p className="aerr" role="alert">
            The articles could not load. Please check your connection and refresh the page.
          </p>
        ) : (
          <ol className="arows" aria-label="Articles, newest first">
            {sorted.map((insight) => (
              <li key={insight.id}>
                <Link to={`/insights/${insight.slug}`}>
                  <span className="am">
                    <time dateTime={toISODate(insight.date)}>{formatLongDate(insight.date)}</time>
                    <span>{insight.category}</span>
                  </span>
                  <span className="ab">
                    <span className="t">{insight.title}</span>
                    <span className="go">
                      <ArrowRight size={18} />
                    </span>
                    <span className="d">{insight.summary}</span>
                    <span className="i">{insight.readTime}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
};

export default Insights;
