import { useState } from 'react';
import { motion } from 'motion/react';
import { brand, story, bittenCookie } from '../data/site';

interface BrandBentoHubProps {
  inView?: boolean;
}

const PILLARS = [
  'Freshly Baked Daily',
  'Student-Friendly Price',
  'Mobile Rolling Store',
  '100% Nueva Ecija Made',
];

export function BrandBentoHub({ inView = false }: BrandBentoHubProps) {
  const [activeTouchpoint, setActiveTouchpoint] = useState<string | null>(null);

  const touchpoints = [
    { label: 'Schools', detail: 'Campuses & university gates' },
    { label: 'Communities', detail: 'Neighborhoods & barangay plazas' },
    { label: 'Events', detail: 'Local fairs & gatherings' },
    { label: 'Busy Areas', detail: 'Transit hubs & bustling streets' },
  ];

  return (
    <div className="brand-bento-hub">
      {/* ── Tile 1: Brand Hero & Speech Bubble Tagline (Pop-Up Entrance) ── */}
      <motion.div
        className="brand-bento-card brand-bento-card--hero"
        initial={{ opacity: 0, y: 45, scale: 0.92 }}
        animate={inView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 45, scale: 0.92 }}
        transition={{ type: 'spring', stiffness: 280, damping: 20, delay: 0.08 }}
        whileHover={{ y: -3 }}
      >
        <div className="brand-bento-card__top">
          <div className="brand-bento-card__badge-row">
            <span className="brand-bento-label">BRAND IDENTITY</span>
            <span className="brand-bento-pill brand-bento-pill--est">
              <span className="brand-bento-pulse-dot" aria-hidden="true" />
              EST. {brand.founded} · NUEVA ECIJA
            </span>
          </div>

          <div className="brand-bento-hero__brand-row">
            <h3 className="brand-bento-hero__title">{brand.name}</h3>
            <motion.div
              className="brand-bento-hero__cookie-wrap"
              whileHover={{ rotate: 18, scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              title="Click for a cookie smile!"
            >
              <img
                src={bittenCookie}
                alt="kOKi.co bitten cookie icon"
                className="brand-bento-hero__cookie-img"
              />
            </motion.div>
          </div>
        </div>

        {/* Tagline Speech Capsule with Auto-Pop Badge on Scroll */}
        <div className="brand-bento-tagline-wrap">
          <span className="brand-bento-sublabel">OFFICIAL TAGLINE</span>
          <div className="brand-bento-tagline-bubble">
            <div className="brand-bento-tagline-bubble__quote">
              <span className="brand-bento-tagline-bubble__quote-mark">“</span>
              <span className="brand-bento-tagline-bubble__text">{brand.tagline}</span>
              <span className="brand-bento-tagline-bubble__quote-mark">”</span>
            </div>

            {/* Pops out automatically with bouncy spring */}
            <motion.div
              className="brand-bento-tagline-sparkle"
              initial={{ opacity: 0, y: 12, scale: 0.75 }}
              animate={inView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 12, scale: 0.75 }}
              transition={{
                type: 'spring',
                stiffness: 440,
                damping: 18,
                delay: 0.38,
              }}
            >
              Fresh comfort for your day!
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* ── Tile 2 & 3: Mission & Vision Interactive Bento Grid (Staggered Pop-Up) ── */}
      <div className="brand-bento-grid">
        {/* Mission Tile */}
        <motion.div
          className="brand-bento-card brand-bento-card--mission"
          initial={{ opacity: 0, y: 32, scale: 0.93 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 32, scale: 0.93 }}
          transition={{ type: 'spring', stiffness: 320, damping: 22, delay: 0.16 }}
          whileHover={{ y: -3 }}
        >
          <div className="brand-bento-card__header">
            <span className="brand-bento-tag brand-bento-tag--orange">
              MISSION
            </span>
            <span className="brand-bento-chip">The Action</span>
          </div>

          <h4 className="brand-bento-card__title">Rolling Fresh Treats Closer</h4>
          <p className="brand-bento-card__body">{story.mission}</p>

          <div className="brand-bento-touchpoints" aria-label="Key delivery locations">
            {touchpoints.map((tp) => (
              <button
                type="button"
                key={tp.label}
                className={`brand-bento-touchpoint ${activeTouchpoint === tp.label ? 'is-active' : ''}`}
                onClick={() =>
                  setActiveTouchpoint(activeTouchpoint === tp.label ? null : tp.label)
                }
                title={`${tp.label}: ${tp.detail}`}
              >
                <span>{tp.label}</span>
              </button>
            ))}
          </div>
          {activeTouchpoint && (
            <div className="brand-bento-touchpoint-detail">
              Serving {touchpoints.find((t) => t.label === activeTouchpoint)?.detail}
            </div>
          )}
        </motion.div>

        {/* Vision Tile */}
        <motion.div
          className="brand-bento-card brand-bento-card--vision"
          initial={{ opacity: 0, y: 32, scale: 0.93 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 32, scale: 0.93 }}
          transition={{ type: 'spring', stiffness: 320, damping: 22, delay: 0.25 }}
          whileHover={{ y: -3 }}
        >
          <div className="brand-bento-card__header">
            <span className="brand-bento-tag brand-bento-tag--blue">
              VISION
            </span>
            <span className="brand-bento-chip">The Goal</span>
          </div>

          <h4 className="brand-bento-card__title">Nueva Ecija's Favorite Cookie</h4>
          <p className="brand-bento-card__body">{story.vision}</p>
        </motion.div>
      </div>

      {/* ── Bottom Pillar Badges (Staggered Pop-Up) ────────────────── */}
      <div className="brand-bento-pillars" aria-label="Brand Pillars">
        {PILLARS.map((pill, i) => (
          <motion.span
            key={pill}
            className="brand-bento-pillar"
            initial={{ opacity: 0, y: 16, scale: 0.86 }}
            animate={inView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 16, scale: 0.86 }}
            transition={{
              type: 'spring',
              stiffness: 380,
              damping: 20,
              delay: 0.32 + i * 0.07,
            }}
          >
            {pill}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

