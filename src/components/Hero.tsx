import React from 'react';
import { IconArrow, IconPlay } from './Icons';

interface HeroProps {
  onOpenFilm: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenFilm }) => {

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
    </section>
  );
};
