import React from 'react';

const workCards = [
  {
    title: 'Single point of contact',
    body: 'The proprietor leads every engagement - quotes, working papers, certificates, and the call you make at 7 PM. No relationship managers, no junior hand-offs.',
  },
  {
    title: 'Retainer or assignment',
    body: 'Most clients take an annual retainer covering tax, GST and ROC. We also accept stand-alone engagements - audits, due-diligence, one-off filings.',
  },
  {
    title: 'Working from Mysuru, India-wide',
    body: 'Filings, e-assessments and ITAT representations are handled remotely; physical attendance is offered across Karnataka and to ICAI-member panels nationwide.',
  },
];

export const HowWeWork: React.FC = () => (
  <section className="py-24 px-4 md:px-6 zone-bg">
    <div className="container mx-auto max-w-7xl">
      <div className="mb-12 max-w-3xl">
        <span className="text-zone-accent font-bold tracking-widest uppercase text-xs mb-4 block">How We Work</span>
        <h2 className="text-4xl md:text-6xl font-heading font-bold zone-text leading-tight">Direct, accountable, practical.</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {workCards.map((card) => (
          <article key={card.title} className="zone-surface rounded-bento border zone-border p-8 md:p-10">
            <h3 className="text-2xl font-heading font-bold zone-text mb-4">{card.title}</h3>
            <p className="text-zone-text-muted/90 leading-relaxed">{card.body}</p>
          </article>
        ))}
      </div>
    </div>
  </section>
);
