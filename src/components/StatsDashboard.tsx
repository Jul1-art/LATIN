import React, { useEffect, useState } from 'react';
import { IconArrow } from './Icons';

interface StatsDashboardProps {
  onClose: () => void;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ onClose }) => {
  const [visitorCount, setVisitorCount] = useState<number>(1428);

  useEffect(() => {
    const saved = localStorage.getItem('latin_visitor_count');
    let count = saved ? parseInt(saved, 10) : 1428;
    if (isNaN(count)) count = 1428;
    // increment for session
    if (!sessionStorage.getItem('latin_visited')) {
      count += 1;
      localStorage.setItem('latin_visitor_count', count.toString());
      sessionStorage.setItem('latin_visited', 'true');
    }
    setVisitorCount(count);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 998,
        background: '#121414',
        color: '#e2e2e2',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: 'var(--sans)',
      }}
    >
      {/* Background Ambient Glow */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(181,154,69,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Topbar */}
      <header
        style={{
          height: 56,
          background: 'rgba(22, 20, 12, 0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(181,154,69,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingInline: 24,
          position: 'relative',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span
            style={{
              fontFamily: 'var(--serif)',
              letterSpacing: '0.2em',
              fontWeight: 700,
              fontSize: 14,
              color: '#dedbd4',
            }}
          >
            LATIN
          </span>
          <span style={{ color: 'rgba(181,154,69,0.6)', fontSize: 10, letterSpacing: '0.15em' }}>
            — Dashboard
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'none',
            border: 0,
            color: '#a3a797',
            cursor: 'pointer',
            fontSize: 11,
          }}
        >
          <span style={{ transform: 'rotate(180deg)', display: 'inline-block' }}>
            <IconArrow />
          </span>
          Retour au site
        </button>
      </header>

      {/* Main card */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div
          style={{
            position: 'relative',
            borderRadius: '2rem',
            border: '1px solid rgba(181,154,69,0.25)',
            background: 'rgba(22, 20, 12, 0.85)',
            backdropFilter: 'blur(20px)',
            padding: '60px 48px',
            maxWidth: 640,
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          }}
        >
          {/* Corner accents */}
          <div style={{ position: 'absolute', top: 24, left: 24, width: 32, height: 1, background: 'rgba(181,154,69,0.4)' }} />
          <div style={{ position: 'absolute', top: 24, left: 24, width: 1, height: 32, background: 'rgba(181,154,69,0.4)' }} />
          <div style={{ position: 'absolute', bottom: 24, right: 24, width: 32, height: 1, background: 'rgba(181,154,69,0.4)' }} />
          <div style={{ position: 'absolute', bottom: 24, right: 24, width: 1, height: 32, background: 'rgba(181,154,69,0.4)' }} />

          {/* Watermark */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '18rem',
              fontFamily: 'var(--serif)',
              color: '#b59a45',
              opacity: 0.03,
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          >
            V
          </div>

          <span
            style={{
              display: 'inline-block',
              color: 'rgba(181,154,69,0.7)',
              letterSpacing: '0.5em',
              fontSize: 11,
              textTransform: 'uppercase',
              marginBottom: 36,
              borderBottom: '1px solid rgba(181,154,69,0.2)',
              paddingBottom: 8,
              position: 'relative',
              zIndex: 1,
            }}
          >
            Statistiques Globales
          </span>

          <h2
            style={{
              fontFamily: 'var(--serif)',
              fontSize: 'clamp(54px, 10vw, 96px)',
              color: '#d4af37',
              letterSpacing: '0.08em',
              lineHeight: 1,
              margin: '0 0 24px',
              textShadow: '0 0 35px rgba(212,175,55,0.25)',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {visitorCount.toLocaleString('fr-FR')}
          </h2>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              width: 160,
              margin: '24px auto',
              opacity: 0.7,
              position: 'relative',
              zIndex: 1,
            }}
          >
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, transparent, #b59a45)' }} />
            <div style={{ width: 6, height: 6, transform: 'rotate(45deg)', background: '#b59a45' }} />
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left, transparent, #b59a45)' }} />
          </div>

          <p
            style={{
              fontFamily: 'var(--serif)',
              fontStyle: 'italic',
              fontSize: 18,
              color: '#b5c6c7',
              position: 'relative',
              zIndex: 1,
              margin: 0,
            }}
          >
            « <span style={{ color: 'rgba(181,154,69,0.9)' }}>Visiteurs uniques enregistrés</span> »
          </p>
        </div>
      </main>
    </div>
  );
};
