import React, { useEffect } from 'react';
import { IconArrow } from './Icons';

interface CreditsViewProps {
  onClose: () => void;
}

export const CreditsView: React.FC<CreditsViewProps> = ({ onClose }) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="credits-view">
      <header className="credits-header wrap">
        <button
          type="button"
          onClick={onClose}
          className="credits-brand"
        >
          LATIN<span className="brand-period">.</span>
        </button>
        <button
          type="button"
          onClick={onClose}
          className="credits-close-btn back text-button"
        >
          Retour au site <IconArrow />
        </button>
      </header>

      <main className="credits-main wrap">
        <h1 className="credits-title">
          Crédits du film.
        </h1>
        <p className="credits-intro">
          Treize citations latines, treize sujets visuels. Un film de 1 min 45 mêlant vidéos de nature, œuvre historique, images spatiales, éruption solaire, time-lapse réel de la Voie lactée et animation du dé existant.
        </p>

        <article className="credits-article">
          <span className="credits-index">I</span>
          <div className="credits-article-content">
            <h2>La Terre</h2>
            <p className="credits-article-source">NASA · Collection officielle NASA-3D-Resources</p>
            <p className="credits-article-description">
              L’image « Earth (B) » présente le globe terrestre sur fond noir. Cette photographie mise en mouvement accompagne uniquement les titres « LATIN. » d’ouverture et de fin.
            </p>
            <p className="credits-article-description">
              Le README officiel de la collection déclare : <strong>« These assets are free and without copyright. »</strong>
            </p>
          </div>
        </article>

        <article className="credits-article">
          <span className="credits-index">II</span>
          <div className="credits-article-content">
            <h2>L’empreinte d’Apollo</h2>
            <p className="credits-article-source">NASA · Collection officielle NASA-3D-Resources</p>
            <p className="credits-article-description">
              La photographie « Moon — Apollo Astronaut Bootprint » montre une empreinte d’astronaute dans le régolithe lunaire. Elle apparaît une seule fois, pour « Veni, vidi, vici. ».
            </p>
          </div>
        </article>

        <article className="credits-article">
          <span className="credits-index">III</span>
          <div className="credits-article-content">
            <h2>Le rouge-gorge, le blé, les vagues</h2>
            <p className="credits-article-source">Robin Bird · Wheat Field · Waves · Domaine public</p>
            <p className="credits-article-description">
              Ces trois vidéos de nature accompagnent respectivement « Ave ! », « Mens sana in corpore sano. » et « Audacibus fortuna juvat. ».
            </p>
          </div>
        </article>

        <article className="credits-article">
          <span className="credits-index">IV</span>
          <div className="credits-article-content">
            <h2>La fleur et le ruisseau</h2>
            <p className="credits-article-source">MDN · interactive-examples · CC0 1.0 Universal</p>
            <p className="credits-article-description">
              La vidéo « flower » accompagne exclusivement « Carpe diem. ». Le ruisseau de « stream-of-water » illustre « Errare humanum est, perseverare diabolicum. ».
            </p>
          </div>
        </article>

        <article className="credits-article">
          <span className="credits-index">V</span>
          <div className="credits-article-content">
            <h2>Saturne et ses anneaux</h2>
            <p className="credits-article-source">NASA / JPL / Space Science Institute · Cassini · Domaine public NASA</p>
            <p className="credits-article-description">
              L’image « Saturn during Equinox » (PIA11141) accompagne « Dura lex, sed lex. ».
            </p>
          </div>
        </article>

        <article className="credits-article">
          <span className="credits-index">VI</span>
          <div className="credits-article-content">
            <h2>Musique : Adventure</h2>
            <p className="credits-article-source">Rafael Krux / CinematicWaves.com · FreePD Music · CC0</p>
            <p className="credits-article-description">
              La partition orchestrale accompagne l’intégralité des 105 secondes du film, avec un fondu d’extension ajusté avec précision.
            </p>
          </div>
        </article>
      </main>

      <footer className="credits-footer wrap">
        <span>LATIN — Pour la vie</span>
        <button
          type="button"
          onClick={onClose}
          className="credits-back-link"
        >
          Retour au site ↗
        </button>
      </footer>
    </div>
  );
};
