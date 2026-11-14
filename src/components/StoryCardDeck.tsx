import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { bittenCookie } from '../data/site';

interface StoryItem {
  id: string;
  tag: string;
  title: string;
  badge: string;
  content: string;
  accent: string;
  number: string;
}

const STORY_CARDS: StoryItem[] = [
  {
    id: 'origin',
    number: '01',
    tag: '2026 · THE BEGINNING',
    title: 'A Small Treat to Brighten Your Day',
    badge: '1 Store · 1 Flavor',
    content:
      'kOKi.co started in 2026 as a small rolling store selling only one cookie flavor. The idea started from a simple thought: cookies are a small treat, but they can easily make someone’s day better. At first, only a small batch was made and sold to friends and people they knew. As more customers started enjoying the cookies, the business slowly added new flavors and improved recipes based on what people liked.',
    accent: '#F48A17',
  },
  {
    id: 'name',
    number: '02',
    tag: 'BRAND STORY · THE NAME',
    title: 'Cookies That Roll Closer to You',
    badge: 'Why kOKi.co?',
    content:
      "The name kOKi.co came from the idea of a welcoming 'Cookie Corner' — a place where people can always find fresh, comforting cookies they’ll enjoy, no matter where they are. The '.co' suffix stands for 'Corner', reflecting our rolling carts and mobile vendors turning every school gate, plaza, and street corner across Nueva Ecija into an inviting cookie spot.",
    accent: '#ce8f59',
  },
  {
    id: 'growth',
    number: '03',
    tag: 'THE COMMUNITY · NUEVA ECIJA',
    title: 'Bringing Joy to Schools & Streets',
    badge: 'Campus & Community',
    content:
      'What began as one humble rolling cart selling a single flavor has grown into a vibrant mobile cookie presence reaching school gates, university plazas, community parks, and bustling event grounds across Nueva Ecija. Every batch is baked fresh daily to guarantee warm comfort wherever your day takes you.',
    accent: '#0B1C7D',
  },
];

interface StoryCardDeckProps {
  activeIndex?: number;
  onIndexChange?: (idx: number) => void;
}

export function StoryCardDeck({ activeIndex, onIndexChange }: StoryCardDeckProps) {
  const [internalIndex, setInternalIndex] = useState(0);

  // Sync with controlled activeIndex if provided
  useEffect(() => {
    if (typeof activeIndex === 'number') {
      setInternalIndex(activeIndex % STORY_CARDS.length);
    }
  }, [activeIndex]);

  const index = typeof activeIndex === 'number' ? activeIndex % STORY_CARDS.length : internalIndex;

  const nextCard = () => {
    const nextIdx = (index + 1) % STORY_CARDS.length;
    setInternalIndex(nextIdx);
    onIndexChange?.(nextIdx);
  };

  const current = STORY_CARDS[index];
  const nextItem = STORY_CARDS[(index + 1) % STORY_CARDS.length];
  const thirdItem = STORY_CARDS[(index + 2) % STORY_CARDS.length];

  return (
    <div className="story-deck-container">
      {/* ── Stacked Cards Deck Area (Snug Height & Horizontally Centered) ── */}
      <div className="story-deck-stack">
        {/* 3rd Card (Bottom of Stack) */}
        <div className="story-deck-card story-deck-card--bottom" aria-hidden="true">
          <div className="story-deck-card__header">
            <span className="story-deck-card__tag">{thirdItem.tag}</span>
            <span className="story-deck-card__num">{thirdItem.number} / 03</span>
          </div>
          <h3 className="story-deck-card__title">{thirdItem.title}</h3>
        </div>

        {/* 2nd Card (Middle of Stack - clickable to peek/flip) */}
        <div
          className="story-deck-card story-deck-card--middle"
          aria-hidden="true"
          onClick={nextCard}
          title="Click to peek next card"
        >
          <div className="story-deck-card__header">
            <span className="story-deck-card__tag">{nextItem.tag}</span>
            <span className="story-deck-card__num">{nextItem.number} / 03</span>
          </div>
          <h3 className="story-deck-card__title">{nextItem.title}</h3>
        </div>

        {/* 1st Card (Top / Active Card with Scroll & Flip Transition) */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={current.id}
            className="story-deck-card story-deck-card--active"
            initial={{ y: 24, opacity: 0, scale: 0.94, rotateX: -6 }}
            animate={{ y: 0, opacity: 1, scale: 1, rotateX: 0 }}
            exit={{
              y: -50,
              opacity: 0,
              scale: 0.92,
              rotate: -4,
              transition: { duration: 0.32, ease: [0.32, 0.72, 0, 1] },
            }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            onClick={nextCard}
            title="Click or scroll down to advance card"
          >
            {/* Card Header */}
            <div className="story-deck-card__header">
              <span className="story-deck-card__tag">{current.tag}</span>
              <div className="story-deck-card__badge-cluster">
                <span className="story-deck-card__pill">{current.badge}</span>
                <span className="story-deck-card__step">{current.number} / 03</span>
                <img
                  src={bittenCookie}
                  alt=""
                  className="story-deck-card__cookie-icon"
                  draggable={false}
                />
              </div>
            </div>

            {/* Card Title */}
            <h3 className="story-deck-card__title">{current.title}</h3>

            {/* Card Story Paragraph (No large empty space below!) */}
            <p className="story-deck-card__body">{current.content}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
