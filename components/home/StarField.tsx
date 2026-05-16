import React, { useRef, useEffect, useCallback } from 'react';
import { useReducedMotion } from '../../hooks';

export const STARFIELD_BG = '#06070a';
const MOBILE_BP = 768;
/** Below this width the mid-layer (breathing warm stars) is skipped entirely
 *  to save fillrate on the cheapest devices. Audit H-04. */
const NARROW_MOBILE_BP = 360;
export const STARFIELD_NEBULA = 'rgba(90,110,180,0.06)';
const SHOOT_ANGLE_DEG = 215;
const SHOOT_ANGLE_SPREAD = 15;
const SHOOT_TRAIL_LEN = 140;
const SHOOT_FADE_IN = 180;
const SHOOT_TRAVEL = 900;
const SHOOT_FADE_OUT = 220;
const SHOOT_AVG_INTERVAL = 55_000;
const MAX_DPR = 2;

/** Star counts per layer, broken down by device class. Lowered on mobile
 *  after audit H-04 — the previous 90/180 back and 20/40 mid was the single
 *  biggest CPU sink during hero entry on mid-tier Android. */
const STAR_COUNTS = {
  mobile: { back: 60, mid: 14 },
  desktop: { back: 180, mid: 40 },
  /** Static draw — used when reduced motion / save-data is on, so we don't
   *  bother breathing or parallaxing. Counts are intentionally lower than
   *  the animated path because there's no temporal averaging to forgive
   *  high density. */
  staticMobile: { back: 60, mid: 14 },
  staticDesktop: { back: 90, mid: 20 },
} as const;

/** Schedule a callback at the next idle opportunity, falling back to a short
 *  setTimeout in browsers without requestIdleCallback (Safari < 17.4). */
const scheduleIdle = (cb: () => void, timeout = 250): (() => void) => {
  const w = window as Window & {
    requestIdleCallback?: (cb: IdleRequestCallback, opts?: IdleRequestOptions) => number;
    cancelIdleCallback?: (id: number) => void;
  };
  if (typeof w.requestIdleCallback === 'function') {
    const id = w.requestIdleCallback(cb, { timeout });
    return () => w.cancelIdleCallback?.(id);
  }
  const id = window.setTimeout(cb, 0);
  return () => window.clearTimeout(id);
};

interface Star {
  x: number;
  y: number;
  r: number;
  o: number;
  vx: number;
  vy: number;
}

interface MidStar extends Star {
  phase: number;
  period: number;
  warm: boolean;
}

interface ShootingStar {
  x: number;
  y: number;
  angle: number;
  birth: number;
  speed: number;
}

