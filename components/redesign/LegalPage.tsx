import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useReducedMotion } from '../../hooks';
import { RD_LEGAL_UPDATED } from './content';
import { ChevronDown } from './icons';

export interface LegalSection {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface LegalPageProps {
  title: string;
  sections: LegalSection[];
}

const NARROW_QUERY = '(max-width: 900px)';
const UPDATED_LABEL = new Date(`${RD_LEGAL_UPDATED}T00:00:00`).toLocaleDateString('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

/** Two-column table used in the legal pages: what we collect, who sees it, how long we keep it. */
export const LegalTable: React.FC<{ rows: [string, React.ReactNode][] }> = ({ rows }) => (
  <table className="ltable">
    <tbody>
      {rows.map(([label, value]) => (
        <tr key={label}>
          <th scope="row">{label}</th>
          <td>{value}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

/** A name, a role, and contact lines set apart from the text. */
export const ContactCard: React.FC<{ name: string; position: string; lines: [string, React.ReactNode][] }> = ({
  name,
  position,
  lines,
}) => (
  <div className="officer">
    <p className="who">{name}</p>
    <p className="role">{position}</p>
    <dl>
      {lines.map(([label, value]) => (
        <React.Fragment key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </React.Fragment>
      ))}
    </dl>
  </div>
);

/**
 * Layout for the privacy policy, terms of service and disclaimer: a plain
 * header band with the title and the date the text last changed, then the
 * numbered sections beside a list of them. On phones the list becomes a
 * sticky "Section n of N" picker, the same control as on the FAQ page.
 */
const LegalPage: React.FC<LegalPageProps> = ({ title, sections }) => {
  const { hash } = useLocation();
  const prefersReducedMotion = useReducedMotion();
  const [activeId, setActiveId] = useState(() => {
    const target = hash.slice(1);
    return sections.some((section) => section.id === target) ? target : (sections[0]?.id ?? '');
  });
  const [pickerOpen, setPickerOpen] = useState(false);
  // Once the title has scrolled out of view, the label above the contents
  // (and the phone picker's) carries the page name instead, so the reader
  // still knows which document this is without the name showing twice.
  const [titleGone, setTitleGone] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const docRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const pickerButtonRef = useRef<HTMLButtonElement>(null);
  // Set while a jump is scrolling, so the scroll-spy doesn't flash through
  // every section on the way there.
  const jumpRef = useRef<string | null>(null);
  const jumpTimerRef = useRef(0);

  const activeIndex = Math.max(
    0,
    sections.findIndex((section) => section.id === activeId),
  );

  const jumpTo = (id: string) => {
    setPickerOpen(false);
    setActiveId(id);
    jumpRef.current = id;
    window.clearTimeout(jumpTimerRef.current);
    jumpTimerRef.current = window.setTimeout(() => {
      jumpRef.current = null;
    }, 1200);
    window.history.replaceState(window.history.state, '', `${window.location.pathname}${window.location.search}#${id}`);
    document.getElementById(id)?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
  };

  const sectionLink = (section: LegalSection, index: number, compact: boolean) => (
    <a
      href={`#${section.id}`}
      aria-current={section.id === sections[activeIndex]?.id ? 'true' : undefined}
      onClick={(event) => {
        event.preventDefault();
        jumpTo(section.id);
      }}
    >
      {compact ? (
        `${index + 1}. ${section.title}`
      ) : (
        <>
          <span className="tn">{index + 1}</span>
          <span>{section.title}</span>
        </>
      )}
    </a>
  );

  // A link to a section (/privacy#your-rights) scrolls there once the page
  // has rendered, after RouteHandler's scroll-to-top.
  useEffect(() => {
    const id = hash.slice(1);
    if (!id) {
      return;
    }
    const timer = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ block: 'start' });
    }, 60);
    return () => window.clearTimeout(timer);
  }, [hash]);

  // Scroll-spy: the current section is the last one whose heading has passed
  // a line near the top of the screen, and the last section at the very end.
  useEffect(() => {
    let rafId = 0;
    const compute = () => {
      rafId = 0;
      if (jumpRef.current) {
        return;
      }
      const elements = Array.from(docRef.current?.querySelectorAll<HTMLElement>('.lsec') ?? []);
      const last = elements[elements.length - 1];
      if (!last) {
        return;
      }
      const line = window.matchMedia(NARROW_QUERY).matches ? 210 : 180;
      let active = elements[0] ?? last;
      elements.forEach((element) => {
        if (element.getBoundingClientRect().top <= line) {
          active = element;
        }
      });
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (atBottom && last.getBoundingClientRect().top < window.innerHeight * 0.7) {
        active = last;
      }
      setActiveId(active.id);
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

  useEffect(() => {
    const titleEl = titleRef.current;
    if (!titleEl) {
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry) {
        setTitleGone(!entry.isIntersecting);
      }
    });
    observer.observe(titleEl);
    return () => observer.disconnect();
  }, []);

  // Close the phone picker on an outside click or Escape.
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

  return (
    <div className={`rd-page ${titleGone ? 'title-gone' : ''}`}>
      <div className="phead">
        <div className="hgrid lhero pad">
          <div>
            <h1 ref={titleRef} className="rise">
              {title}
            </h1>
            <p className="upd rise d1">
              Last updated <time dateTime={RD_LEGAL_UPDATED}>{UPDATED_LABEL}</time>
            </p>
          </div>
        </div>
      </div>

      <div className="ldoc pad">
        <nav className="toc" aria-label={`Sections of the ${title.toLowerCase()}`}>
          <p className="lbl tlab">
            <span className="t-on">On this page</span>
            <span className="t-name" aria-hidden="true">
              {title}
            </span>
          </p>
          <ol>
            {sections.map((section, index) => (
              <li key={section.id}>{sectionLink(section, index, false)}</li>
            ))}
          </ol>
        </nav>

        <div className="picker" ref={pickerRef} data-open={pickerOpen ? '' : undefined}>
          <button
            ref={pickerButtonRef}
            type="button"
            aria-expanded={pickerOpen}
            aria-controls="legal-picker-list"
            onClick={() => setPickerOpen((open) => !open)}
          >
            <span className="pl">
              <span className="lbl plab">
                <span className="p-on">
                  Section {activeIndex + 1} of {sections.length}
                </span>
                <span className="p-name" aria-hidden="true">
                  {title} · Section {activeIndex + 1} of {sections.length}
                </span>
              </span>
              <b>{sections[activeIndex]?.title}</b>
            </span>
            <span className="chev" aria-hidden="true">
              <ChevronDown />
            </span>
          </button>
          <ol id="legal-picker-list" hidden={!pickerOpen}>
            {sections.map((section, index) => (
              <li key={section.id}>{sectionLink(section, index, true)}</li>
            ))}
          </ol>
        </div>

        <div className="doc" ref={docRef}>
          {sections.map((section, index) => (
            <section key={section.id} id={section.id} className="lsec" aria-labelledby={`${section.id}-heading`}>
              <h2 id={`${section.id}-heading`}>
                <span className="n">{index + 1}</span>
                <span>{section.title}</span>
              </h2>
              {section.content}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LegalPage;
