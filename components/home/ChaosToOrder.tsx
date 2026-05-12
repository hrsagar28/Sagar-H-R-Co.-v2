import React, { useCallback, useRef, useState } from 'react';
import Reveal from '../Reveal';
import { useReducedMotion } from '../../hooks';

/**
 * ChaosToOrder
 * ------------
 * A drag-to-compare "before / after" panel that sits on the Home page
 * immediately below the hero. Visceral proof of value: messy books in,
 * clean books out.
 * Palette: Zone B (editorial paper). Kept in CHAOS_COLORS because this
 * drag-to-compare panel is an intentional editorial set, not a global theme.
 *
 * Interaction:
 *   - Pointer drag on the centre knob moves the divider horizontally.
 *   - Clicking anywhere inside the panel snaps the divider to the click X.
 *   - Keyboard: divider is a WAI-ARIA slider (left/right arrows, Home/End).
 *   - Before first interaction, the divider drifts ±1.2% on a slow sine
 *     to hint that it can be moved. Drift stops for `prefers-reduced-motion`
 *     users and immediately after the first interaction.
 *
 * All visual content is pure CSS/SVG — no raster assets, no heavy deps.
 */

export const CHAOS_COLORS = {
  ink: '#0a0908',
  inkText: '#2A251D',
  brass: '#b8924c',
  rust: '#8b3a2f',
  paper: '#f4f1ea',
  paperSurface: '#eae5d9',
  paperWarm: '#e5dfd0',
  paperYellowed: '#f5ecd6',
  paperCream: '#fbf7ec',
  paperCream2: '#f8f5ec',
  mossDeep: '#1A4D2E',
} as const;

const CHAOS_STYLE_VARS = {
  '--chaos-ink': CHAOS_COLORS.ink,
  '--chaos-ink-rgb': '10 9 8',
  '--chaos-ink-text': CHAOS_COLORS.inkText,
  '--chaos-ink-text-rgb': '42 37 29',
  '--chaos-brass': CHAOS_COLORS.brass,
  '--chaos-brass-rgb': '184 146 76',
  '--chaos-rust': CHAOS_COLORS.rust,
  '--chaos-rust-rgb': '139 58 47',
  '--chaos-paper': CHAOS_COLORS.paper,
  '--chaos-paper-rgb': '244 241 234',
  '--chaos-paper-surface': CHAOS_COLORS.paperSurface,
  '--chaos-paper-warm': CHAOS_COLORS.paperWarm,
  '--chaos-paper-yellowed': CHAOS_COLORS.paperYellowed,
  '--chaos-paper-cream': CHAOS_COLORS.paperCream,
  '--chaos-paper-cream-2': CHAOS_COLORS.paperCream2,
  '--chaos-moss-deep': CHAOS_COLORS.mossDeep,
  '--divider': '50%',
} as React.CSSProperties;

