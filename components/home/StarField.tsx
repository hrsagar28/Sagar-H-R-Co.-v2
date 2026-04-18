
import React, { useMemo } from 'react';
import { useReducedMotion } from '../../hooks';

/**
 * StarField — a restrained, editorial night-sky background for the Home hero.
 *
 * Design intent (kept deliberately quiet so it reads as wallpaper, not spectacle):
 *   - 48 pin-prick stars (≈30 on mobile), 1–2.5px diameter, opacity 0.14–0.55.
 *   - Three stars twinkle on a slow 5–7s opacity cycle. Rest are static.
 *   - One "anchor" star in the upper-right quadrant is slightly brighter (3px)
 *     with a soft moss-green halo — a fixed reference point. Conceptual nod
 *     to the practice: a north star that doesn't move.
 *   - A thin moss horizon line sits in the lower third.
 *   - Fully disables motion under `prefers-reduced-motion`.
 */

type Star = { cx: number; cy: number; r: number; o: number; twinkle?: boolean };

// Deterministic star positions. Hand-distributed across a 100×100 viewBox
// so the eye doesn't fall into grid artefacts. Kept sparse around the lower
// third so headline copy stays legible.
const STARS: Star[] = [
  { cx: 3.2,  cy: 8.4,  r: 1.1, o: 0.32 },
  { cx: 7.8,  cy: 18.1, r: 0.9, o: 0.22 },
  { cx: 11.4, cy: 5.6,  r: 1.3, o: 0.44 },
  { cx: 14.9, cy: 24.2, r: 0.8, o: 0.19 },
  { cx: 18.7, cy: 12.3, r: 1.0, o: 0.28 },
  { cx: 22.1, cy: 31.8, r: 1.2, o: 0.36, twinkle: true },
  { cx: 26.3, cy: 7.1,  r: 0.9, o: 0.25 },
  { cx: 29.8, cy: 19.4, r: 1.1, o: 0.31 },
  { cx: 33.5, cy: 3.9,  r: 0.8, o: 0.17 },
  { cx: 37.2, cy: 26.7, r: 1.3, o: 0.48 },
  { cx: 41.6, cy: 14.2, r: 0.9, o: 0.23 },
  { cx: 44.8, cy: 33.5, r: 1.0, o: 0.29 },
  { cx: 48.3, cy: 9.8,  r: 1.4, o: 0.52, twinkle: true },
  { cx: 51.9, cy: 21.6, r: 0.8, o: 0.18 },
  { cx: 55.4, cy: 5.2,  r: 1.1, o: 0.34 },
  { cx: 58.7, cy: 28.9, r: 0.9, o: 0.24 },
  { cx: 62.5, cy: 16.3, r: 1.2, o: 0.39 },
  { cx: 66.1, cy: 35.1, r: 0.8, o: 0.16 },
  { cx: 69.8, cy: 4.5,  r: 1.0, o: 0.27 },
  { cx: 73.4, cy: 22.8, r: 1.1, o: 0.33 },
  { cx: 76.9, cy: 11.5, r: 0.9, o: 0.21 },
  // "Anchor" neighbourhood (upper-right). A couple of lesser stars surround
  // the anchor so it reads as a constellation, not a lone ornament.
  { cx: 82.1, cy: 7.8,  r: 1.2, o: 0.42 },
  { cx: 85.7, cy: 14.6, r: 0.9, o: 0.26 },
  { cx: 88.3, cy: 19.2, r: 1.0, o: 0.30 },
  { cx: 91.8, cy: 9.4,  r: 1.1, o: 0.36, twinkle: true },
  { cx: 94.6, cy: 25.7, r: 0.8, o: 0.20 },
  { cx: 97.2, cy: 16.8, r: 1.0, o: 0.29 },
  // Lower half — sparser so headline type reads clean
  { cx: 5.1,  cy: 48.3, r: 0.9, o: 0.18 },
  { cx: 12.8, cy: 62.9, r: 1.0, o: 0.22 },
  { cx: 19.4, cy: 54.1, r: 0.8, o: 0.15 },
  { cx: 28.7, cy: 70.6, r: 1.1, o: 0.26 },
  { cx: 36.2, cy: 58.4, r: 0.9, o: 0.19 },
  { cx: 42.9, cy: 76.3, r: 0.8, o: 0.14 },
  { cx: 51.3, cy: 64.8, r: 1.0, o: 0.21 },
  { cx: 58.6, cy: 52.7, r: 0.9, o: 0.17 },
  { cx: 64.2, cy: 78.9, r: 1.1, o: 0.24 },
  { cx: 71.5, cy: 61.4, r: 0.8, o: 0.16 },
  { cx: 78.3, cy: 73.2, r: 0.9, o: 0.19 },
  { cx: 83.7, cy: 56.8, r: 1.0, o: 0.22 },
  { cx: 89.4, cy: 68.5, r: 0.8, o: 0.15 },
  { cx: 94.1, cy: 51.9, r: 0.9, o: 0.18 },
  { cx: 2.6,  cy: 37.2, r: 0.9, o: 0.21 },
  { cx: 16.3, cy: 42.1, r: 0.8, o: 0.17 },
  { cx: 31.9, cy: 45.8, r: 1.0, o: 0.23 },
  { cx: 46.7, cy: 39.5, r: 0.9, o: 0.19 },
  { cx: 60.8, cy: 44.2, r: 1.0, o: 0.24 },
  { cx: 74.2, cy: 41.6, r: 0.8, o: 0.16 },
  { cx: 87.9, cy: 38.3, r: 0.9, o: 0.20 },
];

