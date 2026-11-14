import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { logos, logoPalette, logoLayers } from '../data/site';
import { useLightbox } from './Lightbox';
import { ChapterHead } from './ui';
import '../styles/logo-showcase.css';

const EASE = [0.34, 1.56, 0.64, 1] as const;

interface DissectElementInfo {
  id: string;
  number: string;
  name: string;
  badge: string;
  description: string;
  // Percentage coordinates on the logo stage (0-100)
  x: number;
  y: number;
  r: number;
  layerTarget?: 'typography' | 'baker' | 'cookie' | 'monogram' | 'crumbs' | 'submark';
  zoomX: number;
  zoomY: number;
  zoomScale: number;
}

const primaryDissectElements: DissectElementInfo[] = [
  {
    id: 'pri-cookie',
    number: '01',
    name: 'The Bitten Cookie',
    badge: "Core Mark · The 'O'",
    description:
      "Replaces the central letter 'O' with a golden baked chocolate-chip cookie showing a distinct bite mark on the top right. Rendered as a prominent floating 3D layer with realistic baked crust bevels, it communicates irresistible craving and freshly baked warmth.",
    layerTarget: 'cookie',
    x: 34,
    y: 43,
    r: 72,
    zoomX: 34,
    zoomY: 43,
    zoomScale: 2.6,
  },
  {
    id: 'pri-baker',
    number: '02',
    name: 'Young Baker Silhouette',
    badge: "Brand Mascot · 'K' & 'i'",
    description:
      "Seamlessly integrated into the letters 'K' and 'i', a stylized boy wearing a cap reaches enthusiastically toward the cookie. Floating forward in 3D space, this character embodies the passion of the four student founders and the joy of sharing treats.",
    layerTarget: 'baker',
    x: 65,
    y: 43,
    r: 75,
    zoomX: 65,
    zoomY: 43,
    zoomScale: 2.5,
  },
  {
    id: 'pri-crumbs',
    number: '03',
    name: 'Dynamic Flying Crumbs',
    badge: 'Kinetic Motion & Texture',
    description:
      "Three airborne cookie crumb specks hovering in 3D mid-air between the bite and the baker's hand. They express crispy crunch, authentic home baking, and the lively kinetic motion of kOKi.co's mobile rolling stores in motion.",
    layerTarget: 'cookie',
    x: 50,
    y: 34,
    r: 45,
    zoomX: 50,
    zoomY: 34,
    zoomScale: 3.2,
  },
  {
    id: 'pri-wordmark',
    number: '04',
    name: 'Rounded Fredoka Wordmark',
    badge: "Typography · Friendly Lettering",
    description:
      "Anchors the entire identity as a sturdy 3D foundation plane. Custom-rounded geometric typography (Fredoka) projects friendly warmth, approachable charm, and the handcrafted feel of homemade baked treats.",
    layerTarget: 'typography',
    x: 14,
    y: 48,
    r: 52,
    zoomX: 14,
    zoomY: 48,
    zoomScale: 2.8,
  },
  {
    id: 'pri-co',
    number: '05',
    name: "The '.co' Suffix (Corner)",
    badge: "Short for 'Corner' · Community Hub",
    description:
      "Short for 'Corner' (Cookie Corner), the '.co' suffix represents kOKi.co as an accessible neighborhood corner where people can always find warm, freshly baked cookies. Whether set up at school gates, street corners, or plaza spots across Nueva Ecija, it turns every rolling store stop into a friendly gathering corner.",
    layerTarget: 'typography',
    x: 87,
    y: 61,
    r: 42,
    zoomX: 87,
    zoomY: 61,
    zoomScale: 3.5,
  },
];