const ChaosToOrder: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dividerValueRef = useRef<number>(50);
  const prefersReduced = useReducedMotion();

  const [ariaDivider, setAriaDivider] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);

  const writeDivider = useCallback((pct: number) => {
    const next = Math.max(6, Math.min(94, pct));
    dividerValueRef.current = next;
    setAriaDivider(Math.round(next));
    containerRef.current?.style.setProperty('--divider', `${next}%`);
  }, []);

  const setFromClientX = useCallback(
    (clientX: number) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const pct = ((clientX - rect.left) / rect.width) * 100;
      writeDivider(pct);
    },
    [writeDivider],
  );

  const beginInteraction = () => {
    containerRef.current?.classList.remove('chaos-drift');
    if (!hasInteracted) setHasInteracted(true);
  };

  const onContainerPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Ignore drag-handle presses here — the handle manages its own capture.
    if ((e.target as HTMLElement).closest('[data-role="handle"]')) return;
    beginInteraction();
    setFromClientX(e.clientX);
  };

  const onHandlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    beginInteraction();
    setFromClientX(e.clientX);
    setIsDragging(true);
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  };

  const onHandlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!isDragging) return;
    setFromClientX(e.clientX);
  };

  const onHandlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    setIsDragging(false);
    try {
      (e.currentTarget as Element).releasePointerCapture(e.pointerId);
    } catch {
      /* no-op */
    }
  };

  const onHandleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    const step = e.shiftKey ? 8 : 3;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      beginInteraction();
      writeDivider(dividerValueRef.current - step);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      beginInteraction();
      writeDivider(dividerValueRef.current + step);
    } else if (e.key === 'Home') {
      e.preventDefault();
      beginInteraction();
      writeDivider(6);
    } else if (e.key === 'End') {
      e.preventDefault();
      beginInteraction();
      writeDivider(94);
    }
  };

  return (
    <section
      className="relative overflow-hidden bg-brand-bg py-20 text-[var(--chaos-ink)] [contain-intrinsic-size:900px] [content-visibility:auto] md:py-28"
      aria-labelledby="chaos-to-order-title"
      style={CHAOS_STYLE_VARS}
    >
      {/* Soft paper tone & faint vertical brass rule on the left margin */}
      <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-[2px] bg-gradient-to-b from-transparent via-[rgb(var(--chaos-brass-rgb)_/_0.25)] to-transparent md:block" />

      {/* Section intro */}
      <div className="container mx-auto mb-10 max-w-7xl px-4 md:mb-14 md:px-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Reveal variant="fade-up" delay={0.08}>
            <h2
              id="chaos-to-order-title"
              className="max-w-4xl font-heading font-bold leading-[0.95]"
              style={{ fontSize: 'clamp(1.75rem, 5vw, 4.5rem)' }}
            >
              Messy books, in.
              <br />
              <span className="font-serif font-normal italic text-[var(--chaos-rust)]">Clean books, out.</span>
            </h2>
          </Reveal>
          <Reveal variant="fade-up" delay={0.18}>
            <p
              className="max-w-md font-medium leading-relaxed text-[rgb(var(--chaos-ink-text-rgb)_/_0.75)] md:text-right"
              style={{ fontSize: 'clamp(0.8125rem, 1.8vw, 1.125rem)' }}
            >
              Drag the divider. What a practice looks like before we step in — and after a year of quiet, on-time
              filings.
            </p>
          </Reveal>
        </div>
      </div>

      {/* The split-screen panel */}
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <Reveal variant="fade-up" delay={0.1} width="100%">
          <div
            ref={containerRef}
            onPointerDown={onContainerPointerDown}
            className={`relative aspect-[3/4] w-full cursor-ew-resize touch-pan-y select-none overflow-hidden rounded-[1.75rem] border border-[rgb(var(--chaos-ink-rgb)_/_0.10)] bg-[var(--chaos-paper-surface)] shadow-[0_30px_60px_-20px_rgba(10,9,8,0.25)] sm:aspect-[4/3] md:rounded-[2rem] lg:aspect-[16/10] ${
              !hasInteracted && !prefersReduced ? 'chaos-drift' : ''
            }`}
            style={{ '--divider': '50%' } as React.CSSProperties}
            role="group"
            aria-roledescription="Before and after comparison"
          >
            {/* CHAOS layer — always rendered fully; the Order layer sits on top.
                `isolation: isolate` confines invoice card z-indexes to this
                wrapper so they can't escape above the Order layer. */}
            <div className="absolute inset-0" style={{ isolation: 'isolate', zIndex: 1 }}>
              <ChaosPane />
            </div>

            {/* ORDER layer — clipped from the left based on divider %.
                Using clipPath so layout is never reflowed during drag.
                Explicit z-index keeps it above the Chaos stacking context. */}
            <div
              className="absolute inset-0"
              style={{
                clipPath: 'inset(0 0 0 var(--divider))',
                WebkitClipPath: 'inset(0 0 0 var(--divider))',
                isolation: 'isolate',
                zIndex: 2,
              }}
            >
              <OrderPane />
            </div>

            {/* Divider line */}
            <div
              className="pointer-events-none absolute bottom-0 top-0 w-px bg-[rgb(var(--chaos-ink-rgb)_/_0.40)]"
              style={{ left: 'var(--divider)', zIndex: 3 }}
            />

            {/* Drag handle (slider) */}
            <button
              type="button"
              role="slider"
              aria-label="Drag to compare messy books versus clean books"
              aria-valuemin={6}
              aria-valuemax={94}
              aria-valuenow={ariaDivider}
              data-role="handle"
              tabIndex={0}
              onPointerDown={onHandlePointerDown}
              onPointerMove={onHandlePointerMove}
              onPointerUp={onHandlePointerUp}
              onPointerCancel={onHandlePointerUp}
              onKeyDown={onHandleKeyDown}
              className={`absolute top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[rgb(var(--chaos-paper-rgb)_/_0.10)] bg-[var(--chaos-ink)] text-[var(--chaos-paper)] shadow-lg shadow-[rgb(var(--chaos-ink-rgb)_/_0.30)] transition-transform duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--chaos-brass)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--chaos-paper)] md:h-14 md:w-14 ${
                isDragging ? 'scale-105 cursor-grabbing' : 'cursor-grab hover:scale-105'
              }`}
              style={{ left: 'var(--divider)', zIndex: 4 }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path
                  d="M8 5L4 10L8 15"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 5L16 10L12 15"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* Corner captions */}
            <div className="pointer-events-none absolute left-3 top-3 md:left-6 md:top-5" style={{ zIndex: 3 }}>
              <span
                className="inline-block rounded bg-[rgb(var(--chaos-rust-rgb)_/_0.85)] px-2 py-1 font-mono uppercase tracking-[0.15em] text-[var(--chaos-paper)] backdrop-blur-sm"
                style={{ fontSize: 'clamp(9px, 1.4vw, 11px)' }}
              >
                <span className="md:hidden">Before</span>
                <span className="hidden md:inline">Before · filings, forgotten</span>
              </span>
            </div>
            <div
              className="pointer-events-none absolute bottom-3 right-3 md:bottom-auto md:right-6 md:top-5"
              style={{ zIndex: 3 }}
            >
              <span
                className="inline-block rounded bg-[rgb(var(--chaos-ink-rgb)_/_0.85)] px-2 py-1 font-mono uppercase tracking-[0.15em] text-[var(--chaos-paper)] backdrop-blur-sm"
                style={{ fontSize: 'clamp(9px, 1.4vw, 11px)' }}
              >
                <span className="md:hidden">After</span>
                <span className="hidden md:inline">After · filings, finalised</span>
              </span>
            </div>
          </div>
        </Reveal>

        {/* Footnote below the panel */}
        <Reveal variant="fade-up" delay={0.2}>
          <p className="mt-5 text-center font-mono text-[11px] uppercase tracking-[0.2em] text-[rgb(var(--chaos-ink-rgb)_/_0.55)] md:mt-7">
            Drag&nbsp;·&nbsp;Tap&nbsp;·&nbsp;Use arrow keys
          </p>
        </Reveal>
      </div>
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/*  BEFORE — Chaos pane                                                        */
/* -------------------------------------------------------------------------- */

type DocKind = 'invoice' | 'gstr' | 'brs' | 'itr' | 'tds' | 'cheque';

type ChaosDoc = {
  kind: DocKind;
  left: string;
  top: string;
  width: string;
  rotate: number;
  z: number;
  tone: 'paper' | 'yellowed';
  stamp?: 'overdue' | 'pending' | 'unpaid' | 'mismatch' | 'late-fee' | 'not-filed';
  scribble?: boolean;
};

// Hand-placed to feel tossed, not gridded. z-index staggered so some cards
// clearly overlap others (the chaos of a folder that was never filed).
// The mix is intentional: it's not just invoices — it's every filing that
// *should* have happened (GSTR, BRS, ITR, TDS) lying next to the cheque
// nobody deposited. That's the actual chaos of a practice without a CA.
const INVOICES: ChaosDoc[] = [
  { kind: 'invoice', left: '2%', top: '8%', width: '26%', rotate: -6, z: 1, tone: 'paper', stamp: 'overdue' },
  { kind: 'gstr', left: '20%', top: '18%', width: '28%', rotate: 4, z: 3, tone: 'yellowed', stamp: 'late-fee' },
  {
    kind: 'invoice',
    left: '2%',
    top: '44%',
    width: '28%',
    rotate: 9,
    z: 2,
    tone: 'paper',
    stamp: 'pending',
    scribble: true,
  },
  { kind: 'cheque', left: '32%', top: '2%', width: '26%', rotate: -3, z: 4, tone: 'paper' },
  { kind: 'brs', left: '46%', top: '34%', width: '30%', rotate: 6, z: 5, tone: 'yellowed', stamp: 'mismatch' },
  { kind: 'invoice', left: '34%', top: '60%', width: '26%', rotate: -8, z: 3, tone: 'paper', scribble: true },
  { kind: 'tds', left: '62%', top: '10%', width: '28%', rotate: 3, z: 4, tone: 'yellowed', stamp: 'pending' },
  { kind: 'itr', left: '68%', top: '48%', width: '28%', rotate: -5, z: 5, tone: 'paper', stamp: 'not-filed' },
  { kind: 'invoice', left: '54%', top: '70%', width: '22%', rotate: 7, z: 2, tone: 'yellowed', stamp: 'unpaid' },
];

const ChaosPane: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Desk texture — faint crossed grain */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: 'var(--chaos-paper-warm)',
          backgroundImage:
            'radial-gradient(rgba(139,58,47,0.035) 1px, transparent 1px), radial-gradient(rgba(10,9,8,0.04) 1px, transparent 1px)',
          backgroundSize: '22px 22px, 36px 36px',
          backgroundPosition: '0 0, 11px 18px',
        }}
      />

      {/* Highlighter streak — slanted yellow marker over one card cluster */}
      <div
        className="absolute"
        style={{
          left: '18%',
          top: '36%',
          width: '42%',
          height: '8%',
          background:
            'linear-gradient(90deg, rgba(184,146,76,0.0) 0%, rgba(230,200,110,0.45) 20%, rgba(230,200,110,0.55) 80%, rgba(184,146,76,0.0) 100%)',
          transform: 'rotate(-4deg)',
          filter: 'blur(1.5px)',
          mixBlendMode: 'multiply',
        }}
      />

      {/* Calculator tape — runs off the right edge */}
      <div
        className="absolute overflow-hidden bg-white shadow-sm"
        style={{
          right: '-4%',
          top: '74%',
          width: '38%',
          height: '60px',
          transform: 'rotate(-2deg)',
          borderTop: '1px dashed rgba(10,9,8,0.2)',
          borderBottom: '1px dashed rgba(10,9,8,0.2)',
        }}
      >
        <div className="flex h-full items-center gap-3 whitespace-nowrap px-3 font-mono text-[11px] text-[rgb(var(--chaos-ink-rgb)_/_0.65)]">
          <span>18,240.00</span>
          <span>+</span>
          <span>4,610.00</span>
          <span>+</span>
          <span>?</span>
          <span>+</span>
          <span className="text-[var(--chaos-rust)]">12,300.50</span>
          <span>=</span>
          <span className="text-[var(--chaos-rust)]">??</span>
        </div>
      </div>

      {/* Scattered documents — invoices, GSTR, BRS, ITR, TDS, cheques */}
      {INVOICES.map((doc, i) => (
        <DocCard key={i} {...doc} seed={i} />
      ))}

      {/* Red question-mark margin scribble */}
      <svg
        className="absolute"
        style={{ left: '62%', top: '74%', width: '80px', height: '80px', transform: 'rotate(-12deg)' }}
        viewBox="0 0 80 80"
        aria-hidden="true"
      >
        <path
          d="M20 25 Q20 10, 40 10 Q60 10, 60 25 Q60 38, 40 42 L40 55 M40 65 L40 68"
          fill="none"
          stroke="var(--chaos-rust)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.82"
        />
      </svg>

      {/* Torn-corner paper clip in top-right */}
      <div
        className="absolute"
        style={{
          right: '4%',
          top: '3%',
          width: '36px',
          height: '60px',
          transform: 'rotate(14deg)',
        }}
      >
        <div
          className="h-full w-full rounded-full border-[3px] border-[rgb(var(--chaos-ink-rgb)_/_0.35)]"
          style={{ clipPath: 'inset(0 0 0 35%)' }}
        />
      </div>
    </div>
  );
};

