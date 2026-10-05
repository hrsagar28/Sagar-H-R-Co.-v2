import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import SEO from '../components/SEO';
import LegalPage from '../components/redesign/LegalPage';
import ArticleMarkdown from '../components/redesign/ArticleMarkdown';
import RdPageSkeleton from '../components/redesign/RdPageSkeleton';
import { ArrowLeft, ArrowRight } from '../components/redesign/icons';
import { CONTACT_INFO } from '../constants';
import { SITE_URL } from '../config/site';
import { useArticleBody, useInsights } from '../hooks';
import { splitArticle } from '../utils/articleSections';
import { formatLongDate, toISODate } from '../utils/insightDates';
import NotFound from './NotFound';

// 2026 redesign of an Insights article: the document layout of the legal
// pages (light header, contents beside the text), unnumbered, with a few more
// articles underneath. Rendered inside RedesignLayout.

const RELATED_COUNT = 3;

const InsightDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { insights, loading, getInsightBySlug } = useInsights();
  const insight = slug ? getInsightBySlug(slug) : undefined;
  const { content, loading: bodyLoading, error, refetch } = useArticleBody(slug, Boolean(insight));
  const parts = useMemo(() => (content ? splitArticle(content) : null), [content]);

  // Other articles: shared tags first, then the same category, then the newest.
  const related = useMemo(() => {
    if (!insight) return [];
    const tags = new Set(insight.tags ?? []);
    return insights
      .filter((item) => item.id !== insight.id)
      .map((item) => ({
        item,
        score:
          (item.tags ?? []).filter((tag) => tags.has(tag)).length * 3 +
          (item.category === insight.category ? 2 : 0) +
          new Date(item.date).getTime() / 1e13,
      }))
      .sort((left, right) => right.score - left.score)
      .slice(0, RELATED_COUNT)
      .map(({ item }) => item);
  }, [insight, insights]);

  if (loading) return <RdPageSkeleton />;

  if (!insight) {
    return (
      <NotFound
        title="Article not found"
        intro="There is no article at this address. It may have been removed."
        description="This article does not exist."
      />
    );
  }

  // A later revision date replaces the first one in the byline.
  const updated =
    insight.dateModified && toISODate(insight.dateModified) !== toISODate(insight.date)
      ? insight.dateModified
      : undefined;

  const lead = error ? (
    <div className="aerr">
      <p>The article could not load. Please check your connection and try again.</p>
      <button type="button" className="btn" onClick={refetch}>
        <span>Try again</span>
        <ArrowRight />
      </button>
    </div>
  ) : !parts || bodyLoading ? (
    <div className="askel" aria-busy="true">
      <span className="skel-line" />
      <span className="skel-line" />
      <span className="skel-line" />
      <p className="vh" role="status">
        Loading the article
      </p>
    </div>
  ) : parts.lead ? (
    <div className="alead">
      <ArticleMarkdown>{parts.lead}</ArticleMarkdown>
    </div>
  ) : null;

  const sections =
    parts && !error && !bodyLoading
      ? parts.sections.map((section) => ({
          id: section.id,
          title: section.title,
          content: <ArticleMarkdown>{section.body}</ArticleMarkdown>,
        }))
      : [];

  return (
    <>
      <SEO
        title={`${insight.title} | Insights`}
        description={insight.summary}
        ogType="article"
        noindex={Boolean(error)}
        ogImage={insight.image ? `${SITE_URL}${insight.image}` : undefined}
        alternates={[
          { type: 'application/rss+xml', title: `${CONTACT_INFO.name} RSS Feed`, href: '/rss.xml' },
          { type: 'application/atom+xml', title: `${CONTACT_INFO.name} Atom Feed`, href: '/atom.xml' },
        ]}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Insights', url: '/insights' },
          { name: insight.title, url: `/insights/${insight.slug}` },
        ]}
        article={{
          headline: insight.title,
          author: insight.author,
          authorUrl: `${SITE_URL}/about`,
          datePublished: toISODate(insight.date),
          dateModified: toISODate(insight.dateModified || insight.date),
          image: insight.image,
          section: insight.category,
          tags: insight.tags,
          wordCount: insight.wordCount,
        }}
      />
      <LegalPage
        title={insight.title}
        numbered={false}
        contentsLabel="Sections of this article"
        crumb={
          <Link className="crumb rise" to="/insights">
            <ArrowLeft />
            All insights
          </Link>
        }
        meta={
          <>
            By {insight.author} ·{' '}
            {updated ? (
              <>
                Updated <time dateTime={toISODate(updated)}>{formatLongDate(updated)}</time>
              </>
            ) : (
              <time dateTime={toISODate(insight.date)}>{formatLongDate(insight.date)}</time>
            )}{' '}
            · {insight.readTime}
          </>
        }
        lead={lead}
        note={
          parts?.note && !error ? (
            <div className="lnote">
              <ArticleMarkdown>{parts.note}</ArticleMarkdown>
            </div>
          ) : null
        }
        sections={sections}
      >
        {related.length > 0 && (
          <div className="amore pad">
            <section className="sec" aria-labelledby="more-insights">
              <div className="sec-h">
                <h2 id="more-insights">More insights</h2>
              </div>
              <ul className="srows">
                {related.map((item) => (
                  <li key={item.id}>
                    <Link to={`/insights/${item.slug}`}>
                      <span>
                        <span className="t">{item.title}</span>
                        <span className="i">
                          <time dateTime={toISODate(item.date)}>{formatLongDate(item.date)}</time> · {item.readTime}
                        </span>
                      </span>
                      <span className="go">
                        <ArrowRight size={18} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}
      </LegalPage>
    </>
  );
};

export default InsightDetail;
