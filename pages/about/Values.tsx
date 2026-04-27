import React from 'react';
import { BookOpen, ShieldCheck, Target, TrendingUp } from 'lucide-react';

const values = [
  {
    icon: Target,
    title: 'Accuracy',
    body: 'Working papers, reconciliations, and filings are reviewed with care so advice is rooted in records, not assumptions.',
  },
  {
    icon: ShieldCheck,
    title: 'Integrity',
    body: 'Engagements are handled within ICAI ethics, independence requirements, and the confidentiality expected from a professional adviser.',
  },
  {
    icon: TrendingUp,
    title: 'Objectivity',
    body: 'Recommendations are framed around facts, law, and the client context, even when the answer is less convenient.',
  },
  {
    icon: BookOpen,
    title: 'Knowledge',
    body: 'The practice keeps current with direct tax, GST, audit, and company law changes that affect owner-led businesses.',
  },
];

export const Values: React.FC = () => (
  <section id="values" aria-labelledby="values-heading" className="py-24 px-4 md:px-6 zone-bg zone-surface relative overflow-hidden">
    <div className="absolute inset-0 bg-noise opacity-[0.08]" aria-hidden="true"></div>
    <div className="container mx-auto max-w-7xl relative z-10">
      <div className="flex flex-col md:flex-row justify-between items-start gap-16">
        <div className="md:w-1/3">
          <span className="text-zone-accent font-bold tracking-widest uppercase text-xs mb-4 block">Our Values</span>
          <h2 id="values-heading" className="text-4xl md:text-6xl font-heading font-bold zone-text leading-tight">
            Professional <br /> Ethics.
          </h2>
        </div>
        <div className="md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-12 border-t zone-border pt-12">
          {values.map(({ icon: Icon, title, body }) => (
            <div key={title}>
              <h3 className="text-xl font-bold zone-text mb-4 flex items-center gap-3">
                <Icon className="text-zone-accent" aria-hidden="true" focusable="false" /> {title}
              </h3>
              <p className="text-zone-text-muted/90 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);