/**
 * DocCard
 * -------
 * Shared card chrome (paper tone, shadow, scribble, stamp) with a body
 * dispatched per `kind`. This lets the chaos pane show the real set of
 * filings a practice neglects — invoices, GSTR returns, a BRS that
 * doesn't tie, an unfiled ITR, a TDS certificate, a stale cheque — all
 * tossed into the same pile.
 */
const DocCard: React.FC<ChaosDoc & { seed: number }> = ({
  kind,
  left,
  top,
  width,
  rotate,
  z,
  tone,
  stamp,
  scribble,
  seed,
}) => {
  const bg = tone === 'yellowed' ? 'var(--chaos-paper-yellowed)' : 'var(--chaos-paper-cream)';

  // Cheques are landscape (long & short); everything else is ~4:3
  const aspectRatio = kind === 'cheque' ? '5 / 2' : '4 / 3';

  return (
    <div
      className="absolute"
      style={{
        left,
        top,
        width,
        aspectRatio,
        transform: `rotate(${rotate}deg)`,
        zIndex: z,
      }}
    >
      <div
        className="relative h-full w-full overflow-hidden rounded-[2px] border border-[rgb(var(--chaos-ink-rgb)_/_0.08)] shadow-[0_6px_14px_-6px_rgba(10,9,8,0.35)]"
        style={{ backgroundColor: bg }}
      >
        {kind === 'invoice' && <InvoiceBody seed={seed} />}
        {kind === 'gstr' && <GSTRBody seed={seed} />}
        {kind === 'brs' && <BRSBody seed={seed} />}
        {kind === 'itr' && <ITRBody seed={seed} />}
        {kind === 'tds' && <TDSBody seed={seed} />}
        {kind === 'cheque' && <ChequeBody seed={seed} />}

        {/* Optional hand-scribble over the card — the CA scrawling
            "check this", green ink, on something that never got checked. */}
        {scribble && (
          <svg
            className="pointer-events-none absolute inset-0"
            viewBox="0 0 100 75"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M10 60 Q30 40, 50 58 T 90 55"
              stroke="var(--chaos-moss-deep)"
              strokeWidth="0.6"
              strokeLinecap="round"
              fill="none"
              opacity="0.55"
            />
          </svg>
        )}

        {/* Optional stamp */}
        {stamp && <Stamp label={stamp} />}
      </div>
    </div>
  );
};

