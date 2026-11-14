import { useEffect, useRef, useState } from 'react';
import { bittenCookie } from '../data/site';

interface CrumbBurstItem {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  rot: number;
  size: number;
  kind: 'crumb' | 'chip';
}

let cursorAudioCtx: AudioContext | null = null;

function playCursorCookiePop() {
  if (typeof window === 'undefined') return;
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return;
  if (!cursorAudioCtx) {
    cursorAudioCtx = new Ctx();
  }
  const ctx = cursorAudioCtx;
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  if (ctx.state !== 'running') return;

  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.24, now);
  master.connect(ctx.destination);

  // Cute bubbly cookie pop
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const basePitch = 420 + Math.random() * 140;
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(basePitch, now);
  osc.frequency.exponentialRampToValueAtTime(basePitch * 1.65, now + 0.04);
  osc.frequency.exponentialRampToValueAtTime(basePitch * 0.95, now + 0.085);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.8, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.095);

  osc.connect(gain);
  gain.connect(master);
  osc.start(now);
  osc.stop(now + 0.1);
}

export function CookieCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [clicking, setClicking] = useState(false);
  const [crumbs, setCrumbs] = useState<CrumbBurstItem[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!mq.matches || reduced) return;

    setEnabled(true);
    document.documentElement.classList.add('has-cookie-cursor');

    let rafId = 0;
    let targetX = -100;
    let targetY = -100;
    let curX = -100;
    let curY = -100;

    const tick = () => {
      curX += (targetX - curX) * 0.42;
      curY += (targetY - curY) * 0.42;
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${curX}px, ${curY}px, 0)`;
      }
      if (Math.abs(targetX - curX) > 0.2 || Math.abs(targetY - curY) > 0.2) {
        rafId = requestAnimationFrame(tick);
      } else {
        rafId = 0;
      }
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      targetX = e.clientX;
      targetY = e.clientY;
      setVisible(true);

      const el = e.target as HTMLElement | null;
      const isInteractive = Boolean(
        el?.closest('a, button, [role="button"], input, textarea, select, [data-interactive="true"]')
      );
      setHovering(isInteractive);

      if (!rafId) {
        rafId = requestAnimationFrame(tick);
      }
    };

    const onDown = (e: PointerEvent) => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      setClicking(true);
      window.setTimeout(() => setClicking(false), 160);

      playCursorCookiePop();

      const count = 6;
      const batch: CrumbBurstItem[] = Array.from({ length: count }, (_, i) => {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
        const dist = 24 + Math.random() * 28;
        return {
          id: ++idRef.current,
          x: e.clientX,
          y: e.clientY,
          dx: Math.cos(angle) * dist,
          dy: Math.sin(angle) * dist + 10,
          rot: Math.round((Math.random() - 0.5) * 240),
          size: 7 + Math.random() * 6,
          kind: i % 2 === 0 ? 'crumb' : 'chip',
        };
      });

      setCrumbs((prev) => [...prev.slice(-24), ...batch]);
      window.setTimeout(() => {
        const ids = new Set(batch.map((b) => b.id));
        setCrumbs((prev) => prev.filter((item) => !ids.has(item.id)));
      }, 650);
    };

    const onLeave = () => setVisible(false);

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    document.addEventListener('mouseleave', onLeave);

    return () => {
      document.documentElement.classList.remove('has-cookie-cursor');
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      document.removeEventListener('mouseleave', onLeave);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      {/* Custom Cookie Cursor */}
      <div
        ref={cursorRef}
        className={`cookie-cursor${visible ? ' is-visible' : ''}${hovering ? ' is-hover' : ''}${clicking ? ' is-click' : ''}`}
        aria-hidden="true"
      >
        <img src={bittenCookie} alt="" className="cookie-cursor__img" draggable={false} />
      </div>

      {/* Click Crumb & Chocolate Chip Bursts */}
      <div className="cookie-cursor-bursts" aria-hidden="true">
        {crumbs.map((c) => (
          <span
            key={c.id}
            className={`cookie-cursor-crumb cookie-cursor-crumb--${c.kind}`}
            style={
              {
                left: `${c.x}px`,
                top: `${c.y}px`,
                width: `${c.size}px`,
                height: `${c.size}px`,
                '--dx': `${c.dx}px`,
                '--dy': `${c.dy}px`,
                '--rot': `${c.rot}deg`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
    </>
  );
}

