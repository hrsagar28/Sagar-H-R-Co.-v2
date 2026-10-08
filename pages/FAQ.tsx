import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import { CONTACT_INFO, FAQ_CATEGORIES, FAQ_LAST_UPDATED, FAQ_LEGACY_IDS, FAQS } from '../constants';
import type { FAQItem } from '../types';
import { markdownToHtml } from '../utils/markdownToHtml';
import { routeAnswerClick } from '../utils/answerLinks';
import { SITE_URL } from '../config/site';
import { PAGE_META } from '../constants/pageMeta';
import { useReducedMotion } from '../hooks';
import { ArrowRight, ChevronDown, SearchIcon } from '../components/redesign/icons';

// 2026 redesign of /faqs. Rendered inside RedesignLayout, which supplies the
// top bar, footer and stylesheet (components/redesign/redesign.css).

const FAQ_CANONICAL_URL = `${SITE_URL}/faqs`;
const FAQ_OG_IMAGE = PAGE_META.faqs.ogImage;
const FAQ_TITLE = PAGE_META.faqs.title;
const FAQ_DESCRIPTION = PAGE_META.faqs.description;

const NARROW_QUERY = '(max-width: 900px)';
const PLACEHOLDER_WIDE = 'Search the questions, for example ‘notice’ or ‘GST returns’';
const PLACEHOLDER_NARROW = 'Search the questions';

// Shorter names for the topic buttons where a section title runs long.
const TOPIC_LABELS: Record<string, string> = {
  'business-gst-compliance': 'Company law and compliance',
};

interface Entry extends FAQItem {
  slug: string;
  plain: string;
  questionLower: string;
  answerLower: string;
}

const toPlain = (markdown: string) =>
  markdown.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\*\*([^*]+)\*\*/g, '$1');

const SECTIONS = FAQ_CATEGORIES.map((category) => ({
  slug: category.slug,
  label: category.label,
  description: category.description,
  items: FAQS.filter((faq) => faq.category === category.label),
})).filter((section) => section.items.length > 0);

const SECTION_SLUGS = new Set<string>(SECTIONS.map((section) => section.slug));

const ENTRIES = new Map<string, Entry>(
  SECTIONS.flatMap((section) =>
    section.items.map((faq): [string, Entry] => {
      const plain = toPlain(faq.answer);
      return [
        faq.id,
        {
          ...faq,
          slug: section.slug,
          plain,
          questionLower: faq.question.toLowerCase(),
          answerLower: plain.toLowerCase(),
        },
      ];
    }),
  ),
);

// FQ-08 / FQ-15: answers use only paragraphs and inline links, so they render
// through the lightweight `markdownToHtml` helper (which escapes HTML and
// sanitises URLs). The same map feeds the on-page answers and the FAQPage
// schema — one source.
const ANSWER_HTML = new Map(FAQS.map((faq) => [faq.id, markdownToHtml(faq.answer)]));

// Most recent per-FAQ review date, falling back to the shared constant.
const FAQ_PAGE_DATE_MODIFIED =
  FAQS.map((faq) => faq.lastUpdated)
    .filter((date): date is string => Boolean(date))
    .sort((left, right) => new Date(right).getTime() - new Date(left).getTime())[0] || FAQ_LAST_UPDATED;

const FAQ_SCHEMA_ITEMS = FAQS.map((faq) => ({
  question: faq.question,
  answer: ANSWER_HTML.get(faq.id) ?? '',
  dateModified: faq.lastUpdated || FAQ_PAGE_DATE_MODIFIED,
}));

const FAQ_PAGE_SCHEMA = {
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
    cssSelector: ['.rd-question', '.rd-answer'],
  },
};

type HashTarget = { kind: 'question'; id: string } | { kind: 'section'; slug: string } | null;

/** Resolve `#question-id`, a retired question id, or `#section-slug`. */
const resolveHash = (hash: string): HashTarget => {
  if (!hash) {
    return null;
  }
  let id = hash.slice(1);
  try {
    id = decodeURIComponent(id);
  } catch {
    // keep the raw fragment
  }
  if (ENTRIES.has(id)) {
    return { kind: 'question', id };
  }
  const successor = Object.prototype.hasOwnProperty.call(FAQ_LEGACY_IDS, id) ? FAQ_LEGACY_IDS[id] : undefined;
  if (successor && ENTRIES.has(successor)) {
    return { kind: 'question', id: successor };
  }
  return SECTION_SLUGS.has(id) ? { kind: 'section', slug: id } : null;
};

