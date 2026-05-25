import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plus } from 'lucide-react';
import SEO from '../components/SEO';
import Reveal from '../components/Reveal';
import { PageHero } from '../components/hero';
import { FAQ_CATEGORIES, FAQS, FAQ_LAST_UPDATED } from '../constants';
import { markdownToHtml } from '../utils/markdownToHtml';
import { SITE_URL } from '../config/site';
import './route-styles.css';
import '../components/hero/PageHero.css';
import './FAQ.css';

const FAQ_CANONICAL_URL = `${SITE_URL}/faqs`;
const FAQ_OG_IMAGE = `${SITE_URL}/og-faq.png`;
const FAQ_TITLE = 'CA FAQs | Tax, GST, Audit - Sagar H R & Co., Mysuru';
const FAQ_DESCRIPTION =
  'Answers to 20+ questions on Income Tax, GST, TDS, audit, data security, and business setup from Mysuru-based Chartered Accountants. Updated for FY 2025-26.';

const ORDERED_CATEGORIES = FAQ_CATEGORIES.filter(({ label }) => FAQS.some((faq) => faq.category === label));
const FAQ_INDEX_BY_ID = new Map(FAQS.map((faq, index) => [faq.id, index]));

// Most recent per-FAQ review date, falling back to the shared constant.
const FAQ_PAGE_DATE_MODIFIED =
  FAQS.map((faq) => faq.lastUpdated)
    .filter((date): date is string => Boolean(date))
    .sort((left, right) => new Date(right).getTime() - new Date(left).getTime())[0] || FAQ_LAST_UPDATED;

/** Resolve a URL hash (`#question-id` or `#category-slug`) to a category slug. */
const resolveCategoryFromHash = (rawHash: string): string | null => {
  if (!rawHash) {
    return null;
  }
  const targetId = rawHash.slice(1);
  const matchingFaq = FAQS.find((faq) => faq.id === targetId);
  if (matchingFaq) {
    return FAQ_CATEGORIES.find((category) => category.label === matchingFaq.category)?.slug ?? null;
  }
  return ORDERED_CATEGORIES.some((category) => category.slug === targetId) ? targetId : null;
};

const scrollToTarget = (targetId: string, behavior: ScrollBehavior = 'auto') => {
  const target = document.getElementById(targetId);
  if (!target) {
    return;
  }
  target.scrollIntoView({ behavior, block: 'start' });
};

