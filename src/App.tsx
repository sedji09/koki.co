import { useEffect } from 'react';
import { MotionConfig } from 'motion/react';
import { Concept } from './components/Concept';
import { CookieCursor } from './components/CookieCursor';
import { Footer } from './components/Footer';
import { LightboxProvider } from './components/Lightbox';
import { LogoChapter } from './components/LogoChapter';
import { Nav } from './components/Nav';
import { Opening } from './components/Opening';
import { PostChapter } from './components/PostChapter';
import { PosterChapter } from './components/PosterChapter';
import { IntroProvider } from './components/Preloader';

export default function App() {
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    const onBeforeUnload = () => {
      window.scrollTo(0, 0);
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <IntroProvider>
      <LightboxProvider>
        <CookieCursor />
        <a className="skip-link" href="#main">Skip to content</a>
        <div id="top" />
        <Nav />
        <main id="main" tabIndex={-1}>
          <Opening />
          <Concept />
          <LogoChapter />
          <PostChapter />
          <PosterChapter />
        </main>
        <Footer />
      </LightboxProvider>
      </IntroProvider>
    </MotionConfig>
  );
}
