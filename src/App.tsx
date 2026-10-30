import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Featured } from './components/Featured';
import { Collection } from './components/Collection';
import { Everyday } from './components/Everyday';
import { Footer } from './components/Footer';
import { ReaderModal } from './components/ReaderModal';
import { FilmModal } from './components/FilmModal';
import { CreditsView } from './components/CreditsView';
import { QUOTES } from './data/quotes';

export const App: React.FC = () => {
  const [selectedQuoteIndex, setSelectedQuoteIndex] = useState<number | null>(null);
  const [isFilmOpen, setIsFilmOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'credits'>('home');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleRandomQuote = () => {
    const current = selectedQuoteIndex ?? 0;
    const offset = 1 + Math.floor(Math.random() * (QUOTES.length - 1));
    const nextIndex = (current + offset) % QUOTES.length;
    setSelectedQuoteIndex(nextIndex);
  };

  const handleOpenQuote = (index: number) => {
    setSelectedQuoteIndex(index);
  };

  // Ouvrir la vidéo automatiquement au chargement
  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem('hasSeenIntro');
    if (!hasSeenIntro) {
      setIsFilmOpen(true);
      sessionStorage.setItem('hasSeenIntro', 'true');
    }
  }, []);

  const handleViewChange = (newView: 'home' | 'credits') => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentView(newView);
      setIsTransitioning(false);
    }, 400);
  };

  if (currentView === 'credits') {
    return (
      <div className={isTransitioning ? 'view-transition-out' : 'view-transition-in'}>
        <CreditsView onClose={() => handleViewChange('home')} />
      </div>
    );
  }

  return (
    <>
      <div className={isTransitioning ? 'view-transition-out' : 'view-transition-in'}>
        <a className="skip-link" href="#citations">
          Aller aux citations
        </a>

        <Header
          onOpenFilm={() => setIsFilmOpen(true)}
          onRandomQuote={handleRandomQuote}
        />

        <main>
          <Hero onOpenFilm={() => setIsFilmOpen(true)} />
          <Featured onOpenQuote={handleOpenQuote} />
          <Collection onOpenQuote={handleOpenQuote} />
          <Everyday onOpenQuote={handleOpenQuote} />
        </main>

        <Footer
          onOpenFilm={() => setIsFilmOpen(true)}
          onOpenCredits={() => handleViewChange('credits')}
        />
      </div>

      {/* Modals are outside the transition wrapper so they work normally */}
      <ReaderModal
        isOpen={selectedQuoteIndex !== null}
        quoteIndex={selectedQuoteIndex ?? 0}
        onClose={() => setSelectedQuoteIndex(null)}
        onSelectQuote={setSelectedQuoteIndex}
      />

      <FilmModal
        isOpen={isFilmOpen}
        onClose={() => setIsFilmOpen(false)}
        onOpenCredits={() => {
          setIsFilmOpen(false);
          handleViewChange('credits');
        }}
      />
    </>
  );
};

export default App;