const FAQ: React.FC = () => {
  const { hash } = useLocation();
  const [activeId, setActiveId] = useState<string | null>(null);
  // FQ-02 / FQ-03: the active section is tracked by a scroll-spy
  // IntersectionObserver, not derived from the URL hash — `history.replaceState`
  // never fed the hash back into `useLocation`, so the old highlight was dead
  // on click. The hash still seeds the initial value for deep links.
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(
    () => resolveCategoryFromHash(hash) ?? ORDERED_CATEGORIES[0]?.slug ?? null,
  );
  // FQ-01: answer markup is mounted lazily — nothing answer-related is in the
  // DOM until a card is first opened. Once revealed it stays mounted so the
  // collapse animation (FQ-11) always has content to animate.
  const [revealedIds, setRevealedIds] = useState<Set<string>>(() => new Set());
  const headerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const groupedFaqs = useMemo(
    () =>
      ORDERED_CATEGORIES.map((category) => ({
        category: category.label,
        categoryId: category.slug,
        items: FAQS.filter((faq) => faq.category === category.label),
      })),
    [],
  );

  // FQ-08 / FQ-15: FAQ answers only use paragraphs and inline links, so they
  // render through the lightweight `markdownToHtml` helper (which escapes HTML
  // and sanitises URLs) instead of the full ReactMarkdown pipeline. The same
  // map feeds both the on-page answers and the FAQPage schema — one source.
  const answerHtmlById = useMemo(() => new Map(FAQS.map((faq) => [faq.id, markdownToHtml(faq.answer)])), []);

  const faqSchemaItems = useMemo(
    () =>
      FAQS.map((faq) => ({
        question: faq.question,
        answer: answerHtmlById.get(faq.id) ?? '',
        dateModified: faq.lastUpdated || FAQ_PAGE_DATE_MODIFIED,
      })),
    [answerHtmlById],
  );

  const faqPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${FAQ_CANONICAL_URL}#webpage`,
    url: FAQ_CANONICAL_URL,
    name: FAQ_TITLE,
    description: FAQ_DESCRIPTION,
    inLanguage: 'en-IN',
    dateModified: FAQ_PAGE_DATE_MODIFIED,
    // FQ-17: link the WebPage node to the FAQPage node emitted by <SEO />.
    mainEntity: { '@id': `${FAQ_CANONICAL_URL}#faqpage` },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['.faq-question', '.faq-answer'],
    },
  };

  const toggleAccordion = (faqId: string) => {
    setRevealedIds((prev) => (prev.has(faqId) ? prev : new Set(prev).add(faqId)));
    setActiveId((currentId) => (currentId === faqId ? null : faqId));
  };

  const handleCategoryJump = (event: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    event.preventDefault();

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      'matchMedia' in window &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Keep the URL shareable; the active highlight is driven by the scroll-spy.
    window.history.replaceState(null, '', `#${targetId}`);
    setActiveCategoryId(targetId);
    scrollToTarget(targetId, prefersReducedMotion ? 'auto' : 'smooth');
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, faqId: string) => {
    const currentIndex = FAQ_INDEX_BY_ID.get(faqId);
    if (currentIndex === undefined) {
      return;
    }

    const lastIndex = FAQS.length - 1;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      headerRefs.current[FAQS[Math.min(currentIndex + 1, lastIndex)]?.id || '']?.focus();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      headerRefs.current[FAQS[Math.max(currentIndex - 1, 0)]?.id || '']?.focus();
    } else if (event.key === 'Home') {
      event.preventDefault();
      headerRefs.current[FAQS[0]?.id || '']?.focus();
    } else if (event.key === 'End') {
      event.preventDefault();
      headerRefs.current[FAQS[lastIndex]?.id || '']?.focus();
    }
  };

  // Deep-link handling: open and scroll to a question, or scroll to a category.
  useEffect(() => {
    if (!hash) {
      return;
    }

    const targetId = hash.slice(1);
    const matchingFaq = FAQS.find((faq) => faq.id === targetId);

    if (matchingFaq) {
      setRevealedIds((prev) => (prev.has(matchingFaq.id) ? prev : new Set(prev).add(matchingFaq.id)));
      setActiveId(matchingFaq.id);
      scrollToTarget(matchingFaq.id);
      return;
    }

    scrollToTarget(targetId);
  }, [hash]);

  // FQ-03: scroll-spy. Marks the category whose section currently sits near
  // the top of the viewport as active, keeping both the sticky chip bar and
  // the desktop sidebar in sync as the user scrolls.
  useEffect(() => {
    const sections = ORDERED_CATEGORIES.map((category) => sectionRefs.current[category.slug]).filter(
      (element): element is HTMLElement => Boolean(element),
    );
    if (sections.length === 0) {
      return;
    }

    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const slug = entry.target.getAttribute('data-category');
          if (!slug) {
            return;
          }
          if (entry.isIntersecting) {
            visible.add(slug);
          } else {
            visible.delete(slug);
          }
        });
        const firstVisible = ORDERED_CATEGORIES.find((category) => visible.has(category.slug));
        if (firstVisible) {
          setActiveCategoryId(firstVisible.slug);
        }
      },
      { rootMargin: '-130px 0px -60% 0px', threshold: 0 },
    );

    sections.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-brand-bg selection:bg-brand-moss selection:text-white">
      <SEO
        title={FAQ_TITLE}
        description={FAQ_DESCRIPTION}
        canonicalUrl={FAQ_CANONICAL_URL}
        ogImage={FAQ_OG_IMAGE}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'FAQs', url: '/faqs' },
        ]}
        schema={faqPageSchema}
        faqs={faqSchemaItems}
      />

      <PageHero
        tag="FAQs"
        title={
          <>
            Common <em>Queries.</em>
          </>
        }
        description="Clear answers to your financial queries. From tax planning to compliance, we have got you covered."
      />

      <div className="px-4 py-20 md:px-6">
        <div className="container mx-auto max-w-6xl px-4">
          {/* Wrapper establishes the sticky containing block for the category
              nav — it must span the question grid for `sticky` to travel. */}
          <div>
            {/* FQ-04 / FQ-05 / FQ-B1: category nav for mobile + tablet only
                (the desktop sidebar takes over on lg+). Sticky so it stays
                reachable while scrolling, and frosted glass so it reads
                cleanly once question cards scroll beneath it. */}
            <nav
              aria-label="FAQ category jump links"
              className="glass-strong sticky top-28 z-sticky mb-12 rounded-3xl px-5 py-5 lg:hidden"
            >
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-[#5f594f]">Jump to a section</p>
              <ul className="no-scrollbar flex gap-3 overflow-x-auto py-1">
                {groupedFaqs.map(({ category, categoryId }) => (
                  <li key={categoryId} className="shrink-0">
                    <a
                      href={`#${categoryId}`}
                      onClick={(event) => handleCategoryJump(event, categoryId)}
                      aria-current={activeCategoryId === categoryId ? 'true' : undefined}
                      className={`inline-flex items-center whitespace-nowrap rounded-full border px-4 py-2 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-moss focus-visible:ring-offset-4 focus-visible:ring-offset-brand-bg ${
                        activeCategoryId === categoryId
                          ? 'border-brand-moss bg-brand-moss text-white'
                          : 'border-brand-border bg-brand-surface text-brand-dark hover:border-brand-moss hover:text-brand-moss'
                      }`}
                    >
                      {category}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10 xl:gap-14">
              <aside className="hidden lg:block">
                <div className="sticky top-[calc(var(--sticky-offset)+1rem)]">
                  <nav aria-label="FAQ section navigation" className="pr-4">
                    <p className="mb-5 text-xs font-bold uppercase tracking-widest text-[#5f594f]">Browse sections</p>
                    <ul className="space-y-2.5">
                      {groupedFaqs.map(({ category, categoryId }) => (
                        <li key={`side-${categoryId}`}>
                          <a
                            href={`#${categoryId}`}
                            onClick={(event) => handleCategoryJump(event, categoryId)}
                            aria-current={activeCategoryId === categoryId ? 'true' : undefined}
                            className={`block rounded-2xl border px-4 py-3 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-moss focus-visible:ring-offset-4 focus-visible:ring-offset-brand-bg ${
                              activeCategoryId === categoryId
                                ? 'border-brand-moss bg-brand-moss text-white shadow-lg shadow-brand-moss/20'
                                : 'border-brand-border/80 bg-brand-surface text-brand-dark hover:border-brand-moss/40 hover:text-brand-moss'
                            }`}
                          >
                            {category}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
              </aside>

              <div className="space-y-16">
                {groupedFaqs.map(({ category, categoryId, items }, catIdx) => (
                  // FQ-21: category sections use the shared Reveal component
                  // (scroll-triggered, reduced-motion aware) for consistency.
                  <Reveal key={categoryId} width="100%" delay={catIdx * 0.08}>
                    <section
                      ref={(node) => {
                        sectionRefs.current[categoryId] = node;
                      }}
                      data-category={categoryId}
                      aria-labelledby={categoryId}
                    >
                      <h2
                        id={categoryId}
                        className="mb-6 border-l-4 border-brand-moss bg-gradient-to-r from-brand-moss/5 to-transparent pl-2 font-heading text-2xl font-bold text-brand-dark"
                        style={{ scrollMarginTop: 'calc(var(--sticky-offset) + 6rem)' }}
                      >
                        {category}
                      </h2>
                      <div className="space-y-4">
                        {items.map((faq) => {
                          const isExpanded = activeId === faq.id;
                          const buttonId = `faq-button-${faq.id}`;
                          const panelId = `faq-panel-${faq.id}`;

                          return (
                            <div
                              key={faq.id}
                              id={faq.id}
                              className={`rounded-3xl border bg-brand-surface p-5 transition-[border-color,box-shadow] duration-300 md:p-8 ${
                                isExpanded
                                  ? 'border-brand-moss shadow-lg ring-1 ring-brand-moss/20'
                                  : 'border-brand-border hover:border-brand-moss/30 hover:shadow-lg'
                              }`}
                              style={{ scrollMarginTop: 'calc(var(--sticky-offset) + 6rem)' }}
                            >
                              <h3 className="m-0">
                                <button
                                  ref={(node) => {
                                    headerRefs.current[faq.id] = node;
                                  }}
                                  id={buttonId}
                                  type="button"
                                  aria-expanded={isExpanded}
                                  aria-controls={panelId}
                                  className="group w-full rounded-2xl text-left focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-moss focus-visible:ring-offset-4 focus-visible:ring-offset-brand-bg"
                                  onClick={() => toggleAccordion(faq.id)}
                                  onKeyDown={(event) => onKeyDown(event, faq.id)}
                                >
                                  <span className="flex w-full items-start justify-between gap-4 md:items-center">
                                    <span
                                      className={`faq-question text-balance break-words font-heading text-lg font-bold leading-tight transition-colors md:text-xl ${
                                        isExpanded ? 'text-brand-moss' : 'text-brand-dark'
                                      }`}
                                    >
                                      {faq.question}
                                    </span>
                                    <span
                                      aria-hidden="true"
                                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${
                                        isExpanded ? 'bg-brand-moss text-white' : 'bg-brand-bg text-brand-dark'
                                      }`}
                                    >
                                      <Plus
                                        size={20}
                                        className={`transition-transform duration-300 ${isExpanded ? 'rotate-45' : ''}`}
                                      />
                                    </span>
                                  </span>
                                </button>
                              </h3>

                              {/* FQ-11: a grid-rows 0fr->1fr transition gives a
                                  smooth height reveal. Reduced-motion users get
                                  an instant swap via the global override in
                                  index.css. FQ-06: no role="region" — 20 of them
                                  is landmark proliferation; aria-expanded on the
                                  button already carries the state. */}
                              <div
                                id={panelId}
                                className={`grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                                  isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                                }`}
                              >
                                <div className="min-h-0 overflow-hidden">
                                  {revealedIds.has(faq.id) && (
                                    <div
                                      className="faq-answer"
                                      // `inert` keeps a collapsed answer (and its
                                      // links) out of the tab order and a11y tree.
                                      inert={!isExpanded}
                                      // Safe: answers are static authored content
                                      // and markdownToHtml escapes HTML + sanitises
                                      // URLs before re-introducing whitelisted tags.
                                      dangerouslySetInnerHTML={{ __html: answerHtmlById.get(faq.id) ?? '' }}
                                    />
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-20 rounded-3xl border border-brand-border bg-brand-surface p-10 text-center shadow-sm">
            <Reveal width="100%" delay={0}>
              <h2 className="mb-4 font-heading text-3xl font-bold text-brand-dark">Still have questions?</h2>
            </Reveal>
            <Reveal width="100%" delay={0.08}>
              <p className="mb-8 text-lg font-medium text-brand-stone">
                If you can&apos;t find the answer you&apos;re looking for, please don&apos;t hesitate to reach out.
              </p>
            </Reveal>
            <Reveal delay={0.16}>
              <Link
                to="/contact"
                className="inline-block rounded-full bg-brand-dark px-8 py-4 font-bold text-white shadow-lg transition-colors duration-300 hover:bg-brand-moss"
              >
                Schedule a Consultation
              </Link>
            </Reveal>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