/* ---------- Document bodies --------------------------------------------- */

const InvoiceBody: React.FC<{ seed: number }> = ({ seed }) => {
  const lines = 4 + (seed % 3);
  return (
    <>
      <div className="flex items-center justify-between border-b border-dashed border-[rgb(var(--chaos-ink-rgb)_/_0.15)] px-3 pb-1.5 pt-2">
        <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-[rgb(var(--chaos-ink-rgb)_/_0.65)] md:text-[9px]">
          Invoice · {String(1024 + seed * 37).padStart(4, '0')}
        </span>
        <span className="font-mono text-[9px] text-[rgb(var(--chaos-ink-rgb)_/_0.45)] md:text-[8px]">
          {['12/04', '03/07', '28/11', '19/02', '06/09', '22/01', '14/05', '30/08'][seed % 8]}
        </span>
      </div>
      <div className="space-y-1.5 p-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-[2px] rounded-full bg-[rgb(var(--chaos-ink-rgb)_/_0.15)]"
            style={{ width: `${55 + ((seed * 13 + i * 19) % 40)}%` }}
          />
        ))}
        <div className="flex justify-between pt-1.5">
          <div className="h-[3px] w-[30%] rounded-full bg-[rgb(var(--chaos-ink-rgb)_/_0.25)]" />
          <div className="h-[3px] w-[22%] rounded-full bg-[rgb(var(--chaos-ink-rgb)_/_0.25)]" />
        </div>
      </div>
    </>
  );
};

