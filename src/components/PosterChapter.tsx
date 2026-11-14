import { useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { posterPalette, promoPoster, type Swatch } from '../data/site';
import { useLightbox } from './Lightbox';
import { inkOn, useCopy } from './Palette';
import { ChapterHead } from './ui';

/** 24-sector complementary color wheel matching the promo artwork */
const WHEEL_COLORS = [
  '#E60012', '#EB4412', '#EF6C00', '#F48A17', '#F9A825', '#FDD835',
  '#FFEE58', '#C0CA33', '#7CB342', '#43A047', '#00897B', '#00ACC1',
  '#039BE5', '#1E88E5', '#000793', '#3949AB', '#5E35B1', '#8E24AA',
  '#AB47BC', '#D81B60', '#E91E63', '#F06292', '#E53935', '#D32F2F',
];

function polarToCartesian(cx: number, cy: number, r: number, angleInDegrees: number) {
  const rad = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describeWedge(cx: number, cy: number, rInner: number, rOuter: number, startAngle: number, endAngle: number) {
  const p1 = polarToCartesian(cx, cy, rOuter, startAngle);
  const p2 = polarToCartesian(cx, cy, rOuter, endAngle);
  const p3 = polarToCartesian(cx, cy, rInner, endAngle);
  const p4 = polarToCartesian(cx, cy, rInner, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    'M', p1.x, p1.y,
    'A', rOuter, rOuter, 0, largeArcFlag, 1, p2.x, p2.y,
    'L', p3.x, p3.y,
    'A', rInner, rInner, 0, largeArcFlag, 0, p4.x, p4.y,
    'Z',
  ].join(' ');
}

function ComplementaryColorWheel() {
  const cx = 100;
  const cy = 100;
  const rOuter = 88;
  const rInner = 52;
  const rMid = (rOuter + rInner) / 2;

  // Fixed complementary pair from kOKi.co poster: #F48A17 Orange (index 3) & #000793 Royal Blue (index 14)
  const orangeIdx = 3;
  const blueIdx = 14;
  const orangeAngle = orangeIdx * 15 + 7.5;
  const blueAngle = blueIdx * 15 + 7.5;

  const pPrimary = polarToCartesian(cx, cy, rMid, orangeAngle);
  const pComp = polarToCartesian(cx, cy, rMid, blueAngle);

  return (
    <motion.svg
      viewBox="0 0 200 200"
      className="poster-wheel-svg"
      aria-label="Complementary Color Wheel: Warm Cookie Orange (#F48A17) and Royal Blue (#000793)"
      initial={{ rotate: -65, scale: 0.85, opacity: 0 }}
      whileInView={{ rotate: 0, scale: 1, opacity: 1 }}
      viewport={{ once: false, amount: 0.25 }}
      transition={{ type: 'spring', stiffness: 180, damping: 18 }}
      whileHover={{ scale: 1.05, rotate: 6 }}
    >
      {/* 24 Wedges with fixed Orange & Royal Blue highlight */}
      {WHEEL_COLORS.map((color, i) => {
        const start = i * 15;
        const end = (i + 1) * 15;
        const isSelected = i === orangeIdx || i === blueIdx;
        return (
          <path
            key={color + i}
            d={describeWedge(cx, cy, isSelected ? rInner - 4 : rInner, isSelected ? rOuter + 4 : rOuter, start, end)}
            fill={color}
            stroke="#FFFDF9"
            strokeWidth={isSelected ? '1.8' : '0.75'}
          />
        );
      })}

      {/* Center connector line between complementary hues */}
      <line
        x1={pPrimary.x}
        y1={pPrimary.y}
        x2={pComp.x}
        y2={pComp.y}
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Orange indicator ring */}
      <circle
        cx={pPrimary.x}
        cy={pPrimary.y}
        r="9"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="3"
      />

      {/* Royal Blue indicator ring */}
      <circle
        cx={pComp.x}
        cy={pComp.y}
        r="9"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="3"
      />

      {/* Center live color split preview */}
      <circle cx={cx} cy={cy} r="28" fill="#FFFDF9" stroke="rgba(42,22,10,0.1)" strokeWidth="1.5" />
      <path
        d={`M ${cx} ${cy - 22} A 22 22 0 0 1 ${cx} ${cy + 22} Z`}
        fill="#F48A17"
      />
      <path
        d={`M ${cx} ${cy - 22} A 22 22 0 0 0 ${cx} ${cy + 22} Z`}
        fill="#000793"
      />
    </motion.svg>
  );
}

function PosterPaletteStrip({ swatches }: { swatches: Swatch[] }) {
  const { copied, copy } = useCopy();
  return (
    <div className="poster-palette-strip" role="list" aria-label="Promotional poster color scheme">
      {swatches.map((s, idx) => (
        <motion.button
          key={s.hex}
          type="button"
          className="poster-palette-chip"
          style={{ '--sw-color': s.hex, '--sw-ink': inkOn(s.hex) } as React.CSSProperties}
          onClick={() => copy(s.hex)}
          aria-label={`${s.name}, ${s.hex}. Click to copy HEX`}
          initial={{ opacity: 0, y: 18, scale: 0.92 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22, delay: idx * 0.06 }}
          whileHover={{ y: -5, scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
        >
          <span className="poster-palette-chip__color">
            {copied === s.hex ? (
              <motion.span
                className="poster-palette-chip__copied-badge"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 450, damping: 18 }}
              >
                Copied!
              </motion.span>
            ) : null}
          </span>
          <span className="poster-palette-chip__info">
            <strong className="poster-palette-chip__hex">{s.hex}</strong>
            <span className="poster-palette-chip__name">{s.name}</span>
          </span>
        </motion.button>
      ))}
    </div>
  );
}

export function PosterChapter() {
  const open = useLightbox();
  const currentImage = promoPoster.cleanImage;

  const [wheelHovered, setWheelHovered] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 220, damping: 24 });
  const smoothY = useSpring(mouseY, { stiffness: 220, damping: 24 });

  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-9, 9]);
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [9, -9]);
  const glareX = useTransform(smoothX, [-0.5, 0.5], ['15%', '85%']);
  const glareY = useTransform(smoothY, [-0.5, 0.5], ['15%', '85%']);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handlePointerLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <section id="poster" className="chapter band band--peach" aria-labelledby="poster-title">
      <ChapterHead
        id="poster"
        code="CT #3"
        title="PROMOTIONAL POSTER"
        theme="dark"
        tensionColor="#F48A17"
      />

      <div className="poster-chapter-wrap">
        <div className="poster-two-col-grid">
          {/* LEFT COLUMN: Tall Color Theory Wheel on Top + Shorter Color Palette Below */}
          <div className="poster-left-stack">
            {/* 1. Centered Color Theory Wheel Card */}
            <motion.div
              className="poster-deck-card poster-wheel-card"
              initial={{ opacity: 0, x: -32, y: 18 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ type: 'spring', stiffness: 270, damping: 23, delay: 0.08 }}
            >
              <div className="poster-wheel-header">
                <span className="poster-wheel-badge">Color Theory</span>
                <h4 className="poster-wheel-heading">Complementary Color Scheme</h4>
              </div>

              <div
                className="poster-wheel-visual"
                onMouseEnter={() => setWheelHovered(true)}
                onMouseLeave={() => setWheelHovered(false)}
                onClick={() => setWheelHovered((v) => !v)}
                onFocus={() => setWheelHovered(true)}
                onBlur={() => setWheelHovered(false)}
                tabIndex={0}
              >
                <ComplementaryColorWheel />

                <div className="poster-wheel-hover-slot">
                  <AnimatePresence>
                    {wheelHovered && (
                      <motion.div
                        className="poster-wheel-contrast-tags"
                        initial={{ opacity: 0, y: 8, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.92 }}
                        transition={{ type: 'spring', stiffness: 360, damping: 24 }}
                      >
                        <span className="poster-wheel-contrast-tag poster-wheel-contrast-tag--orange">
                          <span className="poster-dot" style={{ background: '#F48A17' }} /> #F48A17 Orange
                        </span>
                        <span className="poster-wheel-arrow" aria-hidden="true">⇄</span>
                        <span className="poster-wheel-contrast-tag poster-wheel-contrast-tag--blue">
                          <span className="poster-dot" style={{ background: '#000793' }} /> #000793 Blue
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

            {/* 2. Promotional Color Scheme Card (Directly Below Color Wheel) */}
            <motion.div
              className="poster-deck-card poster-palette-bottom-card"
              initial={{ opacity: 0, x: -32, y: 18 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ type: 'spring', stiffness: 270, damping: 23, delay: 0.16 }}
            >
              <div className="poster-deck-card__header">
                <h4 className="poster-deck-card__title">Promotional Color Scheme</h4>
                <span className="poster-deck-card__subtitle">Click any swatch to copy hex</span>
              </div>
              <PosterPaletteStrip swatches={posterPalette} />
            </motion.div>
          </div>

          {/* RIGHT COLUMN: X-Banner Standee Showcase with 3D Light Glare */}
          <motion.div
            className="poster-standee-stage"
            initial={{ opacity: 0, y: 42, scale: 0.94 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: false, amount: 0.16 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.22 }}
          >
            {/* X-Banner Standee Rig */}
            <div
              ref={stageRef}
              className="poster-standee-tilt-wrap"
              onPointerMove={handlePointerMove}
              onPointerLeave={handlePointerLeave}
            >
              <motion.div
                className="poster-standee-rig"
                style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 280, damping: 24 }}
              >
                {/* X-Standee Metal Frame & Symmetrical Tripod Legs (SVG behind banner) */}
                <svg
                  className="poster-standee__hardware"
                  viewBox="0 0 440 580"
                  preserveAspectRatio="none"
                  fill="none"
                  aria-hidden="true"
                >
                  {/* Center rear tripod support leg */}
                  <line x1="220" y1="420" x2="220" y2="554" stroke="#2D2724" strokeWidth="7" strokeLinecap="round" />
                  <ellipse cx="220" cy="556" rx="11" ry="4" fill="#161311" />

                  {/* Symmetrical Upper X-arms extending past top corners */}
                  <line x1="220" y1="278" x2="12" y2="10" stroke="#1E1A18" strokeWidth="6" strokeLinecap="round" />
                  <line x1="220" y1="278" x2="428" y2="10" stroke="#1E1A18" strokeWidth="6" strokeLinecap="round" />

                  {/* Symmetrical Lower X-legs extending past bottom corners to floor */}
                  <line x1="220" y1="278" x2="12" y2="566" stroke="#221E1C" strokeWidth="6.5" strokeLinecap="round" />
                  <line x1="220" y1="278" x2="428" y2="566" stroke="#221E1C" strokeWidth="6.5" strokeLinecap="round" />

                  {/* Symmetrical Rubber foot caps */}
                  <ellipse cx="12" cy="566" rx="6" ry="3.2" fill="#12100F" />
                  <ellipse cx="428" cy="566" rx="6" ry="3.2" fill="#12100F" />

                  {/* Symmetrical Top hook caps */}
                  <circle cx="12" cy="10" r="4" fill="#3A3330" />
                  <circle cx="428" cy="10" r="4" fill="#3A3330" />
                </svg>

                {/* Banner Sheet Mounted on the X-Stand */}
                <div className="poster-standee__banner">
                  {/* 4 Metallic Corner Grommets */}
                  <span className="poster-grommet poster-grommet--tl" aria-hidden="true" />
                  <span className="poster-grommet poster-grommet--tr" aria-hidden="true" />
                  <span className="poster-grommet poster-grommet--bl" aria-hidden="true" />
                  <span className="poster-grommet poster-grommet--br" aria-hidden="true" />

                  <button
                    type="button"
                    className="poster-stage__img-btn"
                    onClick={() => open({ ...currentImage, caption: 'kOKi.co — promotional event poster' })}
                    aria-label="View promotional poster full size"
                  >
                    <img
                      src={currentImage.src}
                      alt={currentImage.alt}
                      width={currentImage.width}
                      height={currentImage.height}
                      loading="lazy"
                      decoding="async"
                      className="poster-stage__photo"
                    />
                    <span className="poster-stage__shine" aria-hidden="true" />
                    <motion.span
                      className="poster-stage__cursor-glare"
                      aria-hidden="true"
                      style={{
                        background: useTransform(
                          [glareX, glareY],
                          ([x, y]) => `radial-gradient(circle at ${x} ${y}, rgba(255,255,255,0.36) 0%, rgba(255,255,255,0) 62%)`
                        ),
                      }}
                    />
                    <span className="poster-stage__expand-badge">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                      </svg>
                      Tap Full View
                    </span>
                  </button>
                </div>

                {/* Soft Ground Shadow Under Standee Legs */}
                <div className="poster-standee__floor-shadow" aria-hidden="true" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
