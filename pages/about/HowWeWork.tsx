import React from 'react';

const workCards = [
  {
    title: 'Single point of contact',
    body: 'When you have a question, you call Sagar. When a document needs signing, Sagar signs it. The same person who understood the brief at the start is the one who closes it out.',
  },
  {
    title: 'Retainer or assignment',
    body: 'Most clients take an annual retainer covering tax, GST and ROC. We also accept stand-alone engagements - audits, due-diligence, one-off filings.',
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
        <span className="mb-4 block text-xs font-bold uppercase tracking-widest text-zone-accent">How We Work</span>
        <h2 id="how-we-work-heading" className="zone-text font-heading text-4xl font-bold leading-tight md:text-6xl">
          Direct, accountable, practical.
        </h2>
      </div>
      <ul role="list" className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {workCards.map((card) => (
          <li key={card.title} className="zone-surface zone-border rounded-bento border p-8 md:p-10">
            <h3 className="zone-text mb-4 font-heading text-2xl font-bold">{card.title}</h3>
            <p className="leading-relaxed text-zone-text-muted/90">{card.body}</p>
          </li>
        ))}
      </ul>
    </div>
  </section>
);
