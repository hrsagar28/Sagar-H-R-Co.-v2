import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { FAQS } from '../../constants/faq';
import Reveal from '../Reveal';

const DESKTOP_QUERY = '(min-width: 768px)';

const isDesktopViewport = () =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(DESKTOP_QUERY).matches;

interface FAQPreviewItemProps {
  faq: (typeof FAQS)[number];
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}

const FAQPreviewItem: React.FC<FAQPreviewItemProps> = ({ faq, index, isOpen, onToggle }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const cachedHeight = useRef<number | null>(null);
  const rafRef = useRef<number>(0);
  const panelId = `faq-preview-panel-${index}`;
  const buttonId = `faq-preview-button-${index}`;
  const supportsAutoHeight =
    typeof CSS !== 'undefined' &&
    typeof CSS.supports === 'function' &&
    CSS.supports('interpolate-size', 'allow-keywords');
  const panelStyle = supportsAutoHeight
    ? ({
        height: isOpen ? 'auto' : '0px',
        opacity: isOpen ? 1 : 0,
        interpolateSize: 'allow-keywords',
      } as React.CSSProperties)
    : undefined;

  useEffect(() => {
    const panel = panelRef.current;
    const content = contentRef.current;
    if (!panel || !content) return;

    window.cancelAnimationFrame(rafRef.current);

    if (supportsAutoHeight) {
      panel.style.height = isOpen ? 'auto' : '0px';
      panel.style.opacity = isOpen ? '1' : '0';
      return;
    }

    rafRef.current = window.requestAnimationFrame(() => {
      const measuredHeight = cachedHeight.current ?? content.scrollHeight;
      cachedHeight.current = measuredHeight;

      if (isOpen) {
        panel.style.height = `${measuredHeight}px`;
        panel.style.opacity = '1';
        return;
      }

      if (panel.style.height === 'auto') {
        panel.style.height = `${measuredHeight}px`;
      }

      void panel.offsetHeight;

      rafRef.current = window.requestAnimationFrame(() => {
        panel.style.height = '0px';
        panel.style.opacity = '0';
      });
    });

    return () => window.cancelAnimationFrame(rafRef.current);
  }, [isOpen, supportsAutoHeight]);

  useEffect(() => {
    if (supportsAutoHeight) return;

    const resetCachedHeight = () => {
      cachedHeight.current = null;
      if (!isOpen || !contentRef.current || !panelRef.current) return;

      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = window.requestAnimationFrame(() => {
        const measuredHeight = contentRef.current?.scrollHeight ?? 0;
        cachedHeight.current = measuredHeight;
        if (panelRef.current) {
          panelRef.current.style.height = `${measuredHeight}px`;
        }
      });
    };

    window.addEventListener('resize', resetCachedHeight, { passive: true });
    return () => window.removeEventListener('resize', resetCachedHeight);
  }, [isOpen, supportsAutoHeight]);

  const handleTransitionEnd = (event: React.TransitionEvent<HTMLDivElement>) => {
    if (supportsAutoHeight) return;
    if (event.propertyName !== 'height' || !isOpen || !panelRef.current) return;
    panelRef.current.style.height = 'auto';
  };

  return (
    <Reveal delay={index * 0.1} width="100%">
      <div
        className={`group/faq relative overflow-hidden rounded-[1.5rem] bg-white transition-[transform,opacity] duration-500 ${
          isOpen ? 'scale-[1.02]' : ''
        } `}
      >
        <div className="pointer-events-none absolute inset-0 rounded-[1.5rem] opacity-0 shadow-[inset_0_0_0_1px_rgba(26,77,46,1),0_20px_45px_-24px_rgba(26,77,46,0.45)] transition-opacity duration-300 group-hover/faq:opacity-60" />
        <div
          className={`pointer-events-none absolute inset-0 rounded-[1.5rem] shadow-[inset_0_0_0_1px_rgba(26,77,46,1),0_25px_50px_-24px_rgba(26,77,46,0.5)] transition-opacity duration-300 ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <div className="pointer-events-none absolute inset-0 rounded-[1.5rem] shadow-[inset_0_0_0_1px_rgba(223,217,204,1)]" />

        <button
          id={buttonId}
          onClick={onToggle}
          className="group relative z-10 flex w-full items-center justify-between gap-4 p-6 text-left focus:outline-none md:p-8"
          aria-expanded={isOpen}
          aria-controls={panelId}
        >
          <div className="flex items-center gap-4">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold transition-colors duration-300 ${
                isOpen
                  ? 'bg-brand-moss text-white'
                  : 'bg-brand-bg text-brand-stone group-hover:bg-brand-moss/10 group-hover:text-brand-moss'
              } `}
            >
              {String(index + 1).padStart(2, '0')}
            </div>
            <h3
              className={`font-heading text-lg font-bold transition-colors md:text-xl ${
                isOpen ? 'text-brand-moss' : 'text-brand-dark'
              }`}
            >
              {faq.question}
            </h3>
          </div>

          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-[inset_0_0_0_1px_currentColor] transition-[transform,opacity,background-color,color] duration-500 ${
              isOpen ? 'rotate-180 bg-brand-moss text-white' : 'text-brand-stone group-hover:text-brand-moss'
            } `}
          >
            <ChevronDown size={20} />
          </div>
        </button>

        <div
          id={panelId}
          role="region"
          aria-labelledby={buttonId}
          aria-hidden={!isOpen}
          ref={panelRef}
          className="relative z-10 h-0 overflow-hidden opacity-0 transition-[height,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={panelStyle}
          onTransitionEnd={handleTransitionEnd}
        >
          <div ref={contentRef} className="px-6 pb-8 pt-0 md:px-8">
            <div className="border-l-2 border-brand-moss/20 pl-14">
              <p className="text-lg font-medium leading-relaxed text-brand-stone">{faq.answer}</p>
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
};

const FAQPreview: React.FC = () => {
  // Get top 3 General FAQs
  const featuredFaqs = FAQS.filter((f) => f.category === 'General & Onboarding').slice(0, 3);
  const [openIndex, setOpenIndex] = useState<number | null>(() => (isDesktopViewport() ? 0 : null));

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

    const query = window.matchMedia(DESKTOP_QUERY);
    const handleChange = (event: MediaQueryListEvent) => {
      setOpenIndex((current) => (event.matches ? (current ?? 0) : null));
    };

    if (typeof query.addEventListener === 'function') {
      query.addEventListener('change', handleChange);
      return () => query.removeEventListener('change', handleChange);
    }

    query.addListener(handleChange);
    return () => query.removeListener(handleChange);
  }, []);

  return (
    <section className="relative bg-brand-bg px-4 py-32 md:px-6">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-16 text-center">
          <Reveal>
            <span className="mb-4 block text-xs font-bold uppercase tracking-widest text-brand-moss">FAQ</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="font-heading text-5xl font-bold text-brand-dark md:text-6xl">
              Quick <span className="font-serif font-normal italic text-brand-stone">answers.</span>
            </h2>
          </Reveal>
        </div>

        {/* FAQ Cards */}
        <div className="space-y-4">
          {featuredFaqs.map((faq, i) => (
            <FAQPreviewItem
              key={faq.question}
              faq={faq}
              index={i}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>

        {/* View All CTA */}
        <Reveal delay={0.4}>
          <div className="mt-12 text-center">
            <Link
              to="/faqs"
              className="group inline-flex items-center gap-3 rounded-full border border-brand-border bg-white px-8 py-4 font-bold text-brand-dark shadow-lg transition-all duration-300 hover:border-brand-moss hover:bg-brand-moss hover:text-white hover:shadow-xl"
            >
              View All FAQs
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default FAQPreview;
