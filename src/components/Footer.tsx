import React, { useState } from 'react';
import { IconPlay, IconArrow } from './Icons';

interface FooterProps {
  onOpenFilm: () => void;
  onOpenCredits: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenFilm,
  onOpenCredits,
}) => {
  const letters = ['L', 'A', 'T', 'I', 'N'];
  const [bouncingIndices, setBouncingIndices] = useState<number[]>([]);

  const handleLetterHover = (index: number) => {
    if (bouncingIndices.includes(index)) return;
    setBouncingIndices((prev) => [...prev, index]);
    setTimeout(() => {
      setBouncingIndices((prev) => prev.filter((i) => i !== index));
    }, 900);
  };

  const handleWordHover = () => {
    letters.forEach((_, idx) => {
      setTimeout(() => {
        handleLetterHover(idx);
      }, idx * 80);
    });
  };

  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-top">
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <button
              type="button"
              className="text-button"
              onClick={onOpenFilm}
            >
              Revoir le film <IconPlay className="icon" />
            </button>
            <button
              type="button"
              className="film-credits-link"
              onClick={onOpenCredits}
            >
              Crédits du film
            </button>
          </div>
          <a className="back-top" href="#accueil">
            Tout en haut <IconArrow />
          </a>
        </div>

        <div
          className="footer-word"
          id="footer-word"
          role="img"
          aria-label="LATIN"
          onMouseEnter={handleWordHover}
        >
          <span className="footer-word-base" aria-hidden="true">
            {letters.map((char, index) => {
              const isBouncing = bouncingIndices.includes(index);
              return (
                <span
                  key={index}
                  className={`footer-letter ${isBouncing ? 'is-bouncing' : ''}`}
                  data-position={index}
                  onMouseEnter={(e) => {
                    e.stopPropagation();
                    handleLetterHover(index);
                  }}
                  onClick={() => handleLetterHover(index)}
                  title="Faire rebondir"
                >
                  <span className="footer-glyph">{char}</span>
                </span>
              );
            })}
          </span>
        </div>
      </div>
    </footer>
  );
};
