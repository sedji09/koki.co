import React, { useEffect, useRef, useState } from 'react';

export interface ElasticLetteringProps {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div' | 'span';
  className?: string;
  style?: React.CSSProperties;
  stiffness?: number; // Spring tension stiffness (e.g. 260)
  damping?: number;   // Oscillation damping (e.g. 15)
  mass?: number;      // Letter mass (e.g. 1)
  coupling?: number;  // Neighbor elastic string coupling (e.g. 120)
  maxStretch?: number; // Max stretch limit in px (e.g. 180)
  tensionColor?: string; // Color when stretched (e.g. '#F48A17')
  id?: string;
}

interface LetterState {
  char: string;
  isSpace: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  tension: number;
}

export function ElasticLettering({
  text,
  as: Tag = 'h2',
  className = '',
  style = {},
  stiffness = 260,
  damping = 14,
  mass = 1,
  coupling = 110,
  maxStretch = 180,
  tensionColor = '#F48A17',
  id,
}: ElasticLetteringProps) {
  const containerRef = useRef<HTMLElement>(null);
  const spansRef = useRef<(HTMLSpanElement | null)[]>([]);
  const isDraggingRef = useRef(false);
  const pointerStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastPointerRef = useRef<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: 0 });
  const dragVelocityRef = useRef<{ vx: number; vy: number }>({ vx: 0, vy: 0 });
  const [isGrabbing, setIsGrabbing] = useState(false);

  // Initialize letters
  const lettersRef = useRef<LetterState[]>([]);
  if (lettersRef.current.length !== text.length) {
    lettersRef.current = text.split('').map((char) => ({
      char,
      isSpace: char === ' ',
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      tension: 0,
    }));
  }

  useEffect(() => {
    let animId = 0;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      animId = requestAnimationFrame(loop);
      const dt = Math.min((currentTime - lastTime) / 1000, 0.032);
      lastTime = currentTime;

      const letters = lettersRef.current;
      const n = letters.length;
      if (n === 0) return;

      // Spring physics simulation when not dragging
      if (!isDraggingRef.current) {
        for (let i = 0; i < n; i++) {
          const l = letters[i];
          if (l.isSpace) continue;

          // Restoring spring force (Hooke's Law with damping)
          const fx = -stiffness * l.x - damping * l.vx;
          const fy = -stiffness * l.y - damping * l.vy;

          // Wave propagation to neighbor letters
          let neighborCouplingY = 0;
          if (i > 0) neighborCouplingY += coupling * (letters[i - 1].y - l.y);
          if (i < n - 1) neighborCouplingY += coupling * (letters[i + 1].y - l.y);

          const ax = fx / mass;
          const ay = (fy + neighborCouplingY) / mass;

          l.vx += ax * dt;
          l.vy += ay * dt;
          l.x += l.vx * dt;
          l.y += l.vy * dt;

          // Dynamic tilt along the curved string
          const prevY = i > 0 ? letters[i - 1].y : 0;
          const nextY = i < n - 1 ? letters[i + 1].y : 0;
          const targetRot = Math.max(-35, Math.min(35, (nextY - prevY) * 0.55));
          l.rotation += (targetRot - l.rotation) * 0.25;

          // Dynamic squash and stretch
          const speed = Math.hypot(l.vx, l.vy);
          const stretch = Math.min(0.24, speed * 0.0003 + Math.abs(l.y) * 0.0018);
          l.scaleY = 1 + stretch;
          l.scaleX = 1 - stretch * 0.45;

          // Tension color ratio
          l.tension = Math.max(0, Math.min(1, Math.hypot(l.x, l.y) / (maxStretch * 0.75)));

          // Sleep check
          if (
            Math.abs(l.x) < 0.08 &&
            Math.abs(l.y) < 0.08 &&
            Math.abs(l.vx) < 0.3 &&
            Math.abs(l.vy) < 0.3
          ) {
            l.x = 0;
            l.y = 0;
            l.vx = 0;
            l.vy = 0;
            l.rotation = 0;
            l.scaleX = 1;
            l.scaleY = 1;
            l.tension = 0;
          }
        }
      }

      // Update DOM
      for (let i = 0; i < n; i++) {
        const span = spansRef.current[i];
        if (!span) continue;
        const l = letters[i];
        if (l.isSpace) continue;

        span.style.transform = `translate3d(${l.x.toFixed(2)}px, ${l.y.toFixed(2)}px, 0) rotate(${l.rotation.toFixed(2)}deg) scale(${l.scaleX.toFixed(3)}, ${l.scaleY.toFixed(3)})`;
        if (l.tension > 0.015) {
          span.style.color = `color-mix(in srgb, ${tensionColor} ${(l.tension * 100).toFixed(0)}%, currentColor)`;
        } else {
          span.style.color = '';
        }
      }
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [stiffness, damping, mass, coupling, maxStretch, tensionColor]);

  // Drag interaction
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    isDraggingRef.current = true;
    setIsGrabbing(true);

    containerRef.current.setPointerCapture?.(e.pointerId);

    const clientX = e.clientX;
    const clientY = e.clientY;

    pointerStartRef.current = { x: clientX, y: clientY };
    lastPointerRef.current = { x: clientX, y: clientY, time: performance.now() };
    dragVelocityRef.current = { vx: 0, vy: 0 };

    updateDragDisplacement(clientX, clientY, rect);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const now = performance.now();
    const dt = Math.max((now - lastPointerRef.current.time) / 1000, 0.001);

    dragVelocityRef.current = {
      vx: (e.clientX - lastPointerRef.current.x) / dt,
      vy: (e.clientY - lastPointerRef.current.y) / dt,
    };

    lastPointerRef.current = { x: e.clientX, y: e.clientY, time: now };
    updateDragDisplacement(e.clientX, e.clientY, rect);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsGrabbing(false);

    try {
      containerRef.current?.releasePointerCapture?.(e.pointerId);
    } catch {}

    // Fling kick
    const n = lettersRef.current.length;
    const flingBoostY = Math.max(-1200, Math.min(1200, dragVelocityRef.current.vy * 0.45));
    const flingBoostX = Math.max(-800, Math.min(800, dragVelocityRef.current.vx * 0.35));

    for (let i = 0; i < n; i++) {
      const l = lettersRef.current[i];
      if (l.isSpace) continue;
      const ratio = Math.abs(l.y) / (maxStretch || 1);
      l.vy += -l.y * 11 + flingBoostY * ratio;
      l.vx += -l.x * 7 + flingBoostX * ratio;
    }
  };

  const updateDragDisplacement = (clientX: number, clientY: number, rect: DOMRect) => {
    const rawDy = clientY - (rect.top + rect.height / 2);
    const rawDx = clientX - (rect.left + rect.width / 2);

    const distY =
      Math.sign(rawDy) *
      Math.min(Math.abs(rawDy), maxStretch) *
      Math.pow(Math.min(1, Math.abs(rawDy) / maxStretch), 0.82);
    const distX = Math.sign(rawDx) * Math.min(Math.abs(rawDx), maxStretch * 0.35);

    const relativeX = (clientX - rect.left) / Math.max(rect.width, 1);
    const letters = lettersRef.current;
    const n = letters.length;

    for (let i = 0; i < n; i++) {
      const l = letters[i];
      if (l.isSpace) continue;

      const t = (i + 0.5) / n;
      const stringEnvelope = Math.sin(Math.PI * t);
      const distToPluck = Math.abs(t - relativeX);
      const pluckProximity = Math.exp(-Math.pow(distToPluck / 0.3, 2));

      const letterDy = distY * (0.32 * stringEnvelope + 0.68 * pluckProximity * stringEnvelope);
      const letterDx = distX * 0.35 * stringEnvelope;

      l.y = letterDy;
      l.x = letterDx;
      l.vx = 0;
      l.vy = 0;

      const prevY = i > 0 ? letters[i - 1].y : 0;
      const nextY = i < n - 1 ? letters[i + 1].y : 0;
      l.rotation = Math.max(-42, Math.min(42, (nextY - prevY) * 0.72));

      const stretch = Math.min(0.28, (Math.abs(letterDy) / maxStretch) * 0.32);
      l.scaleY = 1 + stretch;
      l.scaleX = 1 - stretch * 0.45;
      l.tension = Math.min(1, Math.abs(letterDy) / (maxStretch * 0.75));
    }
  };

  // Group letters into words so whole words wrap naturally without breaking mid-word
  const words = text.split(' ');
  let letterIndexCounter = 0;

  return (
    <Tag
      ref={containerRef as any}
      id={id}
      className={`elastic-lettering ${isGrabbing ? 'elastic-grabbing' : ''} ${className}`}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        width: '100%',
        position: 'relative',
        cursor: isGrabbing ? 'grabbing' : 'grab',
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        ...style,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      aria-label={text}
      title="Grab and stretch the elastic text!"
    >
      {/* Screen-reader accessible label */}
      <span
        className="sr-only"
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: 'hidden',
          clip: 'rect(0,0,0,0)',
          border: 0,
        }}
      >
        {text}
      </span>

      {/* Visual interactive words & letters */}
      {words.map((word, wordIdx) => {
        const wordChars = word.split('');
        const startIndex = letterIndexCounter;
        letterIndexCounter += wordChars.length + 1; // +1 for space

        return (
          <span
            key={`word-${wordIdx}`}
            style={{
              display: 'inline-flex',
              whiteSpace: 'nowrap',
              marginRight: wordIdx < words.length - 1 ? '0.28em' : 0,
            }}
          >
            {wordChars.map((char, charIdx) => {
              const globalIndex = startIndex + charIdx;
              return (
                <span
                  key={`char-${globalIndex}`}
                  ref={(el) => {
                    spansRef.current[globalIndex] = el;
                  }}
                  aria-hidden="true"
                  style={{
                    display: 'inline-block',
                    transformOrigin: 'center center',
                    willChange: 'transform, color',
                    pointerEvents: 'none',
                  }}
                >
                  {char}
                </span>
              );
            })}
          </span>
        );
      })}
    </Tag>
  );
}