/** GSTR-1 / GSTR-3B return — HSN summary grid with red totals */
const GSTRBody: React.FC<{ seed: number }> = ({ seed }) => {
  const rows = [
    { hsn: '9983', val: '2,14,500', tax: '38,610' },
    { hsn: '8471', val: '  68,240', tax: '12,283' },
    { hsn: '9954', val: '1,02,900', tax: '18,522' },
    { hsn: '4901', val: '  14,760', tax: '  2,656' },
  ];
  return (
    <>
      <div
        className="flex items-center justify-between border-b border-[rgb(var(--chaos-rust-rgb)_/_0.35)] px-3 pb-1.5 pt-2"
        style={{ backgroundColor: 'rgba(139,58,47,0.06)' }}
      >
        <span className="font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-[var(--chaos-rust)] md:text-[9px]">
          GSTR-{seed % 2 === 0 ? '3B' : '1'} · {seed % 2 === 0 ? 'SUMMARY' : 'OUTWARD SUPPLY'}
        </span>
        <span className="font-mono text-[9px] text-[rgb(var(--chaos-ink-rgb)_/_0.55)] md:text-[8px]">
          {['MAR-24', 'APR-24', 'MAY-24', 'JUN-24', 'JUL-24', 'AUG-24'][seed % 6]}
        </span>
      </div>
      <div className="px-3 py-2">
        <div className="grid grid-cols-[1fr_1.2fr_1fr] gap-1 border-b border-[rgb(var(--chaos-ink-rgb)_/_0.10)] pb-1 font-mono text-[8px] uppercase tracking-[0.1em] text-[rgb(var(--chaos-ink-rgb)_/_0.50)] md:text-[7px]">
          <span>HSN</span>
          <span className="text-right">Taxable</span>
          <span className="text-right">IGST</span>
        </div>
        {rows.map((r, i) => (
          <div
            key={i}
            className="grid grid-cols-[1fr_1.2fr_1fr] gap-1 border-b border-[rgb(var(--chaos-ink-rgb)_/_0.05)] py-[3px] font-mono text-[9px] tabular-nums text-[rgb(var(--chaos-ink-rgb)_/_0.80)] last:border-b-0 md:text-[8px]"
          >
            <span>{r.hsn}</span>
            <span className="text-right">{r.val}</span>
            <span className="text-right">{r.tax}</span>
          </div>
        ))}
        <div className="mt-1 flex items-center justify-between border-t border-[rgb(var(--chaos-rust-rgb)_/_0.40)] pt-1.5">
          <span className="font-mono text-[9px] font-bold uppercase text-[var(--chaos-rust)] md:text-[8px]">
            Total tax
          </span>
          <span className="font-mono text-[9px] font-bold tabular-nums text-[var(--chaos-rust)] md:text-[8px]">
            72,071
          </span>
        </div>
      </div>
    </>
  );
};

