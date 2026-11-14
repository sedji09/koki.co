import { AnimatePresence, motion } from 'motion/react';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { bittenCookie, brand, heroCookie, logos } from '../data/site';
import { useReducedMotion } from '../hooks/useReducedMotion';

const IntroCtx = createContext(false);
/** true once the preloader has finished — used to start the hero entrance. */
export const useIntroDone = () => useContext(IntroCtx);

const MIN_MS = 3800; // enough time to watch the whole cookie get bitten step-by-step
const MAX_MS = 7500; // never trap the user behind a slow network

let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  if (!sharedAudioCtx) {
    sharedAudioCtx = new Ctx();
  }
  return sharedAudioCtx;
}

/**
 * Synthesizes a cute, playful cartoon cookie-bite ("nom / pop!") sound
 * via Web Audio API, ascending in pitch across bites 1–4 and ending
 * with a cheerful chime-pop on the final bite (Stage 5).
 */
async function playCuteCookieBite(stage: number) {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch {
      return;
    }
  }
  if (ctx.state !== 'running') return;

  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.36, now);
  master.connect(ctx.destination);

  const pitchOffset = (stage - 1) * 48;

  // 1. Cute bouncy "nom / chomp" bubble pop (triangle + sine)
  const osc = ctx.createOscillator();
  const popGain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(340 + pitchOffset, now);
  osc.frequency.exponentialRampToValueAtTime(660 + pitchOffset, now + 0.045);
  osc.frequency.exponentialRampToValueAtTime(420 + pitchOffset, now + 0.095);

  popGain.gain.setValueAtTime(0.001, now);
  popGain.gain.linearRampToValueAtTime(0.75, now + 0.012);
  popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

  osc.connect(popGain);
  popGain.connect(master);
  osc.start(now);
  osc.stop(now + 0.12);

  // 2. Gentle soft cookie nibble tick (very brief, light filtered tap)
  const sampleRate = ctx.sampleRate;
  const noiseLen = Math.floor(sampleRate * 0.04);
  const buffer = ctx.createBuffer(1, noiseLen, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < noiseLen; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / noiseLen, 2.5);
  }
  const noiseSrc = ctx.createBufferSource();
  noiseSrc.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1600, now);
  filter.Q.setValueAtTime(2.0, now);
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.28, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
  noiseSrc.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(master);
  noiseSrc.start(now);
  noiseSrc.stop(now + 0.045);

  // 3. Final bite (Stage 5): cute two-note chime ("ta-da!")
  if (stage >= 5) {
    const notes = [784, 1046.5]; // G5 -> C6
    notes.forEach((freq, idx) => {
      const chime = ctx.createOscillator();
      const cg = ctx.createGain();
      const t = now + 0.05 + idx * 0.075;
      chime.type = 'sine';
      chime.frequency.setValueAtTime(freq, t);
      cg.gain.setValueAtTime(0.001, t);
      cg.gain.linearRampToValueAtTime(0.45, t + 0.01);
      cg.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      chime.connect(cg);
      cg.connect(master);
      chime.start(t);
      chime.stop(t + 0.19);
    });
  }
}

function loadImage(src: string) {
  return new Promise<void>((res) => {
    const img = new Image();
    img.onload = img.onerror = () => res();
    img.src = src;
  });
}

/** Real progress: fonts + hero image + logos + window load (minimum time is enforced by pacing). */
function useLoadProgress() {
  const [target, setTarget] = useState(0);
  useEffect(() => {
    const tasks: Promise<unknown>[] = [
      document.fonts?.ready ?? Promise.resolve(),
      loadImage(heroCookie.src),
      loadImage(bittenCookie),
      loadImage(logos.primaryTrim),
      loadImage(logos.secondaryTrim),
      document.readyState === 'complete'
        ? Promise.resolve()
        : new Promise((r) => window.addEventListener('load', r, { once: true })),
    ];
    let done = 0;
    let alive = true;
    tasks.forEach((t) => t.then(() => alive && setTarget(++done / tasks.length)));
    const bail = setTimeout(() => alive && setTarget(1), MAX_MS);
    return () => {
      alive = false;
      clearTimeout(bail);
    };
  }, []);
  return target;
}

