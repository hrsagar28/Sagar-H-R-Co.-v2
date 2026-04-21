
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import Reveal from '../Reveal';
import { useReducedMotion } from '../../hooks';

/**
 * ChaosToOrder
 * ------------
 * A drag-to-compare "before / after" panel that sits on the Home page
 * immediately below the hero. Visceral proof of value: messy books in,
 * clean books out.
 *
 * Palette: Zone B (editorial paper). No new colour tokens — only values
 * already present in the codebase (paper #f4f1ea, ink #0a0908,
 * rust #8b3a2f, brass #b8924c).
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

const ChaosToOrder: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  const [divider, setDivider] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);

  // Idle sine-drift hint until the user has interacted. Stops under
  // prefers-reduced-motion. Uses requestAnimationFrame for smoothness.
  useEffect(() => {
    if (hasInteracted || prefersReduced) return;
    let frame = 0;
    let t = 0;
    const tick = () => {
      t += 0.012;
      setDivider(50 + Math.sin(t) * 1.2);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [hasInteracted, prefersReduced]);

  const setFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setDivider(Math.max(6, Math.min(94, pct)));
  }, []);

  const beginInteraction = () => {
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
      setDivider((d) => Math.max(6, d - step));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      beginInteraction();
      setDivider((d) => Math.min(94, d + step));
    } else if (e.key === 'Home') {
      e.preventDefault();
      beginInteraction();
      setDivider(6);
    } else if (e.key === 'End') {
      e.preventDefault();
      beginInteraction();
      setDivider(94);
    }
  };

  return (
    <section
      data-zone="editorial-paper"
      className="relative overflow-hidden bg-[#f4f1ea] text-[#0a0908] py-20 md:py-28"
      aria-labelledby="chaos-to-order-title"
    >
      {/* Soft paper tone & faint vertical brass rule on the left margin */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[2px] bg-gradient-to-b from-transparent via-[#b8924c]/25 to-transparent hidden md:block" />

      {/* Section intro */}
      <div className="container mx-auto max-w-7xl px-4 md:px-6 mb-10 md:mb-14">

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <Reveal variant="fade-up" delay={0.08}>
            <h2
              id="chaos-to-order-title"
              className="font-heading font-bold leading-[0.95] max-w-4xl"
              style={{ fontSize: 'clamp(1.75rem, 5vw, 4.5rem)' }}
            >
              Messy books, in.
              <br />
              <span className="font-serif italic font-normal text-[#8b3a2f]">
                Clean books, out.
              </span>
            </h2>
          </Reveal>
          <Reveal variant="fade-up" delay={0.18}>
            <p className="max-w-md text-[#2A251D]/75 font-medium leading-relaxed md:text-right" style={{ fontSize: 'clamp(0.8125rem, 1.8vw, 1.125rem)' }}>
              Drag the divider. What a practice looks like before we step in —
              and after a year of quiet, on-time filings.
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
            className="relative select-none w-full aspect-[3/4] sm:aspect-[4/3] lg:aspect-[16/10] rounded-[1.75rem] md:rounded-[2rem] overflow-hidden border border-[#0a0908]/10 shadow-[0_30px_60px_-20px_rgba(10,9,8,0.25)] bg-[#eae5d9] cursor-ew-resize touch-pan-y"
            role="group"
            aria-roledescription="Before and after comparison"
          >
            {/* CHAOS layer — always rendered fully; the Order layer sits on top.
                `isolation: isolate` confines invoice card z-indexes to this
                wrapper so they can't escape above the Order layer. */}
            <div
              className="absolute inset-0"
              style={{ isolation: 'isolate', zIndex: 1 }}
            >
              <ChaosPane />
            </div>

            {/* ORDER layer — clipped from the left based on divider %.
                Using clipPath so layout is never reflowed during drag.
                Explicit z-index keeps it above the Chaos stacking context. */}
            <div
              className="absolute inset-0"
              style={{
                clipPath: `inset(0 0 0 ${divider}%)`,
                WebkitClipPath: `inset(0 0 0 ${divider}%)`,
                isolation: 'isolate',
                zIndex: 2,
              }}
            >
              <OrderPane />
            </div>

            {/* Divider line */}
            <div
              className="absolute top-0 bottom-0 w-px bg-[#0a0908]/40 pointer-events-none"
              style={{ left: `${divider}%`, zIndex: 3 }}
            />

            {/* Drag handle (slider) */}
            <button
              type="button"
              role="slider"
              aria-label="Drag to compare messy books versus clean books"
              aria-valuemin={6}
              aria-valuemax={94}
              aria-valuenow={Math.round(divider)}
              data-role="handle"
              tabIndex={0}
              onPointerDown={onHandlePointerDown}
              onPointerMove={onHandlePointerMove}
              onPointerUp={onHandlePointerUp}
              onPointerCancel={onHandlePointerUp}
              onKeyDown={onHandleKeyDown}
              className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#0a0908] text-[#f4f1ea] flex items-center justify-center shadow-lg shadow-[#0a0908]/30 border border-[#f4f1ea]/10 transition-transform duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b8924c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f4f1ea] ${
                isDragging ? 'cursor-grabbing scale-105' : 'cursor-grab hover:scale-105'
              }`}
              style={{ left: `${divider}%`, zIndex: 4 }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
              >
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
            <div
              className="absolute top-3 left-3 md:top-5 md:left-6 pointer-events-none"
              style={{ zIndex: 3 }}
            >
              <span className="inline-block px-2 py-1 bg-[#8b3a2f]/85 backdrop-blur-sm rounded text-[#f4f1ea] font-mono tracking-[0.15em] uppercase" style={{ fontSize: 'clamp(9px, 1.4vw, 11px)' }}>
                <span className="md:hidden">Before</span>
                <span className="hidden md:inline">Before · filings, forgotten</span>
              </span>
            </div>
            <div
              className="absolute bottom-3 right-3 md:bottom-auto md:top-5 md:right-6 pointer-events-none"
              style={{ zIndex: 3 }}
            >
              <span className="inline-block px-2 py-1 bg-[#0a0908]/85 backdrop-blur-sm rounded text-[#f4f1ea] font-mono tracking-[0.15em] uppercase" style={{ fontSize: 'clamp(9px, 1.4vw, 11px)' }}>
                <span className="md:hidden">After</span>
                <span className="hidden md:inline">After · filings, finalised</span>
              </span>
            </div>
          </div>
        </Reveal>

        {/* Footnote below the panel */}
        <Reveal variant="fade-up" delay={0.2}>
          <p className="mt-5 md:mt-7 text-[#0a0908]/55 font-mono text-[11px] tracking-[0.2em] uppercase text-center">
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

type Invoice = {
  left: string;
  top: string;
  width: string;
  rotate: number;
  z: number;
  tone: 'paper' | 'yellowed';
  stamp?: 'overdue' | 'pending' | 'unpaid';
  scribble?: boolean;
};

// Hand-placed to feel tossed, not gridded. z-index staggered so some cards
// clearly overlap others (the chaos of a folder that was never filed).
const INVOICES: Invoice[] = [
  { left: '2%',  top: '10%', width: '28%', rotate: -6, z: 1, tone: 'paper',    stamp: 'overdue' },
  { left: '22%', top: '22%', width: '26%', rotate:  4, z: 3, tone: 'yellowed'                  },
  { left: '4%',  top: '48%', width: '30%', rotate:  9, z: 2, tone: 'paper',    stamp: 'pending', scribble: true },
  { left: '36%', top: '6%',  width: '24%', rotate: -3, z: 4, tone: 'paper'                     },
  { left: '48%', top: '38%', width: '28%', rotate:  6, z: 5, tone: 'yellowed', stamp: 'unpaid' },
  { left: '38%', top: '62%', width: '26%', rotate: -8, z: 3, tone: 'paper',    scribble: true  },
  { left: '66%', top: '14%', width: '26%', rotate:  3, z: 4, tone: 'yellowed'                  },
  { left: '72%', top: '52%', width: '24%', rotate: -5, z: 5, tone: 'paper',    stamp: 'overdue' },
];

const ChaosPane: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Desk texture — faint crossed grain */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: '#e5dfd0',
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
        className="absolute bg-white shadow-sm overflow-hidden"
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
        <div className="h-full px-3 flex items-center gap-3 font-mono text-[11px] text-[#0a0908]/65 whitespace-nowrap">
          <span>18,240.00</span>
          <span>+</span>
          <span>4,610.00</span>
          <span>+</span>
          <span>?</span>
          <span>+</span>
          <span className="text-[#8b3a2f]">12,300.50</span>
          <span>=</span>
          <span className="text-[#8b3a2f]">??</span>
        </div>
      </div>

      {/* Invoice cards */}
      {INVOICES.map((inv, i) => (
        <InvoiceCard key={i} {...inv} seed={i} />
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
          stroke="#8b3a2f"
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
        <div className="w-full h-full rounded-full border-[3px] border-[#0a0908]/35" style={{ clipPath: 'inset(0 0 0 35%)' }} />
      </div>
    </div>
  );
};

const InvoiceCard: React.FC<Invoice & { seed: number }> = ({
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
  const bg = tone === 'yellowed' ? '#f5ecd6' : '#fbf7ec';
  const lines = 4 + (seed % 3); // vary line count

  return (
    <div
      className="absolute"
      style={{
        left,
        top,
        width,
        aspectRatio: '4 / 3',
        transform: `rotate(${rotate}deg)`,
        zIndex: z,
      }}
    >
      <div
        className="relative w-full h-full rounded-[2px] shadow-[0_6px_14px_-6px_rgba(10,9,8,0.35)] overflow-hidden border border-[#0a0908]/8"
        style={{ backgroundColor: bg }}
      >
        {/* Header */}
        <div className="px-3 pt-2 pb-1.5 flex items-center justify-between border-b border-dashed border-[#0a0908]/15">
          <span className="font-mono text-[8px] md:text-[9px] tracking-[0.2em] uppercase text-[#0a0908]/65">
            Invoice · {String(1024 + seed * 37).padStart(4, '0')}
          </span>
          <span className="font-mono text-[7px] md:text-[8px] text-[#0a0908]/45">
            {/* Throwaway "dates" that look plausibly old */}
            {['12/04', '03/07', '28/11', '19/02', '06/09', '22/01', '14/05', '30/08'][seed % 8]}
          </span>
        </div>
        {/* Body — fake text lines */}
        <div className="p-3 space-y-1.5">
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className="h-[2px] bg-[#0a0908]/15 rounded-full"
              style={{ width: `${55 + ((seed * 13 + i * 19) % 40)}%` }}
            />
          ))}
          <div className="pt-1.5 flex justify-between">
            <div className="h-[3px] w-[30%] bg-[#0a0908]/25 rounded-full" />
            <div className="h-[3px] w-[22%] bg-[#0a0908]/25 rounded-full" />
          </div>
        </div>

        {/* Optional hand-scribble over the card */}
        {scribble && (
          <svg
            className="absolute inset-0 pointer-events-none"
            viewBox="0 0 100 75"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M10 60 Q30 40, 50 58 T 90 55"
              stroke="#1A4D2E"
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

const Stamp: React.FC<{ label: 'overdue' | 'pending' | 'unpaid' }> = ({ label }) => {
  const text = label.toUpperCase();
  return (
    <div
      className="absolute"
      style={{
        right: '6%',
        bottom: '10%',
        transform: 'rotate(-8deg)',
        border: '2px solid #8b3a2f',
        color: '#8b3a2f',
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
      {text}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  AFTER — Order pane                                                         */
/* -------------------------------------------------------------------------- */

const LEDGER_ROWS: Array<{ label: string; value: string; bold?: boolean; section?: boolean }> = [
  { label: 'Revenue from Operations',   value: '2,48,14,600' },
  { label: 'Other Income',              value: '    3,62,450' },
  { label: 'Total Revenue',             value: '2,51,77,050', bold: true },
  { label: 'Cost of Materials',         value: '  96,48,220',             section: true },
  { label: 'Employee Benefits',         value: '  42,10,900' },
  { label: 'Finance Costs',             value: '   5,84,300' },
  { label: 'Depreciation',              value: '   8,92,150' },
  { label: 'Other Expenses',            value: '  28,74,480' },
  { label: 'Profit Before Tax',         value: '  69,67,000', bold: true,  section: true },
  { label: 'Tax Expense',               value: '  17,53,050' },
  { label: 'Profit for the Year',       value: '  52,13,950', bold: true },
];

const OrderPane: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Paper base — cleaner than chaos pane, with a subtle warm vignette */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: '#f4f1ea',
          backgroundImage:
            'radial-gradient(ellipse at 50% 30%, rgba(184,146,76,0.05) 0%, rgba(184,146,76,0) 60%)',
        }}
      />

      {/* Faint rule grid — suggests ruled accounting paper */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'linear-gradient(to bottom, rgba(10,9,8,0.05) 1px, transparent 1px)',
          backgroundSize: '100% 28px',
        }}
      />

      {/* Centred ledger card */}
      <div className="absolute inset-0 flex items-center justify-center p-4 md:p-10">
        <div
          className="w-full max-w-[520px] bg-[#f8f5ec] border border-[#b8924c]/50 shadow-[0_20px_40px_-18px_rgba(10,9,8,0.25)]"
          style={{ borderRadius: '4px' }}
        >
          {/* Masthead */}
          <div className="px-5 md:px-7 pt-5 md:pt-7 pb-3 md:pb-4 border-b border-[#b8924c]/40">
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-[9px] md:text-[10px] tracking-[0.3em] uppercase text-[#8b3a2f]">
                Statement of Profit &amp; Loss
              </span>
              <span className="font-mono text-[9px] md:text-[10px] tracking-[0.2em] uppercase text-[#0a0908]/55">
                FY 2025&ndash;26
              </span>
            </div>
            <div className="mt-1 font-serif italic text-[#0a0908]/70 text-[11px] md:text-xs">
              for the year ended 31 March 2026
            </div>
            {/* Brass gradient hairline */}
            <div className="mt-3 h-px bg-gradient-to-r from-[#b8924c]/10 via-[#b8924c] to-[#b8924c]/10" />
          </div>

          {/* Ledger body */}
          <div className="px-5 md:px-7 py-4 md:py-5">
            <div className="font-mono text-[11px] md:text-[13px] text-[#0a0908]">
              {LEDGER_ROWS.map((row, i) => (
                <div key={i}>
                  {row.section && (
                    <div className="h-px my-2 bg-[#0a0908]/10" />
                  )}
                  <div
                    className={`flex items-baseline justify-between py-[3px] md:py-1 ${
                      row.bold ? 'font-bold text-[#0a0908]' : 'text-[#0a0908]/80'
                    }`}
                  >
                    <span className="pr-4 truncate">{row.label}</span>
                    <span className="tabular-nums whitespace-pre">
                      ₹ {row.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer — closed seal */}
          <div className="px-5 md:px-7 pb-5 md:pb-6 pt-2 flex items-center justify-between border-t border-[#b8924c]/30">
            <span className="font-mono text-[9px] md:text-[10px] tracking-[0.25em] uppercase text-[#0a0908]/55">
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
        <circle cx="27" cy="27" r="25" fill="none" stroke="#b8924c" strokeWidth="1" />
        <circle cx="27" cy="27" r="21" fill="none" stroke="#b8924c" strokeWidth="0.5" strokeDasharray="1 2" />
      </svg>
      <div className="flex flex-col items-center leading-none">
        <span className="font-serif italic text-[#8b3a2f] text-[10px]">closed</span>
        <span className="font-mono text-[8px] tracking-[0.15em] text-[#0a0908]/70 mt-[2px]">
          FY25-26
        </span>
      </div>
    </div>
  );
};

export default ChaosToOrder;
