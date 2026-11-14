import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { firstPost, firstPostPalette, logos, supportingPosts, type Swatch } from '../data/site';
import { useLightbox } from './Lightbox';
import { Marquee } from './Marquee';
import { inkOn, useCopy } from './Palette';
import { ChapterHead, RevealMedia } from './ui';

const ALPHABET_PAIRS = ['Aa', 'Bb', 'Cc'];

const CHARSET_PAIRS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((c) => `${c}${c.toLowerCase()}`);
const CHARSET_EXTRAS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '!', '@', '#', '$', '&', '?'];

/** Evenly spaced character set: Aa Bb Cc … then numbers & symbols. */
function CharSet({ className }: { className: string }) {
  return (
    <div className={`video-specimen__charset ${className}`} aria-hidden="true">
      <div className="video-specimen__charset-grid video-specimen__charset-grid--pairs">
        {CHARSET_PAIRS.map((p) => (
          <span key={p}>{p}</span>
        ))}
      </div>
      <div className="video-specimen__charset-grid video-specimen__charset-grid--extras">
        {CHARSET_EXTRAS.map((c) => (
          <span key={c}>{c}</span>
        ))}
      </div>
    </div>
  );
}

function useTypewriterAlphabet(pairs: string[]) {
  const [text, setText] = useState('Aa');
  const [pairIndex, setPairIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(2);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPair = pairs[pairIndex % pairs.length];

    if (!isDeleting && subIndex === currentPair.length) {
      const pause = setTimeout(() => {
        setIsDeleting(true);
      }, 1400);
      return () => clearTimeout(pause);
    }

    if (isDeleting && subIndex === 0) {
      setIsDeleting(false);
      setPairIndex((prev) => (prev + 1) % pairs.length);
      return;
    }

    const timeout = setTimeout(() => {
      const nextSub = subIndex + (isDeleting ? -1 : 1);
      setSubIndex(nextSub);
      setText(currentPair.substring(0, nextSub));
    }, isDeleting ? 80 : 150);

    return () => clearTimeout(timeout);
  }, [subIndex, isDeleting, pairIndex, pairs]);

  return text;
}