interface Scallop {
  cx: number;
  cy: number;
  r: number;
}

interface CrumbParticle {
  id: string;
  /** starting position right at the bite edge */
  x: number;
  y: number;
  /** outward scatter offset */
  dx: number;
  dy: number;
  /** size scale */
  size: number;
  /** 'cookie' = golden dough chunk with dark choc outline; 'chip' = solid dark choc morsel */
  kind: 'cookie' | 'chip';
  delay: number;
  rotate: number;
}

const COOKIE_CX = 100;
const COOKIE_CY = 100;
const COOKIE_R = 64;
const BORDER_W = 7.5;

/**
 * Computes an outward-shifted circle along the radial vector from the cookie center
 * so the outer mask completely clears the outer perimeter of the cookie without leaving
 * any thin leftover border slivers inside the bite notch.
 */
function getOuterClearCircle(sc: Scallop) {
  const vx = sc.cx - COOKIE_CX;
  const vy = sc.cy - COOKIE_CY;
  const len = Math.hypot(vx, vy) || 1;
  const shift = BORDER_W + 7;
  return {
    cx: sc.cx + (vx / len) * shift,
    cy: sc.cy + (vy / len) * shift,
    r: sc.r,
  };
}

/**
 * Progressive scalloped bites taken out of the whole cookie.
 * Stage 1 matches the iconic top-right bite from the kOKi.co logo.
 * Subsequent stages eat around the cookie until it is completely finished at Stage 5.
 */
