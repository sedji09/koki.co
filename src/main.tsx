import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/bricolage-grotesque';
import '@fontsource-variable/dm-sans';
import '@fontsource/fredoka/500.css';
import '@fontsource/fredoka/600.css';
import '@fontsource/fredoka/700.css';
import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';
import App from './App';
import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/bands.css';
import './styles/loader.css';
import './styles/opening.css';
import './styles/concept-slide.css';
import './styles/clean.css';
import './styles/motion.css';
import './styles/products.css';
import './styles/services.css';
import './styles/chapter-head.css';
import './styles/post-chapter.css';
import './styles/poster-chapter.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