/** Bank Reconciliation Statement — bank vs books columns, highlighted gap */
const BRSBody: React.FC<{ seed: number }> = ({ seed }) => {
  return (
    <>
      <div className="flex items-center justify-between border-b border-dashed border-[rgb(var(--chaos-ink-rgb)_/_0.15)] px-3 pb-1.5 pt-2">
        <span className="font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-[rgb(var(--chaos-ink-rgb)_/_0.65)] md:text-[9px]">
          Bank Reconciliation
        </span>
        <span className="font-mono text-[9px] text-[rgb(var(--chaos-ink-rgb)_/_0.45)] md:text-[8px]">
          HDFC · {seed % 2 ? '56431' : '87209'}
        </span>
      </div>
      <div className="px-3 py-2 font-mono text-[9px] tabular-nums text-[rgb(var(--chaos-ink-rgb)_/_0.80)] md:text-[8px]">
        <div className="grid grid-cols-[1fr_auto_auto] gap-x-2 gap-y-[2px]">
          <span>Balance as per bank</span>
          <span></span>
          <span className="text-right">4,86,210</span>
          <span>Less: Cheques not presented</span>
          <span></span>
          <span className="text-right text-[rgb(var(--chaos-ink-rgb)_/_0.55)]">( 42,300)</span>
          <span>Add: Cheques issued not cleared</span>
          <span></span>
          <span className="text-right text-[rgb(var(--chaos-ink-rgb)_/_0.55)]"> 18,500</span>
          <span>Less: Unrecorded bank charges</span>
          <span></span>
          <span className="text-right text-[rgb(var(--chaos-ink-rgb)_/_0.55)]">( 640)</span>
        </div>
        <div className="my-1.5 h-px bg-[rgb(var(--chaos-ink-rgb)_/_0.15)]" />
        <div className="flex items-center justify-between">
          <span className="font-bold">Balance as per books</span>
          <span className="font-bold">4,61,770</span>
        </div>
        <div
          className="mt-1.5 flex items-center justify-between rounded px-1.5 py-[2px]"
          style={{ backgroundColor: 'rgba(139,58,47,0.12)' }}
        >
          <span className="font-bold uppercase tracking-[0.1em] text-[var(--chaos-rust)]">Difference</span>
          <span className="font-bold text-[var(--chaos-rust)]">7,940</span>
        </div>
      </div>
    </>
  );
};

/** ITR-V acknowledgment — boxy income tax form with fake AY/PAN */
const ITRBody: React.FC<{ seed: number }> = ({ seed }) => {
  return (
    <>
      <div
        className="border-b-2 border-[rgb(var(--chaos-ink-rgb)_/_0.30)] px-3 pb-1.5 pt-2"
        style={{ backgroundColor: 'rgba(184,146,76,0.12)' }}
      >
        <div className="flex items-center justify-between">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[rgb(var(--chaos-ink-rgb)_/_0.55)] md:text-[8px]">
            Form ITR-{[1, 2, 3, 4, 5][seed % 5]}
          </span>
          <span className="font-mono text-[8px] uppercase tracking-[0.15em] text-[rgb(var(--chaos-ink-rgb)_/_0.45)] md:text-[7px]">
            AY {['2023-24', '2024-25', '2025-26'][seed % 3]}
          </span>
        </div>
        <div className="mt-[2px] font-mono text-[8px] font-bold uppercase tracking-[0.15em] text-[var(--chaos-ink)] md:text-[9px]">
          Income Tax Return
        </div>
      </div>
      <div className="space-y-[3px] px-3 py-2 font-mono text-[9px] text-[rgb(var(--chaos-ink-rgb)_/_0.80)] md:text-[8px]">
        <div className="flex justify-between border-b border-dotted border-[rgb(var(--chaos-ink-rgb)_/_0.15)] pb-[2px]">
          <span className="text-[rgb(var(--chaos-ink-rgb)_/_0.55)]">PAN</span>
          <span className="tabular-nums">AXXPS{String((seed * 131) % 10000).padStart(4, '0')}Q</span>
        </div>
        <div className="flex justify-between border-b border-dotted border-[rgb(var(--chaos-ink-rgb)_/_0.15)] pb-[2px]">
          <span className="text-[rgb(var(--chaos-ink-rgb)_/_0.55)]">Gross Total Income</span>
          <span className="tabular-nums">18,42,700</span>
        </div>
        <div className="flex justify-between border-b border-dotted border-[rgb(var(--chaos-ink-rgb)_/_0.15)] pb-[2px]">
          <span className="text-[rgb(var(--chaos-ink-rgb)_/_0.55)]">Total Deductions</span>
          <span className="tabular-nums">2,15,000</span>
        </div>
        <div className="flex justify-between pt-[2px] font-bold">
          <span>Tax Payable</span>
          <span className="tabular-nums">3,14,820</span>
        </div>
      </div>
    </>
  );
};