const BITE_STAGES: {
  scallops: Scallop[];
  burstCrumbs: CrumbParticle[];
}[] = [
  // Stage 1: Top-Right Bite (exact kOKi.co logo bite silhouette)
  {
    scallops: [
      { cx: 126, cy: 48, r: 22 },
      { cx: 134, cy: 70, r: 26 },
      { cx: 156, cy: 78, r: 21 },
    ],
    burstCrumbs: [
      { id: 'b1-1', x: 140, y: 58, dx: 24, dy: -22, size: 1.05, kind: 'cookie', delay: 0, rotate: 55 },
      { id: 'b1-2', x: 148, y: 68, dx: 34, dy: -8, size: 0.82, kind: 'chip', delay: 0.03, rotate: -65 },
      { id: 'b1-3', x: 130, y: 48, dx: 12, dy: -32, size: 0.76, kind: 'chip', delay: 0.05, rotate: 80 },
      { id: 'b1-4', x: 152, y: 74, dx: 28, dy: 10, size: 0.9, kind: 'cookie', delay: 0.02, rotate: -40 },
      { id: 'b1-5', x: 136, y: 52, dx: 36, dy: -32, size: 0.65, kind: 'cookie', delay: 0.06, rotate: 95 },
    ],
  },
  // Stage 2: Top-Left Bite
  {
    scallops: [
      { cx: 70, cy: 46, r: 24 },
      { cx: 56, cy: 66, r: 27 },
      { cx: 42, cy: 86, r: 22 },
    ],
    burstCrumbs: [
      { id: 'b2-1', x: 56, y: 58, dx: -26, dy: -22, size: 1.05, kind: 'cookie', delay: 0, rotate: -60 },
      { id: 'b2-2', x: 48, y: 72, dx: -34, dy: -6, size: 0.85, kind: 'chip', delay: 0.03, rotate: 70 },
      { id: 'b2-3', x: 66, y: 48, dx: -14, dy: -32, size: 0.78, kind: 'cookie', delay: 0.04, rotate: -85 },
      { id: 'b2-4', x: 44, y: 82, dx: -28, dy: 12, size: 0.72, kind: 'chip', delay: 0.02, rotate: 45 },
      { id: 'b2-5', x: 54, y: 54, dx: -36, dy: -30, size: 0.65, kind: 'cookie', delay: 0.06, rotate: -35 },
    ],
  },
  // Stage 3: Bottom-Right Bite
  {
    scallops: [
      { cx: 152, cy: 114, r: 25 },
      { cx: 134, cy: 128, r: 29 },
      { cx: 118, cy: 148, r: 25 },
    ],
    burstCrumbs: [
      { id: 'b3-1', x: 140, y: 128, dx: 26, dy: 22, size: 1.05, kind: 'cookie', delay: 0, rotate: 65 },
      { id: 'b3-2', x: 148, y: 116, dx: 34, dy: 8, size: 0.82, kind: 'chip', delay: 0.03, rotate: -50 },
      { id: 'b3-3', x: 126, y: 144, dx: 16, dy: 32, size: 0.88, kind: 'cookie', delay: 0.04, rotate: 85 },
      { id: 'b3-4', x: 136, y: 134, dx: 36, dy: 28, size: 0.7, kind: 'chip', delay: 0.02, rotate: -75 },
      { id: 'b3-5', x: 120, y: 148, dx: 6, dy: 34, size: 0.68, kind: 'cookie', delay: 0.05, rotate: 35 },
    ],
  },
  // Stage 4: Left & Center Bite (leaves one cute final bite-sized piece at bottom-left/center)
  {
    scallops: [
      { cx: 96, cy: 84, r: 30 },
      { cx: 54, cy: 118, r: 26 },
      { cx: 114, cy: 112, r: 26 },
    ],
    burstCrumbs: [
      { id: 'b4-1', x: 62, y: 118, dx: -28, dy: 20, size: 1.0, kind: 'cookie', delay: 0, rotate: -55 },
      { id: 'b4-2', x: 88, y: 92, dx: 14, dy: -26, size: 0.84, kind: 'chip', delay: 0.02, rotate: 60 },
      { id: 'b4-3', x: 54, y: 124, dx: -32, dy: 28, size: 0.86, kind: 'cookie', delay: 0.04, rotate: 75 },
      { id: 'b4-4', x: 104, y: 108, dx: 24, dy: 18, size: 0.74, kind: 'chip', delay: 0.03, rotate: -80 },
    ],
  },
  // Stage 5: Final Bite (cookie completely eaten — final celebratory pop of cookie crumbs!)
  {
    scallops: [{ cx: 88, cy: 138, r: 64 }],
    burstCrumbs: [
      { id: 'b5-1', x: 86, y: 132, dx: -24, dy: -20, size: 1.05, kind: 'cookie', delay: 0, rotate: -50 },
      { id: 'b5-2', x: 94, y: 134, dx: 26, dy: -18, size: 0.92, kind: 'cookie', delay: 0.02, rotate: 65 },
      { id: 'b5-3', x: 84, y: 140, dx: -20, dy: 24, size: 0.82, kind: 'chip', delay: 0.03, rotate: 85 },
      { id: 'b5-4', x: 96, y: 140, dx: 22, dy: 24, size: 0.86, kind: 'cookie', delay: 0.04, rotate: -70 },
      { id: 'b5-5', x: 90, y: 128, dx: 2, dy: -30, size: 0.76, kind: 'chip', delay: 0.01, rotate: 40 },
      { id: 'b5-6', x: 88, y: 144, dx: -2, dy: 30, size: 0.72, kind: 'cookie', delay: 0.05, rotate: -90 },
    ],
  },
];

/** Chocolate chips positioned to match the kOKi.co logo cookie (plus 2 in top-right when whole). */
const CHOC_CHIPS = [
  { cx: 77, cy: 69, r: 9.5 },
  { cx: 122, cy: 62, r: 8.5 }, // eaten in Bite 1
  { cx: 142, cy: 82, r: 5.5 }, // eaten in Bite 1
  { cx: 58, cy: 103, r: 9.0 },
  { cx: 100, cy: 108, r: 9.5 },
  { cx: 138, cy: 105, r: 5.2 },
  { cx: 76, cy: 141, r: 9.5 },
  { cx: 101, cy: 155, r: 4.6 },
  { cx: 130, cy: 141, r: 9.5 },
];

function getBiteStage(pct: number): number {
  if (pct < 18) return 0; // Whole cookie (buo)
  if (pct < 38) return 1; // 1st bite (logo bite)
  if (pct < 58) return 2; // 2nd bite
  if (pct < 76) return 3; // 3rd bite
  if (pct < 93) return 4; // 4th bite
  return 5;               // Final bite
}

