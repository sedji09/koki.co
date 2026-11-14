import { useEffect, useRef, useState } from 'react';
import type { Img } from '../data/site';
import { useActiveLightboxItem, useLightbox } from './Lightbox';
import { useReducedMotion } from '../hooks/useReducedMotion';

const COPIES = 3; // 3 sets so user can swipe left or right endlessly from the middle set
const REST_TILTS = [-2.4, 1.9, -1.5, 2.3, -2.0, 1.6];

/** Wooden Clothespin SVG that clips over the straight horizontal cord */
function WoodenPin() {
  return (
    <span className="polaroid-pin" aria-hidden="true">
      <svg width="28" height="56" viewBox="0 0 26 54" fill="none">
        {/* Back shadow */}
        <rect x="4" y="2" width="18" height="50" rx="3" fill="rgba(25, 10, 3, 0.35)" transform="translate(2, 2)" />
        {/* Left wood half */}
        <path
          d="M4 4C4 2.34315 5.34315 1 7 1H13V51H6C4.89543 51 4 50.1046 4 49V4Z"
          fill="#DEC096"
        />
        {/* Right wood half */}
        <path
          d="M13 1H19C20.6569 1 22 2.34315 22 4V49C22 50.1046 21.1046 51 20 51H13V1Z"
          fill="#CDA97B"
        />
        {/* Bevel groove where the straight cord passes */}
        <rect x="4" y="19" width="18" height="4.5" rx="1" fill="#A67F50" />
        {/* Metal spring coil band */}
        <rect x="3.5" y="20" width="19" height="2.5" rx="1.2" fill="#EFEAE2" />
        <rect x="11.5" y="16" width="3" height="9" rx="1" fill="#D5CEC2" />
        {/* Bottom notch grip */}
        <path d="M9 51L13 44L17 51H9Z" fill="#8C653A" opacity="0.55" />
      </svg>
    </span>
  );
}

/**
 * Interactive Polaroid Clothesline / Closet Rack.
 * - Uses native horizontal scroll + direct mouse grab-and-drag with inertia
 * - Works with mouse drag, touchscreen swipe, trackpad 2-finger swipe, and arrow buttons
 * - Seamless infinite loop (starts in middle set so you can swipe left or right immediately)
 * - Pendulum sway physics as Polaroids slide along the straight cord
 * - Click any Polaroid to zoom in Lightbox
 */
