import React, { useEffect, useRef, useState } from 'react';
import { IconArrow, IconPlay } from './Icons';

interface HeroProps {
  onOpenFilm: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenFilm }) => {
  const portraitRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => {
      if (!portraitRef.current) return;
      const rect = portraitRef.current.getBoundingClientRect();
      const height = window.innerHeight;
      const progress = Math.max(-1, Math.min(1, (height / 2 - rect.top - rect.height / 2) / ((height + rect.height) / 2)));
      const travel = Math.min(25, rect.height * 0.018);
      setTilt((prev) => ({ ...prev, y: progress * travel }));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch' || !portraitRef.current) return;
    const rect = portraitRef.current.getBoundingClientRect();
    const rx = Math.max(-2, Math.min(2, (-(e.clientY - rect.top - rect.height / 2) / rect.height) * 3.5));
    const ry = Math.max(-2, Math.min(2, ((e.clientX - rect.left - rect.width / 2) / rect.width) * 3.5));
    setTilt((prev) => ({ ...prev, rx, ry }));
  };

  const handlePointerLeave = () => {
    setTilt((prev) => ({ ...prev, rx: 0, ry: 0 }));
  };

  const renderBouncyText = (text: string) => {
    return text.split('').map((char, idx) => (
      <span
        key={idx}
        className={`hero-bouncy-char ${char === ' ' ? 'is-space' : ''}`}
        data-char={char}
      >
        {char === ' ' ? '\u00A0' : char}
      </span>
    ));
  };

  return (
    <section className="hero wrap" aria-labelledby="hero-title">
      <div className="hero-copy">
        <h1 id="hero-title">
          <span className="hero-line">
            <span className="hero-line-inner hero-interactive-title">
              {renderBouncyText('Le latin.')}
            </span>
          </span>
          <span className="hero-line hero-line-accent">
            <span className="hero-line-inner hero-interactive-title">
              {renderBouncyText('Pour la vie.')}
            </span>
          </span>
        </h1>
        <p className="hero-description">Deux mille ans. Toujours vivant.</p>
        <div className="hero-actions">
          <a className="button button-dark hero-btn-explore" href="#citations">
            <span>Explorer les citations</span>
            <IconArrow className="icon hero-arrow-icon" />
          </a>
          <button
            type="button"
            className="hero-film-button hero-btn-film"
            onClick={onOpenFilm}
          >
            <span className="film-play-badge">
              <IconPlay className="icon" />
            </span>
            <span>Voir le film</span>
            <span className="film-duration">01:45</span>
          </button>
        </div>
        <a className="everyday-jump" href="#au-quotidien">
          Et dans la vie d’aujourd’hui ? <IconArrow />
        </a>
      </div>
      <figure className="hero-visual">
        <div
          ref={portraitRef}
          className="portrait-frame hero-portrait-glow"
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
        >
          <div
            className="portrait-parallax"
            style={{
              transform: `translate3d(0, ${tilt.y.toFixed(2)}px, 0) rotateX(${tilt.rx.toFixed(3)}deg) rotateY(${tilt.ry.toFixed(3)}deg)`,
            }}
          >
            <img
              src="/assets/roman-portrait.webp"
              alt="Portrait sculptural d’un jeune Romain en marbre clair"
              width="1122"
              height="1402"
              loading="eager"
            />
          </div>
        </div>
      </figure>
    </section>
  );
};
