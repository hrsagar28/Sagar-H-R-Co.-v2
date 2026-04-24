import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plus } from 'lucide-react';
import MarkdownRenderer from '../components/MarkdownRenderer';
import SEO from '../components/SEO';
import { PageHero } from '../components/hero';
import { FAQ_CATEGORIES, FAQS } from '../constants';
import { markdownToHtml } from '../utils/markdownToHtml';

const DEFAULT_FAQ_DATE_MODIFIED = '2026-04-24';
const FAQ_CANONICAL_URL = 'https://casagar.co.in/faqs';
const FAQ_OG_IMAGE = 'https://casagar.co.in/og-faq.png';
const FAQ_TITLE = 'CA FAQs | Tax, GST, Audit - Sagar H R & Co., Mysuru';
const FAQ_DESCRIPTION =
  'Answers to 20+ questions on Income Tax, GST, TDS, audit, data security, and business setup from Mysuru-based Chartered Accountants. Updated for FY 2025-26.';
const ENABLE_CARD_CONTENT_VISIBILITY = FAQS.length > 20;
const ORDERED_CATEGORIES = FAQ_CATEGORIES.filter(({ label }) => FAQS.some((faq) => faq.category === label));
const FAQ_INDEX_BY_ID = new Map(FAQS.map((faq, index) => [faq.id, index]));
const FAQ_PAGE_DATE_MODIFIED =
  FAQS.map((faq) => faq.lastUpdated)
    .filter((date): date is string => Boolean(date))
    .sort((left, right) => new Date(right).getTime() - new Date(left).getTime())[0] || DEFAULT_FAQ_DATE_MODIFIED;