export function Marquee({ items }: { items: Img[] }) {
  const reduced = useReducedMotion();
  const open = useLightbox();
  const activeItem = useActiveLightboxItem();
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const firstSetRef = useRef<HTMLDivElement>(null);

  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [isDraggingUI, setIsDraggingUI] = useState(false);

  const state = useRef({
    setW: 0,
    initialized: false,
    isDown: false,
    startX: 0,
    startScrollLeft: 0,
    lastPageX: 0,
    lastTime: 0,
    vx: 0,
    moved: 0,
    lastScrollLeft: 0,
    swing: 0,
    swingVel: 0,
  });

  // Measure set width and center scrollLeft on the middle set (set #1)
  useEffect(() => {
    const vp = viewportRef.current;
    const el = firstSetRef.current;
    const tr = trackRef.current;
    if (!vp || !el || !tr) return;

    const measure = () => {
      const gap = parseFloat(getComputedStyle(tr).columnGap) || 0;
      const w = el.offsetWidth + gap;
      if (w > 0) {
        state.current.setW = w;
        if (!state.current.initialized) {
          vp.scrollLeft = w;
          state.current.lastScrollLeft = w;
          state.current.initialized = true;
        }
      }
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [items.length]);

  // Momentum + seamless wrap + pendulum swing animation loop
  useEffect(() => {
    let raf = 0;
    let lastSwing = NaN;

    const tick = () => {
      const vp = viewportRef.current;
      const tr = trackRef.current;
      const s = state.current;

      if (vp && s.setW > 0) {
        // Apply momentum when mouse is released
        if (!s.isDown && Math.abs(s.vx) > 0.1) {
          vp.scrollLeft += s.vx;
          s.vx *= 0.92;
          if (Math.abs(s.vx) < 0.1) s.vx = 0;
        }

        // Seamless infinite wrap around middle set
        if (vp.scrollLeft <= s.setW * 0.25) {
          vp.scrollLeft += s.setW;
          s.lastScrollLeft += s.setW;
          if (s.isDown) s.startScrollLeft += s.setW;
        } else if (vp.scrollLeft >= s.setW * 1.75) {
          vp.scrollLeft -= s.setW;
          s.lastScrollLeft -= s.setW;
          if (s.isDown) s.startScrollLeft -= s.setW;
        }

        // Calculate scroll velocity for pendulum swing
        const scrollDelta = vp.scrollLeft - s.lastScrollLeft;
        s.lastScrollLeft = vp.scrollLeft;

        if (!reduced) {
          const targetSwing = Math.max(-14, Math.min(14, scrollDelta * 0.55));
          const springForce = (targetSwing - s.swing) * 0.16;
          s.swingVel = (s.swingVel + springForce) * 0.8;
          s.swing += s.swingVel;
        } else {
          s.swing = 0;
        }

        if (tr && Math.abs(s.swing - lastSwing) > 0.02) {
          tr.style.setProperty('--rack-swing', `${s.swing.toFixed(2)}deg`);
          lastSwing = s.swing;
        }
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  // Mouse grab-and-drag listeners on window
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const s = state.current;
      const vp = viewportRef.current;
      if (!s.isDown || !vp) return;

      e.preventDefault();
      const dx = e.pageX - s.startX;
      s.moved = Math.max(s.moved, Math.abs(dx));

      if (s.moved > 4) {
        setIsDraggingUI(true);
      }

      const now = performance.now();
      const dt = Math.max(8, now - s.lastTime);
      const stepDx = e.pageX - s.lastPageX;
      s.vx = -(stepDx / dt) * 15;
      s.lastPageX = e.pageX;
      s.lastTime = now;

      vp.scrollLeft = s.startScrollLeft - dx;
    };

    const onMouseUp = () => {
      const s = state.current;
      if (!s.isDown) return;
      s.isDown = false;
      setIsDraggingUI(false);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: false });
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('blur', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('blur', onMouseUp);
    };
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const vp = viewportRef.current;
    if (!vp) return;
    const s = state.current;
    s.isDown = true;
    s.startX = e.pageX;
    s.lastPageX = e.pageX;
    s.lastTime = performance.now();
    s.startScrollLeft = vp.scrollLeft;
    s.moved = 0;
    s.vx = 0;
  };

  const onTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    const s = state.current;
    s.startX = touch.pageX;
    s.moved = 0;
    s.vx = 0;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    const s = state.current;
    s.moved = Math.max(s.moved, Math.abs(touch.pageX - s.startX));
  };

  const slideBy = (dir: 1 | -1) => {
    const firstCard = firstSetRef.current?.firstElementChild as HTMLElement | null;
    const gap = trackRef.current ? parseFloat(getComputedStyle(trackRef.current).columnGap) || 0 : 0;
    const step = (firstCard?.offsetWidth ?? 320) + gap;
    state.current.vx = dir * (step * 0.085);
  };

  return (
    <div className="polaroid-rack">
      {/* Interactive Swipe Hint */}

      <div className="polaroid-rack__stage">
        {/* Straight Horizontal Line / Tali stretching all the way across */}
        <div className="polaroid-rack__line" aria-hidden="true" />

        {/* Left / Right Closet Slide Buttons */}
        <button
          type="button"
          className="polaroid-rack__edge-btn polaroid-rack__edge-btn--prev"
          onClick={() => slideBy(-1)}
          aria-label="Slide Polaroids left"
        >
          ‹
        </button>
        <button
          type="button"
          className="polaroid-rack__edge-btn polaroid-rack__edge-btn--next"
          onClick={() => slideBy(1)}
          aria-label="Slide Polaroids right"
        >
          ›
        </button>

        {/* Scrollable & Draggable Viewport */}
        <div
          ref={viewportRef}
          className={`polaroid-rack__viewport${isDraggingUI ? ' is-dragging' : ''}`}
          role="region"
          aria-roledescription="interactive polaroid clothesline"
          aria-label="Supporting kOKi.co brand posts clipped on a line"
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onDragStart={(e) => e.preventDefault()}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') {
              e.preventDefault();
              slideBy(-1);
            } else if (e.key === 'ArrowRight') {
              e.preventDefault();
              slideBy(1);
            }
          }}
        >
          {/* Sliding Rack Track */}
          <div ref={trackRef} className="polaroid-rack__track">
            {Array.from({ length: COPIES }, (_, c) => (
              <div
                key={c}
                ref={c === 0 ? firstSetRef : undefined}
                className="polaroid-rack__set"
                aria-hidden={c !== 1 ? true : undefined}
              >
                {items.map((im, i) => {
                  const key = `${c}-${i}`;
                  const baseTilt = REST_TILTS[i % REST_TILTS.length];
                  const isUnclipped = activeItem?.src === im.src;

                  // Closet parting effect when hovering a sibling Polaroid in the same set
                  let closetShift = 0;
                  if (hoveredKey !== null) {
                    const [hSet, hIdxStr] = hoveredKey.split('-');
                    const hIdx = Number(hIdxStr);
                    if (Number(hSet) === c && hIdx !== i) {
                      closetShift = i < hIdx ? -18 : 18;
                    }
                  }

                  return (
                    <button
                      key={key}
                      type="button"
                      tabIndex={c === 1 ? 0 : -1}
                      className={`polaroid-item${hoveredKey === key ? ' is-hovered' : ''}${isUnclipped ? ' is-unclipped' : ''}`}
                      style={
                        {
                          '--base-tilt': `${baseTilt}deg`,
                          '--closet-shift': `${closetShift}px`,
                        } as React.CSSProperties
                      }
                      onMouseEnter={() => setHoveredKey(key)}
                      onMouseLeave={() => setHoveredKey((prev) => (prev === key ? null : prev))}
                      onFocus={() => setHoveredKey(key)}
                      onBlur={() => setHoveredKey((prev) => (prev === key ? null : prev))}
                      onClick={(e) => {
                        if (state.current.moved > 6) {
                          e.preventDefault();
                          e.stopPropagation();
                          return;
                        }
                        open({
                          ...im,
                          caption: `Supporting brand post ${i + 1} of ${items.length}`,
                          polaroid: true,
                          polaroidNum: `#${String(i + 1).padStart(2, '0')}`,
                          author: im.author,
                        });
                      }}
                      aria-label={`Supporting post ${i + 1} of ${items.length} — click to zoom`}
                    >
                      {/* Wooden Clothespin gripping the straight line */}
                      <WoodenPin />

                      {/* Classic Polaroid Frame */}
                      <div className="polaroid-card">
                        <div className="polaroid-card__photo-wrap">
                          <img
                            src={im.src}
                            alt={c === 1 ? im.alt : ''}
                            width={im.width}
                            height={im.height}
                            loading="eager"
                            decoding="async"
                            draggable={false}
                            className="polaroid-card__img"
                          />
                          <span className="polaroid-card__zoom-pill" aria-hidden="true">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="11" cy="11" r="8" />
                              <line x1="21" y1="21" x2="16.65" y2="16.65" />
                              <line x1="11" y1="8" x2="11" y2="14" />
                              <line x1="8" y1="11" x2="14" y2="11" />
                            </svg>
                            Zoom
                          </span>
                        </div>

                        {/* Polaroid Bottom Chin */}
                        <div className="polaroid-card__chin">
                          <span className="polaroid-card__num">#{String(i + 1).padStart(2, '0')}</span>
                          <span className="polaroid-card__tag">{im.author ? `By ${im.author}` : 'kOKi.co Archive'}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
