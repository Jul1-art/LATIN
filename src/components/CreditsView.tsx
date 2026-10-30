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
    <div className="credits-view" style={{ minHeight: '100vh', background: 'var(--paper)', color: 'var(--ink)' }}>
      <header className="wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: 95, borderBottom: '1px solid var(--line)', gap: 25 }}>
        <button
          type="button"
          onClick={onClose}
          className="brand"
          style={{ fontWeight: 700, fontSize: 23, letterSpacing: '-0.06em', background: 'none', border: 0, cursor: 'pointer', padding: 0 }}
        >
          LATIN<span style={{ color: 'var(--gold-deep)' }}>.</span>
        </button>
        <button
          type="button"
          onClick={onClose}
          className="back text-button"
          style={{ fontSize: 12 }}
        >
          Retour au site <IconArrow />
        </button>
      </header>

      <main className="wrap" style={{ paddingBlock: '80px 60px' }}>
        <h1 style={{ margin: '0 0 24px', fontSize: 'clamp(42px, 6vw, 76px)', fontWeight: 500, letterSpacing: '-0.065em', lineHeight: 1.05 }}>
          Crédits du film.
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 16, lineHeight: 1.8, maxWidth: 640, margin: '0 0 65px' }}>
          Treize citations latines, treize sujets visuels. Un film de 1 min 45 mêlant vidéos de nature, œuvre historique, images spatiales, éruption solaire, time-lapse réel de la Voie lactée et animation du dé existant.
        </p>

        <article style={{ display: 'grid', gridTemplateColumns: '55px minmax(0, 1fr)', gap: 20, paddingBlock: 35, borderTop: '1px solid var(--line)' }}>
          <span style={{ color: 'var(--gold-deep)', font: '15px var(--serif)', paddingTop: 6 }}>I</span>
          <div>
            <h2 style={{ margin: '0 0 13px', fontSize: 27, lineHeight: 1.2, letterSpacing: '-0.035em', fontWeight: 500 }}>La Terre</h2>
            <p style={{ color: 'var(--ink)', fontSize: 13, marginBottom: 8 }}>NASA · Collection officielle NASA-3D-Resources</p>
            <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.8, maxWidth: 760, marginBottom: 12 }}>
              L’image « Earth (B) » présente le globe terrestre sur fond noir. Cette photographie mise en mouvement accompagne uniquement les titres « LATIN. » d’ouverture et de fin.
            </p>
            <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.8, maxWidth: 760 }}>
              Le README officiel de la collection déclare : <strong>« These assets are free and without copyright. »</strong>
            </p>
          </div>
        </article>

        <article style={{ display: 'grid', gridTemplateColumns: '55px minmax(0, 1fr)', gap: 20, paddingBlock: 35, borderTop: '1px solid var(--line)' }}>
          <span style={{ color: 'var(--gold-deep)', font: '15px var(--serif)', paddingTop: 6 }}>II</span>
          <div>
            <h2 style={{ margin: '0 0 13px', fontSize: 27, lineHeight: 1.2, letterSpacing: '-0.035em', fontWeight: 500 }}>L’empreinte d’Apollo</h2>
            <p style={{ color: 'var(--ink)', fontSize: 13, marginBottom: 8 }}>NASA · Collection officielle NASA-3D-Resources</p>
            <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.8, maxWidth: 760 }}>
              La photographie « Moon — Apollo Astronaut Bootprint » montre une empreinte d’astronaute dans le régolithe lunaire. Elle apparaît une seule fois, pour « Veni, vidi, vici. ».
            </p>
          </div>
        </article>

        <article style={{ display: 'grid', gridTemplateColumns: '55px minmax(0, 1fr)', gap: 20, paddingBlock: 35, borderTop: '1px solid var(--line)' }}>
          <span style={{ color: 'var(--gold-deep)', font: '15px var(--serif)', paddingTop: 6 }}>III</span>
          <div>
            <h2 style={{ margin: '0 0 13px', fontSize: 27, lineHeight: 1.2, letterSpacing: '-0.035em', fontWeight: 500 }}>Le rouge-gorge, le blé, les vagues</h2>
            <p style={{ color: 'var(--ink)', fontSize: 13, marginBottom: 8 }}>Robin Bird · Wheat Field · Waves · Domaine public</p>
            <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.8, maxWidth: 760 }}>
              Ces trois vidéos de nature accompagnent respectivement « Ave ! », « Mens sana in corpore sano. » et « Audacibus fortuna juvat. ».
            </p>
          </div>
        </article>

        <article style={{ display: 'grid', gridTemplateColumns: '55px minmax(0, 1fr)', gap: 20, paddingBlock: 35, borderTop: '1px solid var(--line)' }}>
          <span style={{ color: 'var(--gold-deep)', font: '15px var(--serif)', paddingTop: 6 }}>IV</span>
          <div>
            <h2 style={{ margin: '0 0 13px', fontSize: 27, lineHeight: 1.2, letterSpacing: '-0.035em', fontWeight: 500 }}>La fleur et le ruisseau</h2>
            <p style={{ color: 'var(--ink)', fontSize: 13, marginBottom: 8 }}>MDN · interactive-examples · CC0 1.0 Universal</p>
            <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.8, maxWidth: 760 }}>
              La vidéo « flower » accompagne exclusivement « Carpe diem. ». Le ruisseau de « stream-of-water » illustre « Errare humanum est, perseverare diabolicum. ».
            </p>
          </div>
        </article>

        <article style={{ display: 'grid', gridTemplateColumns: '55px minmax(0, 1fr)', gap: 20, paddingBlock: 35, borderTop: '1px solid var(--line)' }}>
          <span style={{ color: 'var(--gold-deep)', font: '15px var(--serif)', paddingTop: 6 }}>V</span>
          <div>
            <h2 style={{ margin: '0 0 13px', fontSize: 27, lineHeight: 1.2, letterSpacing: '-0.035em', fontWeight: 500 }}>Saturne et ses anneaux</h2>
            <p style={{ color: 'var(--ink)', fontSize: 13, marginBottom: 8 }}>NASA / JPL / Space Science Institute · Cassini · Domaine public NASA</p>
            <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.8, maxWidth: 760 }}>
              L’image « Saturn during Equinox » (PIA11141) accompagne « Dura lex, sed lex. ».
            </p>
          </div>
        </article>

        <article style={{ display: 'grid', gridTemplateColumns: '55px minmax(0, 1fr)', gap: 20, paddingBlock: 35, borderTop: '1px solid var(--line)' }}>
          <span style={{ color: 'var(--gold-deep)', font: '15px var(--serif)', paddingTop: 6 }}>VI</span>
          <div>
            <h2 style={{ margin: '0 0 13px', fontSize: 27, lineHeight: 1.2, letterSpacing: '-0.035em', fontWeight: 500 }}>Musique : Adventure</h2>
            <p style={{ color: 'var(--ink)', fontSize: 13, marginBottom: 8 }}>Rafael Krux / CinematicWaves.com · FreePD Music · CC0</p>
            <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.8, maxWidth: 760 }}>
              La partition orchestrale accompagne l’intégralité des 105 secondes du film, avec un fondu d’extension ajusté avec précision.
            </p>
          </div>
        </article>
      </main>

      <footer className="wrap" style={{ paddingBlock: '25px 35px', borderTop: '1px solid var(--line)', fontSize: 11, color: 'var(--muted)', display: 'flex', justifyContent: 'space-between' }}>
        <span>LATIN — Pour la vie</span>
        <button
          type="button"
          onClick={onClose}
          style={{ background: 'none', border: 0, color: 'var(--gold-deep)', cursor: 'pointer', fontSize: 11 }}
        >
          Retour au site ↗
        </button>
      </footer>
    </div>
  );
};
