import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export interface CookieFlavor {
  id: string;
  name: string;
  number: string;
  category: 'classic' | 'specialty';
  badge: string;
  badgeTone: 'orange' | 'blue' | 'green' | 'caramel' | 'choc';
  description: string;
  profile: string[];
  pairing: string;
  bg: string;
  border: string;
  cookieBase: string;
  cookieChips: string;
  chipDetail: string;
  isHero?: boolean;
}

const COOKIE_FLAVORS: CookieFlavor[] = [
  {
    id: 'classic-choc-chip',
    name: 'Classic Chocolate Chip',
    number: '01',
    category: 'classic',
    badge: 'OG FAVORITE',
    badgeTone: 'orange',
    description:
      'The timeless recipe that started kOKi.co in 2026. Golden buttery dough loaded with rich semi-sweet chocolate chips and a pinch of sea salt.',
    profile: ['Chewy Center', 'Crisp Edges', 'Golden Butter'],
    pairing: 'Best with Ice-Cold Fresh Milk',
    bg: '#FFF8EE',
    border: 'rgba(244, 138, 23, 0.38)',
    cookieBase: '#E8A763',
    cookieChips: '#3B1E08',
    chipDetail: '#241003',
    isHero: true,
  },
  {
    id: 'dubai-cookie',
    name: 'Dubai Cookie',
    number: '02',
    category: 'specialty',
    badge: 'VIRAL HIT',
    badgeTone: 'blue',
    description:
      'Inspired by the viral confectionery sensation. Decadent chocolate dough overflowing with crispy roasted pistachio knafeh crunch and molten chocolate core.',
    profile: ['Crispy Knafeh', 'Pistachio Core', 'Molten Cacao'],
    pairing: 'Best with Iced Americano or Cold Brew',
    bg: '#FAF4EB',
    border: 'rgba(184, 122, 30, 0.42)',
    cookieBase: '#4A2312',
    cookieChips: '#769E4C',
    chipDetail: '#94C660',
    isHero: true,
  },
  {
    id: 'matcha',
    name: 'Matcha',
    number: '03',
    category: 'specialty',
    badge: 'EARTHY & SWEET',
    badgeTone: 'green',
    description:
      'Authentic ceremonial-grade Japanese green tea dough balanced with sweet white chocolate chunks and a silky smooth finish.',
    profile: ['Earthy Matcha', 'White Chocolate', 'Velvety Sweet'],
    pairing: 'Best with Warm Oat Milk Latte',
    bg: '#F2F8F1',
    border: 'rgba(78, 135, 70, 0.32)',
    cookieBase: '#7DAA6B',
    cookieChips: '#FFF5E6',
    chipDetail: '#EDE0CC',
  },
  {
    id: 'cookies-n-cream',
    name: 'Cookies ’n Cream',
    number: '04',
    category: 'classic',
    badge: 'CROWD FAVORITE',
    badgeTone: 'choc',
    description:
      'Velvety vanilla dough studded with crunchy crushed chocolate sandwich cookies and white cream layers for double cookie fun.',
    profile: ['Crushed Cookies', 'Cream Swirl', 'Double Crunch'],
    pairing: 'Best with Iced Caramel Macchiato',
    bg: '#F8F6F4',
    border: 'rgba(46, 39, 36, 0.28)',
    cookieBase: '#E5D8C7',
    cookieChips: '#241F1D',
    chipDetail: '#151211',
  },
  {
    id: 'pistachio',
    name: 'Pistachio',
    number: '05',
    category: 'specialty',
    badge: 'NUTTY INDULGENCE',
    badgeTone: 'green',
    description:
      'Aromatic roasted pistachio dough infused with real nutty paste and topped with toasted pistachio bits for a delicate, luxurious bite.',
    profile: ['Roasted Pistachio', 'Nutty Aroma', 'Tender Crumb'],
    pairing: 'Best with Hot Espresso',
    bg: '#F4F8EE',
    border: 'rgba(116, 153, 85, 0.32)',
    cookieBase: '#A7C686',
    cookieChips: '#4A6930',
    chipDetail: '#2F451E',
  },
  {
    id: 'double-chocolate',
    name: 'Double Chocolate',
    number: '06',
    category: 'classic',
    badge: 'ULTRA FUDGY',
    badgeTone: 'choc',
    description:
      'Deep Dutch cocoa dough generously packed with molten dark chocolate chunks. Rich, gooey, and made for true chocolate purists.',
    profile: ['Dutch Cocoa', 'Molten Chunks', 'Deep Fudgy'],
    pairing: 'Best with Classic Hot Chocolate',
    bg: '#F7EFEB',
    border: 'rgba(61, 30, 14, 0.35)',
    cookieBase: '#381B0E',
    cookieChips: '#1A0B05',
    chipDetail: '#542B18',
  },
  {
    id: 'biscoff-cookie',
    name: 'Biscoff Cookie',
    number: '07',
    category: 'specialty',
    badge: 'SPECULOOS CRUNCH',
    badgeTone: 'caramel',
    description:
      'Caramelized spiced speculoos dough loaded with crunchy Lotus Biscoff biscuit crumbs and a rich caramel biscuit butter swirl.',
    profile: ['Caramel Speculoos', 'Warm Cinnamon', 'Biscoff Biscuit'],
    pairing: 'Best with Spanish Latte',
    bg: '#FAF2EA',
    border: 'rgba(178, 87, 34, 0.36)',
    cookieBase: '#D88A4C',
    cookieChips: '#6E3210',
    chipDetail: '#8F4418',
  },
];

