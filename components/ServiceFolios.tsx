import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { SERVICES } from '../constants';
import { SERVICE_HERO_META } from '../constants/serviceHeroMeta';
import Reveal from './Reveal';
import { Eyebrow } from './ui/Eyebrow';
import { staggerDelay } from '../utils/stagger';

/**
 * ServiceFolios — the services section as a grid of "practice files" on a
 * dark band: eight portrait gradient cards + a consultation card.
 *
 * This is the "D4" direction. ServiceBento (the original) and ServiceLedger
 * (D2) are both still in the repo; Services.tsx picks one via SERVICES_LAYOUT.
 *
 * Tonal system — four balanced families, two services each, each a distinct
 * gradient. The display order interleaves them into a light/dark
 * checkerboard so the cards pop against the dark section:
 *   Tax ........... GST, Income Tax            — deep moss
 *   Assurance ..... Audit, Company Law         — cool cream
 *   Accounts ...... Bookkeeping, Payroll       — warm paper
 *   Counsel ....... Advisory, Litigation       — ink
 *
 * Audit findings folded in: SV-05 (icons used), SV-09 (semantic <ul>),
 * SV-10 (shared <Eyebrow>), SV-04 (DOM order = visual order — no CSS
 * `order`), SV-24 (data-driven from a small tone map, not a per-card map).
 *
 * The folio "scope chips" are the real Scope field from serviceHeroMeta
 * split on its separator — no invented data. Copy is placeholder for CA
 * Sagar to finalise.
 */

type ToneKey = 'moss' | 'cream' | 'paper' | 'ink' | 'cta';

interface Tone {
  surface: string;
  isDark: boolean;
  title: string;
  body: string;
  muted: string;
  tag: string;
  hairline: string;
  iconChip: string;
  chip: string;
  arrow: string;
  glow: string;
  focus: string;
}

const TONES: Record<ToneKey, Tone> = {
  moss: {
    surface: 'bg-[linear-gradient(155deg,#1f5a37_0%,#1A4D2E_45%,#0f2e1b_100%)]',
    isDark: true,
    title: 'text-white',
    body: 'text-white/75',
    muted: 'text-white/55',
    tag: 'text-[#d4a961]',
    hairline: 'bg-[#b8924c]/55',
    iconChip: 'bg-white/10 text-white ring-1 ring-white/20',
    chip: 'bg-white/10 text-white/85 ring-1 ring-white/15',
    arrow: 'border-white/20 bg-white/10 text-white',
    glow: 'bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.12),transparent_60%)]',
    focus: 'focus-visible:ring-brand-brass',
  },
  ink: {
    surface: 'bg-[linear-gradient(155deg,#2e2a26_0%,#1a1714_55%,#0d0c0b_100%)]',
    isDark: true,
    title: 'text-white',
    body: 'text-white/75',
    muted: 'text-white/55',
    tag: 'text-[#d4a961]',
    hairline: 'bg-[#b8924c]/55',
    iconChip: 'bg-white/8 text-white ring-1 ring-white/15',
    chip: 'bg-white/8 text-white/85 ring-1 ring-white/12',
    arrow: 'border-white/20 bg-white/8 text-white',
    glow: 'bg-[radial-gradient(ellipse_at_top_right,rgba(212,169,97,0.14),transparent_60%)]',
    focus: 'focus-visible:ring-brand-brass',
  },
  cream: {
    surface: 'bg-[linear-gradient(155deg,#ffffff_0%,#f4f1ea_55%,#e6e1d2_100%)]',
    isDark: false,
    title: 'text-brand-dark',
    body: 'text-[#5f594f]',
    muted: 'text-[#857d72]',
    tag: 'text-brand-moss',
    hairline: 'bg-brand-moss/35',
    iconChip: 'bg-white text-brand-moss shadow-sm ring-1 ring-black/5',
    chip: 'bg-white text-[#5f594f] ring-1 ring-black/5',
    arrow: 'border-black/10 bg-white text-brand-dark',
    glow: 'bg-[radial-gradient(ellipse_at_bottom_left,rgba(26,77,46,0.08),transparent_60%)]',
    focus: 'focus-visible:ring-brand-moss',
  },
  paper: {
    surface: 'bg-[linear-gradient(155deg,#fafaf9_0%,#efe9da_55%,#e0d6bd_100%)]',
    isDark: false,
    title: 'text-brand-dark',
    body: 'text-[#5f594f]',
    muted: 'text-[#857d72]',
    tag: 'text-brand-moss',
    hairline: 'bg-[#b8924c]/45',
    iconChip: 'bg-white text-brand-moss shadow-sm ring-1 ring-[#b8924c]/25',
    chip: 'bg-white text-[#5f594f] ring-1 ring-black/5',
    arrow: 'border-[#b8924c]/30 bg-white text-brand-dark',
    glow: 'bg-[radial-gradient(ellipse_at_bottom_left,rgba(184,146,76,0.16),transparent_60%)]',
    focus: 'focus-visible:ring-brand-moss',
  },
  cta: {
    surface: 'bg-[linear-gradient(155deg,#1A4D2E_0%,#15803d_55%,#0f3a22_100%)]',
    isDark: true,
    title: 'text-white',
    body: 'text-white/80',
    muted: 'text-white/65',
    tag: 'text-white/80',
    hairline: 'bg-[#FCD34D]/65',
    iconChip: 'bg-white/15 text-white ring-1 ring-white/25',
    chip: 'bg-white/15 text-white ring-1 ring-white/20',
    arrow: 'border-white/30 bg-white text-brand-moss',
    glow: 'bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.18),transparent_60%)]',
    focus: 'focus-visible:ring-brand-brass',
  },
};

