import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { brand, nav } from '../data/site';

export function Nav() {
  const [open, setOpen] = useState(false);
  const [inOpening, setInOpening] = useState(true);

  // Hide nav during Opening sequence until the curtain reveals PT#1
  useEffect(() => {
    const handleScroll = () => {
      setInOpening(window.scrollY < window.innerHeight * 2.4);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('menu-open', open);
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="nav" style={{ opacity: inOpening ? 0 : 1, pointerEvents: inOpening ? 'none' : undefined, transition: 'opacity 0.35s ease' }}>
      <div className="nav__bar">
        <button
          type="button"
          className="nav__toggle"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="nav__toggle-text">{open ? 'Close' : 'Menu'}</span>
          <span className="nav__toggle-icon" aria-hidden="true"><span /><span /></span>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="mmenu"
            initial={{ clipPath: 'circle(0% at 92% 4%)' }}
            animate={{ clipPath: 'circle(150% at 92% 4%)' }}
            exit={{ clipPath: 'circle(0% at 92% 4%)' }}
            transition={{ duration: 0.55, ease: [0.65, 0, 0.35, 1] }}
          >
            <nav aria-label="Mobile">
              <ul>
                {nav.map((n, i) => (
                  <motion.li
                    key={n.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <a href={`#${n.id}`} onClick={() => setOpen(false)}>
                      <span className="mmenu__num">{n.chapter} · {n.code}</span>
                      <span className="mmenu__label">{n.label}</span>
                    </a>
                  </motion.li>
                ))}
              </ul>
            </nav>
            <p className="mmenu__tag">{brand.tagline}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
