import React from 'react';
import { CONTACT_INFO } from '../../constants';
import { useCountUp } from '../../hooks/useCountUp';

const parseCountValue = (value: string) => {
  const match = value.match(/^(\d+)(.*)$/);
  return {
    end: match ? Number(match[1]) : 0,
    suffix: match ? match[2] : value,
  };
};

const CountUpStat: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  const { end, suffix } = parseCountValue(value);
  const { count, ref } = useCountUp(end, 1.4);

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>}>
      <dt className="text-eyebrow font-mono uppercase tracking-[0.2em] text-zone-text-muted/80">
        {label}
      </dt>
      <dd className="font-heading text-2xl mt-1 text-zone-text">
        {count.toLocaleString('en-IN')}
        {suffix}
      </dd>
    </div>
  );
};

export const Snapshot: React.FC = () => (
  <section className="container mx-auto max-w-7xl px-4 md:px-6 pb-24">
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
      <div className="lg:col-span-7">
        <div className="relative rounded-bento overflow-hidden border zone-border zone-surface p-8 md:p-12 shadow-2xl">
          <dl className="grid grid-cols-2 gap-x-8 gap-y-6">
            <CountUpStat label="Established" value={CONTACT_INFO.stats.established} />
            <CountUpStat label="Engagements" value={CONTACT_INFO.stats.consultations} />
            <CountUpStat label="Industries" value={CONTACT_INFO.stats.industriesServed} />
            <div>
              <dt className="text-eyebrow font-mono uppercase tracking-[0.2em] text-zone-text-muted/80">
                Office
              </dt>
              <dd className="font-heading text-2xl mt-1 text-zone-text">{CONTACT_INFO.address.city}</dd>
            </div>
          </dl>
        </div>
      </div>
      <div className="lg:col-span-5 pb-4">
        <p className="text-xl md:text-2xl text-zone-text-muted font-medium leading-relaxed mb-8 max-w-prose">
          {CONTACT_INFO.name} is a Mysuru-based Chartered Accountancy practice for owner-led businesses, professionals, and growing teams that need clear compliance ownership.
        </p>
        <div className="flex flex-col gap-4 border-l zone-border pl-6">
          <p className="text-zone-text-muted/80 text-lg max-w-prose">
            The firm keeps the practice intentionally direct: the person who understands the facts also signs the advice.
          </p>
        </div>
      </div>
    </div>
  </section>
);
