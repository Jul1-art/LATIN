import React, { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Featured } from './components/Featured';
import { Collection } from './components/Collection';
import { Everyday } from './components/Everyday';
import { Footer } from './components/Footer';
import { ReaderModal } from './components/ReaderModal';
import { FilmModal } from './components/FilmModal';
import { CreditsView } from './components/CreditsView';
import { StatsDashboard } from './components/StatsDashboard';
import { QUOTES } from './data/quotes';

export const App: React.FC = () => {
  const [selectedQuoteIndex, setSelectedQuoteIndex] = useState<number | null>(null);
  const [isFilmOpen, setIsFilmOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'credits' | 'dashboard'>('home');

  const handleRandomQuote = () => {
    const current = selectedQuoteIndex ?? 0;
    const offset = 1 + Math.floor(Math.random() * (QUOTES.length - 1));
    const nextIndex = (current + offset) % QUOTES.length;
    setSelectedQuoteIndex(nextIndex);
  };

  const handleOpenQuote = (index: number) => {
    setSelectedQuoteIndex(index);
  };

  if (currentView === 'credits') {
    return <CreditsView onClose={() => setCurrentView('home')} />;
  }

  return (
    <>
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
        onOpenCredits={() => setCurrentView('credits')}
        onOpenDashboard={() => setCurrentView('dashboard')}
      />

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
          setCurrentView('credits');
        }}
      />

      {currentView === 'dashboard' && (
        <StatsDashboard onClose={() => setCurrentView('home')} />
      )}
    </>
  );
};

export default App;
