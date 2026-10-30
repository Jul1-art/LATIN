import React, { useEffect, useRef, useState } from 'react';
import { IconDiagonal } from './Icons';

interface FeaturedProps {
  onOpenQuote: (index: number) => void;
}

export const Featured: React.FC<FeaturedProps> = ({ onOpenQuote }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [fillPercent, setFillPercent] = useState(100);
  const [shiftY, setShiftY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const height = window.innerHeight;
      const progress = Math.max(0, Math.min(1, (height - rect.top) / ((height + rect.height) / 2)));
      setFillPercent(progress * 100);
      setShiftY(12 - progress * 24);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const renderBouncyChars = (text: string) => {
    return text.split('').map((char, i) => (
      <span
        key={i}
        className={`featured-bouncy-char ${char === ' ' ? 'is-space' : ''}`}
      >
        {char === ' ' ? '\u00A0' : char}
      </span>
    ));
  };

  return (
    <section ref={sectionRef} className="featured" aria-labelledby="featured-quote">
      <div className="featured-inner wrap">
        <blockquote>
          <div
            className="featured-type featured-interactive"
            style={{ transform: `translate3d(0, ${shiftY.toFixed(2)}px, 0)` }}
            title="Carpe diem — Cueille le jour"
          >
            <p id="featured-quote">{renderBouncyChars('Carpe diem.')}</p>
            <span
              className="featured-fill"
              aria-hidden="true"
              style={{
                clipPath: `inset(0 calc(100% - ${fillPercent.toFixed(2)}%) 0 0)`,
              }}
            >
              {renderBouncyChars('Carpe diem.')}
            </span>
          </div>
          <footer>Cueille le jour.</footer>
        </blockquote>
        <div className="featured-bottom">
          <span>Horace, 23 av. J.-C.</span>
          <button
            type="button"
            className="text-button featured-btn-read"
            onClick={() => onOpenQuote(3)}
          >
            Lire <IconDiagonal className="icon read-icon" />
          </button>
        </div>
      </div>
    </section>
  );
};
