import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { founders, Founder } from '../data/site';
import '../styles/founders.css';

/* Cute playful SVG doodle stickers */
function StarDoodle({ color = '#FFD166', size = 22 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2L14.39 8.26L21 9.27L16.2 13.97L17.34 20.6L12 17.27L6.66 20.6L7.8 13.97L3 9.27L9.61 8.26L12 2Z"
        fill={color}
        stroke="#481C10"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CrownDoodle({ color = '#FFB703', size = 26 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M3 17L5 7L10 12L12 5L14 12L19 7L21 17H3Z"
        fill={color}
        stroke="#481C10"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="5" cy="6" r="1.5" fill="#FF477E" />
      <circle cx="12" cy="4" r="1.5" fill="#48CAE4" />
      <circle cx="19" cy="6" r="1.5" fill="#06D6A0" />
    </svg>
  );
}

function HeartDoodle({ color = '#FF4D6D', size = 20 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        fill={color}
        stroke="#481C10"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function CookieDoodle({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" fill="#E3A857" stroke="#481C10" strokeWidth="1.6" />
      <circle cx="9" cy="9" r="1.4" fill="#481C10" />
      <circle cx="14" cy="8" r="1.2" fill="#481C10" />
      <circle cx="10" cy="14" r="1.3" fill="#481C10" />
      <circle cx="15" cy="13" r="1.5" fill="#481C10" />
      {/* Bite */}
      <path d="M19 8C17 9 17 11 18.5 12C17 13 17.5 15 19.5 15" stroke="#FFF" strokeWidth="2.5" fill="none" />
    </svg>
  );
}

function SparkleDoodle({ color = '#48CAE4', size = 18 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2V22M2 12H22M5 5L19 19M5 19L19 5"
        stroke={color}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SocialIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export function FoundersSection() {
  const [selectedFounder, setSelectedFounder] = useState<Founder | null>(null);

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedFounder(null);
    };
    if (selectedFounder) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [selectedFounder]);

  return (
    <div id="founders" className="founders-section">
      <div className="founders-header">
        <motion.h3
          className="founders-header__title"
          aria-label="Founders"
          initial={{ opacity: 0, y: 24, scale: 0.92 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: false, amount: 0.35 }}
          transition={{ type: 'spring', stiffness: 280, damping: 20 }}
        >
          {'Founders'.split('').map((char, idx) => (
            <motion.span
              key={idx}
              style={{ display: 'inline-block' }}
              initial={{ opacity: 0, y: 18, rotate: -6 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: false, amount: 0.35 }}
              transition={{
                type: 'spring',
                stiffness: 340,
                damping: 18,
                delay: idx * 0.035,
              }}
              whileHover={{ y: -4, scale: 1.1, color: '#F48A17' }}
            >
              {char}
            </motion.span>
          ))}
        </motion.h3>
        <motion.p
          className="founders-header__sub"
          initial={{ opacity: 0, y: 16, scale: 0.9 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: false, amount: 0.35 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.22 }}
          whileHover={{ scale: 1.05, y: -2 }}
        >
          <motion.span
            style={{ display: 'inline-flex' }}
            animate={{ rotate: [-8, 10, -8], y: [0, -2, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <CookieDoodle size={18} />
          </motion.span>
          Tap to know them more!
        </motion.p>
      </div>

      <ul className="founders-grid">
        {founders.map((f, i) => (
          <motion.li
            key={f.name}
            className="founder-card"
            style={{
              '--card-color': f.color,
              '--card-accent-bg': f.accentBg,
            } as React.CSSProperties}
            onClick={() => setSelectedFounder(f)}
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: i * 0.1, ease: [0.34, 1.56, 0.64, 1] }}
          >
            {/* Top decorative doodles */}
            <div className="founder-doodle founder-doodle--tl">
              {i % 2 === 0 ? <CrownDoodle size={24} /> : <StarDoodle color={f.color} size={22} />}
            </div>
            <div className="founder-doodle founder-doodle--tr">
              <SparkleDoodle color={f.color} size={20} />
            </div>

            {/* Photo frame */}
            <div className="founder-card__photo-wrap">
              {f.photo ? (
                <img
                  src={f.photo}
                  alt={f.name}
                  className="founder-card__img"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="founder-card__placeholder">
                  <div className="founder-card__avatar-circle">
                    {f.initials}
                  </div>
                  <span className="founder-card__avatar-hint">Add photo in assets</span>
                </div>
              )}
            </div>

            {/* Bottom-right sticker */}
            <div className="founder-doodle founder-doodle--br">
              {i % 2 === 0 ? <HeartDoodle size={18} /> : <CookieDoodle size={20} />}
            </div>

            {/* Details */}
            <div className="founder-card__info">
              <span className="founder-card__nickname">{f.nickname}</span>
              <h4 className="founder-card__name">{f.name}</h4>
              <div className="founder-card__tap-pill">
                <span>Tap to view card</span>
                <span aria-hidden="true">→</span>
              </div>
            </div>
          </motion.li>
        ))}
      </ul>

      {/* Scrapbook Profile Modal */}
      <AnimatePresence>
        {selectedFounder && (
          <motion.div
            className="founder-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedFounder(null)}
          >
            <motion.div
              className="founder-modal"
              style={{
                '--modal-color': selectedFounder.color,
                '--modal-accent-bg': selectedFounder.accentBg,
              } as React.CSSProperties}
              initial={{ scale: 0.85, y: 30, opacity: 0, rotate: -2 }}
              animate={{ scale: 1, y: 0, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.85, y: 20, opacity: 0, rotate: 1 }}
              transition={{ type: 'spring', damping: 22, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                className="founder-modal__close"
                onClick={() => setSelectedFounder(null)}
                aria-label="Close profile"
              >
                ✕
              </button>

              <div className="founder-modal__content">
                {/* Scrapbook details */}
                <div className="founder-modal__bio">
                  <div className="founder-modal__doodle-title">
                    <StarDoodle color={selectedFounder.color} size={30} />
                    <span className="founder-modal__nickname-display">
                      {selectedFounder.nickname}
                    </span>
                    <HeartDoodle color={selectedFounder.color} size={24} />
                  </div>

                  <div className="founder-modal__lines">
                    <div className="founder-modal__row">
                      <span className="founder-modal__label">Name</span>
                      <span className="founder-modal__val">{selectedFounder.name}</span>
                    </div>

                    <div className="founder-modal__row">
                      <span className="founder-modal__label">Program & Year</span>
                      <span className="founder-modal__val">
                        ✏️ {selectedFounder.course || 'BSIT 4G'}
                      </span>
                    </div>

                    {selectedFounder.birthday && selectedFounder.birthday !== '—' && (
                      <div className="founder-modal__row">
                        <span className="founder-modal__label">Birthday</span>
                        <span className="founder-modal__val">
                          🎂 {selectedFounder.birthday}
                        </span>
                      </div>
                    )}

                    {(selectedFounder.socialUrl || selectedFounder.instagram) && (
                      <div className="founder-modal__row">
                        <span className="founder-modal__label">Socials</span>
                        <span className="founder-modal__val">
                          <SocialIcon size={18} />
                          <a
                            href={
                              selectedFounder.socialUrl ||
                              `https://www.facebook.com/${selectedFounder.instagram?.replace('@', '')}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            @{selectedFounder.instagram?.replace('@', '')}
                          </a>
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right side photo */}
                <div className="founder-modal__photo-container">
                  <div className="founder-doodle" style={{ top: -10, left: -10, zIndex: 3 }}>
                    <CrownDoodle size={32} />
                  </div>
                  <div className="founder-doodle" style={{ bottom: -8, right: -8, zIndex: 3 }}>
                    <CookieDoodle size={28} />
                  </div>

                  <div className="founder-modal__photo-frame">
                    {selectedFounder.photo ? (
                      <img
                        src={selectedFounder.photo}
                        alt={selectedFounder.name}
                        className="founder-modal__img"
                      />
                    ) : (
                      <div className="founder-modal__ph-avatar">
                        <div className="founder-modal__ph-circle">
                          {selectedFounder.initials}
                        </div>
                        <span className="founder-modal__ph-msg">
                          Ready for founder photo!
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

