import { useState, useEffect, type CSSProperties } from 'react';
import { motion } from 'motion/react';
import { asset } from '../data/site';
import '../styles/product-accordion.css';

export interface FlavorItem {
  id: string;
  name: string;
  number: string;
  price: string;
  priceNote?: string;
  category: 'Classic' | 'Specialty';
  badge: string;
  description: string;
  profile: string[];
  pairing: string;
  bg: string;
  accent: string;
  image: string;
}

export const FLAVORS: FlavorItem[] = [
  {
    id: 'classic-choc-chip',
    name: 'Classic Chocolate Chip',
    number: '01',
    price: '₱35',
    priceNote: 'or 3 for ₱99',
    category: 'Classic',
    badge: 'OG BESTSELLER',
    description:
      'The timeless recipe that started kOKi.co in 2026. Golden buttery dough packed with rich semi-sweet chocolate chunks and finished with a pinch of sea salt.',
    profile: ['Chewy Center', 'Crisp Edges', 'Golden Butter'],
    pairing: 'Best with Ice-Cold Fresh Milk',
    bg: '#4E2111',
    accent: '#FFE6CC',
    image: asset('products/classic-choc-chip.png'),
  },
  {
    id: 'dubai-cookie',
    name: 'Dubai Cookie',
    number: '02',
    price: '₱65',
    priceNote: 'Limited Batch',
    category: 'Specialty',
    badge: 'VIRAL SENSATION',
    description:
      'Inspired by the viral confectionery hit. Deep chocolate dough filled with golden crispy knafeh crunch and a silky, molten pistachio cream center.',
    profile: ['Crispy Knafeh', 'Pistachio Core', 'Molten Cacao'],
    pairing: 'Best with Iced Americano or Cold Brew',
    bg: '#2C170E',
    accent: '#EADBCE',
    image: asset('products/dubai-cookie.png'),
  },
  {
    id: 'matcha',
    name: 'Matcha',
    number: '03',
    price: '₱45',
    priceNote: 'Daily Bake',
    category: 'Specialty',
    badge: 'EARTHY & SWEET',
    description:
      'Authentic Japanese ceremonial-grade green tea dough folded with creamy white chocolate chunks for a serene, bittersweet balance.',
    profile: ['Ceremonial Matcha', 'White Chocolate', 'Velvety Crumb'],
    pairing: 'Best with Warm Oat Milk Latte',
    bg: '#33482A',
    accent: '#F2F8EE',
    image: asset('products/matcha.png'),
  },
  {
    id: 'cookies-n-cream',
    name: 'Cookies ’n Cream',
    number: '04',
    price: '₱40',
    priceNote: 'Crowd Favorite',
    category: 'Classic',
    badge: 'DOUBLE CRUNCH',
    description:
      'Velvety vanilla dough loaded with real crushed dark chocolate sandwich cookies and sweet cream pockets for double cookie delight.',
    profile: ['Crushed Cookies', 'Cream Swirl', 'Crisp Bite'],
    pairing: 'Best with Iced Caramel Macchiato',
    bg: '#231F1E',
    accent: '#F5F1ED',
    image: asset('products/cookies-n-cream.png'),
  },
  {
    id: 'pistachio',
    name: 'Pistachio',
    number: '05',
    price: '₱50',
    priceNote: 'Specialty',
    category: 'Specialty',
    badge: 'NUTTY INDULGENCE',
    description:
      'Rich roasted pistachio dough infused with pure nut paste and topped with toasted pistachio bits for a delicate, luxurious texture.',
    profile: ['Roasted Pistachio', 'Nutty Aroma', 'Tender Crumb'],
    pairing: 'Best with Hot Espresso',
    bg: '#475635',
    accent: '#F5F9EF',
    image: asset('products/pistachio.png'),
  },
  {
    id: 'double-chocolate',
    name: 'Double Chocolate',
    number: '06',
    price: '₱40',
    priceNote: 'Ultra Fudgy',
    category: 'Classic',
    badge: 'TRUE CHOCOLATE PURIST',
    description:
      'Deep Dutch cocoa dough loaded with overflowing dark chocolate chunks. Ultra rich, gooey, and made for serious chocolate cravers.',
    profile: ['Dutch Cocoa', 'Molten Chunks', 'Pure Fudge'],
    pairing: 'Best with Hot Chocolate',
    bg: '#1C0D06',
    accent: '#FAEDE7',
    image: asset('products/double-chocolate.png'),
  },
  {
    id: 'biscoff-cookie',
    name: 'Biscoff Cookie',
    number: '07',
    price: '₱50',
    priceNote: 'Specialty',
    category: 'Specialty',
    badge: 'SPECULOOS CRUNCH',
    description:
      'Caramelized spiced speculoos cookie dough packed with crunchy Lotus Biscoff biscuit crumbs and a molten biscuit spread swirl.',
    profile: ['Caramel Speculoos', 'Warm Cinnamon', 'Biscoff Crunch'],
    pairing: 'Best with Spanish Latte',
    bg: '#5E2B0F',
    accent: '#FFF1E6',
    image: asset('products/biscoff-cookie.png'),
  },
];