const sectionOfTarget = (target: HashTarget) => {
  if (!target) {
    return SECTIONS[0]?.slug ?? '';
  }
  return target.kind === 'section' ? target.slug : (ENTRIES.get(target.id)?.slug ?? '');
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const questionWord = (count: number) => (count === 1 ? 'question' : 'questions');

/** Wrap every match of `pattern` (which has one capturing group) in <mark>. */
const highlight = (text: string, pattern: RegExp | null): React.ReactNode => {
  if (!pattern) {
    return text;
  }
  return text.split(pattern).map((part, index) => (index % 2 === 1 ? <mark key={index}>{part}</mark> : part));
};

/** A short extract of the answer around a search term the question lacks. */
const snippetFor = (text: string, term: string, pattern: RegExp): React.ReactNode => {
  const at = text.toLowerCase().indexOf(term);
  let start = Math.max(0, at - 60);
  let end = Math.min(text.length, at + term.length + 90);
  if (start > 0) {
    const space = text.indexOf(' ', start);
    if (space > -1 && space < at) {
      start = space + 1;
    }
  }
  if (end < text.length) {
    const space = text.lastIndexOf(' ', end);
    if (space > at + term.length) {
      end = space;
    }
  }
  return (
    <>
      {start > 0 ? '… ' : ''}
      {highlight(text.slice(start, end), pattern)}
      {end < text.length ? ' …' : ''}
    </>
  );
};

const addTo = (id: string) => (previous: Set<string>) => (previous.has(id) ? previous : new Set(previous).add(id));

const FAQ: React.FC = () => {
  const { hash } = useLocation();
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState('all');
  // Several answers can be open at once. FQ-01: answer markup is mounted
  // lazily — nothing answer-related is in the DOM until a question is first
  // opened — and then stays mounted so the collapse can animate (FQ-11).
  const [openIds, setOpenIds] = useState<Set<string>>(() => {
    const target = resolveHash(hash);
    return new Set(target?.kind === 'question' ? [target.id] : []);
  });
  const [revealedIds, setRevealedIds] = useState<Set<string>>(() => new Set(openIds));
  const [activeSlug, setActiveSlug] = useState(() => sectionOfTarget(resolveHash(hash)));
  const [pickerOpen, setPickerOpen] = useState(false);
  const [narrow, setNarrow] = useState(() => window.matchMedia(NARROW_QUERY).matches);

  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const pickerButtonRef = useRef<HTMLButtonElement>(null);
  // Set while a section jump is scrolling, so the scroll-spy doesn't flash
  // through every section on the way there.
  const jumpRef = useRef<string | null>(null);
  const jumpTimerRef = useRef(0);

  const search = useMemo(() => {
    const raw = query.trim();
    const terms = raw
      .toLowerCase()
      .split(/\s+/)
      .filter((term) => term.length > 1 || /\d/.test(term));
    const pattern = terms.length ? new RegExp(`(${terms.map(escapeRegExp).join('|')})`, 'gi') : null;
    const matches: Record<string, number> = {};
    const shown = new Set<string>();
    ENTRIES.forEach((entry) => {
      const hit = terms.every((term) => entry.questionLower.includes(term) || entry.answerLower.includes(term));
      if (!hit) {
        return;
      }
      matches[entry.slug] = (matches[entry.slug] ?? 0) + 1;
      if (topic === 'all' || topic === entry.slug) {
        shown.add(entry.id);
      }
    });
    const allMatches = Object.values(matches).reduce((sum, count) => sum + count, 0);
    return { raw, terms, pattern, matches, shown, allMatches };
  }, [query, topic]);

  const total = search.shown.size;
  const visibleSections = SECTIONS.filter((section) => section.items.some((faq) => search.shown.has(faq.id)));

  // A hash that changes after mount (back/forward, a link into this page)
  // opens its question here, during render, rather than in an effect.
  const [seenHash, setSeenHash] = useState(hash);
  if (hash !== seenHash) {
    setSeenHash(hash);
    const target = resolveHash(hash);
    if (target) {
      setActiveSlug(sectionOfTarget(target));
    }
    if (target?.kind === 'question') {
      if (!search.shown.has(target.id)) {
        setQuery('');
        setTopic('all');
      }
      setRevealedIds(addTo(target.id));
      setOpenIds(addTo(target.id));
    }
  }

  const scrollBehavior: ScrollBehavior = prefersReducedMotion ? 'auto' : 'smooth';

  // Keep the address shareable without a router navigation. FQ-02: the
  // router's own state is passed through so back/forward keep working.
  const replaceHash = (value: string) => {
    window.history.replaceState(
      window.history.state,
      '',
      `${window.location.pathname}${window.location.search}#${value}`,
    );
  };

  // Audit PRINT-01: printing mounts and opens every answer first (they are
  // mounted lazily, FQ-01), so the printed page carries the questions and
  // their answers; afterwards the questions the reader had open are restored.
  const openBeforePrintRef = useRef<Set<string> | null>(null);
  useEffect(() => {
    const revealAll = () => {
      setOpenIds((previous) => {
        openBeforePrintRef.current = previous;
        return new Set(FAQS.map((faq) => faq.id));
      });
      setRevealedIds(new Set(FAQS.map((faq) => faq.id)));
    };
    const restore = () => {
      const previous = openBeforePrintRef.current;
      openBeforePrintRef.current = null;
      if (previous) setOpenIds(previous);
    };
    window.addEventListener('beforeprint', revealAll);
    window.addEventListener('afterprint', restore);
    return () => {
      window.removeEventListener('beforeprint', revealAll);
      window.removeEventListener('afterprint', restore);
    };
  }, []);

  const toggleQuestion = (id: string) => {
    setRevealedIds(addTo(id));
    setOpenIds((previous) => {
      const next = new Set(previous);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const jumpToSection = (slug: string) => {
    setPickerOpen(false);
    setActiveSlug(slug);
    jumpRef.current = slug;
    window.clearTimeout(jumpTimerRef.current);
    jumpTimerRef.current = window.setTimeout(() => {
      jumpRef.current = null;
    }, 1500);
    replaceHash(slug);
    document.getElementById(slug)?.scrollIntoView({ behavior: scrollBehavior, block: 'start' });
  };

  const onQuestionKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      return;
    }
    const buttons = Array.from(listRef.current?.querySelectorAll<HTMLButtonElement>('.qi:not([hidden]) .qb') ?? []);
    const index = buttons.indexOf(event.currentTarget);
    const last = buttons.length - 1;
    const next =
      event.key === 'ArrowDown'
        ? Math.min(index + 1, last)
        : event.key === 'ArrowUp'
          ? Math.max(index - 1, 0)
          : event.key === 'Home'
            ? 0
            : last;
    event.preventDefault();
    buttons[next]?.focus();
  };

  const onAnswerClick = (event: React.MouseEvent<HTMLDivElement>) => routeAnswerClick(event, navigate);

  const onSearchFocus = () => {
    if (!window.matchMedia(NARROW_QUERY).matches) {
      return;
    }
    // On phones, bring the search box up so the keyboard doesn't hide results.
    window.setTimeout(() => {
      const input = searchRef.current;
      if (!input) {
        return;
      }
      const top = input.getBoundingClientRect().top + window.scrollY - 24;
      if (window.scrollY < top) {
        window.scrollTo({ top, behavior: scrollBehavior });
      }
    }, 250);
  };

  // Scroll to a deep-linked question or section once it has rendered. Runs
  // after RouteHandler's scroll-to-top and its focus of #main-content.
  useEffect(() => {
    const target = resolveHash(hash);
    if (!target) {
      return;
    }
    const timer = window.setTimeout(() => {
      const id = target.kind === 'question' ? target.id : target.slug;
      document.getElementById(id)?.scrollIntoView({ behavior: 'auto', block: 'start' });
      if (target.kind === 'question') {
        document.getElementById(`faq-q-${id}`)?.focus({ preventScroll: true });
      }
    }, 60);
    return () => window.clearTimeout(timer);
  }, [hash]);

  // Shorter placeholder where the box is narrow.
  useEffect(() => {
    const media = window.matchMedia(NARROW_QUERY);
    const onChange = (event: MediaQueryListEvent) => setNarrow(event.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  // Pressing "/" anywhere outside a field jumps to the search box.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      const target = event.target as HTMLElement | null;
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) {
        return;
      }
      event.preventDefault();
      searchRef.current?.focus();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  // FQ-03: scroll-spy for the phone section picker. The active section is the
  // last visible one whose top has crossed a line near the top of the screen,
  // with a bottom-of-page guard so the final section can still win.
  useEffect(() => {
    let rafId = 0;
    const compute = () => {
      rafId = 0;
      const sections = Array.from(listRef.current?.querySelectorAll<HTMLElement>('.sec:not([hidden])') ?? []);
      const last = sections[sections.length - 1];
      if (!last) {
        return;
      }
      const line = window.matchMedia(NARROW_QUERY).matches ? 120 : 200;
      let active = sections[0] ?? last;
      sections.forEach((section) => {
        if (section.getBoundingClientRect().top <= line) {
          active = section;
        }
      });
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (atBottom && last.getBoundingClientRect().top < window.innerHeight * 0.6) {
        active = last;
      }
      // A section picked from the picker stays current until its jump has
      // settled, even if the page bottoms out with a later section in view.
      if (jumpRef.current) {
        return;
      }
      setActiveSlug(active.id);
    };
    const onScroll = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(compute);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(jumpTimerRef.current);
    };
  }, []);

  // Close the section picker on an outside click or Escape.
  useEffect(() => {
    if (!pickerOpen) {
      return;
    }
    const onPointerDown = (event: MouseEvent) => {
      if (!pickerRef.current?.contains(event.target as Node)) {
        setPickerOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPickerOpen(false);
        pickerButtonRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [pickerOpen]);

  const topicLabel = SECTIONS.find((section) => section.slug === topic)?.label ?? '';
  const where = topic === 'all' ? '' : ` in ${topicLabel}`;
  let status = '';
  if (search.pattern && total) {
    status = `${total} ${questionWord(total)}${where} ${total === 1 ? 'matches' : 'match'} “${search.raw}”.`;
  } else if (!search.pattern && topic !== 'all') {
    status = `Showing ${total} ${questionWord(total)} on ${topicLabel}.`;
  }
  const announcement =
    search.pattern || topic !== 'all' ? (total ? `${total} ${questionWord(total)} shown` : 'No questions found') : '';

  const pickerSections = visibleSections.length ? visibleSections : SECTIONS;
  const pickerIndex = Math.max(
    0,
    pickerSections.findIndex((section) => section.slug === activeSlug),
  );
  const pickerCurrent = pickerSections[pickerIndex];

  return (
    <div className="rd-page">
      <SEO
        title={FAQ_TITLE}
        description={FAQ_DESCRIPTION}
        canonicalUrl={FAQ_CANONICAL_URL}
        ogImage={FAQ_OG_IMAGE}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'FAQs', url: '/faqs' },
        ]}
        schema={FAQ_PAGE_SCHEMA}
        faqs={FAQ_SCHEMA_ITEMS}
      />

      <div className="phead">
        <div className="grain" aria-hidden="true" />
        <div className="hgrid solo pad">
          <div>
            <h1 className="rise">Frequently asked questions</h1>
            <p className="hsub rise d1">
              What clients ask us most, from GST and income tax to notices, company filings and trusts. If your question
              isn’t here, call or email us.
            </p>
          </div>
        </div>
      </div>

      <div className="pad">
        <div className="seam panel spanel">
          <div className="srow" role="search">
            <label htmlFor="faq-search" className="vh">
              Search the FAQs
            </label>
            <SearchIcon />
            <input
              ref={searchRef}
              id="faq-search"
              type="search"
              value={query}
              placeholder={narrow ? PLACEHOLDER_NARROW : PLACEHOLDER_WIDE}
              autoComplete="off"
              spellCheck={false}
              enterKeyHint="search"
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape' && query) {
                  event.preventDefault();
                  setQuery('');
                }
              }}
              onFocus={onSearchFocus}
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
          <div className="topics" role="group" aria-label="Show questions on">
            <button type="button" className="topic" aria-pressed={topic === 'all'} onClick={() => setTopic('all')}>
              <span>All topics</span>
              {search.pattern && <span className="c">{search.allMatches}</span>}
            </button>
            {SECTIONS.map((section) => {
              const count = search.matches[section.slug] ?? 0;
              return (
                <button
                  key={section.slug}
                  type="button"
                  className={`topic ${search.pattern && count === 0 ? 'empty' : ''}`}
                  aria-pressed={topic === section.slug}
                  onClick={() => setTopic(section.slug)}
                >
                  <span>{TOPIC_LABELS[section.slug] ?? section.label}</span>
                  {search.pattern && <span className="c">{count}</span>}
                </button>
              );
            })}
          </div>
          {status && (
            <p className="sstatus">
              {status}
              {topic !== 'all' && (
                <button type="button" className="link-btn" onClick={() => setTopic('all')}>
                  Show all topics
                </button>
              )}
            </p>
          )}
        </div>
      </div>

      <div className="faqlist pad" ref={listRef}>
        <div className="picker" ref={pickerRef} data-open={pickerOpen ? '' : undefined}>
          <button
            ref={pickerButtonRef}
            type="button"
            aria-expanded={pickerOpen}
            aria-controls="faq-picker-list"
            onClick={() => setPickerOpen((open) => !open)}
          >
            <span className="pl">
              <span className="lbl">
                Section {pickerIndex + 1} of {pickerSections.length}
              </span>
              <b>{pickerCurrent?.label}</b>
            </span>
            <span className="chev" aria-hidden="true">
              <ChevronDown />
            </span>
          </button>
          <ol id="faq-picker-list" hidden={!pickerOpen}>
            {pickerSections.map((section) => (
              <li key={section.slug}>
                <a
                  href={`#${section.slug}`}
                  aria-current={section.slug === pickerCurrent?.slug ? 'true' : undefined}
                  onClick={(event) => {
                    event.preventDefault();
                    jumpToSection(section.slug);
                  }}
                >
                  {section.label}
                </a>
              </li>
            ))}
          </ol>
        </div>

        <p className="vh" aria-live="polite">
          {announcement}
        </p>

        {SECTIONS.map((section) => (
          <section
            key={section.slug}
            id={section.slug}
            className="sec"
            aria-labelledby={`${section.slug}-heading`}
            hidden={!visibleSections.includes(section)}
          >
            <div className="sec-h">
              <h2 id={`${section.slug}-heading`}>{section.label}</h2>
              <p className="desc">{section.description}</p>
            </div>
            <div className="qlist">
              {section.items.map((faq) => {
                const entry = ENTRIES.get(faq.id);
                const open = openIds.has(faq.id);
                const missing = search.terms.find((term) => !entry?.questionLower.includes(term));
                return (
                  <div
                    key={faq.id}
                    id={faq.id}
                    className={`qi ${open ? 'open' : ''}`}
                    hidden={!search.shown.has(faq.id)}
                  >
                    <h3>
                      <button
                        className="qb"
                        type="button"
                        id={`faq-q-${faq.id}`}
                        aria-expanded={open}
                        aria-controls={`faq-a-${faq.id}`}
                        onClick={() => toggleQuestion(faq.id)}
                        onKeyDown={onQuestionKeyDown}
                      >
                        <span className="q rd-question">{highlight(faq.question, search.pattern)}</span>
                        <span className="x" aria-hidden="true" />
                      </button>
                    </h3>
                    {search.pattern && missing && entry && (
                      <p className="snip">{snippetFor(entry.plain, missing, search.pattern)}</p>
                    )}
                    {/* FQ-11: a grid-rows 0fr -> 1fr transition reveals the
                        answer smoothly. FQ-06: no role="region" — two dozen of
                        them is landmark noise; aria-expanded carries the state. */}
                    <div className="ans" id={`faq-a-${faq.id}`}>
                      <div>
                        {revealedIds.has(faq.id) && (
                          <div
                            className="rd-answer"
                            // `inert` keeps a closed answer and its links out of
                            // the tab order and the accessibility tree.
                            inert={!open}
                            onClick={onAnswerClick}
                            // Safe: authored content; markdownToHtml escapes HTML
                            // and sanitises URLs before adding whitelisted tags.
                            dangerouslySetInnerHTML={{ __html: ANSWER_HTML.get(faq.id) ?? '' }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        {total === 0 && (
          <div className="tail">
            <span />
            <div className="nores">
              <h2>
                No questions{where} match “{search.raw}”.
              </h2>
              <p>Send it to us and we’ll answer it directly. We’ll put your question in the message for you.</p>
              {topic !== 'all' && (
                <p>
                  <button type="button" className="link-btn" onClick={() => setTopic('all')}>
                    Search all topics instead
                  </button>
                </p>
              )}
              <Link className="btn" to="/contact#write" state={{ faqQuestion: search.raw }}>
                <span>Ask us this question</span>
                <ArrowRight />
              </Link>
            </div>
          </div>
        )}

        <div className="tail">
          <span />
          <p className="still">
            Still have a question? Call <a href={`tel:${CONTACT_INFO.phone.value}`}>{CONTACT_INFO.phone.display}</a> or
            email <a href={`mailto:${CONTACT_INFO.email}`}>{CONTACT_INFO.email}</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
