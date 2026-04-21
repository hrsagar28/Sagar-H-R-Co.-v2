import React, { useRef, useEffect, useCallback } from 'react';
import { useReducedMotion } from '../../hooks';

const BG = '#06070a';
const MOBILE_BP = 768;
const NEBULA_COLOR = 'rgba(90,110,180,0.06)';
const WARM_WHITE = '#fff4e0';
const SHOOT_ANGLE_DEG = 215;
const SHOOT_ANGLE_SPREAD = 15;
const SHOOT_TRAIL_LEN = 140;
const SHOOT_FADE_IN = 180;
const SHOOT_TRAVEL = 900;
const SHOOT_FADE_OUT = 220;
const SHOOT_AVG_INTERVAL = 55_000;

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

const rand = (a: number, b: number) => a + Math.random() * (b - a);

const seedBack = (w: number, h: number, n: number): Star[] =>
  Array.from({ length: n }, () => ({
    x: rand(0, w),
    y: rand(0, h),
    r: rand(0.3, 0.8),
    o: rand(0.2, 0.5),
    vx: rand(0.02, 0.06),
    vy: rand(0.01, 0.04),
  }));

const seedMid = (w: number, h: number, n: number): MidStar[] =>
  Array.from({ length: n }, () => ({
    x: rand(0, w),
    y: rand(0, h),
    r: rand(0.8, 1.4),
    o: 0,
    vx: rand(0.03, 0.07),
    vy: rand(0.015, 0.05),
    phase: rand(0, Math.PI * 2),
    period: rand(4000, 9000),
    warm: Math.random() < 0.15,
  }));

const StarField: React.FC<{ className?: string }> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const drawStatic = useCallback((canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, w, h);

    // nebula
    const grad = ctx.createRadialGradient(w * 0.5, h * 0.25, 0, w * 0.5, h * 0.25, w * 0.45);
    grad.addColorStop(0, NEBULA_COLOR);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    const isMobile = w < MOBILE_BP;
    const backStars = seedBack(w, h, isMobile ? 110 : 180);
    const midStars = seedMid(w, h, isMobile ? 24 : 40);

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
      ctx.fillStyle = s.warm
        ? `rgba(255,244,224,${o})`
        : `rgba(255,255,255,${o})`;
      ctx.fill();
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // save-data fallback
    const nav = navigator as any;
    if (nav.connection?.saveData) {
      canvas.style.display = 'none';
      container.style.background = `radial-gradient(ellipse at 50% 30%, rgba(90,110,180,0.08), ${BG} 70%)`;
      return;
    }

    if (reducedMotion) {
      drawStatic(canvas);
      return;
    }

    const ctx = canvas.getContext('2d')!;
    let dpr = window.devicePixelRatio || 1;
    let w = 0;
    let h = 0;
    let backStars: Star[] = [];
    let midStars: MidStar[] = [];
    let shooting: ShootingStar | null = null;
    let mouseX = 0;
    let mouseY = 0;
    let isTouch = 'ontouchstart' in window;
    let visible = true;
    let rafId = 0;
    let lastFrame = 0;
    let nebulaX = 0;
    let nebulaY = 0;
    let resizeTimer: ReturnType<typeof setTimeout>;

    const resize = () => {
      dpr = window.devicePixelRatio || 1;
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const isMobile = w < MOBILE_BP;
      backStars = seedBack(w, h, isMobile ? 110 : 180);
      midStars = seedMid(w, h, isMobile ? 24 : 40);
    };

    resize();

    // parallax
    const onMouseMove = (e: MouseEvent) => {
      if (isTouch) return;
      const rect = container.getBoundingClientRect();
      mouseX = (e.clientX - rect.left) / rect.width - 0.5;
      mouseY = (e.clientY - rect.top) / rect.height - 0.5;
    };
    container.addEventListener('mousemove', onMouseMove, { passive: true });

    // visibility
    const io = new IntersectionObserver(
      ([entry]) => { visible = entry.intersectionRatio >= 0.1; },
      { threshold: 0.1 }
    );
    io.observe(container);

    // resize debounced
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
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
      if (age > totalLife) { shooting = null; return; }

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
      rafId = requestAnimationFrame(loop);
      if (!visible) return;

      const dt = lastFrame ? now - lastFrame : 16;
      lastFrame = now;
      // cap at ~60fps
      if (dt < 14) return;

      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, w, h);

      // nebula drifts in upper third on 60s cycle
      const nebulaT = (now % 60_000) / 60_000 * Math.PI * 2;
      nebulaX = w * 0.5 + Math.sin(nebulaT) * w * 0.12;
      nebulaY = h * 0.2 + Math.cos(nebulaT * 0.7) * h * 0.08;
      const nebGrad = ctx.createRadialGradient(nebulaX, nebulaY, 0, nebulaX, nebulaY, w * 0.45);
      nebGrad.addColorStop(0, NEBULA_COLOR);
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
        ctx.fillStyle = s.warm
          ? `rgba(255,244,224,${o})`
          : `rgba(255,255,255,${o})`;
        ctx.fill();
      }

      trySpawnShoot(dt);
      drawShoot(now);
    };

    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      io.disconnect();
      ro.disconnect();
      container.removeEventListener('mousemove', onMouseMove);
      clearTimeout(resizeTimer);
    };
  }, [reducedMotion, drawStatic]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={{ background: BG }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
};

export default StarField;
