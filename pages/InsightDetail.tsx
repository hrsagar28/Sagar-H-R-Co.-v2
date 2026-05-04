import React, { Suspense, useEffect, useState, useMemo, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Share2, Printer, Check, Twitter, Linkedin, ArrowUp, ArrowUpRight, Bookmark } from 'lucide-react';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/Breadcrumbs';
import Button from '../components/ui/Button';
import { CONTACT_INFO } from '../constants';
import { logger } from '../utils/logger';
import { useArticleBody, useInsights, useScrollPosition } from '../hooks';
import InsightDetailSkeleton from '../components/skeletons/InsightDetailSkeleton';
import { formatArchiveDate } from '../utils/formatArchiveDate';
import { formatLongDate, toISODate } from '../utils/insightDates';
import { extractMarkdownHeadings } from '../utils/markdownHeadings';
import { SITE_URL } from '../config/site';

const MarkdownRenderer = React.lazy(() => import('../components/MarkdownRenderer'));
const READING_PROGRESS_RADIUS = 24;
const SHARE_RESET_DELAY = 2500;

const Tooltip: React.FC<{ id: string; label: string; children: React.ReactElement }> = ({ id, label, children }) => (
  <span className="group relative">
    {React.cloneElement(children, {
      'aria-describedby': id,
      onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => {
        children.props.onKeyDown?.(event);
        if (event.key === 'Escape') {
          event.currentTarget.blur();
        }
      },
    })}
    <span
      id={id}
      role="tooltip"
      className="pointer-events-none absolute left-full top-1/2 z-tooltip ml-3 -translate-y-1/2 whitespace-nowrap rounded bg-brand-dark px-2 py-1 text-xs text-white opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
    >
      {label}
    </span>
  </span>
);

const BodySkeleton = () => (
  <div className="article-wrapper animate-pulse">
    <div className="mb-5 h-6 w-11/12 rounded bg-brand-stone/10"></div>
    <div className="mb-5 h-6 w-full rounded bg-brand-stone/10"></div>
    <div className="mb-10 h-6 w-10/12 rounded bg-brand-stone/10"></div>
    <div className="mb-10 h-40 rounded-2xl bg-brand-stone/10"></div>
    <div className="mb-6 h-8 w-7/12 rounded bg-brand-stone/10"></div>
    <div className="mb-5 h-6 w-full rounded bg-brand-stone/10"></div>
    <div className="h-6 w-9/12 rounded bg-brand-stone/10"></div>
  </div>
);

const copyTextToClipboard = async (text: string) => {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to the legacy selection-based path.
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();

  try {
    return document.execCommand('copy');
  } finally {
    document.body.removeChild(textarea);
  }
};

const ReadingProgress: React.FC = () => {
  const { scrollY } = useScrollPosition(50);
  const [maxScroll, setMaxScroll] = useState(0);

  useEffect(() => {
    const updateMaxScroll = () => {
      const scrollableHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setMaxScroll(Math.max(0, scrollableHeight));
    };

    updateMaxScroll();
    const observer = new ResizeObserver(updateMaxScroll);
    observer.observe(document.documentElement);
    window.addEventListener('resize', updateMaxScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateMaxScroll);
    };
  }, []);

  const scrollProgress = maxScroll === 0 ? 0 : Math.min(1, Math.max(0, scrollY / maxScroll));
  const circumference = 2 * Math.PI * READING_PROGRESS_RADIUS;
  const dashoffset = circumference - scrollProgress * circumference;

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <div
      className={`print-hidden fixed bottom-24 right-6 z-fixed hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] md:right-10 lg:block ${scrollProgress > 0.05 ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-10 opacity-0'}`}
    >
      <button
        onClick={scrollToTop}
        className="zone-surface group relative flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-transform hover:scale-110"
        aria-label="Scroll to top"
        title={`${Math.round(scrollProgress * 100)}% Read`}
      >
        <svg className="h-full w-full -rotate-90" viewBox="0 0 60 60" aria-hidden="true">
          <circle cx="30" cy="30" r={READING_PROGRESS_RADIUS} fill="none" stroke="#e5e7eb" strokeWidth="3" />
          <circle
            cx="30"
            cy="30"
            r={READING_PROGRESS_RADIUS}
            fill="none"
            stroke="#1A4D2E"
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={dashoffset}
            strokeLinecap="round"
          />
        </svg>
        <ArrowUp
          size={20}
          aria-hidden="true"
          focusable="false"
          className="zone-text absolute transition-colors group-hover:text-brand-moss"
        />
      </button>
    </div>
  );
};

const InsightDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { insights, loading, getInsightBySlug } = useInsights();
  const titleRef = useRef<HTMLHeadingElement>(null);

  const [shareCopied, setShareCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [liveMessage, setLiveMessage] = useState('');
  const [activeHeadingId, setActiveHeadingId] = useState('');

  const insightSchema = useMemo(() => {
    if (!slug) return undefined;
    return getInsightBySlug(slug);
  }, [slug, getInsightBySlug, insights]);

  const insight = insightSchema;
  const {
    content: mdContent,
    loading: bodyLoading,
    error: fetchError,
    refetch,
  } = useArticleBody(slug, Boolean(insight));
  const articleTitleId = 'article-title';
  const articleHeadings = useMemo(() => (mdContent ? extractMarkdownHeadings(mdContent) : []), [mdContent]);

  useEffect(() => {
    window.scrollTo(0, 0);
    window.requestAnimationFrame(() => {
      titleRef.current?.focus({ preventScroll: true });
    });
  }, [slug, insight?.id]);

  useEffect(() => {
    if (!slug) return;
    try {
      const saved = JSON.parse(localStorage.getItem('savedInsights') || '[]') as string[];
      setBookmarked(saved.includes(slug));
    } catch {
      setBookmarked(false);
    }
  }, [slug]);

  useEffect(() => {
    if (articleHeadings.length === 0) return;
    const firstHeading = articleHeadings[0];
    if (!firstHeading) return;
    setActiveHeadingId(firstHeading.id);

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => left.boundingClientRect.top - right.boundingClientRect.top)[0];

        if (visibleEntry) setActiveHeadingId(visibleEntry.target.id);
      },
      { rootMargin: '-20% 0px -65% 0px', threshold: [0, 1] },
    );

    articleHeadings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [articleHeadings]);

  const handleShare = async () => {
    const shareData = {
      title: insight?.title || `Insight from ${CONTACT_INFO.name}`,
      text: insight?.summary,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        logger.log('Share cancelled or failed', err);
      }
    } else {
      if (await copyTextToClipboard(window.location.href)) {
        setShareCopied(true);
        setLiveMessage('Article link copied to clipboard.');
        setTimeout(() => setShareCopied(false), SHARE_RESET_DELAY);
      } else {
        logger.error('Clipboard write failed', { url: window.location.href });
        setLiveMessage('Unable to copy article link.');
      }
    }
  };

  const handleBookmark = () => {
    if (!slug) return;
    try {
      const saved = JSON.parse(localStorage.getItem('savedInsights') || '[]') as string[];
      const nextSaved = saved.includes(slug) ? saved.filter((item) => item !== slug) : [...saved, slug];
      localStorage.setItem('savedInsights', JSON.stringify(nextSaved));
      const isSaved = nextSaved.includes(slug);
      setBookmarked(isSaved);
      setLiveMessage(isSaved ? 'Article saved.' : 'Saved article removed.');
    } catch (err) {
      logger.error('Failed to save insight bookmark', err);
    }
  };

  const handlePrint = () => window.print();

  // Get related insights
  const relatedInsights = useMemo(() => {
    if (!insight || insights.length === 0) return [];

    const currentTags = new Set(insight.tags || []);
    return insights
      .filter((i) => i.id !== insight.id)
      .map((item) => {
        const tagOverlap = (item.tags || []).filter((tag) => currentTags.has(tag)).length;
        const sameCategory = item.category === insight.category ? 1 : 0;
        const recency = new Date(item.date).getTime() / 10000000000000;
        return { item, score: tagOverlap * 3 + sameCategory * 2 + recency };
      })
      .sort((left, right) => right.score - left.score)
      .slice(0, 3)
      .map(({ item }) => item);
  }, [insight, insights]);

  // Render Logic
  if (loading) return <InsightDetailSkeleton />;

  if (!insight) {
    const recentInsights = insights.slice(0, 3);
    return (
      <div data-zone="editorial-paper" className="zone-bg min-h-screen px-4 pb-24 pt-40">
        <SEO
          title="Article Not Found | Sagar H R & Co."
          description="We couldn't find this article. Browse the latest tax, audit, GST, and business advisory insights from Sagar H R & Co."
          noindex
        />
        <div className="mx-auto max-w-4xl text-center">
          <span className="zone-border zone-surface zone-text-muted mb-8 inline-block rounded-full border px-4 py-1 text-xs font-bold uppercase tracking-widest">
            Error 404
          </span>
          <h1 className="zone-text mb-6 font-heading text-4xl font-bold md:text-6xl">Article Not Found</h1>
          <p className="zone-text-muted mx-auto mb-10 max-w-2xl text-lg">
            We couldn't find this article. It may have been moved, retired, or never existed.
          </p>
          <Link
            to="/insights"
            className="inline-flex rounded-full bg-brand-moss px-6 py-3 font-bold text-white transition-all hover:bg-brand-dark"
          >
            Back to Insights
          </Link>

          {recentInsights.length > 0 && (
            <div className="mt-16 text-left">
              <h2 className="zone-text mb-6 text-center font-heading text-2xl font-bold">Recent Insights</h2>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                {recentInsights.map((item) => (
                  <Link
                    key={item.id}
                    to={`/insights/${item.slug}`}
                    aria-label={item.title}
                    className="zone-surface zone-border rounded-2xl border p-5 transition-colors hover:border-brand-moss"
                  >
                    <span className="zone-text-muted text-[10px] font-bold uppercase tracking-widest">
                      {item.category}
                    </span>
                    <h3 className="zone-text mt-3 font-heading text-lg font-bold">{item.title}</h3>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      data-zone="editorial-paper"
      className="zone-bg relative min-h-screen selection:bg-brand-moss selection:text-white"
    >
      <SEO
        title={`${insight.title} | Insights`}
        description={insight.summary}
        ogType="article"
        noindex={fetchError}
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
          authorSameAs: [CONTACT_INFO.social.linkedin],
          datePublished: toISODate(insight.date),
          dateModified: toISODate(insight.dateModified || insight.date),
          image: insight.image,
          section: insight.category,
          tags: insight.tags,
          wordCount: insight.wordCount,
        }}
      />

      <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {liveMessage}
      </span>

      <div className="relative z-base mx-auto max-w-[1200px] px-4 pb-32 pt-32 md:px-8 md:pt-48 lg:pb-24">
        {/* Editorial Header */}
        <header className="mx-auto mb-16 max-w-4xl text-center motion-safe:animate-fade-in-up md:mb-24">
          <div className="mb-10 flex justify-center">
            <Breadcrumbs
              items={[{ label: 'Insights', path: '/insights' }, { label: insight.title }]}
              className="justify-center"
            />
          </div>

          <div className="mb-8">
            <span className="zone-text-muted font-mono text-eyebrow uppercase tracking-[0.2em]">
              {insight.category}
            </span>
          </div>

          <h1
            ref={titleRef}
            id={articleTitleId}
            tabIndex={-1}
            className="zone-text mb-8 font-heading text-display-md leading-[1.15] focus:outline-none md:text-display-lg"
          >
            {insight.title}
          </h1>

          <div className="no-scrollbar zone-text-muted zone-border/50 mx-auto flex min-w-0 max-w-2xl flex-nowrap items-center justify-start gap-6 overflow-x-auto border-b border-t py-6 font-mono text-xs uppercase tracking-[0.1em] md:justify-center">
            <time dateTime={toISODate(insight.date)} className="flex shrink-0 items-center gap-2">
              {formatLongDate(insight.date)}
            </time>
            <span className="h-1 w-1 shrink-0 rounded-full bg-brand-stone opacity-40" aria-hidden="true"></span>
            <span className="flex shrink-0 items-center gap-2">{insight.readTime}</span>
            <span className="h-1 w-1 shrink-0 rounded-full bg-brand-stone opacity-40" aria-hidden="true"></span>
            <span className="zone-text shrink-0 font-semibold">BY {insight.author.toUpperCase()}</span>
          </div>
        </header>

        <div className="relative grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Left Sidebar - Floating Actions (Desktop) */}
          <aside className="print-hidden relative hidden lg:col-span-2 lg:block">
            <div className="sticky top-40 flex flex-col items-center gap-6">
              <div className="zone-border/50 flex flex-col gap-3 rounded-2xl border bg-white/80 p-2 shadow-lg shadow-brand-dark/5 backdrop-blur-md">
                {/* Share Button */}
                <Tooltip id="tip-share-article" label={shareCopied ? 'Copied Link' : 'Share'}>
                  <button
                    onClick={handleShare}
                    aria-label="Share article"
                    className="zone-text-muted hover:zone-bg flex h-12 w-12 items-center justify-center rounded-xl transition-all hover:text-brand-moss"
                  >
                    {shareCopied ? (
                      <Check size={20} aria-hidden="true" focusable="false" className="text-green-600" />
                    ) : (
                      <Share2 size={20} aria-hidden="true" focusable="false" />
                    )}
                  </button>
                </Tooltip>

                <Tooltip id="tip-save-article" label={bookmarked ? 'Saved' : 'Save'}>
                  <button
                    onClick={handleBookmark}
                    aria-label={bookmarked ? 'Remove saved article' : 'Save article'}
                    aria-pressed={bookmarked}
                    className="zone-text-muted hover:zone-bg flex h-12 w-12 items-center justify-center rounded-xl transition-all hover:text-brand-moss"
                  >
                    {bookmarked ? (
                      <Check size={20} aria-hidden="true" focusable="false" className="text-green-600" />
                    ) : (
                      <Bookmark size={20} aria-hidden="true" focusable="false" />
                    )}
                  </button>
                </Tooltip>

                <Tooltip id="tip-print-article" label="Print">
                  <button
                    onClick={handlePrint}
                    aria-label="Print article"
                    className="zone-text-muted hover:zone-bg flex h-12 w-12 items-center justify-center rounded-xl transition-all hover:text-brand-moss"
                  >
                    <Printer size={20} aria-hidden="true" focusable="false" />
                  </button>
                </Tooltip>

                <div className="my-1 h-[1px] w-full bg-brand-border/50"></div>

                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(insight.title)}&url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Share on X (opens in new window)"
                  className="zone-text-muted flex h-12 w-12 items-center justify-center rounded-xl transition-all hover:bg-black/5 hover:text-black"
                >
                  <Twitter size={20} aria-hidden="true" focusable="false" />
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Share on LinkedIn (opens in new window)"
                  className="zone-text-muted flex h-12 w-12 items-center justify-center rounded-xl transition-all hover:bg-[#0A66C2]/10 hover:text-[#0A66C2]"
                >
                  <Linkedin size={20} aria-hidden="true" focusable="false" />
                </a>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main id="main-content" aria-labelledby={articleTitleId} className="lg:col-span-8">
            <article className="motion-safe:animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              {/* Using New Markdown Renderer */}
              {bodyLoading && <BodySkeleton />}
              {fetchError && (
                <div className="article-wrapper zone-border zone-surface rounded-2xl border px-6 py-16 text-center">
                  <h2 className="zone-text mb-4 font-heading text-3xl font-bold">Content Not Found</h2>
                  <p className="zone-text-muted mb-8">
                    We couldn't load this article. It may have been moved, retired, or never existed.
                  </p>
                  <div className="flex flex-col justify-center gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={refetch}
                      className="rounded-full bg-brand-moss px-6 py-2 font-bold text-white transition-all hover:bg-brand-dark"
                    >
                      Retry
                    </button>
                    <Link
                      to="/insights"
                      className="zone-border zone-text rounded-full border bg-white px-6 py-2 font-bold transition-all hover:bg-brand-dark hover:text-white"
                    >
                      Back to Insights
                    </Link>
                  </div>
                </div>
              )}
              {mdContent && !fetchError && (
                <Suspense fallback={<BodySkeleton />}>
                  <MarkdownRenderer content={mdContent} />
                </Suspense>
              )}
            </article>

            {/* Footer Author Card */}
            <div className="zone-border/60 mt-24 border-t pt-12">
              <div className="zone-bg/50 zone-border/50 flex flex-col items-center gap-8 rounded-[2rem] border p-8 text-center md:flex-row md:items-start md:p-10 md:text-left">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-brand-dark font-serif text-3xl font-bold text-white shadow-xl shadow-brand-dark/20">
                  {insight.author.replace('CA ', '').charAt(0)}
                </div>
                <div className="flex-grow">
                  <p className="mb-2 text-xs font-bold uppercase tracking-widest text-brand-moss">About the Author</p>
                  <h3 className="zone-text mb-3 font-heading text-2xl font-bold">{insight.author}</h3>
                  <p className="zone-text-muted mb-6 text-base leading-relaxed">
                    Senior Partner at {CONTACT_INFO.name}, specializing in corporate taxation, audit assurance, and
                    strategic business advisory with over a decade of experience.
                  </p>
                  <Link
                    to="/contact"
                    className="zone-border zone-text inline-block rounded-full border bg-white px-6 py-2 text-sm font-bold shadow-sm transition-all hover:bg-brand-dark hover:text-white"
                  >
                    Book Consultation
                  </Link>
                </div>
              </div>
            </div>

            {/* Related Insights Section */}
            {relatedInsights.length > 0 && (
              <section className="zone-border mt-24 border-t pt-16">
                <div className="mb-10 flex flex-col items-end justify-between gap-4 md:flex-row">
                  <div>
                    <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-brand-moss">
                      Further Reading
                    </span>
                    <h3 className="zone-text font-heading text-3xl font-bold">Related Insights</h3>
                  </div>
                  <Link
                    to="/insights"
                    className="zone-text-muted group flex items-center gap-2 text-sm font-bold uppercase tracking-wider transition-colors hover:text-brand-moss"
                  >
                    View All{' '}
                    <ArrowUpRight
                      size={16}
                      aria-hidden="true"
                      focusable="false"
                      className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </Link>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  {relatedInsights.map((item, index) => (
                    <Link
                      to={`/insights/${item.slug}`}
                      key={item.id}
                      aria-label={item.title}
                      className="zone-surface zone-border group flex h-full flex-col rounded-[1.5rem] border p-6 transition-all duration-300 hover:border-brand-moss hover:shadow-lg motion-safe:animate-fade-in-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <span className="zone-bg zone-text-muted mb-4 inline-block w-fit rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest transition-colors group-hover:bg-brand-moss group-hover:text-white">
                        {item.category}
                      </span>
                      <h4 className="zone-text mb-3 line-clamp-2 font-heading text-lg font-bold transition-colors group-hover:text-brand-moss">
                        {item.title}
                      </h4>
                      <div className="zone-border/50 zone-text mt-auto flex items-center justify-between border-t pt-4 text-xs font-semibold">
                        <time dateTime={toISODate(item.date)}>{formatArchiveDate(item.date)}</time>
                        <div className="zone-bg flex h-8 w-8 items-center justify-center rounded-full transition-all group-hover:bg-brand-moss group-hover:text-white">
                          <ArrowUpRight size={14} aria-hidden="true" focusable="false" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </main>

          <aside className="print-hidden hidden lg:col-span-2 lg:block" aria-label="Table of contents">
            {articleHeadings.length > 0 && (
              <nav className="sticky top-40 max-h-[calc(100vh-12rem)] overflow-y-auto pr-2">
                <p className="zone-text-muted mb-4 font-mono text-[10px] uppercase tracking-[0.2em]">On this page</p>
                <ol className="zone-border space-y-3 border-l pl-4">
                  {articleHeadings.map((heading) => (
                    <li key={heading.id}>
                      <a
                        href={`#${heading.id}`}
                        className={`block text-sm leading-snug transition-colors ${heading.level === 3 ? 'pl-3' : ''} ${activeHeadingId === heading.id ? 'zone-text font-bold' : 'zone-text-muted hover:zone-text'}`}
                      >
                        {heading.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            )}
          </aside>
        </div>
      </div>

      {/* Mobile Fixed Bottom Bar */}
      <div
        className="print-hidden fixed left-1/2 z-fixed flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-brand-dark/90 p-2 shadow-2xl shadow-brand-dark/30 lg:hidden"
        style={{ bottom: 'max(env(safe-area-inset-bottom), 1.5rem)' }}
      >
        <button
          onClick={handleShare}
          aria-label="Share article"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-transform active:scale-90"
        >
          {shareCopied ? (
            <Check size={20} aria-hidden="true" focusable="false" className="text-green-400" />
          ) : (
            <Share2 size={20} aria-hidden="true" focusable="false" />
          )}
        </button>
        <button
          onClick={handleBookmark}
          aria-label={bookmarked ? 'Remove saved article' : 'Save article'}
          aria-pressed={bookmarked}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-transform active:scale-90"
        >
          {bookmarked ? (
            <Check size={20} aria-hidden="true" focusable="false" className="text-green-400" />
          ) : (
            <Bookmark size={20} aria-hidden="true" focusable="false" />
          )}
        </button>
        <div className="mx-2 h-8 w-[1px] bg-white/20"></div>
        <Button variant="solid" asChild className="whitespace-nowrap transition-transform active:scale-95">
          <Link to="/contact">Consult Expert</Link>
        </Button>
      </div>

      <ReadingProgress />
    </div>
  );
};

export default InsightDetail;