const secondaryDissectElements: DissectElementInfo[] = [
  {
    id: 'sec-stem',
    number: '01',
    name: 'Bitten Monogram Stem',
    badge: 'Signature Bite Mark',
    description:
      "A distinct bite mark carved into the upper-right branch of the lowercase 'k' carries the signature cookie narrative into a compact, bold 3D mark for stickers, wax paper seals, and jar lids.",
    layerTarget: 'monogram',
    x: 37,
    y: 35,
    r: 50,
    zoomX: 37,
    zoomY: 35,
    zoomScale: 3.0,
  },
  {
    id: 'sec-neg-space',
    number: '02',
    name: 'Negative Space Silhouette',
    badge: 'Optical Double-Take',
    description:
      "Carved out of the inner counter of the circular 'o', the white negative space forms the profile of a young boy peering and pointing outward. This witty 3D optical illusion embodies discovery, anticipation, and welcoming hospitality.",
    layerTarget: 'monogram',
    x: 54,
    y: 52,
    r: 75,
    zoomX: 54,
    zoomY: 52,
    zoomScale: 2.5,
  },
  {
    id: 'sec-rising-crumbs',
    number: '03',
    name: 'Rising Crumb Particles',
    badge: 'Texture & Motion',
    description:
      "Crumb specks disperse upward from the bite on the 'k', floating high in 3D foreground space to inject lightness, crunch, and playful culinary charm into the solid silhouette mark.",
    layerTarget: 'crumbs',
    x: 46,
    y: 35,
    r: 54,
    zoomX: 46,
    zoomY: 35,
    zoomScale: 3.2,
  },
  {
    id: 'sec-submark',
    number: '04',
    name: "The '.co' Suffix (Corner)",
    badge: "Short for 'Corner' · Community Hub",
    description:
      "Short for 'Corner' (Cookie Corner), the '.co' suffix establishes kOKi.co as a welcoming neighborhood corner for cookie lovers. Positioned at the lower-right baseline, it reinforces the mobile brand's mission of rolling warm, freshly baked cookies directly to every school, plaza, and street corner across Nueva Ecija.",
    layerTarget: 'submark',
    x: 78,
    y: 69,
    r: 48,
    zoomX: 78,
    zoomY: 69,
    zoomScale: 3.2,
  },
];