function CookieGraphic({
  baseColor,
  chipColor,
  detailColor,
}: {
  baseColor: string;
  chipColor: string;
  detailColor: string;
}) {
  return (
    <svg
      viewBox="0 0 120 120"
      className="product-bento-card__cookie-svg"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`glow-${baseColor.replace('#', '')}`} cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.18" />
        </radialGradient>
        <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#2A160A" floodOpacity="0.18" />
        </filter>
      </defs>

      {/* Main Cookie Body */}
      <circle
        cx="60"
        cy="60"
        r="48"
        fill={baseColor}
        filter="url(#shadow)"
      />
      <circle
        cx="60"
        cy="60"
        r="48"
        fill={`url(#glow-${baseColor.replace('#', '')})`}
      />

      {/* Bite Impression at Top-Right */}
      <circle cx="98" cy="30" r="14" fill="#F8F1E5" />
      <circle cx="94" cy="42" r="10" fill="#F8F1E5" />

      {/* Rich Chunks / Chips */}
      <circle cx="42" cy="40" r="7" fill={chipColor} />
      <circle cx="44" cy="42" r="3" fill={detailColor} />

      <circle cx="68" cy="48" r="8.5" fill={chipColor} />
      <circle cx="70" cy="50" r="3.5" fill={detailColor} />

      <circle cx="48" cy="74" r="8" fill={chipColor} />
      <circle cx="50" cy="76" r="3" fill={detailColor} />

      <circle cx="78" cy="78" r="6.5" fill={chipColor} />
      <circle cx="80" cy="80" r="2.5" fill={detailColor} />

      <circle cx="30" cy="62" r="5" fill={chipColor} />
      <circle cx="58" cy="28" r="5" fill={chipColor} />
    </svg>
  );
}

