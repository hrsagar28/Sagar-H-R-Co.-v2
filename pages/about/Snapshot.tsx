import React from 'react';
import { CONTACT_INFO } from '../../constants';
import { useCountUp } from '../../hooks/useCountUp';

type Stat = { kind: 'count'; label: string; value: string } | { kind: 'static'; label: string; value: string };

const parseCountValue = (value: string) => {
  const match = value.match(/^(\d+)(.*)$/);
  return {
    end: match ? Number(match[1]) : 0,
    suffix: match ? match[2] : value,
  };
};

const CountUpStat: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  const { end, suffix } = parseCountValue(value);
  const { count, ref } = useCountUp<HTMLDivElement>(end, 1.4);
  const finalValue = `${end.toLocaleString('en-IN')}${suffix}`;

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>}>
      <dt className="font-mono text-eyebrow uppercase tracking-[0.2em] text-zone-text-muted/80">{label}</dt>
      <dd className="mt-1 font-heading text-2xl text-zone-text">
        {/* Audit AB-04: the live count and a hidden copy of the final value
            share a single grid cell, so the cell is always sized to the
            final number and the count-up no longer reflows the row as
            digits are added. tabular-nums keeps digit advance-widths
            uniform while the value climbs. */}
        <span className="inline-grid tabular-nums">
          <span aria-hidden="true" className="col-start-1 row-start-1">
            {count.toLocaleString('en-IN')}
            {suffix}
          </span>
          <span aria-hidden="true" className="invisible col-start-1 row-start-1">
            {finalValue}
          </span>
        </span>
        <span className="sr-only">{finalValue}</span>
      </dd>
    </div>
  );
};

const StaticStat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <dt className="font-mono text-eyebrow uppercase tracking-[0.2em] text-zone-text-muted/80">{label}</dt>
    <dd className="mt-1 font-heading text-2xl text-zone-text">{value}</dd>
  </div>
);

const stats: Stat[] = [
  { kind: 'static', label: 'Established', value: CONTACT_INFO.stats.established },
  { kind: 'count', label: 'Engagements', value: CONTACT_INFO.stats.consultations },
  { kind: 'count', label: 'Industries', value: CONTACT_INFO.stats.industriesServed },
  { kind: 'static', label: 'Office', value: CONTACT_INFO.address.city },
];

export const Snapshot: React.FC = () => (
  <section id="snapshot" aria-labelledby="snapshot-heading" className="container mx-auto max-w-7xl px-4 pb-24 md:px-6">
    <h2 id="snapshot-heading" className="sr-only">
      Practice at a glance
    </h2>
    <div
      className="grid animate-fade-in-up grid-cols-1 items-end gap-12 lg:grid-cols-12"
      style={{ animationDelay: '0.2s' }}
    >
      <div className="lg:col-span-7">
        <div className="zone-border zone-surface relative overflow-hidden rounded-bento border p-8 md:p-12">
          <dl className="grid grid-cols-2 gap-x-8 gap-y-6">
            {stats.map((stat) =>
              stat.kind === 'count' ? (
                <CountUpStat key={stat.label} label={stat.label} value={stat.value} />
              ) : (
                <StaticStat key={stat.label} label={stat.label} value={stat.value} />
              ),
            )}
          </dl>
        </div>
      </div>
      <div className="pb-4 lg:col-span-5">
        <p className="mb-8 max-w-prose text-xl font-medium leading-relaxed text-zone-text-muted md:text-2xl">
          {CONTACT_INFO.name} is a Mysuru-based Chartered Accountancy practice for owner-led businesses, professionals,
          and growing teams.
        </p>
        <div className="zone-border flex flex-col gap-4 border-l pl-6">
          <p className="max-w-prose text-lg text-zone-text-muted/80">
            Compliance dates are monitored here, so returns are prepared ahead of time, not remembered after.
          </p>
        </div>
      </div>
    </div>
  </section>
);
