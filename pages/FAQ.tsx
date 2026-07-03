import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Plus, ChevronDown, Check } from 'lucide-react';
import SEO from '../components/SEO';
import Reveal from '../components/Reveal';
import { PageHero } from '../components/hero';
import { FAQ_CATEGORIES, FAQS, FAQ_LAST_UPDATED } from '../constants';
import { markdownToHtml } from '../utils/markdownToHtml';
import { SITE_URL } from '../config/site';
import './route-styles.css';
import '../components/hero/PageHero.css';
// UX-1 / PERF-1: `.faq-answer` styling now lives globally in index.css so the
// home-page FAQ preview shares one source of truth (was pages/FAQ.css).

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

interface SectionPickerProps {
  sections: readonly { slug: string; label: string }[];
  activeSlug: string | null;
  onSelect: (slug: string) => void;
}

/**
 * Mobile / tablet section picker — a dropdown disclosure. The closed state is a
 * compact control (label + the section you're currently in, tracked by the
 * scroll-spy); opening it reveals every section at once. Replaces a
 * horizontally scrolling chip strip that read as a content card and only ever
 * showed one or two sections.
 */
const SectionPicker: React.FC<SectionPickerProps> = ({ sections, activeSlug, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = 'faq-section-picker-panel';

  const activeLabel = sections.find((section) => section.slug === activeSlug)?.label ?? sections[0]?.label ?? '';

  // Close the panel on an outside click or Escape.
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (slug: string) => {
    onSelect(slug);
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((open) => !open)}
        className="flex w-full items-center gap-3 rounded-2xl border border-brand-border bg-brand-surface px-5 py-3 text-left shadow-sm transition-[border-color,box-shadow] duration-200 hover:border-brand-moss/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-moss focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bg"
      >
        <span className="min-w-0 flex-1">
          <span className="block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-brand-moss">
            Jump to section
          </span>
          <span className="mt-0.5 block truncate font-heading text-base font-bold text-brand-dark">{activeLabel}</span>
        </span>
        <span
          aria-hidden="true"
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-bg text-brand-dark transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        >
          <ChevronDown size={18} />
        </span>
      </button>

      <div
        id={panelId}
        className={`absolute inset-x-0 top-full z-popover mt-2 origin-top overflow-hidden rounded-2xl border border-brand-border bg-brand-surface shadow-xl transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen
            ? 'visible translate-y-0 scale-100 opacity-100'
            : 'pointer-events-none invisible -translate-y-1 scale-95 opacity-0'
        }`}
      >
        {sections.map((section, index) => {
          const isActive = section.slug === activeSlug;
          return (
            <button
              key={section.slug}
              type="button"
              onClick={() => handleSelect(section.slug)}
              aria-current={isActive ? 'true' : undefined}
              className={`flex w-full items-center gap-3 px-5 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-moss ${
                isActive ? 'bg-brand-moss/10' : 'hover:bg-brand-bg'
              }`}
            >
              <span className={`font-mono text-xs font-medium ${isActive ? 'text-brand-moss' : 'text-brand-stone'}`}>
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className={`flex-1 text-sm font-bold ${isActive ? 'text-brand-moss' : 'text-brand-dark'}`}>
                {section.label}
              </span>
              {isActive && <Check size={16} aria-hidden="true" className="shrink-0 text-brand-moss" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const FAQ: React.FC = () => {
  const { hash } = useLocation();
  const navigate = useNavigate();
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
  // Set while a category-jump smooth-scroll is travelling. It pins the active
  // highlight to the clicked category so the scroll-spy doesn't light up every
  // category the scroll passes over on the way there.
  const jumpRef = useRef<{ slug: string; deadline: number } | null>(null);

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

  // Scroll to a category and pin the highlight to it until the smooth scroll
  // arrives, so the scroll-spy doesn't flash through every category in between.
  const jumpToCategory = (slug: string) => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      'matchMedia' in window &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    window.history.replaceState(null, '', `#${slug}`); // keep the URL shareable
    setActiveCategoryId(slug);
    jumpRef.current = { slug, deadline: Date.now() + 1500 };
    scrollToTarget(slug, prefersReducedMotion ? 'auto' : 'smooth');
  };

  // Desktop sidebar links are real anchors — cancel the native jump first.
  const handleCategoryJump = (event: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    event.preventDefault();
    jumpToCategory(targetId);
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

  // FQ-09: answers render from an HTML string (dangerouslySetInnerHTML), so
  // their internal links are plain <a> tags that would otherwise trigger a
  // full document reload. Delegate clicks here and route same-origin paths
  // through React Router instead. Modified clicks (open-in-new-tab etc.),
  // new-tab/download links, external URLs, mailto:/tel:, and in-page hash
  // jumps are all left to the browser's native behaviour.
  const handleAnswerNavigation = (event: React.MouseEvent<HTMLDivElement>) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const anchor = (event.target as HTMLElement).closest('a');
    if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) {
      return;
    }

    const url = new URL(anchor.href, window.location.href);
    if (url.origin !== window.location.origin) {
      return;
    }
    // Pure in-page hash jumps keep their native scroll behaviour.
    if (url.pathname === window.location.pathname && url.hash) {
      return;
    }

    event.preventDefault();
    navigate(`${url.pathname}${url.search}${url.hash}`);
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

  // FQ-03: scroll-spy. The active category is the last section whose top has
  // crossed a trigger line just below the fixed chrome — with a bottom-of-page
  // guard so the final category still wins when the page can't scroll its
  // heading all the way up to the line (the previous "first section touching a
  // band" heuristic mis-fired there). Driven by a passive, rAF-throttled
  // scroll listener; the initial value is seeded from the hash above.
  useEffect(() => {
    // A jumped-to heading lands at its `scrollMarginTop` (~224px) with the
    // index kicker just above it, so a trigger near 220px catches the jumped
    // section while staying clear of the next one.
    const TRIGGER_OFFSET = 220;

    const computeActive = () => {
      const sections = ORDERED_CATEGORIES.map((category) => sectionRefs.current[category.slug]).filter(
        (element): element is HTMLElement => Boolean(element),
      );
      const first = sections[0];
      const last = sections[sections.length - 1];
      if (!first || !last) {
        return;
      }

      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;

      let active = first;
      if (atBottom) {
        // The last section often can't be scrolled up to the trigger line;
        // once the page bottoms out it is unambiguously the active one.
        active = last;
      } else {
        sections.forEach((section) => {
          if (section.getBoundingClientRect().top <= TRIGGER_OFFSET) {
            active = section;
          }
        });
      }

      const slug = active.getAttribute('data-category');
      if (!slug) {
        return;
      }

      // While a category jump is animating, keep the highlight pinned to the
      // clicked category until the scroll reaches it (or the safety deadline
      // passes) — otherwise it flashes through every category scrolled past.
      const jump = jumpRef.current;
      if (jump) {
        if (slug === jump.slug || Date.now() > jump.deadline) {
          jumpRef.current = null;
        } else {
          return;
        }
      }

      setActiveCategoryId(slug);
    };

    let ticking = false;
    const onScroll = () => {
      if (ticking) {
        return;
      }
      ticking = true;
      window.requestAnimationFrame(() => {
        computeActive();
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
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
            {/* Mobile + tablet section picker (the desktop sidebar takes over
                on lg+). A dropdown rather than a chip strip: it reads clearly
                as a control, shows every section at once without horizontal
                scrolling, and its closed state doubles as a "you are here"
                indicator driven by the scroll-spy. Sticky so it stays
                reachable while scrolling the answers. */}
            <div className="sticky top-28 z-sticky mb-12 lg:hidden">
              <SectionPicker sections={ORDERED_CATEGORIES} activeSlug={activeCategoryId} onSelect={jumpToCategory} />
            </div>

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
                      {/* Ledger-index kicker — a leading-zero mono numeral
                          that echoes the numbered nav and the ledger identity
                          of an accountancy practice. aria-hidden so it stays
                          out of the h2's accessible name (which must match the
                          category label used by the nav and FAQ schema). */}
                      <div aria-hidden="true" className="mb-2 flex items-center gap-2.5">
                        <span className="font-mono text-xs font-medium tracking-[0.14em] text-brand-moss">
                          {String(catIdx + 1).padStart(2, '0')}
                        </span>
                        <span className="h-px w-5 bg-brand-moss/45" />
                      </div>
                      <h2
                        id={categoryId}
                        className="mb-6 font-heading text-2xl font-bold text-brand-dark"
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
                                      // FQ-09: keep internal links as SPA
                                      // navigations rather than full reloads.
                                      onClick={handleAnswerNavigation}
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
            <Reveal width="100%" delay={0.16}>
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
