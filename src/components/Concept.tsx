import { useEffect, useRef, useState } from 'react';
import { services } from '../data/site';
import { motion } from 'motion/react';
import { BrandBentoHub } from './BrandBentoHub';
import { ElasticLettering } from './ElasticLettering';
import { ProductAccordion } from './ProductAccordion';
import { StoryCardDeck } from './StoryCardDeck';
import { FoundersSection } from './FoundersSection';
import { type Tone } from './ui';
import '../styles/services.css';

const serviceTones: Tone[] = ['orange', 'paper', 'peach', 'choc', 'caramel'];

export function Concept() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [scrollCardIndex, setScrollCardIndex] = useState(0);
  const [isSlideInView, setIsSlideInView] = useState(false);

  // Scroll effect:
  // 1. Story cards flip as you scroll through the section
  // 2. Staggered pop-up entrance for bento cards when entering view
  useEffect(() => {
    const section = document.getElementById('concept');
    const track = trackRef.current;
    if (!section) return;

    let rafId = 0;

    const onScroll = () => {
      rafId = 0;
      const vh = window.innerHeight;

      // Check if PT #1 slide is actually locked in full view
      if (track) {
        const trackRect = track.getBoundingClientRect();
        // Trigger precisely when PT #1 locks into the viewport (top <= 80px)
        const isLockedInView = trackRect.top <= 80 && trackRect.bottom >= vh * 0.2;
        setIsSlideInView(isLockedInView);
      }

      // Scroll-driven story card flipping
      if (track) {
        const trackRect = track.getBoundingClientRect();
        const scrollable = trackRect.height - vh;
        if (scrollable > 60) {
          // Progress through pinned slide from 0 to 1
          const p = Math.min(1, Math.max(0, -trackRect.top / scrollable));
          if (p < 0.35) {
            setScrollCardIndex(0);
          } else if (p < 0.70) {
            setScrollCardIndex(1);
          } else {
            setScrollCardIndex(2);
          }
        } else {
          // Unpinned fallback
          const progress = Math.min(1, Math.max(0, (vh - trackRect.top) / (vh + trackRect.height)));
          if (progress < 0.42) {
            setScrollCardIndex(0);
          } else if (progress < 0.72) {
            setScrollCardIndex(1);
          } else {
            setScrollCardIndex(2);
          }
        }
      }
    };

    const handleScroll = () => {
      if (!rafId) rafId = requestAnimationFrame(onScroll);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    onScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section id="concept" className="chapter concept-slide-section" aria-labelledby="concept-title">
      {/* ── Slide: PT #1 Business Concept Development with Scroll Track ── */}
      <div ref={trackRef} className="concept-slide-track">
        <div className="concept-slide concept-slide--sticky">
          <div className="concept-slide__inner">
            {/* PT #1 Blue Pill Badge on its own row above the title */}
            <motion.div
              className="concept-slide__badge-wrap"
              initial={{ opacity: 0, x: -22, scale: 0.85 }}
              animate={isSlideInView ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: -22, scale: 0.85 }}
              transition={{ type: 'spring', stiffness: 320, damping: 20 }}
            >
              <span className="concept-slide__badge">PT #1</span>
            </motion.div>

            {/* Big Title with Elastic Lettering on its own full line */}
            <motion.div
              initial={{ opacity: 0, x: -36, y: 10 }}
              animate={isSlideInView ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x: -36, y: 10 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.06 }}
            >
              <ElasticLettering
                text="BUSINESS CONCEPT DEVELOPMENT"
                as="h2"
                id="concept-title"
                className="concept-slide__title"
                tensionColor="#F48A17"
                stiffness={280}
                damping={14}
                maxStretch={180}
              />
            </motion.div>

            {/* Two-Column Bento Presentation Grid */}
            <div className="concept-slide__grid">
              {/* Left Column: Interactive Brand Identity Bento Hub (Staggered Pop-Up Entrance) */}
              <div className="concept-slide__col-info">
                <BrandBentoHub inView={isSlideInView} />
              </div>

              {/* Right Column: Scroll-Driven Story Deck (Pop-Up Entrance) */}
              <motion.div
                className="concept-slide__col-card"
                initial={{ opacity: 0, y: 35, scale: 0.94 }}
                animate={isSlideInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 35, scale: 0.94 }}
                transition={{ type: 'spring', stiffness: 320, damping: 22, delay: 0.18 }}
              >
                <StoryCardDeck
                  activeIndex={scrollCardIndex}
                  onIndexChange={setScrollCardIndex}
                />
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Products: Slicehaus-Style Interactive Accordion ── */}
      <ProductAccordion />

      {/* ── Continuation: Services, Owners ── */}
      <div className="band band--cream" style={{ paddingTop: 'clamp(2rem, 3.5vw, 4rem)' }}>
        {/* Services */}
        <div id="services" className="services-wrap">
          <div className="services-header">
            <motion.div
              initial={{ opacity: 0, x: -52, y: 12 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: false, amount: 0.25 }}
              transition={{ type: 'spring', stiffness: 240, damping: 22 }}
            >
              <ElasticLettering
                text="SERVICES"
                as="h3"
                id="services-title"
                className="services-title"
                tensionColor="#F48A17"
                stiffness={280}
                damping={14}
                maxStretch={180}
              />
              <motion.div
                className="chapter-head-unified__baseline-wrap"
                aria-hidden="true"
                initial={{ scaleX: 0, opacity: 0 }}
                whileInView={{ scaleX: 1, opacity: 1 }}
                viewport={{ once: false, amount: 0.25 }}
                transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay: 0.16 }}
              >
                <span className="chapter-head-unified__baseline" style={{ backgroundColor: '#F48A17' }} />
                <span className="chapter-head-unified__baseline-dot" style={{ backgroundColor: '#0B1C7D' }} />
              </motion.div>
            </motion.div>
          </div>

          <ul className="services">
            {services.map((s, i) => (
              <motion.li
                key={s.title}
                className={`tile tile--${serviceTones[i]} service`}
                initial={{ opacity: 0, y: 55, scale: 0.86 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  type: 'spring',
                  stiffness: 280,
                  damping: 18,
                  mass: 0.75,
                  delay: i * 0.1,
                }}
                whileHover={{
                  y: -8,
                  transition: { type: 'spring', stiffness: 380, damping: 18 },
                }}
              >
                <div className="service__media">
                  <motion.img
                    src={s.image}
                    alt={s.alt}
                    width={400}
                    height={400}
                    loading="lazy"
                    decoding="async"
                    className="service__img"
                    initial={{ opacity: 0, scale: 0.85 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 20,
                      delay: i * 0.1 + 0.08,
                    }}
                  />
                </div>
                <h4 className="service__title">{s.title}</h4>
                <p className="service__text">{s.text}</p>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Founders */}
        <FoundersSection />
      </div>
    </section>
  );
}