// Mobile subset — removes every second star in the busy upper half to keep
// performance up and the aesthetic quiet on small screens.
const mobileStars = (stars: Star[]): Star[] =>
  stars.filter((_, i) => i % 3 !== 2);

const StarField: React.FC<{ className?: string }> = ({ className = '' }) => {
  const prefersReduced = useReducedMotion();

  // Memoise the per-star animation-delay so React doesn't recompute on rerender.
  const desktopStars = useMemo(() => STARS, []);
  const smallStars = useMemo(() => mobileStars(STARS), []);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {/* Warm-ink base (slightly warmer than pure black so it sits alongside
          the brand's editorial zones without clashing). */}
      <div className="absolute inset-0 bg-[#0a0908]" />

      {/* Subtle vertical gradient — darker at top-left, almost-black at bottom
          — so the stars feel like they sit in depth rather than on a flat plate. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(26,77,46,0.08),transparent_55%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050403]" />

      {/* Star SVG — desktop */}
      <svg
        viewBox="0 0 100 80"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full hidden md:block"
      >
        {desktopStars.map((s, i) => (
          <circle
            key={i}
            cx={s.cx}
            cy={s.cy}
            r={s.r * 0.18}
            fill="#ffffff"
            opacity={s.twinkle && !prefersReduced ? undefined : s.o}
            className={
              s.twinkle && !prefersReduced ? 'sh-star-twinkle' : undefined
            }
            style={
              s.twinkle && !prefersReduced
                ? ({
                    animationDelay: `${(i % 3) * 1.4}s`,
                    ['--sh-o' as any]: s.o,
                  } as React.CSSProperties)
                : undefined
            }
          />
        ))}
        {/* Anchor star — the "north star". Slightly brighter, haloed moss. */}
        <g>
          <circle
            cx="79.5"
            cy="12.5"
            r="1.4"
            fill="#1A4D2E"
            opacity="0.35"
            className={!prefersReduced ? 'sh-star-halo' : undefined}
          />
          <circle cx="79.5" cy="12.5" r="0.55" fill="#ffffff" opacity="0.92" />
        </g>
      </svg>

      {/* Star SVG — mobile (sparser) */}
      <svg
        viewBox="0 0 100 80"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full md:hidden"
      >
        {smallStars.map((s, i) => (
          <circle
            key={i}
            cx={s.cx}
            cy={s.cy}
            r={s.r * 0.2}
            fill="#ffffff"
            opacity={s.twinkle && !prefersReduced ? undefined : s.o}
            className={
              s.twinkle && !prefersReduced ? 'sh-star-twinkle' : undefined
            }
            style={
              s.twinkle && !prefersReduced
                ? ({
                    animationDelay: `${(i % 3) * 1.4}s`,
                    ['--sh-o' as any]: s.o,
                  } as React.CSSProperties)
                : undefined
            }
          />
        ))}
        <g>
          <circle
            cx="79.5"
            cy="12.5"
            r="1.6"
            fill="#1A4D2E"
            opacity="0.4"
            className={!prefersReduced ? 'sh-star-halo' : undefined}
          />
          <circle cx="79.5" cy="12.5" r="0.65" fill="#ffffff" opacity="0.95" />
        </g>
      </svg>

      {/* Horizon line — a single thin moss stroke in the lower third.
          Conceptual "ground" so the stars above feel positioned, not floating. */}
      <div
        className="absolute left-0 right-0 h-px"
        style={{
          top: '78%',
          background:
            'linear-gradient(to right, transparent 0%, rgba(26,77,46,0.0) 8%, rgba(26,77,46,0.35) 50%, rgba(26,77,46,0.0) 92%, transparent 100%)',
        }}
      />

      {/* Keyframes — scoped here so the component is self-contained and
          doesn't leak animation names into the global stylesheet. */}
      <style>{`
        @keyframes sh-star-twinkle {
          0%, 100% { opacity: var(--sh-o, 0.35); }
          50%      { opacity: calc(var(--sh-o, 0.35) * 0.25); }
        }
        .sh-star-twinkle {
          animation: sh-star-twinkle 6s ease-in-out infinite;
        }
        @keyframes sh-star-halo {
          0%, 100% { opacity: 0.35; transform-origin: center; }
          50%      { opacity: 0.6; }
        }
        .sh-star-halo {
          transform-box: fill-box;
          transform-origin: center;
          animation: sh-star-halo 7s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .sh-star-twinkle, .sh-star-halo { animation: none !important; }
        }
      `}</style>
    </div>
  );
};

export default StarField;
