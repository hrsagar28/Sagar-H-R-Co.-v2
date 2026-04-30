import React, { useCallback, useDeferredValue, useEffect, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { AlertCircle, ArrowUpRight, Calendar, Check, Clock, Search, X } from 'lucide-react';
import SEO from '../components/SEO';
import { PageHero } from '../components/hero';
import { CONTACT_INFO } from '../constants';
import { useAnnounce, useInsights } from '../hooks';
import Skeleton from '../components/Skeleton';
import { formatArchiveDate } from '../utils/formatArchiveDate';
import { formatLongDate, toISODate } from '../utils/insightDates';
import { normalizeSearch } from '../utils/normalizeSearch';
import { SITE_URL } from '../config/site';

const { Link, useSearchParams } = ReactRouterDOM;

const HERO_PLACEHOLDERS = Array.from({ length: 4 }, (_, index) => ({
  num: String(index + 1).padStart(2, '0'),
  title: <span className="inline-block h-5 w-40 rounded-full bg-current opacity-10" aria-hidden="true" />,
  date: '',
  href: '#insights-results',
}));

const SERVICE_LINKS: Record<string, { label: string; href: string }> = {
  'GST & Compliance': { label: 'GST Services', href: '/services/gst' },
  'Income Tax': { label: 'Income Tax Services', href: '/services/income-tax' },
  'Income Tax Updates': { label: 'Income Tax Services', href: '/services/income-tax' },
  'Real Estate Taxation': { label: 'Advisory Services', href: '/services/advisory' },
  'Economic Analysis': { label: 'Business Advisory', href: '/services/advisory' },
};

const sortByNewest = <T extends { date: string }>(items: T[]) => (
  [...items].sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime())
);

const getCanonicalCategory = (category: string) => (
  category === 'Income Tax Updates' ? 'Income Tax' : category
);