function getStatusMessage(biteStage: number): string {
  switch (biteStage) {
    case 0:
      return 'Baking a fresh, golden kOKi cookie...';
    case 1:
      return 'Taking the first crispy bite...';
    case 2:
      return 'Crumbs flying everywhere...';
    case 3:
      return 'Too good to stop at one bite...';
    case 4:
      return 'Almost down to the last crumb...';
    default:
      return 'Welcome to kOKi.co!';
  }
}

/**
 * Renders a stylized mini cookie-chunk crumb or chocolate chip morsel
 * matching the exact art style of the kOKi.co cookie.
 */
function StylizedCrumb({ kind, size }: { kind: 'cookie' | 'chip'; size: number }) {
  if (kind === 'chip') {
    return (
      <g transform={`scale(${size})`}>
        <path
          d="M-4.2,-1.8 C-4.8,-4.2 -1.5,-5.5 1.4,-4.6 C4.2,-3.8 5.4,-0.8 4.4,2.2 C3.4,4.8 -0.6,5.4 -3.2,3.6 C-4.8,2.4 -3.8,0.2 -4.2,-1.8 Z"
          fill="#361D07"
        />
      </g>
    );
  }
  return (
    <g transform={`scale(${size})`}>
      {/* Organic mini cookie chunk with dark chocolate border and golden dough fill */}
      <path
        d="M-6.2,-2.4 C-6.8,-5.8 -2.4,-7.4 1.8,-6.4 C5.8,-5.4 7.6,-1.2 6.2,3.0 C4.8,6.6 -0.8,7.4 -4.6,5.0 C-6.8,3.4 -5.6,0.4 -6.2,-2.4 Z"
        fill="#E39744"
        stroke="#361D07"
        strokeWidth="2.8"
        strokeLinejoin="round"
      />
      {/* Tiny chocolate fleck inside the cookie crumb */}
      <circle cx="1.2" cy="-0.8" r="1.5" fill="#361D07" />
    </g>
  );
}

/**
 * Interactive SVG Cookie that starts whole ("buo") and gets progressively bitten
 * with logo-style scalloped bite cutouts and stylized cookie-chunk crumbs.
 */