/** TDS / Form 16A — lighter on data, heavier on letterhead look */
const TDSBody: React.FC<{ seed: number }> = ({ seed }) => {
  return (
    <>
      <div className="border-b border-[rgb(var(--chaos-ink-rgb)_/_0.20)] px-3 pb-1.5 pt-2">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[rgb(var(--chaos-ink-rgb)_/_0.55)] md:text-[8px]">
            Form 16{seed % 2 ? 'A' : ''}
          </span>
          <span className="font-mono text-[9px] text-[rgb(var(--chaos-ink-rgb)_/_0.45)] md:text-[8px]">
            Q{(seed % 4) + 1} · FY 24-25
          </span>
        </div>
        <div className="mt-[2px] font-mono text-[8px] font-bold uppercase tracking-[0.1em] text-[var(--chaos-ink)] md:text-[9px]">
          Certificate of TDS
        </div>
      </div>
      <div className="space-y-[3px] px-3 py-2 font-mono text-[9px] tabular-nums text-[rgb(var(--chaos-ink-rgb)_/_0.80)] md:text-[8px]">
        <div className="flex justify-between">
          <span className="text-[rgb(var(--chaos-ink-rgb)_/_0.55)]">TAN of deductor</span>
          <span>BLRA{String(12340 + seed * 17).slice(-5)}B</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[rgb(var(--chaos-ink-rgb)_/_0.55)]">Amount paid / credited</span>
          <span>8,40,000</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[rgb(var(--chaos-ink-rgb)_/_0.55)]">TDS u/s 194{seed % 2 ? 'J' : 'C'}</span>
          <span>84,000</span>
        </div>
        <div className="flex justify-between border-t border-[rgb(var(--chaos-ink-rgb)_/_0.15)] pt-[3px] font-bold">
          <span>Challan date</span>
          <span>07/07/24</span>
        </div>
      </div>
    </>
  );
};

/** Bearer cheque — landscape, MICR band, signature line */
const ChequeBody: React.FC<{ seed: number }> = ({ seed }) => {
  return (
    <div className="relative h-full w-full px-3 py-2 font-mono text-[9px] text-[rgb(var(--chaos-ink-rgb)_/_0.80)] md:text-[8px]">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[8px] font-bold uppercase tracking-[0.15em] text-[var(--chaos-ink)] md:text-[9px]">
            HDFC Bank
          </div>
          <div className="text-[8px] text-[rgb(var(--chaos-ink-rgb)_/_0.55)] md:text-[7px]">
            Devaraja Urs Road, Mysuru
          </div>
        </div>
        <div className="text-[8px] tabular-nums text-[rgb(var(--chaos-ink-rgb)_/_0.55)] md:text-[7px]">
          Date <span className="border-b border-dotted border-[rgb(var(--chaos-ink-rgb)_/_0.35)] px-1">__/__/____</span>
        </div>
      </div>
      <div className="mt-1.5 flex items-center gap-1">
        <span className="text-[rgb(var(--chaos-ink-rgb)_/_0.55)]">Pay</span>
        <div className="flex-1 border-b border-dotted border-[rgb(var(--chaos-ink-rgb)_/_0.35)]" />
      </div>
      <div className="mt-1.5 flex items-center justify-between">
        <span className="text-[8px] text-[rgb(var(--chaos-ink-rgb)_/_0.55)] md:text-[7px]">
          Rupees _________________________
        </span>
        <div className="rounded-sm border border-[rgb(var(--chaos-ink-rgb)_/_0.40)] px-2 py-[1px] font-bold tabular-nums">
          ₹ 42,500
        </div>
      </div>
      <div className="absolute bottom-[22%] left-3 right-3 text-right text-[9px] italic text-[rgb(var(--chaos-ink-rgb)_/_0.35)] md:text-[8px]">
        signature
      </div>
      {/* MICR band */}
      <div
        className="absolute bottom-0 left-0 right-0 border-t border-[rgb(var(--chaos-ink-rgb)_/_0.15)] px-3 py-1 font-mono text-[9px] tracking-[0.2em] text-[rgb(var(--chaos-ink-rgb)_/_0.70)] md:text-[8px]"
        style={{ backgroundColor: 'rgba(10,9,8,0.04)' }}
      >
        ⑆{String(570240011 + seed).slice(-9)}⑆ 560{String(seed * 17).slice(-3)}⑈
      </div>
    </div>
  );
};

const STAMP_STYLES: Record<NonNullable<ChaosDoc['stamp']>, string> = {
  overdue: 'OVERDUE',
  pending: 'PENDING',
  unpaid: 'UNPAID',
  mismatch: 'MISMATCH',
  'late-fee': 'LATE FEE',
  'not-filed': 'NOT FILED',
};