const FAQ: React.FC = () => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const headerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const { hash } = useLocation();

  const groupedFaqs = useMemo(
    () =>
      ORDERED_CATEGORIES.map((category) => ({
        category: category.label,
        categoryId: category.slug,
        items: FAQS.filter((faq) => faq.category === category.label),
      })),
    []
  );

  const faqSchemaItems = useMemo(
    () =>
      FAQS.map((faq) => ({
        question: faq.question,
        answer: markdownToHtml(faq.answer),
        dateModified: faq.lastUpdated || FAQ_PAGE_DATE_MODIFIED,
      })),
    []
  );

  const faqPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${FAQ_CANONICAL_URL}#webpage`,
    url: FAQ_CANONICAL_URL,
    name: FAQ_TITLE,
    description: FAQ_DESCRIPTION,
    dateModified: FAQ_PAGE_DATE_MODIFIED,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['.faq-question', '.faq-answer'],
    },
  };

  const activeCategoryId = useMemo(() => {
    if (!hash) {
      return null;
    }

    const targetId = hash.slice(1);
    const matchingFaq = FAQS.find((faq) => faq.id === targetId);
    if (matchingFaq) {
      return FAQ_CATEGORIES.find((category) => category.label === matchingFaq.category)?.slug || null;
    }

    return groupedFaqs.some(({ categoryId }) => categoryId === targetId) ? targetId : null;
  }, [groupedFaqs, hash]);

  const toggleAccordion = (faqId: string) => {
    setActiveId((currentId) => (currentId === faqId ? null : faqId));
  };

  const scrollToTarget = (targetId: string, behavior: ScrollBehavior = 'auto') => {
    const target = document.getElementById(targetId);
    if (!target) {
      return;
    }

    target.scrollIntoView({ behavior, block: 'start' });
  };

  const handleCategoryJump = (event: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    event.preventDefault();

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      'matchMedia' in window &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.history.replaceState(null, '', `#${targetId}`);
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
      headerRefs.current[FAQS[Math.min(currentIndex + 1, lastIndex)].id]?.focus();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      headerRefs.current[FAQS[Math.max(currentIndex - 1, 0)].id]?.focus();
    } else if (event.key === 'Home') {
      event.preventDefault();
      headerRefs.current[FAQS[0].id]?.focus();
    } else if (event.key === 'End') {
      event.preventDefault();
      headerRefs.current[FAQS[lastIndex].id]?.focus();
    }
  };

  useEffect(() => {
    if (!hash) {
      return;
    }

    const targetId = hash.slice(1);
    const matchingFaq = FAQS.find((faq) => faq.id === targetId);

    if (matchingFaq) {
      setActiveId(matchingFaq.id);
      scrollToTarget(matchingFaq.id);
      return;
    }

    scrollToTarget(targetId);
  }, [hash]);

  return (
    <div className="bg-brand-bg min-h-screen selection:bg-brand-moss selection:text-white">
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

      <div className="py-20 px-4 md:px-6">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-12">
            <nav
              aria-label="FAQ category jump links"
              className="rounded-[1.75rem] border border-brand-border/80 bg-brand-bg/95 px-5 py-5 shadow-lg shadow-brand-dark/5 backdrop-blur supports-[backdrop-filter]:bg-brand-bg/85"
            >
              <p className="text-xs font-bold uppercase tracking-widest text-brand-stone mb-4">Jump to a section</p>
              <ul className="flex flex-wrap gap-3">
                {groupedFaqs.map(({ category, categoryId }) => (
                  <li key={categoryId}>
                    <a
                      href={`#${categoryId}`}
                      onClick={(event) => handleCategoryJump(event, categoryId)}
                      className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-moss focus-visible:ring-offset-4 focus-visible:ring-offset-brand-bg ${
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
          </div>

          <div className="lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10 xl:gap-14">
            <aside className="hidden lg:block">
              <div className="sticky top-[calc(var(--sticky-offset)+1rem)]">
                <nav aria-label="FAQ section navigation" className="pr-4">
                  <p className="mb-5 text-xs font-bold uppercase tracking-widest text-brand-stone">Browse sections</p>
                  <ul className="space-y-2.5">
                    {groupedFaqs.map(({ category, categoryId }) => (
                      <li key={`side-${categoryId}`}>
                        <a
                          href={`#${categoryId}`}
                          onClick={(event) => handleCategoryJump(event, categoryId)}
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
                <section
                  key={categoryId}
                  className="animate-fade-in-up"
                  aria-labelledby={categoryId}
                  style={{ animationDelay: `${catIdx * 80}ms` }}
                >
                  <h2
                    id={categoryId}
                    className="text-2xl font-heading font-bold text-brand-dark mb-6 pl-2 border-l-4 border-brand-moss bg-gradient-to-r from-brand-moss/5 to-transparent"
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
                          className={`bg-brand-surface border rounded-3xl p-5 md:p-8 transition-all duration-300 ${
                            isExpanded
                              ? 'border-brand-moss shadow-lg ring-1 ring-brand-moss/20'
                              : 'border-brand-border hover:border-brand-moss/30 hover:shadow-lg'
                          }`}
                          style={{
                            scrollMarginTop: 'calc(var(--sticky-offset) + 6rem)',
                            ...(ENABLE_CARD_CONTENT_VISIBILITY
                              ? {
                                  contentVisibility: 'auto',
                                  containIntrinsicSize: '200px 400px',
                                }
                              : {}),
                          }}
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
                              <span className="flex w-full justify-between gap-4 items-start md:items-center">
                                <span
                                  className={`faq-question text-lg md:text-xl font-heading font-bold leading-tight transition-colors text-balance break-words ${
                                    isExpanded ? 'text-brand-moss' : 'text-brand-dark'
                                  }`}
                                >
                                  {faq.question}
                                </span>
                                <span
                                  aria-hidden="true"
                                  className={`shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 ${
                                    isExpanded ? 'bg-brand-moss text-white' : 'bg-brand-bg text-brand-dark'
                                  }`}
                                >
                                  <Plus size={20} className={`transition-transform duration-300 ${isExpanded ? 'rotate-45' : ''}`} />
                                </span>
                              </span>
                            </button>
                          </h3>
                          <div
                            id={panelId}
                            role="region"
                            aria-labelledby={buttonId}
                            hidden={!isExpanded}
                            className="mt-6"
                          >
                            <MarkdownRenderer
                              content={faq.answer}
                              className="faq-answer [&_p]:mb-4 [&_p]:text-base [&_p]:font-medium [&_p]:leading-relaxed [&_p]:text-brand-stone md:[&_p]:text-lg [&_p:last-child]:mb-0 [&_ul]:my-4 [&_ol]:my-4 [&_ul]:space-y-2 [&_ol]:space-y-2 [&_ul]:pl-0 [&_li]:text-base md:[&_li]:text-lg [&_li]:leading-relaxed [&_li]:font-medium [&_li]:text-brand-stone [&_a]:break-words [&_a]:font-bold"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          </div>

          <div className="mt-20 text-center bg-brand-surface border border-brand-border p-10 rounded-[2.5rem] shadow-sm">
            <h2 className="text-3xl font-heading font-bold text-brand-dark mb-4">Still have questions?</h2>
            <p className="text-brand-stone mb-8 font-medium text-lg">
              If you can&apos;t find the answer you&apos;re looking for, please don&apos;t hesitate to reach out.
            </p>
            <Link
              to="/contact"
              className="inline-block px-8 py-4 bg-brand-dark text-white font-bold rounded-full hover:bg-brand-moss transition-all duration-300 shadow-lg"
            >
              Schedule a Consultation
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