function BittenCookieLoaderIcon({ biteStage, reduced }: { biteStage: number; reduced: boolean }) {
  const activeStages = BITE_STAGES.slice(0, biteStage);
  const currentStageData = biteStage > 0 ? BITE_STAGES[biteStage - 1] : null;

  return (
    <div className="loader__cookie-badge">
      <div className="loader__cookie-halo" aria-hidden="true" />
      <div className="loader__cookie-disc">
        <motion.svg
          key={biteStage}
          viewBox="0 0 200 200"
          className="loader__cookie-svg"
          aria-hidden="true"
          initial={
            reduced || biteStage === 0
              ? false
              : { scale: 0.91, rotate: biteStage % 2 === 1 ? -6 : 6 }
          }
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 420, damping: 18 }}
        >
          <defs>
            {/* Outer dark chocolate crust mask:
                1. Inner-shifted circle (r - BORDER_W) leaves the thick dark chocolate border along the bite.
                2. Outward-shifted circle completely clears the outer perimeter so zero stray lines remain. */}
            <mask id="koki-outer-bite-mask">
              <rect x="0" y="0" width="200" height="200" fill="white" />
              {activeStages.map((stage, sIdx) =>
                stage.scallops.map((sc, cIdx) => {
                  const clear = getOuterClearCircle(sc);
                  return (
                    <g key={`out-${sIdx}-${cIdx}`}>
                      <circle
                        cx={sc.cx}
                        cy={sc.cy}
                        r={Math.max(0, sc.r - BORDER_W)}
                        fill="black"
                      />
                      <circle cx={clear.cx} cy={clear.cy} r={clear.r} fill="black" />
                    </g>
                  );
                })
              )}
            </mask>

            {/* Inner golden cookie dough mask: bite circles have full radius r */}
            <mask id="koki-inner-bite-mask">
              <rect x="0" y="0" width="200" height="200" fill="white" />
              {activeStages.map((stage, sIdx) =>
                stage.scallops.map((sc, cIdx) => {
                  const clear = getOuterClearCircle(sc);
                  return (
                    <g key={`in-${sIdx}-${cIdx}`}>
                      <circle cx={sc.cx} cy={sc.cy} r={sc.r} fill="black" />
                      <circle cx={clear.cx} cy={clear.cy} r={clear.r + BORDER_W} fill="black" />
                    </g>
                  );
                })
              )}
            </mask>

            {/* Clip path to keep chocolate chips neatly inside the inner dough circle */}
            <clipPath id="koki-dough-clip">
              <circle cx={COOKIE_CX} cy={COOKIE_CY} r={COOKIE_R - BORDER_W} />
            </clipPath>
          </defs>

          {/* Cookie Body (hidden once Stage 5 eats the final piece) */}
          {biteStage < 5 && (
            <g className="loader__cookie-whole">
              {/* Drop shadow under cookie */}
              <circle
                cx={COOKIE_CX}
                cy={COOKIE_CY + 5}
                r={COOKIE_R}
                fill="rgba(54, 29, 7, 0.14)"
                mask="url(#koki-outer-bite-mask)"
              />

              {/* Outer Dark Chocolate Border (#361D07) that automatically outlines the scalloped bites */}
              <circle
                cx={COOKIE_CX}
                cy={COOKIE_CY}
                r={COOKIE_R}
                fill="#361D07"
                mask="url(#koki-outer-bite-mask)"
              />

              {/* Inner Golden Cookie Dough + Chocolate Chips */}
              <g mask="url(#koki-inner-bite-mask)">
                <g clipPath="url(#koki-dough-clip)">
                  {/* Warm toasted edge */}
                  <circle cx={COOKIE_CX} cy={COOKIE_CY} r={COOKIE_R - BORDER_W} fill="#D48331" />
                  {/* Main golden cookie dough (#E39744 — exact logo cookie color) */}
                  <circle cx="99" cy="99" r={COOKIE_R - BORDER_W - 2.5} fill="#E39744" />
                  {/* Subtle top-left warm bake highlight */}
                  <ellipse
                    cx="84"
                    cy="78"
                    rx="32"
                    ry="22"
                    transform="rotate(-22 84 78)"
                    fill="rgba(255, 224, 178, 0.22)"
                  />

                  {/* Subtle dough texture dots */}
                  <circle cx="96" cy="84" r="1.8" fill="#B86B1E" opacity="0.55" />
                  <circle cx="68" cy="122" r="1.6" fill="#B86B1E" opacity="0.55" />
                  <circle cx="116" cy="128" r="1.8" fill="#B86B1E" opacity="0.55" />
                  <circle cx="112" cy="88" r="1.5" fill="#B86B1E" opacity="0.55" />

                  {/* Dark Chocolate Chips (#361D07) */}
                  {CHOC_CHIPS.map((chip, idx) => (
                    <g key={idx}>
                      <circle cx={chip.cx} cy={chip.cy + 1.2} r={chip.r} fill="rgba(35, 16, 4, 0.25)" />
                      <circle cx={chip.cx} cy={chip.cy} r={chip.r} fill="#361D07" />
                    </g>
                  ))}
                </g>
              </g>
            </g>
          )}

          {/* Dynamic Burst of Stylized Cookie Chunks & Chocolate Crumbs on each bite */}
          {!reduced &&
            currentStageData?.burstCrumbs.map((crumb) => (
              <motion.g
                key={crumb.id}
                initial={{ x: crumb.x, y: crumb.y, scale: 0.2, opacity: 0, rotate: 0 }}
                animate={{
                  x: [crumb.x, crumb.x + crumb.dx * 0.75, crumb.x + crumb.dx],
                  y: [crumb.y, crumb.y + crumb.dy * 0.65 - 4, crumb.y + crumb.dy + 6],
                  scale: [0.35, 1.05, 0.55],
                  opacity: [0, 1, 0],
                  rotate: crumb.rotate,
                }}
                transition={{
                  duration: 0.62,
                  delay: crumb.delay,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <StylizedCrumb kind={crumb.kind} size={crumb.size} />
              </motion.g>
            ))}
        </motion.svg>
      </div>
    </div>
  );
}