export function ProductBentoGrid() {
  const [filter, setFilter] = useState<'all' | 'classic' | 'specialty'>('all');
  const [selectedFlavor, setSelectedFlavor] = useState<string | null>(null);

  const filteredFlavors =
    filter === 'all'
      ? COOKIE_FLAVORS
      : COOKIE_FLAVORS.filter((f) => f.category === filter);

  return (
    <section id="products" className="product-bento-section" aria-labelledby="products-heading">
      <div className="product-bento-container">
        {/* ── Section Header ───────────────────────────────────────── */}
        <div className="product-bento-header">
          <div className="product-bento-header__meta">
            <span className="product-bento-badge">FLAVOR LINEUP</span>
            <span className="product-bento-count">7 Freshly Baked Varieties</span>
          </div>

          <h3 id="products-heading" className="product-bento-title">
            SIGNATURE COOKIE FLAVORS
          </h3>

          <p className="product-bento-lead">
            Crafted in small batches with premium butter and generous toppings. Rolled fresh daily to schools, community hubs, and events across Nueva Ecija.
          </p>

          {/* Category Filter Pills */}
          <div className="product-bento-filters" role="tablist" aria-label="Cookie Flavor Categories">
            <button
              type="button"
              role="tab"
              aria-selected={filter === 'all'}
              className={`product-bento-filter ${filter === 'all' ? 'is-active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Flavors ({COOKIE_FLAVORS.length})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={filter === 'classic'}
              className={`product-bento-filter ${filter === 'classic' ? 'is-active' : ''}`}
              onClick={() => setFilter('classic')}
            >
              Classics (3)
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={filter === 'specialty'}
              className={`product-bento-filter ${filter === 'specialty' ? 'is-active' : ''}`}
              onClick={() => setFilter('specialty')}
            >
              Specialty & Viral (4)
            </button>
          </div>
        </div>

        {/* ── Bento Grid ───────────────────────────────────────────── */}
        <motion.div layout className="product-bento-grid">
          <AnimatePresence mode="popLayout">
            {filteredFlavors.map((flavor, index) => {
              const isSelected = selectedFlavor === flavor.id;

              return (
                <motion.div
                  key={flavor.id}
                  layout
                  initial={{ opacity: 0, y: 30, scale: 0.94 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.15 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  transition={{
                    type: 'spring',
                    stiffness: 320,
                    damping: 24,
                    delay: (index % 4) * 0.08,
                  }}
                  whileHover={{ y: -6 }}
                  className={`product-bento-card product-bento-card--${flavor.badgeTone} ${
                    flavor.isHero && filter === 'all' ? 'product-bento-card--hero' : ''
                  } ${isSelected ? 'is-selected' : ''}`}
                  style={{
                    backgroundColor: flavor.bg,
                    borderColor: flavor.border,
                  }}
                  onClick={() => setSelectedFlavor(isSelected ? null : flavor.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedFlavor(isSelected ? null : flavor.id);
                    }
                  }}
                  aria-label={`${flavor.name} cookie flavor card. Click for details.`}
                >
                  {/* Card Top Badges */}
                  <div className="product-bento-card__top">
                    <span className="product-bento-card__number">#{flavor.number}</span>
                    <span
                      className={`product-bento-card__pill product-bento-card__pill--${flavor.badgeTone}`}
                    >
                      {flavor.badge}
                    </span>
                  </div>

                  {/* Cookie Visual Showcase */}
                  <div className="product-bento-card__visual">
                    <CookieGraphic
                      baseColor={flavor.cookieBase}
                      chipColor={flavor.cookieChips}
                      detailColor={flavor.chipDetail}
                    />
                  </div>

                  {/* Flavor Info */}
                  <div className="product-bento-card__content">
                    <h4 className="product-bento-card__title">{flavor.name}</h4>
                    <p className="product-bento-card__desc">{flavor.description}</p>

                    {/* Taste Profile Tags */}
                    <div className="product-bento-card__tags">
                      {flavor.profile.map((tag) => (
                        <span key={tag} className="product-bento-tag">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Best Pairing Recommendation */}
                    <div className="product-bento-card__pairing">
                      <span className="product-bento-card__pairing-label">Pairing:</span>
                      <span className="product-bento-card__pairing-text">{flavor.pairing}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

