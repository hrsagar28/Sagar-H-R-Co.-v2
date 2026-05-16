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
  <section
    id="values"
    aria-labelledby="values-heading"
    className="zone-bg zone-surface relative overflow-hidden px-4 py-24 md:px-6"
  >
    <div className="bg-noise absolute inset-0 opacity-[0.08]" aria-hidden="true"></div>
    <div className="container relative z-10 mx-auto max-w-7xl">
      <div className="flex flex-col items-start justify-between gap-16 md:flex-row">
        <div className="md:w-1/3">
          <span className="mb-4 block text-xs font-bold uppercase tracking-widest text-zone-accent">Our Values</span>
          <h2 id="values-heading" className="zone-text font-heading text-4xl font-bold leading-tight md:text-6xl">
            The standards we hold ourselves to.
          </h2>
        </div>
        <div className="zone-border grid grid-cols-1 gap-12 border-t pt-12 md:w-2/3 md:grid-cols-2">
          {values.map(({ icon: Icon, title, body }) => (
            <div key={title}>
              <h3 className="zone-text mb-4 flex items-center gap-3 text-xl font-bold">
                <Icon className="text-zone-accent" aria-hidden="true" focusable="false" /> {title}
              </h3>
              <p className="leading-relaxed text-zone-text-muted/90">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);
