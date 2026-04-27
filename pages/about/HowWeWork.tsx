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
  <section id="how-we-work" aria-labelledby="how-we-work-heading" className="py-24 px-4 md:px-6 zone-bg">
    <div className="container mx-auto max-w-7xl">
      <div className="mb-12 max-w-3xl">
        <span className="text-zone-accent font-bold tracking-widest uppercase text-xs mb-4 block">How We Work</span>
        <h2 id="how-we-work-heading" className="text-4xl md:text-6xl font-heading font-bold zone-text leading-tight">Direct, accountable, practical.</h2>
      </div>
      <ul role="list" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {workCards.map((card) => (
          <li key={card.title} className="zone-surface rounded-bento border zone-border p-8 md:p-10">
            <h3 className="text-2xl font-heading font-bold zone-text mb-4">{card.title}</h3>
            <p className="text-zone-text-muted/90 leading-relaxed">{card.body}</p>
          </li>
        ))}
      </ul>
    </div>
  </section>
);
