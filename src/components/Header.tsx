import React from 'react';
import { IconLogoMark, IconDiagonal } from './Icons';

interface HeaderProps {
  onOpenFilm: () => void;
  onRandomQuote: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenFilm, onRandomQuote }) => {
  return (
    <header className="site-header wrap" id="accueil">
      <a className="wordmark header-wordmark" href="#accueil" aria-label="LATIN, accueil">
        <IconLogoMark className="logo-mark" />
        <span className="brand-letters">LATIN</span>
        <span className="brand-period">.</span>
      </a>
      <nav className="main-nav" aria-label="Navigation principale">
        <a href="#accueil" className="nav-link">Découvrir</a>
        <a href="#citations" className="nav-link">
          Les citations <span className="nav-count">13</span>
        </a>
        <a href="#au-quotidien" className="nav-link">Au quotidien</a>
      </nav>
      <div className="header-actions">
        <button
          type="button"
          className="header-random header-btn-random"
          onClick={onRandomQuote}
        >
          Au hasard <IconDiagonal className="icon" />
        </button>
      </div>
    </header>
  );
};