const Stamp: React.FC<{ label: NonNullable<ChaosDoc['stamp']> }> = ({ label }) => {
  return (
    <div
      className="absolute"
      style={{
        right: '6%',
        bottom: '10%',
        transform: 'rotate(-8deg)',
        border: '2px solid var(--chaos-rust)',
        color: 'var(--chaos-rust)',
        padding: '3px 8px',
        fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
        fontSize: '10px',
        fontWeight: 700,
        letterSpacing: '0.15em',
        opacity: 0.82,
        borderRadius: '2px',
        backgroundColor: 'rgba(139,58,47,0.04)',
      }}
    >
      {STAMP_STYLES[label]}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  AFTER — Order pane                                                         */
/* -------------------------------------------------------------------------- */

const LEDGER_ROWS: Array<{ label: string; value: string; bold?: boolean; section?: boolean }> = [
  { label: 'Revenue from Operations', value: '2,48,14,600' },
  { label: 'Other Income', value: '    3,62,450' },
  { label: 'Total Revenue', value: '2,51,77,050', bold: true },
  { label: 'Cost of Materials', value: '  96,48,220', section: true },
  { label: 'Employee Benefits', value: '  42,10,900' },
  { label: 'Finance Costs', value: '   5,84,300' },
  { label: 'Depreciation', value: '   8,92,150' },
  { label: 'Other Expenses', value: '  28,74,480' },
  { label: 'Profit Before Tax', value: '  69,67,000', bold: true, section: true },
  { label: 'Tax Expense', value: '  17,53,050' },
  { label: 'Profit for the Year', value: '  52,13,950', bold: true },
];

const OrderPane: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Paper base — cleaner than chaos pane, with a subtle warm vignette */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: 'var(--chaos-paper)',
          backgroundImage: 'radial-gradient(ellipse at 50% 30%, rgba(184,146,76,0.05) 0%, rgba(184,146,76,0) 60%)',
        }}
      />

      {/* Faint rule grid — suggests ruled accounting paper */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: 'linear-gradient(to bottom, rgba(10,9,8,0.05) 1px, transparent 1px)',
          backgroundSize: '100% 28px',
        }}
      />

      {/* Centred ledger card */}
      <div className="absolute inset-0 flex items-center justify-center p-4 md:p-10">
        <div
          className="w-full max-w-[520px] border border-[rgb(var(--chaos-brass-rgb)_/_0.50)] bg-[var(--chaos-paper-cream-2)] shadow-[0_20px_40px_-18px_rgba(10,9,8,0.25)]"
          style={{ borderRadius: '4px' }}
        >
          {/* Masthead */}
          <div className="border-b border-[rgb(var(--chaos-brass-rgb)_/_0.40)] px-5 pb-3 pt-5 md:px-7 md:pb-4 md:pt-7">
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-[var(--chaos-rust)] md:text-[10px]">
                Statement of Profit &amp; Loss
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[rgb(var(--chaos-ink-rgb)_/_0.55)] md:text-[10px]">
                FY 2025&ndash;26
              </span>
            </div>
            <div className="mt-1 font-serif text-[11px] italic text-[rgb(var(--chaos-ink-rgb)_/_0.70)] md:text-xs">
              for the year ended 31 March 2026
            </div>
            {/* Brass gradient hairline */}
            <div className="mt-3 h-px bg-gradient-to-r from-[rgb(var(--chaos-brass-rgb)_/_0.10)] via-[var(--chaos-brass)] to-[rgb(var(--chaos-brass-rgb)_/_0.10)]" />
          </div>

          {/* Ledger body */}
          <div className="px-5 py-4 md:px-7 md:py-5">
            <div className="font-mono text-[11px] text-[var(--chaos-ink)] md:text-[13px]">
              {LEDGER_ROWS.map((row, i) => (
                <div key={i}>
                  {row.section && <div className="my-2 h-px bg-[rgb(var(--chaos-ink-rgb)_/_0.10)]" />}
                  <div
                    className={`flex items-baseline justify-between py-[3px] md:py-1 ${
                      row.bold ? 'font-bold text-[var(--chaos-ink)]' : 'text-[rgb(var(--chaos-ink-rgb)_/_0.80)]'
                    }`}
                  >
                    <span className="truncate pr-4">{row.label}</span>
                    <span className="whitespace-pre tabular-nums">₹ {row.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer — closed seal */}
          <div className="flex items-center justify-between border-t border-[rgb(var(--chaos-brass-rgb)_/_0.30)] px-5 pb-5 pt-2 md:px-7 md:pb-6">
            <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-[rgb(var(--chaos-ink-rgb)_/_0.55)] md:text-[10px]">
              Reconciled · Audited
            </span>
            <ClosedSeal />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * A minimal "Closed · FY25-26" circular seal — a small brass wax-ring nod.
 * Reads as authentication without being costumey.
 */
const ClosedSeal: React.FC = () => {
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: '54px', height: '54px' }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 54 54" className="absolute inset-0">
        <circle cx="27" cy="27" r="25" fill="none" stroke="var(--chaos-brass)" strokeWidth="1" />
        <circle
          cx="27"
          cy="27"
          r="21"
          fill="none"
          stroke="var(--chaos-brass)"
          strokeWidth="0.5"
          strokeDasharray="1 2"
        />
      </svg>
      <div className="flex flex-col items-center leading-none">
        <span className="font-serif text-[10px] italic text-[var(--chaos-rust)]">closed</span>
        <span className="mt-[2px] font-mono text-[8px] tracking-[0.15em] text-[rgb(var(--chaos-ink-rgb)_/_0.70)]">
          FY25-26
        </span>
      </div>
    </div>
  );
};

export default ChaosToOrder;