export function IntroProvider({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const target = useLoadProgress();
  const [shown, setShown] = useState(0); // eased percentage actually displayed
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);
  const shownRef = useRef(0);
  const startRef = useRef(performance.now());
  const prevBiteStageRef = useRef(0);

  // Attempt to initialize & resume Web Audio immediately on load (plus on any gesture)
  useEffect(() => {
    const unlock = () => {
      const c = getAudioContext();
      if (c && c.state === 'suspended') {
        c.resume().catch(() => {});
      }
    };
    unlock();
    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  // Ease the counter toward the real target at a steady pace so every bite stage is clearly visible
  useEffect(() => {
    if (!loading) return;
    let raf = 0;
    const tick = () => {
      const elapsed = performance.now() - startRef.current;
      const paced = (elapsed / MIN_MS) * 100;
      const goal = Math.min(target * 100, paced);
      const next = shownRef.current + (goal - shownRef.current) * 0.16 + 0.18;
      shownRef.current = Math.min(next, goal, 100);
      setShown(shownRef.current);
      if (shownRef.current < 100) {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, loading]);

  useEffect(() => {
    if (shown >= 100 && loading) {
      const t = setTimeout(() => {
        setDone(true);
        setLoading(false);
      }, 320);
      return () => clearTimeout(t);
    }
  }, [shown, loading]);

  const skipIntro = () => {
    if (!loading) return;
    setDone(true);
    setLoading(false);
  };

  // Block scrolling while loading WITHOUT hiding the scrollbar
  useEffect(() => {
    window.scrollTo(0, 0);
    if (!loading) return;
    const stop = (e: Event) => e.preventDefault();
    const keys = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        skipIntro();
        return;
      }
      if ([' ', 'PageDown', 'PageUp', 'ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) {
        e.preventDefault();
      }
    };
    window.addEventListener('wheel', stop, { passive: false });
    window.addEventListener('touchmove', stop, { passive: false });
    window.addEventListener('keydown', keys);
    return () => {
      window.removeEventListener('wheel', stop);
      window.removeEventListener('touchmove', stop);
      window.removeEventListener('keydown', keys);
    };
  }, [loading]);

  const pct = Math.round(shown);
  const biteStage = getBiteStage(shown);
  const statusText = getStatusMessage(biteStage);

  // Play cute cookie-bite sound automatically each time a new bite is taken
  useEffect(() => {
    if (!loading || reduced) return;
    if (biteStage > prevBiteStageRef.current && biteStage > 0) {
      prevBiteStageRef.current = biteStage;
      playCuteCookieBite(biteStage);
    }
  }, [biteStage, loading, reduced]);

  return (
    <IntroCtx.Provider value={done}>
      {children}
      <AnimatePresence onExitComplete={() => setDone(true)}>
        {loading && (
          <motion.div
            key="loader"
            className="loader"
            role="status"
            aria-live="polite"
            aria-label={`Loading ${brand.name}, ${pct} percent`}
            initial={false}
            exit={reduced ? { opacity: 0 } : { clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: reduced ? 0.2 : 0.95, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="loader__content">
              {/* Cookie Badge: starts whole, gets bitten step-by-step with crumbs */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  playCuteCookieBite(Math.max(1, biteStage));
                }}
                style={{ cursor: 'pointer' }}
                title="Tap cookie for bite sound"
              >
                <BittenCookieLoaderIcon biteStage={biteStage} reduced={reduced} />
              </div>

              {/* Brand Title & Tagline */}
              <div className="loader__branding">
                <h2 className="loader__title">{brand.name}</h2>
                <p className="loader__subtitle">{brand.tagline}</p>
              </div>

              {/* Sleek Centered Progress Bar + Status + Skip Pill */}
              <div className="loader__progress-group">
                <div className="loader__track" aria-hidden="true">
                  <span
                    className="loader__fill"
                    style={{ width: `${Math.min(100, Math.max(0, shown))}%` }}
                  />
                </div>

                <p className="loader__status" key={statusText}>
                  {statusText}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </IntroCtx.Provider>
  );
}