export function LogoChapter() {
  const open = useLightbox();

  const showcaseRef = useRef<HTMLDivElement>(null);
  const sketchRef = useRef<HTMLDivElement>(null);
  const primaryLogoRef = useRef<HTMLImageElement>(null);
  const secondaryLogoRef = useRef<HTMLImageElement>(null);

  // 3D Dissection State
  const [dissectTab, setDissectTab] = useState<'primary' | 'secondary'>('primary');
  const [activeElementIndex, setActiveElementIndex] = useState(0);
  const [explodeFactor, setExplodeFactor] = useState(0); // starts assembled (0), explodes to 1 on viewport enter
  const [is3DExploded, setIs3DExploded] = useState(true);
  const [dissectInView, setDissectInView] = useState(false);

  // 3D Orbit / Tilt State
  const [rotX, setRotX] = useState(4);
  const [rotY, setRotY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, rotX: 20, rotY: -22 });

  // Trigger dramatic 3D tilt + layer explosion whenever section enters viewport
  useEffect(() => {
    if (dissectInView) {
      const t = setTimeout(() => {
        setRotX(20);
        setRotY(-22);
        if (is3DExploded) {
          setExplodeFactor(1);
        }
      }, 220);
      return () => clearTimeout(t);
    } else {
      setRotX(4);
      setRotY(0);
      setExplodeFactor(0);
    }
  }, [dissectInView, is3DExploded]);

  const isPrimary = dissectTab === 'primary';
  const elements = isPrimary ? primaryDissectElements : secondaryDissectElements;
  const currentLogoSrc = isPrimary ? logos.primary.src : logos.secondary.src;
  const currentElement = elements[activeElementIndex] || elements[0];

  const [coords, setCoords] = useState<{
    priStart: [number, number];
    priEnd: [number, number];
    secStart: [number, number];
    secEnd: [number, number];
    w: number;
    h: number;
  } | null>(null);

  useEffect(() => {
    const update = () => {
      if (!showcaseRef.current || !sketchRef.current || !primaryLogoRef.current || !secondaryLogoRef.current) return;
      const sBox = showcaseRef.current.getBoundingClientRect();
      const skBox = sketchRef.current.getBoundingClientRect();
      const pBox = primaryLogoRef.current.getBoundingClientRect();
      const scBox = secondaryLogoRef.current.getBoundingClientRect();

      // Top sketch: kOKi.co wordmark (right edge of sketch circle)
      const priStart: [number, number] = [
        skBox.left - sBox.left + skBox.width * 0.935,
        skBox.top - sBox.top + skBox.height * 0.245,
      ];

      // Primary Logo target: tip connects directly to outer left contour of 'k' in kOKi.co
      const priEnd: [number, number] = [
        pBox.left - sBox.left + pBox.width * 0.0867,
        pBox.top - sBox.top + pBox.height * 0.504,
      ];

      // Bottom sketch: ko.co monogram (right edge of sketch circle)
      const secStart: [number, number] = [
        skBox.left - sBox.left + skBox.width * 0.915,
        skBox.top - sBox.top + skBox.height * 0.64,
      ];

      // Secondary Logo target: tip connects directly to outer left contour of 'k' in ko.co
      const secEnd: [number, number] = [
        scBox.left - sBox.left + scBox.width * 0.161,
        scBox.top - sBox.top + scBox.height * 0.443,
      ];

      setCoords((prev) => {
        if (
          prev &&
          Math.abs(prev.w - sBox.width) < 1 &&
          Math.abs(prev.h - sBox.height) < 1 &&
          Math.abs(prev.priStart[0] - priStart[0]) < 1 &&
          Math.abs(prev.priStart[1] - priStart[1]) < 1 &&
          Math.abs(prev.priEnd[0] - priEnd[0]) < 1 &&
          Math.abs(prev.priEnd[1] - priEnd[1]) < 1
        ) {
          return prev;
        }
        return {
          priStart,
          priEnd,
          secStart,
          secEnd,
          w: sBox.width,
          h: sBox.height,
        };
      });
    };

    update();
    const t1 = setTimeout(update, 50);
    const t2 = setTimeout(update, 200);
    const t3 = setTimeout(update, 500);

    window.addEventListener('resize', update);
    const observer = new ResizeObserver(update);
    if (showcaseRef.current) observer.observe(showcaseRef.current);
    if (sketchRef.current) observer.observe(sketchRef.current);
    if (primaryLogoRef.current) observer.observe(primaryLogoRef.current);
    if (secondaryLogoRef.current) observer.observe(secondaryLogoRef.current);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener('resize', update);
      observer.disconnect();
    };
  }, []);

  const handleTabChange = (tab: 'primary' | 'secondary') => {
    setDissectTab(tab);
    setActiveElementIndex(0);
  };

  const handlePrev = () => {
    setActiveElementIndex((prev) => (prev > 0 ? prev - 1 : elements.length - 1));
  };

  const handleNext = () => {
    setActiveElementIndex((prev) => (prev < elements.length - 1 ? prev + 1 : 0));
  };

  // 3D Drag & Mouse Orbit Handling
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      rotX,
      rotY,
    };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragRef.current.startX;
    const deltaY = e.clientY - dragRef.current.startY;
    const nextY = Math.max(-45, Math.min(45, dragRef.current.rotY + deltaX * 0.35));
    const nextX = Math.max(10, Math.min(38, dragRef.current.rotX - deltaY * 0.3));
    setRotX(nextX);
    setRotY(nextY);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const reset3DAngle = () => {
    setRotX(20);
    setRotY(-22);
  };

  const currentZMultiplier = is3DExploded ? explodeFactor : 0;

  // Active layer check for primary logo
  const isTypoActive = isPrimary && currentElement.layerTarget === 'typography';
  const isBakerActive = isPrimary && currentElement.layerTarget === 'baker';
  const isCookieActive = isPrimary && currentElement.layerTarget === 'cookie';

  // Base Z positions for primary logo
  const typoZ = 20 * currentZMultiplier + (isTypoActive ? 30 : 0);
  const bakerZ = 65 * currentZMultiplier + (isBakerActive ? 35 : 0);
  const cookieZ = 110 * currentZMultiplier + (isCookieActive ? 40 : 0);

  // Active layer check for secondary logo
  const isSecMonogramActive = !isPrimary && currentElement.layerTarget === 'monogram';
  const isSecSubmarkActive = !isPrimary && currentElement.layerTarget === 'submark';
  const isSecCrumbsActive = !isPrimary && currentElement.layerTarget === 'crumbs';

  // Base Z positions for secondary logo: Monogram at base, Submark in middle, Crumbs floating highest
  const secMonogramZ = 20 * currentZMultiplier + (isSecMonogramActive ? 30 : 0);
  const secSubmarkZ = 65 * currentZMultiplier + (isSecSubmarkActive ? 35 : 0);
  const secCrumbsZ = 110 * currentZMultiplier + (isSecCrumbsActive ? 40 : 0);

  return (
    <section id="logo" className="chapter band band--orange" aria-labelledby="logo-title">
      <ChapterHead
        id="logo"
        code="CT #1"
        title="LOGO DEVELOPMENT"
        theme="dark"
        tensionColor="#F48A17"
      />

      {/* ── 1. CLEAN TOP SHOWCASE: Hand Sketch & Ideation with Direct Connectors ── */}
      <div className="logo-showcase" ref={showcaseRef}>
        {/* Dynamic Perfectly-Targeted SVG Arrows Overlay */}
        {coords && (
          <svg className="showcase-arrow-overlay" viewBox={`0 0 ${coords.w} ${coords.h}`}>
            {/* Primary Logo Arrow: Dashed red line */}
            <motion.path
              d={`M ${coords.priStart[0]},${coords.priStart[1]} C ${(coords.priStart[0] + coords.priEnd[0] - 11) / 2},${coords.priStart[1]} ${(coords.priStart[0] + coords.priEnd[0] - 11) / 2},${coords.priEnd[1]} ${coords.priEnd[0] - 11},${coords.priEnd[1]}`}
              fill="none"
              stroke="#D9381E"
              strokeWidth="4"
              strokeLinecap="butt"
              strokeDasharray="7 5"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.8, delay: 1.2, ease: 'easeOut' }}
            />

            {/* Primary Arrow Head */}
            <motion.polygon
              points={`${coords.priEnd[0]},${coords.priEnd[1]} ${coords.priEnd[0] - 14},${coords.priEnd[1] - 5.5} ${coords.priEnd[0] - 14},${coords.priEnd[1] + 5.5}`}
              fill="#D9381E"
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.25, delay: 1.8, ease: 'easeOut' }}
              style={{ transformOrigin: `${coords.priEnd[0]}px ${coords.priEnd[1]}px` }}
            />

            {/* Secondary Logo Arrow */}
            <motion.path
              d={`M ${coords.secStart[0]},${coords.secStart[1]} C ${(coords.secStart[0] + coords.secEnd[0] - 11) / 2},${coords.secStart[1]} ${(coords.secStart[0] + coords.secEnd[0] - 11) / 2},${coords.secEnd[1]} ${coords.secEnd[0] - 11},${coords.secEnd[1]}`}
              fill="none"
              stroke="#D9381E"
              strokeWidth="4"
              strokeLinecap="butt"
              strokeDasharray="7 5"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.8, delay: 1.5, ease: 'easeOut' }}
            />

            {/* Secondary Arrow Head */}
            <motion.polygon
              points={`${coords.secEnd[0]},${coords.secEnd[1]} ${coords.secEnd[0] - 14},${coords.secEnd[1] - 5.5} ${coords.secEnd[0] - 14},${coords.secEnd[1] + 5.5}`}
              fill="#D9381E"
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.25, delay: 2.1, ease: 'easeOut' }}
              style={{ transformOrigin: `${coords.secEnd[0]}px ${coords.secEnd[1]}px` }}
            />
          </svg>
        )}

        {/* Left Column: Sketch & Ideation + Font Used + Palette */}
        <div className="logo-sketch-column">
          <div className="sketch-card">
            <div className="sketch-card__header">
              <span className="sketch-card__tag">✎ Hand Sketch & Ideation</span>
            </div>

            <div className="sketch-stage" ref={sketchRef}>
              <img
                src={logos.sketch}
                alt="kOKi.co Logo Development hand sketches on grid paper"
                className="sketch-stage__img"
                loading="lazy"
                decoding="async"
              />

              <motion.div
                className="sketch-callout-pill sketch-callout-pill--primary"
                initial={{ opacity: 0, scale: 0.75, y: -6 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.45, delay: 0.8, ease: EASE }}
              >
                Primary Logo Concept →
              </motion.div>

              <motion.div
                className="sketch-callout-pill sketch-callout-pill--secondary"
                initial={{ opacity: 0, scale: 0.75, y: -6 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.45, delay: 1.0, ease: EASE }}
              >
                Secondary Logo Concept →
              </motion.div>

              <svg className="sketch-stage__overlay" viewBox="0 0 1080 1080" preserveAspectRatio="none">
                <motion.path
                  d="M 545,270 C 535,160 985,150 1010,265 C 1025,375 565,395 538,285 C 530,250 575,195 640,185"
                  fill="none"
                  stroke="#D9381E"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 1.1, delay: 0.3, ease: 'easeInOut' }}
                />

                <motion.path
                  d="M 565,695 C 555,545 965,540 985,690 C 1000,830 580,850 555,715 C 545,670 595,595 665,580"
                  fill="none"
                  stroke="#D9381E"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 1.1, delay: 0.6, ease: 'easeInOut' }}
                />
              </svg>
            </div>
          </div>

          <div className="sketch-meta-grid">
            <div className="font-used-card">
              <div>
                <span className="font-used-card__label">Font Used</span>
                <h4 className="font-used-card__title">Fredoka</h4>
                <p className="font-used-card__sample">
                  Bold, rounded geometry for kOKi.co.
                </p>
              </div>
            </div>

            <div className="palette-mini-card">
              <div>
                <span className="palette-mini-card__label">Logo Color Palette</span>
                <p style={{ margin: '0 0 0.35rem', fontSize: '0.8rem', color: '#8c7264', fontWeight: 600 }}>
                  Warm bakery tones
                </p>
              </div>
              <ul className="palette-mini-swatches" aria-label="Logo colors">
                {logoPalette.map((p) => (
                  <li
                    key={p.hex}
                    className="palette-mini-swatch"
                    style={{ background: p.hex }}
                  >
                    <span className="swatch-tooltip" role="tooltip">
                      <span className="swatch-tooltip__name">{p.name}</span>
                      <span className="swatch-tooltip__hex">{p.hex}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column: Clean Primary & Secondary Logos */}
        <div className="logo-finals-column">
          <motion.div
            className="logo-blueprint-card"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.3, ease: EASE }}
          >
            <div className="logo-blueprint-card__header">
              <span className="logo-blueprint-card__tag">Primary Logo</span>
              <button
                type="button"
                className="link-btn"
                onClick={() => open({ ...logos.primary, caption: 'kOKi.co Primary Logo' })}
              >
                Full view ⤢
              </button>
            </div>

            <div className="logo-blueprint-card__stage">
              <img
                ref={primaryLogoRef}
                src={logos.primary.src}
                alt={logos.primary.alt}
                width={logos.primary.width}
                height={logos.primary.height}
                className="logo-blueprint-card__img"
                loading="eager"
                decoding="async"
              />
            </div>
          </motion.div>

          <motion.div
            className="logo-blueprint-card"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.5, ease: EASE }}
          >
            <div className="logo-blueprint-card__header">
              <span className="logo-blueprint-card__tag" style={{ color: '#2A9D8F', background: 'rgba(42,157,143,0.12)' }}>
                Secondary Logo
              </span>
              <button
                type="button"
                className="link-btn"
                onClick={() => open({ ...logos.secondary, caption: 'kOKi.co Secondary Logo' })}
              >
                Full view ⤢
              </button>
            </div>

            <div className="logo-blueprint-card__stage">
              <img
                ref={secondaryLogoRef}
                src={logos.secondary.src}
                alt={logos.secondary.alt}
                width={logos.secondary.width}
                height={logos.secondary.height}
                className="logo-blueprint-card__img"
                loading="eager"
                decoding="async"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── 2. DEDICATED SECTION: 3D LOGO ANATOMY & EXPLODED DISSECTION ── */}
      <motion.div
        className="logo-dissect-section"
        initial={{ opacity: 0, y: 48, scale: 0.96 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        onViewportEnter={() => setDissectInView(true)}
        onViewportLeave={() => setDissectInView(false)}
        viewport={{ once: false, amount: 0.16 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      >
        {/* Section Header with Logo Switcher */}
        <div className="logo-dissect-section__header">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={dissectInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24, delay: 0.08 }}
          >
            <span className="logo-dissect-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
              Interactive 3D Exploded Blueprint
            </span>
            <h3 className="logo-dissect-title">3D LOGO BREAKDOWN</h3>
          </motion.div>

          {/* Switcher Buttons */}
          <motion.div
            className="dissect-switcher"
            role="tablist"
            aria-label="Logo selection"
            initial={{ opacity: 0, x: 28, scale: 0.9 }}
            animate={dissectInView ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: 28, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22, delay: 0.16 }}
          >
            <button
              type="button"
              role="tab"
              aria-selected={isPrimary}
              className={`dissect-switcher__btn ${isPrimary ? 'is-active' : ''}`}
              onClick={() => handleTabChange('primary')}
            >
              ✦ Primary Logo (kOKi.co)
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={!isPrimary}
              className={`dissect-switcher__btn dissect-switcher__btn--sec ${!isPrimary ? 'is-active' : ''}`}
              onClick={() => handleTabChange('secondary')}
            >
              ✦ Secondary Logo (ko.co)
            </button>
          </motion.div>
        </div>

        {/* ── 3D Blueprint Main Stage & Connected Inspector ── */}
        <div className="dissect-blueprint-main">
          {/* LEFT: 3D Interactive Stage Viewport */}
          <motion.div
            className={`dissect-3d-viewport ${isDragging ? 'is-dragging' : ''}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            initial={{ opacity: 0, y: 32, scale: 0.93 }}
            animate={dissectInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 32, scale: 0.93 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22, delay: 0.14 }}
          >
            {/* The 3D Rotating Stage Container */}
            <div
              className={`dissect-3d-stage${!isDragging ? ' is-smooth-orbit' : ''}`}
              style={{
                transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
              }}
            >
              {/* 1. 3D Isometric Grid Floor */}
              <div className="dissect-3d-floor" />

              {/* 2. Soft Ground Contact Shadow */}
              <div
                className="dissect-3d-ground-shadow"
                style={{
                  transform: `translateZ(2px) scale(${is3DExploded ? 0.88 : 1})`,
                  opacity: is3DExploded ? 0.45 : 0.65,
                }}
              />

              {/* 3. The 3D Floating Layers (Clean transparent PNG layers, zero clipping artefacts) */}
              {isPrimary ? (
                <>
                  {/* Layer 1: Typography (k, i, .co) */}
                  <div
                    className={`dissect-3d-layer ${isTypoActive ? 'is-active' : ''}`}
                    style={{ transform: `translateZ(${typoZ}px)` }}
                  >
                    <img src={logoLayers.primary.k} alt="k" className="dissect-3d-layer__img" />
                    <img src={logoLayers.primary.i} alt="i" className="dissect-3d-layer__img" />
                    <img src={logoLayers.primary.co} alt=".co" className="dissect-3d-layer__img" />
                  </div>

                  {/* Layer 2: Young Baker Silhouette */}
                  <div
                    className={`dissect-3d-layer ${isBakerActive ? 'is-active' : ''}`}
                    style={{ transform: `translateZ(${bakerZ}px)` }}
                  >
                    <img src={logoLayers.primary.baker} alt="baker" className="dissect-3d-layer__img" />
                  </div>

                  {/* Layer 3: The Bitten Cookie & Crumbs */}
                  <div
                    className={`dissect-3d-layer ${isCookieActive ? 'is-active' : ''}`}
                    style={{ transform: `translateZ(${cookieZ}px)` }}
                  >
                    <img src={logoLayers.primary.cookie} alt="cookie" className="dissect-3d-layer__img" />
                  </div>
                </>
              ) : (
                <>
                  {/* Layer 1: Monogram (k & o with negative space silhouette — keep o corner intact) */}
                  <div
                    className={`dissect-3d-layer dissect-3d-layer--sec ${isSecMonogramActive ? 'is-active' : ''}`}
                    style={{ transform: `translateZ(${secMonogramZ}px)` }}
                  >
                    <img src={logoLayers.secondary.monogram} alt="Secondary Monogram" className="dissect-3d-layer__img" />
                    <img
                      src={logoLayers.secondary.submark}
                      alt=""
                      aria-hidden="true"
                      className="dissect-3d-layer__img"
                      style={{ clipPath: 'polygon(64% 52%, 75.5% 52%, 75.5% 74%, 64% 74%)' }}
                    />
                  </div>

                  {/* Layer 2: .co Submark only (Corner) */}
                  <div
                    className={`dissect-3d-layer dissect-3d-layer--sec ${isSecSubmarkActive ? 'is-active' : ''}`}
                    style={{ transform: `translateZ(${secSubmarkZ}px)` }}
                  >
                    <img
                      src={logoLayers.secondary.submark}
                      alt="Secondary .co Corner Submark"
                      className="dissect-3d-layer__img"
                      style={{ clipPath: 'polygon(75.5% 60%, 92% 60%, 92% 76%, 75.5% 76%)' }}
                    />
                  </div>

                  {/* Layer 3: Rising Crumb Particles */}
                  <div
                    className={`dissect-3d-layer dissect-3d-layer--sec ${isSecCrumbsActive ? 'is-active' : ''}`}
                    style={{ transform: `translateZ(${secCrumbsZ}px)` }}
                  >
                    <img src={logoLayers.secondary.crumbs} alt="Secondary Rising Crumbs" className="dissect-3d-layer__img" />
                  </div>
                </>
              )}

              {/* 4. 3D Encircled Targets & Beacons */}
              {elements.map((el, idx) => {
                const isActive = activeElementIndex === idx;
                const beaconZ = isPrimary
                  ? (el.layerTarget === 'typography'
                      ? typoZ
                      : el.layerTarget === 'baker'
                      ? bakerZ
                      : cookieZ) + 26
                  : (el.layerTarget === 'crumbs'
                      ? secCrumbsZ
                      : el.layerTarget === 'submark'
                      ? secSubmarkZ
                      : secMonogramZ) + 26;

                return (
                  <div
                    key={`beacon-${dissectTab}-${el.id}`}
                    className={`dissect-3d-beacon ${!isPrimary ? 'dissect-3d-beacon--sec' : ''} ${isActive ? 'is-active' : ''}`}
                    style={{
                      left: `${el.x}%`,
                      top: `${el.y}%`,
                      transform: `translateZ(${beaconZ}px)`,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveElementIndex(idx);
                    }}
                  >
                    {/* Encircled Ring in 3D */}
                    <div
                      className={`beacon-circle ${!isPrimary ? 'beacon-circle--sec' : ''}`}
                      style={{
                        width: `${el.r * 1.3}px`,
                        height: `${el.r * 1.3}px`,
                      }}
                    >
                      {isActive && <div className="beacon-pulse" />}
                    </div>

                    {/* Number Pin Badge */}
                    <div className="beacon-badge">{el.number}</div>

                    {/* Tooltip on hover */}
                    <span className="beacon-tooltip">{el.name}</span>
                  </div>
                );
              })}
            </div>

              {/* 3D Controls Floating Bar at bottom */}
            <motion.div
              className="dissect-3d-controls-bar"
              initial={{ opacity: 0, y: 24 }}
              animate={dissectInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24, delay: 0.42 }}
            >
              <div className="dissect-3d-controls-group">
                <button
                  type="button"
                  className={`dissect-3d-mode-btn ${is3DExploded ? 'is-active' : ''}`}
                  onClick={() => {
                    setIs3DExploded(true);
                    setExplodeFactor(1);
                  }}
                >
                  3D Exploded
                </button>
                <button
                  type="button"
                  className={`dissect-3d-mode-btn ${!is3DExploded ? 'is-active' : ''}`}
                  onClick={() => {
                    setIs3DExploded(false);
                    setExplodeFactor(0);
                  }}
                >
                  3D Assembled
                </button>

                {is3DExploded && (
                  <label className="dissect-3d-slider-wrap">
                    <span>Depth:</span>
                    <input
                      type="range"
                      min="0.3"
                      max="1.4"
                      step="0.05"
                      value={explodeFactor}
                      onChange={(e) => setExplodeFactor(parseFloat(e.target.value))}
                      className="dissect-3d-slider"
                      aria-label="3D explosion depth"
                    />
                  </label>
                )}

                <button
                  type="button"
                  className="dissect-3d-reset-btn"
                  onClick={reset3DAngle}
                  title="Reset 3D viewing angle"
                >
                  ↺ Reset 3D
                </button>
              </div>

              <span className="dissect-3d-hint-tag">
                ✦ Drag to orbit 3D view · Click elements to inspect
              </span>
            </motion.div>
          </motion.div>

          {/* RIGHT: Connected 3D Inspector Pane (Loupe Lens + Description) */}
          <motion.div
            className="dissect-inspector-col"
            initial={{ opacity: 0, x: 38, scale: 0.94 }}
            animate={dissectInView ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: 38, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22, delay: 0.24 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={`inspector-${dissectTab}-${currentElement.id}`}
                className={`dissect-lens-card ${isPrimary ? '' : 'dissect-lens-card--sec'}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.35, ease: EASE }}
              >
                {/* Loupe Lens + Heading Group */}
                <div className="dissect-lens-card__top">
                  {/* Magnified Optical 3D Loupe Lens */}
                  <div className={`blueprint-loupe-lens ${isPrimary ? '' : 'blueprint-loupe-lens--sec'}`}>
                    <div className="blueprint-loupe-lens__frame">
                      <img
                        src={currentLogoSrc}
                        alt={`Magnified detail of ${currentElement.name}`}
                        className="blueprint-loupe-lens__img"
                        style={{
                          transform: `translate(${50 - currentElement.zoomX * currentElement.zoomScale}%, ${50 - currentElement.zoomY * currentElement.zoomScale}%) scale(${currentElement.zoomScale})`,
                        }}
                      />
                      <div className="blueprint-loupe-lens__glare" />
                      <div className="blueprint-loupe-lens__reticle" />
                    </div>
                    <span className="blueprint-loupe-lens__tag">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                      ZOOM {currentElement.zoomScale}×
                    </span>
                  </div>

                  {/* Title and Badge Info */}
                  <div className="dissect-lens-card__head-info">
                    <span className="dissect-lens-card__counter">
                      3D LAYER {currentElement.number} OF 0{elements.length}
                    </span>
                    <h4 className="dissect-lens-card__name">{currentElement.name}</h4>
                    <span className="dissect-lens-card__badge">{currentElement.badge}</span>
                  </div>
                </div>

                {/* In-depth Symbolism Description */}
                <p className="dissect-lens-card__desc">
                  {currentElement.description}
                </p>

                {/* Stepper Controls in Card */}
                <div className="dissect-lens-card__nav">
                  <button
                    type="button"
                    className="dissect-nav-btn"
                    onClick={handlePrev}
                    aria-label="Previous element"
                  >
                    ← Previous
                  </button>

                  <div className="dissect-nav-dots" aria-label="Element indicators">
                    {elements.map((_, i) => (
                      <span
                        key={i}
                        className={`dissect-nav-dot ${!isPrimary ? 'dissect-nav-dot--sec' : ''} ${i === activeElementIndex ? 'is-active' : ''}`}
                        onClick={() => setActiveElementIndex(i)}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    className="dissect-nav-btn"
                    onClick={handleNext}
                    aria-label="Next element"
                  >
                    Next →
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* ── 3. BOTTOM 3D ELEMENT DOCK (CLICKABLE THUMBNAIL CARDS) ── */}
        <div className="dissect-dock" role="tablist" aria-label="Dissected logo elements">
          {elements.map((el, i) => {
            const isActive = activeElementIndex === i;
            return (
              <motion.div
                key={el.id}
                role="tab"
                aria-selected={isActive}
                className={`dissect-dock-card ${isPrimary ? '' : 'dissect-dock-card--sec'} ${isActive ? 'is-active' : ''}`}
                onClick={() => setActiveElementIndex(i)}
                initial={{ opacity: 0, y: 32, scale: 0.88 }}
                animate={
                  dissectInView
                    ? { opacity: 1, y: 0, scale: 1 }
                    : { opacity: 0, y: 32, scale: 0.88 }
                }
                transition={{
                  type: 'spring',
                  stiffness: 320,
                  damping: 20,
                  delay: 0.34 + i * 0.075,
                }}
              >
                <span className="dissect-dock-card__num">{el.number}</span>
                <div className="dissect-dock-card__info">
                  <h5 className="dissect-dock-card__title">{el.name}</h5>
                  <p className="dissect-dock-card__role">{el.badge}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}