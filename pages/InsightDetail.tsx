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
  <span className="relative group">
    {React.cloneElement(children, {
      'aria-describedby': id,
      onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => {
        children.props.onKeyDown?.(event);
        if (event.key === 'Escape') {
          event.currentTarget.blur();
        }
      }
    })}
    <span id={id} role="tooltip" className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-brand-dark text-white text-xs rounded opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-tooltip">
      {label}
    </span>
  </span>
);

const BodySkeleton = () => (
  <div className="article-wrapper animate-pulse">
    <div className="h-6 bg-brand-stone/10 rounded w-11/12 mb-5"></div>
    <div className="h-6 bg-brand-stone/10 rounded w-full mb-5"></div>
    <div className="h-6 bg-brand-stone/10 rounded w-10/12 mb-10"></div>
    <div className="h-40 bg-brand-stone/10 rounded-2xl mb-10"></div>
    <div className="h-8 bg-brand-stone/10 rounded w-7/12 mb-6"></div>
    <div className="h-6 bg-brand-stone/10 rounded w-full mb-5"></div>
    <div className="h-6 bg-brand-stone/10 rounded w-9/12"></div>
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
      className={`hidden lg:block fixed bottom-24 right-6 md:right-10 z-fixed transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] print-hidden ${scrollProgress > 0.05 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}
    >
      <button
        onClick={scrollToTop}
        className="relative w-14 h-14 zone-surface rounded-full shadow-xl flex items-center justify-center group hover:scale-110 transition-transform"
        aria-label="Scroll to top"
        title={`${Math.round(scrollProgress * 100)}% Read`}
      >
        <svg className="w-full h-full -rotate-90" viewBox="0 0 60 60" aria-hidden="true">
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
        <ArrowUp size={20} aria-hidden="true" focusable="false" className="absolute zone-text group-hover:text-brand-moss transition-colors" />
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
  const { content: mdContent, loading: bodyLoading, error: fetchError, refetch } = useArticleBody(slug, Boolean(insight));
  const articleTitleId = 'article-title';
  const articleHeadings = useMemo(() => mdContent ? extractMarkdownHeadings(mdContent) : [], [mdContent]);

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
    setActiveHeadingId(articleHeadings[0].id);

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => left.boundingClientRect.top - right.boundingClientRect.top)[0];

        if (visibleEntry) setActiveHeadingId(visibleEntry.target.id);
      },
      { rootMargin: '-20% 0px -65% 0px', threshold: [0, 1] }
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
        logger.log("Share cancelled or failed", err);
      }
    } else {
      if (await copyTextToClipboard(window.location.href)) {
        setShareCopied(true);
        setLiveMessage('Article link copied to clipboard.');
        setTimeout(() => setShareCopied(false), SHARE_RESET_DELAY);
      } else {
        logger.error("Clipboard write failed", { url: window.location.href });
        setLiveMessage('Unable to copy article link.');
      }
    }
  };

  const handleBookmark = () => {
    if (!slug) return;
    try {
      const saved = JSON.parse(localStorage.getItem('savedInsights') || '[]') as string[];
      const nextSaved = saved.includes(slug) ? saved.filter(item => item !== slug) : [...saved, slug];
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
      .filter(i => i.id !== insight.id)
      .map(item => {
        const tagOverlap = (item.tags || []).filter(tag => currentTags.has(tag)).length;
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
      <div data-zone="editorial-paper" className="zone-bg min-h-screen pt-40 pb-24 px-4">
        <SEO
          title="Article Not Found | Sagar H R & Co."
          description="We couldn't find this article. Browse the latest tax, audit, GST, and business advisory insights from Sagar H R & Co."
          noindex
        />
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block px-4 py-1 rounded-full border zone-border zone-surface text-xs font-bold uppercase tracking-widest zone-text-muted mb-8">
            Error 404
          </span>
          <h1 className="text-4xl md:text-6xl font-heading font-bold zone-text mb-6">Article Not Found</h1>
          <p className="text-lg zone-text-muted mb-10 max-w-2xl mx-auto">
            We couldn't find this article. It may have been moved, retired, or never existed.
          </p>
          <Link to="/insights" className="inline-flex px-6 py-3 bg-brand-moss text-white font-bold rounded-full hover:bg-brand-dark transition-all">
            Back to Insights
          </Link>

          {recentInsights.length > 0 && (
            <div className="mt-16 text-left">
              <h2 className="text-2xl font-heading font-bold zone-text mb-6 text-center">Recent Insights</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {recentInsights.map(item => (
                  <Link key={item.id} to={`/insights/${item.slug}`} aria-label={item.title} className="zone-surface rounded-2xl p-5 border zone-border hover:border-brand-moss transition-colors">
                    <span className="text-[10px] font-bold uppercase tracking-widest zone-text-muted">{item.category}</span>
                    <h3 className="mt-3 text-lg font-heading font-bold zone-text">{item.title}</h3>
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
    <div data-zone="editorial-paper" className="zone-bg min-h-screen relative selection:bg-brand-moss selection:text-white">
      <SEO 
        title={`${insight.title} | Insights`}
        description={insight.summary}
        ogType="article"
        ogImage={insight.image ? `${SITE_URL}${insight.image}` : undefined}
        alternates={[
          { type: 'application/rss+xml', title: `${CONTACT_INFO.name} RSS Feed`, href: '/rss.xml' },
          { type: 'application/atom+xml', title: `${CONTACT_INFO.name} Atom Feed`, href: '/atom.xml' }
        ]}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Insights', url: '/insights' },
          { name: insight.title, url: `/insights/${insight.slug}` }
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
          wordCount: insight.wordCount
        }}
      />
      
      <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">{liveMessage}</span>

      <div className="relative z-base pt-32 md:pt-48 pb-32 lg:pb-24 px-4 md:px-8 max-w-[1200px] mx-auto">
        
        {/* Editorial Header */}
        <header className="text-center max-w-4xl mx-auto mb-16 md:mb-24 motion-safe:animate-fade-in-up">
          <div className="flex justify-center mb-10">
            <Breadcrumbs 
              items={[
                { label: 'Insights', path: '/insights' },
                { label: insight.title }
              ]} 
              className="justify-center"
            />
          </div>
          
          <div className="mb-8">
            <span className="font-mono text-eyebrow uppercase tracking-[0.2em] zone-text-muted">
              {insight.category}
            </span>
          </div>

          <h1 ref={titleRef} id={articleTitleId} tabIndex={-1} className="text-display-md md:text-display-lg font-heading zone-text mb-8 leading-[1.15] focus:outline-none">
            {insight.title}
          </h1>

          <div className="flex flex-nowrap justify-start md:justify-center items-center gap-6 overflow-x-auto no-scrollbar min-w-0 zone-text-muted border-t border-b zone-border/50 py-6 mx-auto max-w-2xl font-mono text-xs uppercase tracking-[0.1em]">
            <time dateTime={toISODate(insight.date)} className="flex items-center gap-2 shrink-0">{formatLongDate(insight.date)}</time>
            <span className="w-1 h-1 rounded-full bg-brand-stone opacity-40 shrink-0" aria-hidden="true"></span>
            <span className="flex items-center gap-2 shrink-0">{insight.readTime}</span>
            <span className="w-1 h-1 rounded-full bg-brand-stone opacity-40 shrink-0" aria-hidden="true"></span>
            <span className="zone-text font-semibold shrink-0">BY {insight.author.toUpperCase()}</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative">
            
            {/* Left Sidebar - Floating Actions (Desktop) */}
            <aside className="hidden lg:block lg:col-span-2 relative print-hidden">
              <div className="sticky top-40 flex flex-col gap-6 items-center">
                 <div className="flex flex-col gap-3 p-2 bg-white/80 backdrop-blur-md border zone-border/50 rounded-2xl shadow-lg shadow-brand-dark/5">
                    {/* Share Button */}
                    <Tooltip id="tip-share-article" label={shareCopied ? 'Copied Link' : 'Share'}>
                      <button 
                        onClick={handleShare}
                        aria-label="Share article"
                        className="w-12 h-12 rounded-xl flex items-center justify-center zone-text-muted hover:text-brand-moss hover:zone-bg transition-all"
                      >
                        {shareCopied ? <Check size={20} aria-hidden="true" focusable="false" className="text-green-600" /> : <Share2 size={20} aria-hidden="true" focusable="false" />}
                      </button>
                    </Tooltip>

                    <Tooltip id="tip-save-article" label={bookmarked ? 'Saved' : 'Save'}>
                      <button 
                        onClick={handleBookmark}
                        aria-label={bookmarked ? 'Remove saved article' : 'Save article'}
                        aria-pressed={bookmarked}
                        className="w-12 h-12 rounded-xl flex items-center justify-center zone-text-muted hover:text-brand-moss hover:zone-bg transition-all"
                      >
                        {bookmarked ? <Check size={20} aria-hidden="true" focusable="false" className="text-green-600" /> : <Bookmark size={20} aria-hidden="true" focusable="false" />}
                      </button>
                    </Tooltip>

                    <Tooltip id="tip-print-article" label="Print">
                      <button 
                        onClick={handlePrint}
                        aria-label="Print article"
                        className="w-12 h-12 rounded-xl flex items-center justify-center zone-text-muted hover:text-brand-moss hover:zone-bg transition-all"
                      >
                        <Printer size={20} aria-hidden="true" focusable="false" />
                      </button>
                    </Tooltip>
                    
                    <div className="w-full h-[1px] bg-brand-border/50 my-1"></div>
                    
                    <a 
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(insight.title)}&url=${encodeURIComponent(window.location.href)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Share on X"
                      className="w-12 h-12 rounded-xl flex items-center justify-center zone-text-muted hover:text-black hover:bg-black/5 transition-all"
                    >
                      <Twitter size={20} aria-hidden="true" focusable="false" />
                    </a>
                    <a 
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Share on LinkedIn"
                      className="w-12 h-12 rounded-xl flex items-center justify-center zone-text-muted hover:text-[#0A66C2] hover:bg-[#0A66C2]/10 transition-all"
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
                    <div className="article-wrapper text-center py-16 px-6 border zone-border rounded-2xl zone-surface">
                      <h2 className="text-3xl font-heading font-bold zone-text mb-4">Content Not Found</h2>
                      <p className="zone-text-muted mb-8">We couldn't load this article. It may have been moved, retired, or never existed.</p>
                      <button type="button" onClick={refetch} className="px-6 py-2 bg-brand-moss text-white font-bold rounded-full hover:bg-brand-dark transition-all">
                        Retry
                      </button>
                    </div>
                  )}
                  {mdContent && !fetchError && (
                    <Suspense fallback={<BodySkeleton />}>
                      <MarkdownRenderer content={mdContent} />
                    </Suspense>
                  )}
              </article>

              {/* Footer Author Card */}
              <div className="mt-24 pt-12 border-t zone-border/60">
                  <div className="zone-bg/50 p-8 md:p-10 rounded-[2rem] border zone-border/50 flex flex-col md:flex-row items-center md:items-start gap-8 text-center md:text-left">
                    <div className="w-20 h-20 bg-brand-dark text-white rounded-full flex items-center justify-center font-serif font-bold text-3xl shadow-xl shadow-brand-dark/20 shrink-0">
                        {insight.author.replace('CA ', '').charAt(0)}
                    </div>
                    <div className="flex-grow">
                        <p className="text-xs font-bold uppercase tracking-widest text-brand-moss mb-2">About the Author</p>
                        <h3 className="text-2xl font-heading font-bold zone-text mb-3">{insight.author}</h3>
                        <p className="zone-text-muted text-base leading-relaxed mb-6">
                          Senior Partner at {CONTACT_INFO.name}, specializing in corporate taxation, audit assurance, and strategic business advisory with over a decade of experience.
                        </p>
                        <Link to="/contact" className="inline-block px-6 py-2 bg-white border zone-border zone-text font-bold rounded-full hover:bg-brand-dark hover:text-white transition-all text-sm shadow-sm">
                          Book Consultation
                        </Link>
                    </div>
                  </div>
              </div>

              {/* Related Insights Section */}
              {relatedInsights.length > 0 && (
                <section className="mt-24 pt-16 border-t zone-border">
                   <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
                      <div>
                        <span className="text-brand-moss font-bold tracking-widest uppercase text-xs mb-2 block">Further Reading</span>
                        <h3 className="text-3xl font-heading font-bold zone-text">Related Insights</h3>
                      </div>
                      <Link to="/insights" className="text-sm font-bold uppercase tracking-wider zone-text-muted hover:text-brand-moss transition-colors flex items-center gap-2 group">
                         View All <ArrowUpRight size={16} aria-hidden="true" focusable="false" className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </Link>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {relatedInsights.map((item, index) => (
                        <Link 
                          to={`/insights/${item.slug}`} 
                          key={item.id}
                          aria-label={item.title}
                          className="group zone-surface rounded-[1.5rem] p-6 border zone-border hover:border-brand-moss hover:shadow-lg transition-all duration-300 flex flex-col h-full motion-safe:animate-fade-in-up"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                           <span className="inline-block px-3 py-1 zone-bg rounded-full zone-text-muted text-[10px] font-bold uppercase tracking-widest mb-4 w-fit group-hover:bg-brand-moss group-hover:text-white transition-colors">
                             {item.category}
                           </span>
                           <h4 className="text-lg font-heading font-bold zone-text mb-3 group-hover:text-brand-moss transition-colors line-clamp-2">
                             {item.title}
                           </h4>
                           <div className="mt-auto flex items-center justify-between pt-4 border-t zone-border/50 text-xs font-semibold zone-text">
                              <time dateTime={toISODate(item.date)}>{formatArchiveDate(item.date)}</time>
                              <div className="w-8 h-8 rounded-full zone-bg flex items-center justify-center group-hover:bg-brand-moss group-hover:text-white transition-all">
                                 <ArrowUpRight size={14} aria-hidden="true" focusable="false" />
                              </div>
                           </div>
                        </Link>
                      ))}
                   </div>
                </section>
              )}
            </main>

            <aside className="hidden lg:block lg:col-span-2 print-hidden" aria-label="Table of contents">
              {articleHeadings.length > 0 && (
                <nav className="sticky top-40 max-h-[calc(100vh-12rem)] overflow-y-auto pr-2">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] zone-text-muted mb-4">On this page</p>
                  <ol className="space-y-3 border-l zone-border pl-4">
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
        className="lg:hidden fixed left-1/2 -translate-x-1/2 z-fixed flex items-center gap-2 p-2 bg-brand-dark/90 rounded-full shadow-2xl shadow-brand-dark/30 border border-white/10 print-hidden"
        style={{ bottom: 'max(env(safe-area-inset-bottom), 1.5rem)' }}
      >
        <button onClick={handleShare} aria-label="Share article" className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white active:scale-90 transition-transform">
            {shareCopied ? <Check size={20} aria-hidden="true" focusable="false" className="text-green-400" /> : <Share2 size={20} aria-hidden="true" focusable="false" />}
        </button>
        <button onClick={handleBookmark} aria-label={bookmarked ? 'Remove saved article' : 'Save article'} aria-pressed={bookmarked} className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white active:scale-90 transition-transform">
            {bookmarked ? <Check size={20} aria-hidden="true" focusable="false" className="text-green-400" /> : <Bookmark size={20} aria-hidden="true" focusable="false" />}
        </button>
        <div className="w-[1px] h-8 bg-white/20 mx-2"></div>
        <Button variant="solid" asChild className="whitespace-nowrap active:scale-95 transition-transform"><Link to="/contact">
            Consult Expert
        </Link></Button>
      </div>
      
      <ReadingProgress />
    </div>
  );
};

export default InsightDetail;