export function ProductAccordion() {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 768px)').matches : false
  );

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    setIsMobile(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return (
    <section id="products" className="flavor-accordion-section" aria-labelledby="products-title">
      {/* ── Top Organic Wave Transition ── */}
      <div className="flavor-accordion__wave flavor-accordion__wave--top" aria-hidden="true">
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none">
          <path
            d="M0,0 C320,50 640,15 960,45 C1200,65 1360,20 1440,30 L1440,60 L0,60 Z"
            fill="currentColor"
          />
        </svg>
      </div>

      <div className="flavor-accordion__container">
        {/* Section Heading */}
        <div className="flavor-accordion__header">
          <motion.div
            className="flavor-accordion__badge-row"
            initial={{ opacity: 0, x: -28, scale: 0.85 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: false, amount: 0.25 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <span className="flavor-accordion__pill">FLAVOR SHOWCASE</span>
          </motion.div>

          <motion.h3
            id="products-title"
            className="flavor-accordion__title"
            initial={{ opacity: 0, x: -50, y: 12 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: false, amount: 0.25 }}
            transition={{ type: 'spring', stiffness: 240, damping: 22, delay: 0.08 }}
          >
            SIGNATURE COOKIE FLAVORS
          </motion.h3>

          <motion.div
            className="chapter-head-unified__baseline-wrap"
            style={{ marginBottom: '0.85rem' }}
            aria-hidden="true"
            initial={{ scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 1 }}
            viewport={{ once: false, amount: 0.25 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay: 0.16 }}
          >
            <span className="chapter-head-unified__baseline" style={{ backgroundColor: '#F48A17' }} />
            <span className="chapter-head-unified__baseline-dot" style={{ backgroundColor: '#0B1C7D' }} />
          </motion.div>

          <motion.p
            className="flavor-accordion__subtitle"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.25 }}
            transition={{ type: 'spring', stiffness: 250, damping: 24, delay: 0.22 }}
          >
            Crafted daily in small batches with real golden butter, Belgian chocolate chunks, and generous toppings. Rolled fresh directly to you across Nueva Ecija.
          </motion.p>
        </div>

        {/* ── Interactive Horizontal Accordion ── */}
        <motion.div
          className="flavor-accordion"
          role="region"
          aria-label="Interactive Cookie Flavors Accordion"
          initial={{ opacity: 0, y: 36, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: false, amount: 0.12 }}
          transition={{ type: 'spring', stiffness: 240, damping: 24, delay: 0.12 }}
        >
          {FLAVORS.map((flavor, index) => {
            const isActive = isMobile || activeIndex === index;

            return (
              <motion.div
                key={flavor.id}
                className={`flavor-accordion__panel ${isActive ? 'is-active' : 'is-collapsed'}`}
                style={
                  {
                    backgroundColor: flavor.bg,
                    color: flavor.accent,
                    '--card-index': index,
                  } as CSSProperties
                }
                initial={isMobile ? { opacity: 0.88, scale: 0.95 } : false}
                whileInView={isMobile ? { opacity: 1, scale: 1 } : undefined}
                viewport={isMobile ? { once: false, amount: 0.2 } : undefined}
                transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                onMouseEnter={() => {
                  if (!isMobile) setActiveIndex(index);
                }}
                onClick={() => {
                  if (!isMobile) setActiveIndex(index);
                }}
                role={isMobile ? undefined : 'button'}
                tabIndex={isMobile ? undefined : 0}
                aria-expanded={isMobile ? undefined : isActive}
                aria-label={`${flavor.name} (${flavor.price})`}
                onKeyDown={(e) => {
                  if (!isMobile && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    setActiveIndex(index);
                  }
                }}
              >
                {/* ── EXPANDED VIEW ── */}
                {isActive && (
                  <motion.div
                    key={`content-${flavor.id}`}
                    className="flavor-accordion__expanded-content"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {/* Left: Text & Pricing Info */}
                    <div className="flavor-accordion__info">
                      {/* Price Tag (Slicehaus style) */}
                      <div className="flavor-accordion__price-block">
                        <span className="flavor-accordion__price-label">Only</span>
                        <div className="flavor-accordion__price-val">
                          <span className="flavor-accordion__price-num">{flavor.price}</span>
                          {flavor.priceNote && (
                            <span className="flavor-accordion__price-note">
                              {flavor.priceNote}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Main Flavor Title */}
                      <div className="flavor-accordion__title-group">
                        <h4 className="flavor-accordion__name">{flavor.name}</h4>
                        <div className="flavor-accordion__brand-tag">
                          <span>kOKi.co</span>
                          <span className="flavor-accordion__dot">·</span>
                          <span className="flavor-accordion__cat">{flavor.badge}</span>
                        </div>
                      </div>

                      {/* Flavor Description */}
                      <p className="flavor-accordion__desc">{flavor.description}</p>

                      {/* Taste Profile Tags */}
                      <div className="flavor-accordion__tags">
                        {flavor.profile.map((tag) => (
                          <span key={tag} className="flavor-accordion__tag">
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Pairing Recommendation */}
                      <div className="flavor-accordion__pairing">
                        <span className="flavor-accordion__pairing-title">Recommended Pairing:</span>
                        <span className="flavor-accordion__pairing-desc">{flavor.pairing}</span>
                      </div>
                    </div>

                    {/* Right: Giant Hero Cookie Graphic */}
                    <div className="flavor-accordion__visual">
                      <motion.div
                        key={`cookie-${flavor.id}`}
                        className="flavor-accordion__cookie-wrap"
                        initial={{ scale: 0.25, opacity: 0, rotate: -20 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        transition={{
                          type: 'spring',
                          stiffness: 350,
                          damping: 18,
                          mass: 0.75,
                        }}
                        whileHover={{
                          scale: 1.05,
                          rotate: 6,
                          transition: { type: 'spring', stiffness: 360, damping: 15 },
                        }}
                      >
                        <img
                          src={flavor.image}
                          alt={`${flavor.name} fresh baked cookie`}
                          className="flavor-accordion__cookie-img"
                          width={440}
                          height={440}
                          loading="eager"
                          decoding="async"
                        />
                      </motion.div>
                    </div>
                  </motion.div>
                )}

                {/* ── COLLAPSED VIEW (Vertical Ribbon) ── */}
                {!isActive && (
                  <div className="flavor-accordion__collapsed-strip" aria-hidden="true">
                    <span className="flavor-accordion__strip-num">#{flavor.number}</span>

                    <div className="flavor-accordion__strip-center">
                      <span className="flavor-accordion__strip-title">{flavor.name}</span>
                    </div>

                    <div className="flavor-accordion__strip-bottom">
                      <div className="flavor-accordion__strip-thumb">
                        <img
                          src={flavor.image}
                          alt=""
                          width={40}
                          height={40}
                          loading="lazy"
                        />
                      </div>
                      <span className="flavor-accordion__strip-price">{flavor.price}</span>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* ── Bottom Organic Wave Transition ── */}
      <div className="flavor-accordion__wave flavor-accordion__wave--bottom" aria-hidden="true">
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none">
          <path
            d="M0,30 C240,10 480,50 720,20 C960,40 1200,10 1440,35 L1440,60 L0,60 Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </section>
  );
}
