import { useEffect, useRef, useState } from 'react';
import { bittenCookie } from '../data/site';
import { useIntroDone } from './Preloader';

// ── Deterministic PRNG for falling crumbs & chocolate chips ───────────
function makeRnd(initSeed: number) {
  let s = initSeed;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

const rnd = makeRnd(42);

// ── Original scattered Mini-Cookies (fixed positions, rotate & drift on scroll) ──
const MINI_COOKIES_DATA = [
  { left: 6,  top: 16, size: 86,  hpar: -30, hrot: 260  },
  { left: 84, top: 10, size: 60,  hpar: -62, hrot: -320 },
  { left: 8,  top: 70, size: 120, hpar: -24, hrot: 200  },
  { left: 76, top: 66, size: 150, hpar: -18, hrot: -240 },
  { left: 48, top: 84, size: 56,  hpar: -52, hrot: 420  },
  { left: 30, top: 8,  size: 44,  hpar: -70, hrot: -380 },
];

interface FallingItem {
  id: string;
  kind: 'crumb' | 'chip' | 'glow';
  left: number;       // 2% to 98%
  size: number;       // px
  duration: number;   // seconds to fall from top to bottom
  delay: number;      // negative delay so screen starts populated
  sway: number;       // horizontal sway amplitude in px
  rotStart: number;   // initial rotation deg
  rotSpeed: number;   // rotation delta over one fall cycle
  opacity: number;
  blur: number;       // depth-of-field blur in px
  color: string;
  hpar: number;       // scroll parallax factor
}

const CRUMB_PALETTE = ['#E39744', '#F48A17', '#F6A762', '#FFE9C2', '#C97B2B'];

// Generate 32 continuous falling cookie crumbs, chocolate chips & golden specks
const FALLING_ITEMS: FallingItem[] = Array.from({ length: 32 }, (_, i) => {
  const r = rnd();
  const kind: FallingItem['kind'] =
    r < 0.45
      ? 'crumb'
      : r < 0.82
      ? 'chip'
      : 'glow';

  const size =
    kind === 'crumb'
      ? 10 + rnd() * 14
      : kind === 'chip'
      ? 10 + rnd() * 12
      : 6 + rnd() * 14;

  const duration = 6.5 + rnd() * 8.5;

  // Spread evenly across horizontal columns with slight jitter
  const col = (i / 32) * 94 + 3;
  const left = Math.min(97, Math.max(2, col + (rnd() - 0.5) * 6));

  return {
    id: `fall-${i}`,
    kind,
    left,
    size,
    duration,
    delay: -(rnd() * duration),
    sway: (rnd() > 0.5 ? 1 : -1) * (14 + rnd() * 28),
    rotStart: Math.round(rnd() * 360),
    rotSpeed: (rnd() > 0.5 ? 1 : -1) * (180 + rnd() * 360),
    opacity:
      kind === 'glow'
        ? 0.3 + rnd() * 0.35
        : 0.72 + rnd() * 0.28,
    blur: kind === 'glow' && size > 13 ? 1.5 : 0,
    color: CRUMB_PALETTE[i % CRUMB_PALETTE.length],
    hpar: -(15 + rnd() * 65),
  };
});

/** SVG shape for falling cookie crumbs & chocolate chips */
function FallingParticleGraphic({ item }: { item: FallingItem }) {
  if (item.kind === 'chip') {
    // Classic teardrop/chunk dark chocolate chip with warm cocoa sheen
    return (
      <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" aria-hidden="true">
        <path
          d="M12 2.5C12 2.5 5 10.2 5 15.2C5 19.1 8.1 21.8 12 21.8C15.9 21.8 19 19.1 19 15.2C19 10.2 12 2.5 12 2.5Z"
          fill="#261105"
          stroke="#5A2E14"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M9.5 11.5C8.2 13.5 8 15.6 8.8 17.2"
          stroke="rgba(255, 224, 185, 0.38)"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (item.kind === 'crumb') {
    // Stylized golden cookie chunk with dark chocolate crust border & tiny chip spot
    return (
      <svg viewBox="0 0 28 28" width="100%" height="100%" fill="none" aria-hidden="true">
        <path
          d="M6.5 9.2C5.2 5.4 10.4 3.2 15.6 4.4C20.8 5.6 24.4 9.8 23.2 15.4C22.0 21.0 16.4 23.8 10.8 22.0C5.6 20.2 3.8 15.2 6.5 9.2Z"
          fill={item.color}
          stroke="#361D07"
          strokeWidth="2.8"
          strokeLinejoin="round"
        />
        <circle cx="15.5" cy="12.5" r="2.3" fill="#361D07" />
        <circle cx="10.5" cy="16.2" r="1.4" fill="#361D07" opacity="0.75" />
      </svg>
    );
  }

  // Soft warm golden crumb speck
  return (
    <span
      className="opening-fall-glow-dot"
      style={{ backgroundColor: item.color }}
    />
  );
}

/**
 * Pure vector SVG matching public/assets/brand/bitten_cookie.png 1:1
 * so the Opening hero cookie stays 100% razor-sharp at 19x zoom with zero blur.
 */
const HERO_COOKIE_PATH = [
  'M 111.5 34.5',
  'A 14 14 0 0 0 119.5 55.5',
  'A 22 22 0 0 0 145.5 76.5',
  'A 15 15 0 0 0 167.5 85.5',
  'A 68 68 0 1 1 111.5 34.5',
  'Z',
].join(' ');

function HeroBittenCookieSvg() {
  return (
    <svg
      viewBox="0 0 200 200"
      className="opening-ck"
      aria-hidden="true"
      shapeRendering="geometricPrecision"
    >
      <defs>
        <clipPath id="opening-hero-cookie-clip">
          <path d={HERO_COOKIE_PATH} />
        </clipPath>
      </defs>

      {/* Dark Chocolate Outer Crust matching bitten_cookie.png */}
      <path
        d={HERO_COOKIE_PATH}
        fill="#331803"
        stroke="#331803"
        strokeWidth="18.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Golden Cookie Dough Body */}
      <path d={HERO_COOKIE_PATH} fill="#DE8C3F" />

      {/* 7 Chocolate Chips matching exact positions of bitten_cookie.png */}
      <g fill="#331803" clipPath="url(#opening-hero-cookie-clip)">
        <circle cx="78" cy="68" r="9.8" />
        <circle cx="56" cy="105" r="9.2" />
        <circle cx="101" cy="111" r="9.8" />
        <circle cx="141" cy="108" r="5.0" />
        <circle cx="74" cy="142" r="9.5" />
        <circle cx="100" cy="156" r="4.2" />
        <circle cx="129" cy="142" r="9.5" />
      </g>

      {/* Two Floating Crumb Dots */}
      <circle cx="154.5" cy="48" r="4.2" fill="#331803" />
      <circle cx="170.5" cy="27" r="5.2" fill="#331803" />
    </svg>
  );
}

export function Opening() {
  const ready = useIntroDone();
  const heroRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const wmRef = useRef<HTMLHeadingElement>(null);
  const oElRef = useRef<HTMLSpanElement>(null);
  const lkRef = useRef<HTMLSpanElement>(null);
  const lKRef = useRef<HTMLSpanElement>(null);
  const liRef = useRef<HTMLSpanElement>(null);
  const lcoRef = useRef<HTMLSpanElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const tipRef = useRef<HTMLParagraphElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const hudCookieRef = useRef<HTMLDivElement>(null);
  const secLabelRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLElement>(null);
  const backTopRingRef = useRef<SVGCircleElement>(null);
  const dotsRef = useRef<HTMLElement>(null);
  const ctrlsRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);

  const [clickPulse, setClickPulse] = useState(0);

  useEffect(() => {
    if (!ready || !heroRef.current || !pinRef.current || !oElRef.current || !wmRef.current) return;

    const hero = heroRef.current;
    const pin = pinRef.current;
    const wm = wmRef.current;
    const oEl = oElRef.current;
    const lk = lkRef.current;
    const lK = lKRef.current;
    const li = liRef.current;
    const lco = lcoRef.current;
    const tagline = taglineRef.current;
    const tip = tipRef.current;
    const cue = cueRef.current;
    const hudCookie = hudCookieRef.current;
    const secLabel = secLabelRef.current;
    const bar = barRef.current;
    const dotsEl = dotsRef.current;
    const field = fieldRef.current;

    const miniEls = field ? (Array.from(field.querySelectorAll('[data-mini]')) as HTMLElement[]) : [];
    const fallEls = field ? (Array.from(field.querySelectorAll('[data-fall]')) as HTMLElement[]) : [];

    const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
    const ease2 = (t: number) => t * t * (3 - 2 * t);

    let raf = 0;

    const frame = () => {
      raf = 0;
      const vh = window.innerHeight;
      const sy = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - vh;

      // Hide bottom-right floating controls when near the footer so the footer Back-to-Top button is unobstructed
      if (ctrlsRef.current) {
        const nearBottom = maxScroll > 0 && maxScroll - sy < 220;
        ctrlsRef.current.style.opacity = nearBottom ? '0' : '1';
        ctrlsRef.current.style.pointerEvents = nearBottom ? 'none' : 'auto';
      }
      const scrollRatio = maxScroll > 0 ? clamp(sy / maxScroll, 0, 1) : 0;
      if (bar) {
        bar.style.transform = `scaleX(${scrollRatio})`;
      }
      if (backTopRingRef.current) {
        const circumference = 119.38;
        backTopRingRef.current.style.strokeDashoffset = String(circumference * (1 - scrollRatio));
      }
      if (hudCookie) {
        hudCookie.style.transform = `rotate(${sy * 0.35}deg)`;
      }

      // Check current section for HUD label & dots
      if (secLabel && dotsEl) {
        const posterEl = document.getElementById('poster');
        const postEl = document.getElementById('first-post');
        const logoEl = document.getElementById('logo');
        const conceptEl = document.getElementById('concept');

        const btns = dotsEl.querySelectorAll('.opening-dot');
        const setDotIndex = (activeIdx: number, label: string) => {
          secLabel.textContent = label;
          btns.forEach((btn, idx) => {
            if (idx === activeIdx) {
              btn.classList.add('on');
            } else {
              btn.classList.remove('on');
            }
          });
        };

        if (posterEl && posterEl.getBoundingClientRect().top <= vh * 0.45) {
          setDotIndex(4, 'CT #3');
        } else if (postEl && postEl.getBoundingClientRect().top <= vh * 0.45) {
          setDotIndex(3, 'CT #2');
        } else if (logoEl && logoEl.getBoundingClientRect().top <= vh * 0.45) {
          setDotIndex(2, 'CT #1');
        } else if (conceptEl && conceptEl.getBoundingClientRect().top <= vh * 0.45) {
          setDotIndex(1, 'PT #1');
        } else {
          setDotIndex(0, 'Opening');
        }
      }

      // ── Core Scroll-Driven Zoom Engine ──────────────────────────────────
      const hr = hero.getBoundingClientRect();
      const scrollDistance = hr.height - vh;
      const p = clamp(-hr.top / Math.max(scrollDistance, 1), 0, 1);

      // Center offset: centers the cookie precisely in the viewport
      const dx = pin.clientWidth / 2 - (wm.offsetLeft + oEl.offsetLeft + oEl.offsetWidth / 2);
      const dy = pin.clientHeight / 2 - (wm.offsetTop + oEl.offsetTop + oEl.offsetHeight / 2);
      const m = ease2(clamp(p / 0.9, 0, 1));

      const curTranslateX = dx * m;
      const curTranslateY = dy * m;
      const curRotate = p * 1080;
      // Exponential continuous scale that covers the entire viewport with orange crust & chips
      const curScale = 1 + 18 * Math.pow(clamp(p / 0.92, 0, 1), 2.2);

      // Apply 2D transform (no translate3d) so the browser re-rasterizes the vector SVG
      // crisply at every zoom level instead of upscaling a cached GPU bitmap
      oEl.style.transform = `translate(${curTranslateX}px, ${curTranslateY}px) rotate(${curRotate}deg) scale(${curScale})`;

      // Letters push away and fade out
      const out = clamp(p * 2.4, 0, 1);
      if (lk) {
        lk.style.transform = `translate3d(${-p * 60}vw, 0, 0)`;
        lk.style.opacity = `${1 - out}`;
      }
      if (lK) {
        lK.style.transform = `translate3d(${p * 46}vw, 0, 0)`;
        lK.style.opacity = `${1 - out}`;
      }
      if (li) {
        li.style.transform = `translate3d(${p * 58}vw, 0, 0)`;
        li.style.opacity = `${1 - out}`;
      }
      if (lco) {
        lco.style.transform = `translate3d(${p * 70}vw, 0, 0)`;
        lco.style.opacity = `${1 - out}`;
      }

      // Tagline, tip, and cue fade out
      const fadeVal = String(1 - clamp(p * 4, 0, 1));
      const fadeY = -p * 30;
      if (tagline) {
        tagline.style.opacity = fadeVal;
        tagline.style.transform = `translate3d(0, ${fadeY}px, 0)`;
      }
      if (tip) {
        tip.style.opacity = fadeVal;
        tip.style.transform = `translate3d(0, ${fadeY}px, 0)`;
      }
      if (cue) {
        const cueOpacity = sy > 12 ? Math.max(0, 1 - clamp((sy - 12) / 60, 0, 1)) : 1 - clamp(p * 20, 0, 1);
        if (sy > 12) {
          cue.style.animation = 'none';
        }
        cue.style.opacity = String(cueOpacity);
        cue.style.visibility = cueOpacity <= 0.01 ? 'hidden' : 'visible';
      }

      // Scattered Mini-Cookies: stay in their scattered spots and rotate + drift as you scroll
      miniEls.forEach((el) => {
        const par = parseFloat(el.getAttribute('data-hpar') || '0');
        const rot = parseFloat(el.getAttribute('data-hrot') || '0');
        el.style.transform = `translate3d(0, ${p * par}vh, 0) rotate(${p * rot}deg)`;
      });

      // Falling Cookie Crumbs & Chocolate Chips: parallax drift on scroll
      fallEls.forEach((el) => {
        const par = parseFloat(el.getAttribute('data-hpar') || '0');
        el.style.transform = `translate3d(0, ${p * par}vh, 0)`;
      });
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    frame();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ready]);

  const toggleFs = () => {
    try {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        document.documentElement.requestFullscreen?.();
      }
    } catch {}
  };

  const scrollToNext = () => {
    document.getElementById('concept')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* ── Fixed Presentation HUD (Top-Left) ─────────────────────────── */}
      <div className="opening-hud" ref={hudRef} aria-label="Presentation progress">
        <div className="opening-hud-cookie" ref={hudCookieRef}>
          <img src={bittenCookie} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} draggable={false} />
        </div>
        <span className="opening-hud-brand">kOKi.co</span>
        <span className="opening-hud-sep" />
        <span className="opening-hud-label" ref={secLabelRef}>
          Opening
        </span>
        <div className="opening-hud-bar-track">
          <i className="opening-hud-bar" ref={barRef} />
        </div>
      </div>

      {/* ── Fixed Presentation Dots (Right Side) ──────────────────────── */}
      <nav className="opening-dots" ref={dotsRef} aria-label="Presentation sections">
        <button type="button" className="opening-dot on" data-label="Opening" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Go to Opening" />
        <button type="button" className="opening-dot" data-label="PT #1" onClick={scrollToNext} aria-label="Go to PT #1" />
        <button type="button" className="opening-dot" data-label="CT #1" onClick={() => document.getElementById('logo')?.scrollIntoView({ behavior: 'smooth' })} aria-label="Go to CT #1" />
        <button type="button" className="opening-dot" data-label="CT #2" onClick={() => document.getElementById('first-post')?.scrollIntoView({ behavior: 'smooth' })} aria-label="Go to CT #2" />
        <button type="button" className="opening-dot" data-label="CT #3" onClick={() => document.getElementById('poster')?.scrollIntoView({ behavior: 'smooth' })} aria-label="Go to CT #3" />
      </nav>

      {/* ── Fixed Presentation Controls (Bottom-Right) ────────────────── */}
      <div className="opening-ctrl" ref={ctrlsRef} aria-label="Controls">
        <button
          type="button"
          className="opening-backtop"
          aria-label="Back to top"
          title="Back to top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <svg className="opening-backtop__ring" viewBox="0 0 44 44" aria-hidden="true">
            <circle
              cx="22"
              cy="22"
              r="19"
              fill="none"
              stroke="rgba(75, 38, 8, 0.14)"
              strokeWidth="3"
            />
            <circle
              ref={backTopRingRef}
              cx="22"
              cy="22"
              r="19"
              fill="none"
              stroke="#4B2608"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeDasharray="119.38"
              strokeDashoffset="119.38"
            />
          </svg>
          <svg className="opening-backtop__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </button>
        <button type="button" aria-label="Toggle fullscreen" title="Toggle fullscreen" onClick={toggleFs}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
          </svg>
        </button>
      </div>

      {/* ── 320svh Hero Container with 100svh Sticky Pin ──────────────── */}
      <section className={`opening-hero${ready ? ' is-ready' : ' is-loading'}`} ref={heroRef} id="top" data-nav="Opening">
        <div className="opening-hero-pin" ref={pinRef}>
          {/* Radial warm background glow */}
          <div className="opening-hero-glow" aria-hidden="true" />

          {/* Background Field:
              1. Falling Cookie Crumbs & Chocolate Chips (falling from top)
              2. Scattered Mini-Cookies (fixed scattered positions, rotate & follow scroll) */}
          <div className="opening-field" ref={fieldRef} aria-hidden="true">
            {FALLING_ITEMS.map((item) => (
              <div
                key={item.id}
                className={`opening-fall-wrap opening-fall-wrap--${item.kind}`}
                data-fall="1"
                data-hpar={item.hpar}
                style={{
                  left: `${item.left}%`,
                  width: `${item.size}px`,
                  height: `${item.size}px`,
                  opacity: item.opacity,
                  filter: item.blur > 0 ? `blur(${item.blur}px)` : undefined,
                }}
              >
                <div
                  className="opening-fall-inner"
                  style={
                    {
                      '--fall-dur': `${item.duration.toFixed(2)}s`,
                      '--fall-delay': `${item.delay.toFixed(2)}s`,
                      '--fall-sway': `${item.sway.toFixed(1)}px`,
                      '--rot-start': `${item.rotStart}deg`,
                      '--rot-end': `${item.rotStart + item.rotSpeed}deg`,
                    } as React.CSSProperties
                  }
                >
                  <FallingParticleGraphic item={item} />
                </div>
              </div>
            ))}

            {MINI_COOKIES_DATA.map((m, i) => (
              <div
                key={`mini-${i}`}
                className="opening-mini"
                data-mini="1"
                data-hpar={m.hpar}
                data-hrot={m.hrot}
                style={{
                  left: `${m.left}%`,
                  top: `${m.top}%`,
                  width: `${m.size}px`,
                  height: `${m.size}px`,
                  filter: m.size < 70 ? 'blur(1px)' : undefined,
                }}
              >
                <img src={bittenCookie} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} draggable={false} />
              </div>
            ))}
          </div>

          {/* Giant Wordmark: k [Cookie O] K i .co */}
          <h1 className="opening-wm" ref={wmRef} aria-label="kOKi.co">
            <span className="opening-l" ref={lkRef} aria-hidden="true">
              k
            </span>
            <span
              className="opening-o"
              ref={oElRef}
              aria-hidden="true"
              onClick={() => setClickPulse((c) => c + 1)}
              title="Click to shower crumbs!"
            >
              <HeroBittenCookieSvg />
              {clickPulse > 0 && (
                <span key={clickPulse} className="opening-click-burst" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
              )}
            </span>
            <span className="opening-l" ref={lKRef} aria-hidden="true">
              K
            </span>
            <span className="opening-l" ref={liRef} aria-hidden="true">
              i
            </span>
            <span className="opening-co" ref={lcoRef} aria-hidden="true">
              .co
            </span>
          </h1>

          {/* Tagline */}
          <p className="opening-tagline" ref={taglineRef}>
            It&rsquo;s okay not to be <b>kOKi</b>
          </p>

          {/* Scroll Cue with dripping indicator */}
          <div className="opening-cue" ref={cueRef}>
            Scroll<i aria-hidden="true" />
          </div>
        </div>
      </section>
    </>
  );
}