// Display order — interleaves the four families into a light/dark
// checkerboard across the 3-column grid. DOM order is the reading and tab
// order; no CSS `order` is used, so they always agree.
const FOLIO_ORDER: Array<{ id: string; tone: ToneKey; family: string }> = [
  { id: 'gst', tone: 'moss', family: 'Tax' },
  { id: 'audit', tone: 'cream', family: 'Assurance' },
  { id: 'income-tax', tone: 'moss', family: 'Tax' },
  { id: 'company-law', tone: 'cream', family: 'Corporate' },
  { id: 'advisory', tone: 'ink', family: 'Advisory' },
  { id: 'bookkeeping', tone: 'paper', family: 'Accounts' },
  { id: 'litigation', tone: 'ink', family: 'Disputes' },
  { id: 'payroll', tone: 'paper', family: 'Accounts' },
];

// Pull a labelled value out of a service's hero-meta.
const metaValue = (id: string, label: string): string => {
  const entry = SERVICE_HERO_META[id]?.find((m) => m.label === label);
  return typeof entry?.value === 'string' ? entry.value : '';
};

// The Scope field is a "A · B · C" string — split it into chips.
const scopeChips = (id: string): string[] =>
  metaValue(id, 'Scope')
    .split(/\s*·\s*/)
    .filter(Boolean)
    .slice(0, 3);