interface NavigatorConnection {
  saveData?: boolean;
  effectiveType?: string;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NavigatorConnection;
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const getCanvasDpr = () => Math.min(window.devicePixelRatio || 1, MAX_DPR);

const seedBack = (w: number, h: number, n: number): Star[] =>
  Array.from({ length: n }, () => ({
    x: rand(0, w),
    y: rand(0, h),
    r: rand(0.6, 1.2),
    o: rand(0.35, 0.7),
    vx: rand(0.02, 0.06),
    vy: rand(0.01, 0.04),
  }));

const seedMid = (w: number, h: number, n: number): MidStar[] =>
  Array.from({ length: n }, () => ({
    x: rand(0, w),
    y: rand(0, h),
    r: rand(1.0, 1.8),
    o: 0,
    vx: rand(0.03, 0.07),
    vy: rand(0.015, 0.05),
    phase: rand(0, Math.PI * 2),
    period: rand(4000, 9000),
    warm: Math.random() < 0.15,
  }));

const StarField: React.FC<{ className?: string }> = ({ className = '' }) => {
  'use memo';
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const drawStatic = useCallback((canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = getCanvasDpr();
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = STARFIELD_BG;
    ctx.fillRect(0, 0, w, h);

    // nebula
    const grad = ctx.createRadialGradient(w * 0.5, h * 0.25, 0, w * 0.5, h * 0.25, w * 0.45);
    grad.addColorStop(0, STARFIELD_NEBULA);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    const isMobile = w < MOBILE_BP;
    const isNarrow = w < NARROW_MOBILE_BP;
    const counts = isMobile ? STAR_COUNTS.staticMobile : STAR_COUNTS.staticDesktop;
    const backStars = seedBack(w, h, counts.back);
    // Skip the mid (breathing warm) layer entirely on the narrowest devices.
    const midStars = isNarrow ? [] : seedMid(w, h, counts.mid);

    for (const s of backStars) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${s.o})`;
      ctx.fill();
    }
    for (const s of midStars) {
      const o = 0.35 + (0.9 - 0.35) * 0.5;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.warm ? `rgba(255,244,224,${o})` : `rgba(255,255,255,${o})`;
      ctx.fill();
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const nav = navigator as NavigatorWithConnection;
    const connection = nav.connection;
    const liteMode = Boolean(
      connection?.saveData || connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g',
    );

    let staticRafId = 0;
    const scheduleStaticDraw = (attempt = 0) => {
      staticRafId = requestAnimationFrame(() => {
        if ((canvas.clientWidth === 0 || canvas.clientHeight === 0) && attempt < 5) {
          scheduleStaticDraw(attempt + 1);
          return;
        }

        drawStatic(canvas);
      });
    };

    if (reducedMotion || liteMode) {
      scheduleStaticDraw();

      return () => {
        cancelAnimationFrame(staticRafId);
      };
    }

    const ctx = canvas.getContext('2d')!;
    let dpr = getCanvasDpr();
    let w = 0;
    let h = 0;
    let backStars: Star[] = [];
    let midStars: MidStar[] = [];
    let shooting: ShootingStar | null = null;
    let mouseX = 0;
    let mouseY = 0;
    let rafId = 0;
    let isLooping = false;
    let lastFrame = 0;
    let nebulaX = 0;
    let nebulaY = 0;
    let resizeTimer: ReturnType<typeof setTimeout>;
    const isTouch = 'ontouchstart' in window;
    let resizeRaf = 0;
    let containerRect = {
      left: 0,
      top: 0,
      width: 1,
      height: 1,
    };

    const resize = () => {
      dpr = getCanvasDpr();
      const rect = container.getBoundingClientRect();
      containerRect = {
        left: rect.left,
        top: rect.top,
        width: Math.max(1, rect.width),
        height: Math.max(1, rect.height),
      };
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const isMobile = w < MOBILE_BP;
      const isNarrow = w < NARROW_MOBILE_BP;
      const counts = isMobile ? STAR_COUNTS.mobile : STAR_COUNTS.desktop;
      backStars = seedBack(w, h, counts.back);
      // Below NARROW_MOBILE_BP (≈ phone landscape lock or very small device)
      // the mid layer is dropped entirely. Audit H-04.
      midStars = isNarrow ? [] : seedMid(w, h, counts.mid);
    };

    const scheduleResize = () => {
      if (resizeRaf) return;
      resizeRaf = requestAnimationFrame(() => {
        resizeRaf = 0;
        resize();
      });
    };

    const redrawTimer = setTimeout(() => {
      scheduleResize();
    }, 600);

    scheduleResize();

    // parallax
    const onMouseMove = (e: MouseEvent) => {
      if (isTouch) return;
      mouseX = (e.clientX - containerRect.left) / containerRect.width - 0.5;
      mouseY = (e.clientY - containerRect.top) / containerRect.height - 0.5;
    };
    container.addEventListener('mousemove', onMouseMove, { passive: true });

    // resize debounced
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(scheduleResize, 150);
    });
    ro.observe(container);

    const trySpawnShoot = (dt: number) => {
      if (shooting) return;
      const p = 1 - Math.exp(-dt / SHOOT_AVG_INTERVAL);
      if (Math.random() < p) {
        const angleDeg = SHOOT_ANGLE_DEG + rand(-SHOOT_ANGLE_SPREAD, SHOOT_ANGLE_SPREAD);
        const angleRad = (angleDeg * Math.PI) / 180;
        shooting = {
          x: rand(w * 0.3, w),
          y: rand(0, h * 0.4),
          angle: angleRad,
          birth: performance.now(),
          speed: rand(0.35, 0.55),
        };
      }
    };

    const drawShoot = (now: number) => {
      if (!shooting) return;
      const age = now - shooting.birth;
      const totalLife = SHOOT_FADE_IN + SHOOT_TRAVEL + SHOOT_FADE_OUT;
      if (age > totalLife) {
        shooting = null;
        return;
      }

      let alpha: number;
      if (age < SHOOT_FADE_IN) alpha = age / SHOOT_FADE_IN;
      else if (age < SHOOT_FADE_IN + SHOOT_TRAVEL) alpha = 1;
      else alpha = 1 - (age - SHOOT_FADE_IN - SHOOT_TRAVEL) / SHOOT_FADE_OUT;
      alpha = Math.max(0, Math.min(1, alpha));

      const dist = age * shooting.speed;
      const headX = shooting.x + Math.cos(shooting.angle) * dist;
      const headY = shooting.y + Math.sin(shooting.angle) * dist;
      const tailX = headX - Math.cos(shooting.angle) * SHOOT_TRAIL_LEN;
      const tailY = headY - Math.sin(shooting.angle) * SHOOT_TRAIL_LEN;

      const grad = ctx.createLinearGradient(tailX, tailY, headX, headY);
      grad.addColorStop(0, `rgba(255,255,255,0)`);
      grad.addColorStop(1, `rgba(255,255,255,${alpha * 0.8})`);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(headX, headY);
      ctx.stroke();
    };

    const loop = (now: number) => {
      if (!isLooping) return;
      if (document.visibilityState !== 'visible') {
        stopLoop();
        return;
      }

      const dt = lastFrame ? now - lastFrame : 16;
      lastFrame = now;
      // cap at ~60fps
      if (dt < 14) {
        rafId = requestAnimationFrame(loop);
        return;
      }

      ctx.fillStyle = STARFIELD_BG;
      ctx.fillRect(0, 0, w, h);

      // nebula drifts in upper third on 60s cycle
      const nebulaT = ((now % 60_000) / 60_000) * Math.PI * 2;
      nebulaX = w * 0.5 + Math.sin(nebulaT) * w * 0.12;
      nebulaY = h * 0.2 + Math.cos(nebulaT * 0.7) * h * 0.08;
      const nebGrad = ctx.createRadialGradient(nebulaX, nebulaY, 0, nebulaX, nebulaY, w * 0.45);
      nebGrad.addColorStop(0, STARFIELD_NEBULA);
      nebGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = nebGrad;
      ctx.fillRect(0, 0, w, h);

      const backPx = isTouch ? 0 : mouseX * w * 0.02;
      const backPy = isTouch ? 0 : mouseY * h * 0.02;
      const midPx = isTouch ? 0 : mouseX * w * 0.05;
      const midPy = isTouch ? 0 : mouseY * h * 0.05;

      // back layer
      for (const s of backStars) {
        s.x += s.vx;
        s.y += s.vy;
        if (s.x > w) s.x -= w;
        if (s.y > h) s.y -= h;
        ctx.beginPath();
        ctx.arc(s.x + backPx, s.y + backPy, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.o})`;
        ctx.fill();
      }

      // mid layer
      for (const s of midStars) {
        s.x += s.vx;
        s.y += s.vy;
        if (s.x > w) s.x -= w;
        if (s.y > h) s.y -= h;
        const breathe = Math.sin((now / s.period) * Math.PI * 2 + s.phase);
        const o = 0.35 + (0.9 - 0.35) * (breathe * 0.5 + 0.5);
        ctx.beginPath();
        ctx.arc(s.x + midPx, s.y + midPy, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.warm ? `rgba(255,244,224,${o})` : `rgba(255,255,255,${o})`;
        ctx.fill();
      }

      trySpawnShoot(dt);
      drawShoot(now);

      rafId = requestAnimationFrame(loop);
    };

    /** Idle-cancel handle for the very first startLoop. Lets us avoid
     *  starting the canvas loop until the main thread is free, so the
     *  hero LCP paint isn't competing with our 60 fps draw on first
     *  mount. Audit H-04. */
    let cancelInitialIdle: (() => void) | null = null;

    const startLoop = () => {
      if (isLooping) return;
      isLooping = true;
      lastFrame = 0;
      rafId = requestAnimationFrame(loop);
    };

    /** Defer the very first start through requestIdleCallback (with a
     *  short timeout so we never miss it entirely) so the canvas loop
     *  doesn't compete with hero LCP. Subsequent starts (re-entering the
     *  viewport, tab visibility flips) run immediately because the page
     *  is already warm by then. */
    let hasStartedOnce = false;
    const requestStartLoop = () => {
      if (hasStartedOnce) {
        startLoop();
        return;
      }
      hasStartedOnce = true;
      cancelInitialIdle?.();
      cancelInitialIdle = scheduleIdle(() => {
        cancelInitialIdle = null;
        // Re-check we're still in the right state before firing.
        if (document.visibilityState === 'visible') startLoop();
      });
    };

    const stopLoop = () => {
      cancelInitialIdle?.();
      cancelInitialIdle = null;
      if (!isLooping) return;
      isLooping = false;
      cancelAnimationFrame(rafId);
      rafId = 0;
      lastFrame = 0;
    };

    // visibility
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          requestStartLoop();
        } else {
          stopLoop();
        }
      },
      { rootMargin: '200px 0px' },
    );
    io.observe(container);

    const onVisibilityChange = () => {
      if (document.visibilityState !== 'visible') {
        stopLoop();
        return;
      }

      const rect = container.getBoundingClientRect();
      if (rect.bottom >= -200 && rect.top <= window.innerHeight + 200) {
        // Tab-resume doesn't need the idle gate — the page has already
        // painted by the time we get here.
        startLoop();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      stopLoop();
      io.disconnect();
      ro.disconnect();
      container.removeEventListener('mousemove', onMouseMove);
      clearTimeout(redrawTimer);
      clearTimeout(resizeTimer);
      cancelAnimationFrame(resizeRaf);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [reducedMotion, drawStatic]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={{ background: STARFIELD_BG }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
};

export default StarField;
