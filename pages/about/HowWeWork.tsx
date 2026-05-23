import React from 'react';
import Reveal from '../../components/Reveal';

const workCards = [
  {
    title: 'Reviewed before filing',
    body: 'Every return and filing is reviewed against the underlying records before it is submitted, so errors are caught here rather than surfacing later as a notice or revision.',
  },
  {
    title: 'Retainer or assignment',
    body: 'Engage the practice the way that suits you: an annual retainer covering tax, GST and ROC, or a stand-alone assignment such as an audit, a due-diligence review, or a one-off filing.',
  },
  {
    title: 'Working from Mysuru, India-wide',
    body: "The office is in Mysuru, but geography hasn't been a constraint since assessments and hearings moved online. Clients across India are taken on for remote work; Karnataka clients have the option of in-person meetings.",
  },
];

export const HowWeWork: React.FC = () => (
  <section id="how-we-work" aria-labelledby="how-we-work-heading" className="zone-bg px-4 py-24 md:px-6">
    <div className="container mx-auto max-w-7xl">
      <div className="mb-12 max-w-3xl">
        <Reveal delay={0}>
          <span className="mb-4 block text-xs font-bold uppercase tracking-widest text-zone-accent">How We Work</span>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 id="how-we-work-heading" className="zone-text font-heading text-4xl font-bold leading-tight md:text-6xl">
            Direct, accountable, practical.
          </h2>
        </Reveal>
      </div>
      <ul role="list" className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {workCards.map((card, i) => (
          /* Audit AB-01: <li> is the direct child of <ul>; Reveal's wrapper
             <div> now sits inside the list item, keeping the list markup
             valid and the list semantics intact. */
          <li key={card.title} className="zone-surface zone-border rounded-bento border p-8 md:p-10">
            <Reveal width="100%" delay={Math.min(i * 0.06, 0.3)}>
              <h3 className="zone-text mb-4 font-heading text-2xl font-bold">{card.title}</h3>
              <p className="leading-relaxed text-zone-text-muted/90">{card.body}</p>
            </Reveal>
          </li>
        ))}
      </ul>
    </div>
  </section>
);