const Insights: React.FC = () => {
  const { insights, loading, error } = useInsights();
  const { announce } = useAnnounce();
  const [searchParams, setSearchParams] = useSearchParams();

  const searchTerm = searchParams.get('q') || '';
  const selectedCategory = searchParams.get('cat') || 'All';
  const deferredSearchTerm = useDeferredValue(searchTerm);

  const sortedInsights = useMemo(() => sortByNewest(insights), [insights]);

  const categories = useMemo(() => {
    const cats = new Set(insights.map((insight) => getCanonicalCategory(insight.category)));
    return ['All', ...Array.from(cats).sort((left, right) => left.localeCompare(right))];
  }, [insights]);

  const updateFilters = useCallback((next: { q?: string; cat?: string }) => {
    const params = new URLSearchParams(searchParams);
    const nextQuery = next.q ?? searchTerm;
    const nextCategory = next.cat ?? selectedCategory;

    if (nextQuery.trim()) params.set('q', nextQuery);
    else params.delete('q');

    if (nextCategory && nextCategory !== 'All') params.set('cat', nextCategory);
    else params.delete('cat');

    setSearchParams(params, { replace: true });
  }, [searchParams, searchTerm, selectedCategory, setSearchParams]);

  const clearFilters = useCallback(() => {
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  const onCategoryKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const nextIndex = (() => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') return (index + 1) % categories.length;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') return (index - 1 + categories.length) % categories.length;
      if (event.key === 'Home') return 0;
      if (event.key === 'End') return categories.length - 1;
      return null;
    })();

    if (nextIndex === null) return;
    event.preventDefault();
    const nextCategory = categories[nextIndex];
    updateFilters({ cat: nextCategory });
    window.requestAnimationFrame(() => {
      document.getElementById(`insights-category-${nextCategory.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`)?.focus();
    });
  };

  const filteredInsights = useMemo(() => {
    const query = normalizeSearch(deferredSearchTerm);
    return sortedInsights.filter((item) => {
      const searchableText = normalizeSearch(`${item.title} ${item.summary} ${item.category} ${item.author}`);
      const matchesSearch = !query || searchableText.includes(query);
      const matchesCategory = selectedCategory === 'All' || getCanonicalCategory(item.category) === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [sortedInsights, deferredSearchTerm, selectedCategory]);

  const heroItems = useMemo(() => {
    if (loading && sortedInsights.length === 0) return HERO_PLACEHOLDERS;
    return sortedInsights.slice(0, 4).map((insight, idx) => ({
      num: String(idx + 1).padStart(2, '0'),
      title: insight.title.includes(' ')
        ? <>{insight.title.split(' ')[0]} <em>{insight.title.substring(insight.title.indexOf(' ') + 1)}</em></>
        : <><em>{insight.title}</em></>,
      date: formatArchiveDate(insight.date),
      href: `/insights/${insight.slug}`,
    }));
  }, [loading, sortedInsights]);

  const schema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${SITE_URL}/insights`,
    name: `${CONTACT_INFO.name} - Insights`,
    description: 'Analysis on Income Tax, GST, audit, and Companies Act updates from a Mysuru CA practice.',
    publisher: { '@id': `${SITE_URL}/#organization` },
    blogPost: sortedInsights.map((insight) => ({
      '@type': 'BlogPosting',
      '@id': `${SITE_URL}/insights/${insight.slug}`,
      url: `${SITE_URL}/insights/${insight.slug}`,
      headline: insight.title,
      abstract: insight.summary,
      description: insight.summary,
      datePublished: toISODate(insight.date),
      dateModified: toISODate(insight.dateModified || insight.date),
      author: {
        '@type': 'Person',
        name: insight.author,
      },
      articleSection: getCanonicalCategory(insight.category),
      ...(insight.wordCount ? { wordCount: insight.wordCount } : {}),
      image: insight.image || `${SITE_URL}/og-image.jpg`,
    })),
  }), [sortedInsights]);

  const resultsLabel = loading
    ? 'Loading insights'
    : error
      ? `Error: ${error}`
      : `${filteredInsights.length} ${filteredInsights.length === 1 ? 'article' : 'articles'} found`;

  useEffect(() => {
    announce(resultsLabel, error ? 'assertive' : 'polite');
  }, [announce, resultsLabel, error]);

  return (
    <div className="bg-brand-bg min-h-screen selection:bg-brand-moss selection:text-white">
      <SEO
        title={`Insights & Tax Updates from Mysuru | ${CONTACT_INFO.name}`}
        description="Analysis on Income Tax, GST, audit, and Companies Act updates from a Mysuru CA practice, written when something genuinely useful crosses the desk."
        schema={schema}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Insights', url: '/insights' },
        ]}
      />

      <div id="main">
        <PageHero
          variant="archive"
          eyebrow="Insights"
          title={<>Notes from <em>practice</em>.</>}
          blurb="A working library of the firm's writing on tax, audit, and corporate law."
          items={heroItems}
          totalLabel={`${insights.length} in Archive`}
        />

        <section className="py-20 px-4 md:px-6" aria-labelledby="insights-results-heading">
          <div className="container mx-auto max-w-7xl">
            {!loading && !error && (
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 animate-fade-in-up">
                <div
                  role="tablist"
                  aria-label="Filter insights by category"
                  className="flex w-full md:w-auto flex-nowrap md:flex-wrap gap-2 overflow-x-auto snap-x snap-mandatory pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0"
                >
                  {categories.map((cat, index) => {
                    const selected = selectedCategory === cat;
                    const id = `insights-category-${cat.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`;
                    return (
                      <button
                        key={cat}
                        id={id}
                        type="button"
                        role="tab"
                        aria-selected={selected}
                        aria-controls="insights-results"
                        tabIndex={selected ? 0 : -1}
                        data-analytics="insights_category_filter"
                        data-category={cat}
                        onClick={() => updateFilters({ cat })}
                        onKeyDown={(event) => onCategoryKeyDown(event, index)}
                        className={`snap-start shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-brand-moss focus:ring-offset-2 ${
                          selected
                            ? 'bg-brand-moss text-white shadow-md'
                            : 'bg-white border border-brand-border text-brand-stone hover:border-brand-moss'
                        }`}
                      >
                        {selected && <Check size={12} aria-hidden="true" />}
                        {cat}
                      </button>
                    );
                  })}
                </div>

                <div className="relative w-full md:w-80">
                  <label htmlFor="insights-search" className="sr-only">Search insights</label>
                  <Search size={18} aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-stone" />
                  <input
                    id="insights-search"
                    type="search"
                    enterKeyHint="search"
                    inputMode="search"
                    autoComplete="off"
                    placeholder="Search articles..."
                    value={searchTerm}
                    onChange={(event) => updateFilters({ q: event.target.value })}
                    aria-controls="insights-results"
                    aria-describedby="insights-results-count"
                    data-analytics="insights_search"
                    className="w-full pl-11 pr-10 py-3 bg-white border border-brand-border rounded-full text-sm font-medium focus:outline-none focus:border-brand-moss focus:ring-1 focus:ring-brand-moss transition-all"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => updateFilters({ q: '' })}
                      aria-label="Clear insights search"
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-brand-stone hover:text-brand-dark"
                    >
                      <X size={14} aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>
            )}

            <h2 id="insights-results-heading" className="sr-only">Insights archive results</h2>
            <p id="insights-results-count" role="status" aria-live="polite" className="sr-only">{resultsLabel}</p>

            {loading && (
              <div className="grid gap-6" aria-label="Loading insights">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-brand-surface rounded-[2rem] p-8 md:p-12 border border-brand-border flex flex-col md:flex-row gap-8 md:gap-12 items-start">
                    <div className="md:w-1/4 w-full">
                      <Skeleton variant="text" width={120} height={24} className="mb-4" />
                      <Skeleton variant="text" width={160} height={18} />
                    </div>
                    <div className="md:w-2/4 w-full">
                      <Skeleton variant="text" width="80%" height={36} className="mb-5" />
                      <Skeleton variant="text" width="100%" height={18} className="mb-3" />
                      <Skeleton variant="text" width="72%" height={18} />
                    </div>
                    <div className="md:w-1/4 w-full flex md:justify-end">
                      <Skeleton variant="circular" width={56} height={56} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="text-center py-20" role="alert">
                <AlertCircle size={48} aria-hidden="true" className="mx-auto text-brand-stone mb-4 opacity-50" />
                <h3 className="text-2xl font-bold text-brand-dark mb-2">Unable to load insights</h3>
                <p className="text-brand-stone">{error}</p>
              </div>
            )}

            {!loading && !error && (
              <>
                {filteredInsights.length > 0 ? (
                  <div id="insights-results" className="grid gap-6">
                    {filteredInsights.map((insight) => {
                      const serviceLink = SERVICE_LINKS[insight.category] || SERVICE_LINKS[getCanonicalCategory(insight.category)];
                      return (
                        <article key={insight.slug} className="group bg-brand-surface rounded-[2rem] p-8 md:p-12 border border-brand-border hover:border-brand-moss hover:shadow-xl motion-reduce:hover:shadow-none transition-all duration-300 flex flex-col md:flex-row gap-8 md:gap-12 items-start relative overflow-hidden">
                          <div className="absolute inset-0 bg-brand-moss/0 group-hover:bg-brand-moss/[0.02] transition-colors" />

                          <div className="md:w-1/4 relative z-10 order-3 md:order-1">
                            <span className="inline-block px-4 py-1 rounded-full bg-brand-bg border border-brand-border text-brand-dark text-xs font-bold uppercase tracking-wider mb-4">{getCanonicalCategory(insight.category)}</span>
                            <div className="flex items-center gap-2 text-brand-stone text-sm font-bold">
                              <Calendar size={14} aria-hidden="true" />
                              <time dateTime={toISODate(insight.date)}>{formatLongDate(insight.date)}</time>
                            </div>
                            <div className="mt-3 grid gap-2 text-brand-stone text-xs font-bold">
                              <span className="inline-flex items-center gap-2">
                                <Clock size={12} aria-hidden="true" />
                                {insight.readTime}
                              </span>
                            </div>
                            {serviceLink && (
                              <Link
                                to={serviceLink.href}
                                data-analytics="insights_service_crosslink"
                                className="inline-flex mt-5 items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-moss hover:text-brand-dark"
                              >
                                {serviceLink.label}
                                <ArrowUpRight size={14} aria-hidden="true" />
                              </Link>
                            )}
                          </div>
                          <div className="md:w-2/4 relative z-10 order-1 md:order-2">
                            <h3 className="text-2xl md:text-3xl text-brand-dark font-heading font-bold mb-4 group-hover:text-brand-moss transition-colors leading-tight">
                              <Link to={`/insights/${insight.slug}`} data-analytics="insights_card_click">
                                <span className="absolute inset-0 z-0" aria-hidden="true" />
                                <span className="relative z-10">{insight.title}</span>
                              </Link>
                            </h3>
                            <p className="text-brand-stone leading-relaxed font-medium relative z-10">
                              {insight.summary}
                            </p>
                          </div>
                          <div className="md:w-1/4 flex justify-start md:justify-end w-full relative z-10 order-2 md:order-3">
                            <div className="w-14 h-14 rounded-full bg-brand-bg border border-brand-border flex items-center justify-center text-brand-dark group-hover:bg-brand-moss group-hover:text-brand-inverse group-hover:scale-110 motion-reduce:group-hover:scale-100 transition-all duration-300">
                              <ArrowUpRight size={20} aria-hidden="true" />
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <div id="insights-results" className="text-center py-20 bg-white rounded-[2rem] border border-brand-border px-6">
                    <p className="text-xl text-brand-stone font-medium">No articles found matching your criteria.</p>
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="mt-4 text-brand-moss font-bold hover:underline"
                    >
                      Clear Filters
                    </button>
                    {sortedInsights.length > 0 && (
                      <div className="mt-10 mx-auto max-w-2xl text-left">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-stone mb-4">Recent insights</p>
                        <div className="grid gap-3">
                          {sortedInsights.slice(0, 3).map((insight) => (
                            <Link
                              key={insight.slug}
                              to={`/insights/${insight.slug}`}
                              onClick={clearFilters}
                              className="flex items-center justify-between gap-4 rounded-2xl border border-brand-border bg-brand-bg px-5 py-4 font-bold text-brand-dark hover:border-brand-moss hover:text-brand-moss transition-colors"
                            >
                              <span>{insight.title}</span>
                              <ArrowUpRight size={16} aria-hidden="true" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Insights;
