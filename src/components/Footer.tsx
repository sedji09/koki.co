import { brand } from '../data/site';

const COOKIE_BITE_EDGE = [
  'M 0,20',
  // Bite cluster 1
  'A 34,34 0 0 0 52,32',
  'A 44,44 0 0 0 120,36',
  'A 36,36 0 0 0 176,22',
  'A 28,28 0 0 0 216,20',
  // Bite cluster 2
  'A 38,38 0 0 0 274,34',
  'A 50,50 0 0 0 352,38',
  'A 40,40 0 0 0 414,24',
  'A 30,30 0 0 0 460,20',
  // Bite cluster 3
  'A 40,40 0 0 0 522,36',
  'A 52,52 0 0 0 604,40',
  'A 40,40 0 0 0 668,24',
  'A 34,34 0 0 0 720,20',
  // Bite cluster 4
  'A 38,38 0 0 0 780,34',
  'A 48,48 0 0 0 856,36',
  'A 38,38 0 0 0 916,22',
  'A 34,34 0 0 0 968,20',
  // Bite cluster 5
  'A 40,40 0 0 0 1030,36',
  'A 50,50 0 0 0 1108,38',
  'A 38,38 0 0 0 1168,24',
  'A 32,32 0 0 0 1216,20',
  // Bite cluster 6
  'A 38,38 0 0 0 1276,34',
  'A 48,48 0 0 0 1350,36',
  'A 36,36 0 0 0 1404,22',
  'A 26,26 0 0 0 1440,20',
  'L 1440,96 L 0,96 Z',
].join(' ');

const BITE_CRUMBS = [
  { cx: 86, cy: 14, r: 4.5, fill: '#2A160A' },
  { cx: 104, cy: 22, r: 2.8, fill: '#F48A17' },
  { cx: 312, cy: 15, r: 5, fill: '#2A160A' },
  { cx: 334, cy: 24, r: 3.2, fill: '#F48A17' },
  { cx: 562, cy: 16, r: 5.2, fill: '#2A160A' },
  { cx: 584, cy: 12, r: 3, fill: '#F48A17' },
  { cx: 818, cy: 15, r: 4.6, fill: '#2A160A' },
  { cx: 1068, cy: 16, r: 5, fill: '#2A160A' },
  { cx: 1088, cy: 24, r: 3, fill: '#F48A17' },
  { cx: 1314, cy: 15, r: 4.5, fill: '#2A160A' },
];

export function Footer() {
  const scrollToTop = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer-wave-wrap">
      {/* Top Cookie-Bite Border (Orange cookie crust + cream layer + Dark Chocolate fill) */}
      <div className="footer-wave-top" aria-hidden="true">
        <svg
          viewBox="0 0 1440 96"
          fill="none"
          preserveAspectRatio="none"
          className="footer-wave-svg"
        >
          {/* Floating Cookie Crumbs in the Bite Notches */}
          {BITE_CRUMBS.map((c, idx) => (
            <circle key={idx} cx={c.cx} cy={c.cy} r={c.r} fill={c.fill} />
          ))}
          {/* Top Cookie-Orange Crust Bite Layer */}
          <path d={COOKIE_BITE_EDGE} fill="#F48A17" transform="translate(0, -10)" />
          {/* Crisp Cream Divider Bite Layer */}
          <path d={COOKIE_BITE_EDGE} fill="#FFF7EC" transform="translate(0, -3.5)" />
          {/* Main Dark Chocolate Footer Bite Fill */}
          <path d={COOKIE_BITE_EDGE} fill="#2A160A" />
        </svg>
      </div>

      {/* Main Footer Body */}
      <div className="footer-wave-body">
        <div className="footer-wave-center">
          <h2 className="footer-wave-brand">{brand.name}</h2>
          <p className="footer-wave-tagline">{brand.tagline}.</p>
          <p className="footer-wave-copy">&copy; {brand.founded} {brand.name}</p>
        </div>

        {/* Circular Orange-Ringed Back to Top Button with Upward Animation */}
        <button
          type="button"
          className="footer-up-btn"
          onClick={scrollToTop}
          aria-label="Back to top"
          title="Back to top"
        >
          <span className="footer-up-btn__inner">
            <svg
              className="footer-up-btn__arrow"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 19V5" />
              <path d="M5 12l7-7 7 7" />
            </svg>
          </span>
        </button>
      </div>
    </footer>
  );
}
