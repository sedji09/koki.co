import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

export interface LightboxItem {
  src: string;
  original?: string;
  alt: string;
  caption?: string;
  width: number;
  height: number;
  polaroid?: boolean;
  polaroidNum?: string;
  author?: string;
}

const Ctx = createContext<(item: LightboxItem) => void>(() => {});
const ActiveItemCtx = createContext<LightboxItem | null>(null);

export const useLightbox = () => useContext(Ctx);
export const useActiveLightboxItem = () => useContext(ActiveItemCtx);

export function LightboxProvider({ children }: { children: ReactNode }) {
  const [item, setItem] = useState<LightboxItem | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const open = useCallback((next: LightboxItem) => {
    returnFocus.current = document.activeElement as HTMLElement | null;
    setItem(next);
  }, []);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (item && !d.open) {
      d.show();
      document.documentElement.classList.add('no-scroll');
    }
  }, [item]);

  useEffect(() => {
    if (!item) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dialogRef.current?.close();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [item]);

  const close = () => dialogRef.current?.close();

  return (
    <Ctx.Provider value={open}>
      <ActiveItemCtx.Provider value={item}>
        {children}
        <dialog
          ref={dialogRef}
          className="lightbox"
          aria-label={item ? `Full view: ${item.caption ?? item.alt}` : 'Image viewer'}
          onClose={() => {
            setItem(null);
            document.documentElement.classList.remove('no-scroll');
            returnFocus.current?.focus();
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          {item && (
            <figure className={`lightbox__figure${item.polaroid ? ' lightbox__figure--polaroid' : ''}`}>
              {item.polaroid ? (
                <div className="lightbox__polaroid-wrap">
                  {/* Unclipped Polaroid Card (no clothespin in zoomed view) */}
                  <div className="lightbox__polaroid-card">
                    <div className="lightbox__polaroid-photo">
                      <img src={item.src} alt={item.alt} width={item.width} height={item.height} />
                    </div>
                    <figcaption className="lightbox__polaroid-chin">
                      <div className="lightbox__polaroid-meta">
                        {item.polaroidNum && <span className="lightbox__polaroid-num">{item.polaroidNum}</span>}
                        {item.caption && <span className="lightbox__polaroid-caption">{item.caption}</span>}
                      </div>
                      <span className="lightbox__polaroid-tag">
                        {item.author ? `By ${item.author}` : 'kOKi.co Archive'}
                      </span>
                    </figcaption>
                  </div>
                </div>
              ) : (
                <>
                  <img src={item.src} alt={item.alt} width={item.width} height={item.height} />
                  {item.caption && <figcaption>{item.caption}</figcaption>}
                </>
              )}

              <div className="lightbox__bar">
                {item.original && (
                  <a className="btn btn--ghost-light" href={item.original} target="_blank" rel="noopener">
                    Open original file
                  </a>
                )}
                <button type="button" className="btn btn--light" onClick={close} autoFocus>
                  Close <span aria-hidden="true">✕</span>
                </button>
              </div>
            </figure>
          )}
        </dialog>
      </ActiveItemCtx.Provider>
    </Ctx.Provider>
  );
}
