import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FAQS } from '../../constants';
import { markdownToHtml } from '../../utils/markdownToHtml';

// The questions marked `featuredOnHome` in constants/faq.ts, answered in
// place. The rows are the FAQ page's own (.qi, .qb, .ans in redesign.css), and
// the wording is read from the same list, so the two pages cannot disagree.

const HOME_FAQS = FAQS.filter((faq) => faq.featuredOnHome === true).map((faq) => ({
  id: faq.id,
  question: faq.question,
  // Safe: authored content; markdownToHtml escapes HTML and sanitises URLs
  // before adding whitelisted tags.
  html: markdownToHtml(faq.answer),
}));

const HomeFaqs: React.FC = () => {
  const [openIds, setOpenIds] = useState<ReadonlySet<string>>(() => new Set());
  const navigate = useNavigate();

  const toggle = (id: string) =>
    setOpenIds((current) => {
      const next = new Set(current);
      if (!next.delete(id)) next.add(id);
      return next;
    });

  // A link written into an answer goes through the router when it points to a
  // page of this site, as on the FAQ page; anything else is left to the browser.
  const onAnswerClick = (event: React.MouseEvent<HTMLDivElement>) => {
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
    event.preventDefault();
    navigate(`${url.pathname}${url.search}${url.hash}`);
  };

  return (
    <div className="qlist hfaq">
      {HOME_FAQS.map((faq) => {
        const open = openIds.has(faq.id);
        return (
          <div key={faq.id} className={`qi ${open ? 'open' : ''}`}>
            <h3>
              <button
                className="qb"
                type="button"
                id={`home-faq-q-${faq.id}`}
                aria-expanded={open}
                aria-controls={`home-faq-a-${faq.id}`}
                onClick={() => toggle(faq.id)}
              >
                <span className="q">{faq.question}</span>
                <span className="x" aria-hidden="true" />
              </button>
            </h3>
            <div className="ans" id={`home-faq-a-${faq.id}`}>
              <div>
                <div
                  className="rd-answer"
                  // `inert` keeps a closed answer and its links out of the tab
                  // order and the accessibility tree.
                  inert={!open}
                  onClick={onAnswerClick}
                  dangerouslySetInnerHTML={{ __html: faq.html }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default HomeFaqs;