const ServiceFolios: React.FC = () => {
  return (
    <section aria-labelledby="services-folios-heading" className="relative overflow-hidden bg-brand-black pb-28 pt-20">
      {/* depth glow */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_900px_420px_at_50%_0%,rgba(26,77,46,0.32),transparent_70%)]"
      />

      <div className="container relative z-10 mx-auto max-w-7xl px-4 md:px-6">
        {/* Masthead */}
        <header className="mb-12 flex flex-col justify-between gap-6 md:mb-14 md:flex-row md:items-end">
          <div>
            <Reveal delay={0}>
              <Eyebrow tone="brass" className="mb-4">
                Practice files
              </Eyebrow>
            </Reveal>
            <Reveal delay={0.08}>
              <h2
                id="services-folios-heading"
                className="font-heading text-4xl font-bold leading-[1.02] tracking-tight text-white md:text-6xl"
              >
                What we do.
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.16}>
            <p className="max-w-md text-base font-medium leading-relaxed text-white/70 md:text-lg">
              Eight disciplines of chartered-accountancy practice — each one a self-contained file of scope, status and
              deliverables.
            </p>
          </Reveal>
        </header>

        {/* The folios */}
        <ul role="list" className="grid auto-rows-fr grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FOLIO_ORDER.map((entry, index) => {
            const service = SERVICES.find((s) => s.id === entry.id);
            if (!service) return null;
            const t = TONES[entry.tone];
            const numeral = String(index + 1).padStart(2, '0');
            const discipline = metaValue(service.id, 'Discipline');
            const status = metaValue(service.id, 'Status');
            const chips = scopeChips(service.id);

            return (
              <li key={service.id} className="flex">
                <Reveal width="100%" className="flex" delay={staggerDelay(index, 0.06, 0.4)}>
                  <Link
                    to={service.link}
                    aria-labelledby={`folio-${service.id}-title`}
                    aria-describedby={`folio-${service.id}-desc`}
                    className={`group/folio relative flex h-full min-h-[23rem] w-full flex-col overflow-hidden rounded-[2rem] p-7 outline-none transition-[transform,box-shadow] duration-500 ease-out-expo hover:-translate-y-2 hover:shadow-[0_30px_60px_-18px_rgba(0,0,0,0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-black ${t.surface} ${t.focus}`}
                  >
                    {/* top hairline */}
                    <span aria-hidden="true" className={`absolute inset-x-7 top-0 h-px ${t.hairline}`} />
                    {/* corner glow */}
                    <span aria-hidden="true" className={`pointer-events-none absolute inset-0 ${t.glow}`} />
                    {/* engraved numeral watermark */}
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none absolute -bottom-10 -right-3 select-none font-serif text-[12rem] italic leading-none ${
                        t.isDark ? 'text-white/[0.05]' : 'text-brand-dark/[0.05]'
                      }`}
                    >
                      {numeral}
                    </span>

                    {/* Top row — discipline + status + index */}
                    <div className="relative z-10 flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className={`font-mono text-[0.62rem] uppercase tracking-[0.22em] ${t.tag}`}>{discipline}</p>
                        <p className={`mt-1.5 font-mono text-[0.6rem] uppercase tracking-[0.18em] ${t.muted}`}>
                          {status}
                        </p>
                      </div>
                      <span
                        aria-hidden="true"
                        className={`shrink-0 font-mono text-[0.66rem] uppercase tracking-[0.2em] ${t.muted}`}
                      >
                        {numeral}
                      </span>
                    </div>

                    {/* Icon */}
                    <span
                      className={`relative z-10 mt-8 flex h-14 w-14 items-center justify-center rounded-2xl ${t.iconChip}`}
                    >
                      <service.Icon size={26} strokeWidth={1.5} aria-hidden="true" focusable={false} />
                    </span>

                    {/* Title + description */}
                    <h3
                      id={`folio-${service.id}-title`}
                      className={`relative z-10 mt-6 font-heading text-2xl font-medium leading-tight tracking-tight ${t.title}`}
                    >
                      {service.title}
                    </h3>
                    <p
                      id={`folio-${service.id}-desc`}
                      className={`relative z-10 mt-2.5 text-sm font-medium leading-relaxed ${t.body}`}
                    >
                      {service.description}
                    </p>

                    {/* Footer — scope chips + arrow */}
                    <div className="relative z-10 mt-auto flex items-end justify-between gap-3 pt-6">
                      <div className="flex flex-wrap gap-1.5">
                        {chips.map((chip) => (
                          <span
                            key={chip}
                            className={`rounded-full px-2.5 py-1 font-mono text-[0.6rem] tracking-[0.04em] ${t.chip}`}
                          >
                            {chip}
                          </span>
                        ))}
                      </div>
                      <span
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-transform duration-500 ease-out-expo group-hover/folio:rotate-45 ${t.arrow}`}
                      >
                        <ArrowUpRight size={17} strokeWidth={1.5} aria-hidden="true" focusable={false} />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              </li>
            );
          })}

          {/* Ninth file — the consultation CTA */}
          <li className="flex">
            <Reveal width="100%" className="flex" delay={0.46}>
              <Link
                to="/contact"
                aria-labelledby="folio-cta-title"
                className={`group/folio relative flex h-full min-h-[23rem] w-full flex-col overflow-hidden rounded-[2rem] p-7 outline-none transition-[transform,box-shadow] duration-500 ease-out-expo hover:-translate-y-2 hover:shadow-[0_30px_60px_-18px_rgba(26,77,46,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-black ${TONES.cta.surface} ${TONES.cta.focus}`}
              >
                <span aria-hidden="true" className={`absolute inset-x-7 top-0 h-px ${TONES.cta.hairline}`} />
                <span aria-hidden="true" className={`pointer-events-none absolute inset-0 ${TONES.cta.glow}`} />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-10 -right-3 select-none font-serif text-[12rem] italic leading-none text-white/[0.06]"
                >
                  09
                </span>

                <div className="relative z-10 flex items-start justify-between gap-4">
                  <p className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-white/80">Get started</p>
                  <span
                    aria-hidden="true"
                    className="shrink-0 font-mono text-[0.66rem] uppercase tracking-[0.2em] text-white/65"
                  >
                    09
                  </span>
                </div>

                <h3
                  id="folio-cta-title"
                  className="relative z-10 mt-auto font-heading text-3xl font-medium leading-tight tracking-tight text-white"
                >
                  Book a consultation.
                </h3>
                <p className="relative z-10 mt-3 text-sm font-medium leading-relaxed text-white/80">
                  A 30-minute call with a partner to scope the right engagement — retainer or assignment.
                </p>

                <div className="relative z-10 mt-6 flex items-center gap-2 self-start rounded-full bg-white px-6 py-3 text-sm font-bold text-brand-moss shadow-lg transition-colors duration-300 group-hover/folio:bg-brand-dark group-hover/folio:text-white">
                  Schedule a call
                  <ArrowUpRight
                    size={16}
                    strokeWidth={2}
                    aria-hidden="true"
                    focusable={false}
                    className="transition-transform duration-500 ease-out-expo group-hover/folio:rotate-45"
                  />
                </div>
              </Link>
            </Reveal>
          </li>
        </ul>
      </div>
    </section>
  );
};

export default ServiceFolios;