function PostPaletteStrip({ swatches }: { swatches: Swatch[] }) {
  const { copied, copy } = useCopy();
  return (
    <div className="post-palette-strip" role="list" aria-label="First post color palette">
      {swatches.map((s) => (
        <button
          key={s.hex}
          type="button"
          className="post-palette-chip"
          style={{ '--sw-color': s.hex, '--sw-ink': inkOn(s.hex) } as React.CSSProperties}
          onClick={() => copy(s.hex)}
          aria-label={`${s.name}, ${s.hex}. Click to copy`}
        >
          <span className="post-palette-chip__color">
            {copied === s.hex ? (
              <span className="post-palette-chip__copied-badge">Copied!</span>
            ) : null}
          </span>
          <span className="post-palette-chip__info">
            <strong className="post-palette-chip__hex">{s.hex}</strong>
            <span className="post-palette-chip__name">{s.name}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

export function PostChapter() {
  const [expanded, setExpanded] = useState(false);
  const typedGlyph = useTypewriterAlphabet(ALPHABET_PAIRS);
  const displayGlyph = typedGlyph || '\u00A0';
  const open = useLightbox();
  const im = firstPost.image;

  return (
    <section id="first-post" className="chapter band band--choc" aria-labelledby="first-post-title">
      <ChapterHead
        id="first-post"
        code="CT #2"
        title="FIRST BRAND POST"
        theme="light"
        tensionColor="#F48A17"
      />

      <div className="post-chapter-wrap">
        <div className="post-showcase-grid">
          {/* LEFT: Feed Card (Proportional, balanced social card) */}
          <div className="post-feed-col">
            <article className="feedcard feedcard--refined" aria-label="kOKi.co first brand post">
              {/* Header */}
              <header className="feedcard__head">
                <span className="feedcard__avatar">
                  <img src={logos.primaryTrim} alt="kOKi.co logo" width={32} height={32} />
                </span>
                <div className="feedcard__meta">
                  <div className="feedcard__author-row">
                    <strong className="feedcard__name">kOKi.co</strong>
                    <span className="feedcard__badge" title="Official Brand Account" aria-label="Verified">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="#0B1C7D">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                    </span>
                  </div>
                  <span className="feedcard__handle">@kOKi.co</span>
                </div>
              </header>

              {/* Artwork Media Frame */}
              <RevealMedia>
                <div className="feedcard__media-wrap">
                  <button
                    type="button"
                    className="feedcard__img-btn"
                    onClick={() => open({ ...im, caption: 'kOKi.co — first ever brand post' })}
                    aria-label="View the first ever brand post full size"
                  >
                    <img
                      src={im.src}
                      alt={im.alt}
                      width={im.width}
                      height={im.height}
                      loading="lazy"
                      decoding="async"
                      className="feedcard__photo"
                    />
                    <span className="feedcard__expand-badge">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                      </svg>
                      Full View
                    </span>
                  </button>
                </div>
              </RevealMedia>

              {/* Social Actions */}
              <div className="feedcard__actions" aria-hidden="true">
                <div className="feedcard__action-group">
                  <span className="feedcard__action-btn" title="Like">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </span>
                  <span className="feedcard__action-btn" title="Comment">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                    </svg>
                  </span>
                  <span className="feedcard__action-btn" title="Share">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </span>
                </div>
              </div>

              {/* Caption */}
              <div className="feedcard__caption-box">
                <div id="first-post-caption" className={`feedcard__caption-text${expanded ? ' is-open' : ''}`}>
                  <p>{firstPost.caption}</p>
                </div>
                <button
                  type="button"
                  className="feedcard__more-btn"
                  aria-expanded={expanded}
                  aria-controls="first-post-caption"
                  onClick={() => setExpanded((v) => !v)}
                >
                  {expanded ? 'Show less ▲' : 'Read original caption ▼'}
                </button>
              </div>
            </article>
          </div>

          {/* RIGHT: Companion Brand Kit Deck */}
          <div className="post-details-col">
            {/* Color Palette (Compact interactive strip) */}
            <motion.div
              className="post-kit-card"
              initial={{ opacity: 0, x: 36, y: 16 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ type: 'spring', stiffness: 250, damping: 23, delay: 0.1 }}
            >
              <div className="post-kit-card__header">
                <h4 className="post-kit-title">Brand Color Palette</h4>
              </div>
              <PostPaletteStrip swatches={firstPostPalette} />
            </motion.div>

            {/* Typography Specimen Board (Video Showcase Style) */}
            <motion.div
              className="video-specimen-board"
              aria-label="Brand Typography Guidelines"
              initial={{ opacity: 0, x: 36, y: 18 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: false, amount: 0.18 }}
              transition={{ type: 'spring', stiffness: 250, damping: 23, delay: 0.2 }}
            >
              <div className="video-specimen-board__top-bar">
                <span className="video-specimen-board__main-title">Brand Post Typography</span>
                <span className="video-specimen-board__badge">3 Core Typefaces</span>
              </div>

              {/* Top: 3-Column Alphabet & Character Set Grid */}
              <div className="video-specimen__top-grid">
                {/* Pop Core */}
                <div className="video-specimen__font-col">
                  <div className="video-specimen__font-head">
                    <h5 className="video-specimen__font-name font-pop-core">Pop Core</h5>
                    <span className="video-specimen__font-tag">Primary · Arched Headline</span>
                  </div>
                  <CharSet className="font-pop-core" />
                </div>

                {/* Super Boys */}
                <div className="video-specimen__font-col">
                  <div className="video-specimen__font-head">
                    <h5 className="video-specimen__font-name font-super-boys">Super Boys</h5>
                    <span className="video-specimen__font-tag">Secondary · Playful Display</span>
                  </div>
                  <CharSet className="font-super-boys" />
                </div>

                {/* Chewy */}
                <div className="video-specimen__font-col">
                  <div className="video-specimen__font-head">
                    <h5 className="video-specimen__font-name font-chewy">Chewy</h5>
                    <span className="video-specimen__font-tag">Accent · Tagline</span>
                  </div>
                  <CharSet className="font-chewy" />
                </div>
              </div>

              {/* Divider */}
              <div className="video-specimen__divider"></div>

              {/* Bottom: Left Meta Index + Right Giant Animated Glyph with Center Guide Line */}
              <div className="video-specimen__bottom">
                <div className="video-specimen__meta-index">
                  <div className="video-specimen__meta-row">
                    <span className="video-specimen__meta-font font-pop-core">Pop Core</span>
                    <span className="video-specimen__meta-role">— Primary Typeface</span>
                  </div>
                  <div className="video-specimen__meta-row">
                    <span className="video-specimen__meta-font font-super-boys">Super Boys</span>
                    <span className="video-specimen__meta-role">— Secondary Typeface</span>
                  </div>
                  <div className="video-specimen__meta-row">
                    <span className="video-specimen__meta-font font-chewy">Chewy</span>
                    <span className="video-specimen__meta-role">— Brand Tagline</span>
                  </div>
                </div>

                {/* Giant Glyph Stage Columns */}
                <div className="video-specimen__stage-grid">
                  {/* Pop Core */}
                  <div className="video-specimen__stage-col">
                    <div className="video-specimen__giant-letter font-pop-core">
                      {displayGlyph}
                      <span className="video-specimen__cursor">|</span>
                    </div>
                    <span className="video-specimen__stage-caption font-pop-core">Pop Core</span>
                  </div>

                  {/* Super Boys */}
                  <div className="video-specimen__stage-col">
                    <div className="video-specimen__giant-letter font-super-boys">
                      {displayGlyph}
                      <span className="video-specimen__cursor">|</span>
                    </div>
                    <span className="video-specimen__stage-caption font-super-boys">Super Boys</span>
                  </div>

                  {/* Chewy */}
                  <div className="video-specimen__stage-col">
                    <div className="video-specimen__giant-letter font-chewy">
                      {displayGlyph}
                      <span className="video-specimen__cursor">|</span>
                    </div>
                    <span className="video-specimen__stage-caption font-chewy">Chewy</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Supporting Posts Marquee */}
      <div className="feed" style={{ marginTop: 'clamp(2.5rem, 4.5vw, 4rem)' }}>
        <motion.div
          className="row-head"
          style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.55rem' }}
          initial={{ opacity: 0, x: -48, y: 10 }}
          whileInView={{ opacity: 1, x: 0, y: 0 }}
          viewport={{ once: false, amount: 0.25 }}
          transition={{ type: 'spring', stiffness: 250, damping: 22 }}
        >
          <h3 className="row-head__title" style={{ margin: 0 }}>Supporting Posts</h3>
          <motion.div
            className="chapter-head-unified__baseline-wrap"
            style={{ marginTop: 0 }}
            aria-hidden="true"
            initial={{ scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 1 }}
            viewport={{ once: false, amount: 0.25 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          >
            <span className="chapter-head-unified__baseline" style={{ backgroundColor: '#F48A17' }} />
            <span className="chapter-head-unified__baseline-dot" style={{ backgroundColor: '#FFFDF9' }} />
          </motion.div>
        </motion.div>
        <Marquee items={supportingPosts} />
      </div>
    </section>
  );
}
