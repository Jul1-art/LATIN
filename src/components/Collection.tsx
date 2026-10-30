import React, { useState, useMemo } from 'react';
import { QUOTES, normalizeText } from '../data/quotes';
import { CategoryFilter } from '../types';
import { IconSearch, IconDiagonal } from './Icons';

interface CollectionProps {
  onOpenQuote: (index: number) => void;
}

export const Collection: React.FC<CollectionProps> = ({ onOpenQuote }) => {
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredQuotes = useMemo(() => {
    const term = normalizeText(searchTerm.trim());
    return QUOTES.filter((quote) => {
      if (activeFilter !== 'all' && quote.category !== activeFilter) {
        return false;
      }
      if (!term) return true;
      const haystack = normalizeText(`${quote.latin} ${quote.translation} ${quote.author}`);
      return haystack.includes(term);
    });
  }, [activeFilter, searchTerm]);

  return (
    <section className="collection wrap" id="citations" aria-labelledby="collection-title">
      <div className="collection-heading">
        <h2 id="collection-title">Les citations.</h2>
        <span className="collection-total" aria-hidden="true">XIII</span>
      </div>

      <div className="collection-tools">
        <div className="filters" role="group" aria-label="Filtrer les citations">
          <button
            type="button"
            className={`filter ${activeFilter === 'all' ? 'is-active' : ''}`}
            onClick={() => setActiveFilter('all')}
            aria-pressed={activeFilter === 'all'}
          >
            Toutes
          </button>
          <button
            type="button"
            className={`filter ${activeFilter === 'life' ? 'is-active' : ''}`}
            onClick={() => setActiveFilter('life')}
            aria-pressed={activeFilter === 'life'}
          >
            Vivre
          </button>
          <button
            type="button"
            className={`filter ${activeFilter === 'courage' ? 'is-active' : ''}`}
            onClick={() => setActiveFilter('courage')}
            aria-pressed={activeFilter === 'courage'}
          >
            Oser
          </button>
          <button
            type="button"
            className={`filter ${activeFilter === 'wisdom' ? 'is-active' : ''}`}
            onClick={() => setActiveFilter('wisdom')}
            aria-pressed={activeFilter === 'wisdom'}
          >
            Penser
          </button>
        </div>

        <label className="search">
          <IconSearch />
          <input
            type="search"
            id="quote-search"
            placeholder="Rechercher"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Rechercher une citation"
          />
        </label>
      </div>

      <ol className="quote-list" id="quote-list" aria-label="Citations latines">
        {filteredQuotes.map((quote) => (
          <li key={quote.id} className="quote-item">
            <button
              type="button"
              className="quote-row"
              onClick={() => onOpenQuote(quote.id)}
            >
              <span className="quote-number" aria-hidden="true">
                {quote.numeral}
              </span>
              <span className="quote-latin">{quote.latin}</span>
              <span className="quote-info">
                <span className="quote-translation">{quote.translation}</span>
              </span>
              <span className="row-arrow" aria-hidden="true">
                <IconDiagonal />
              </span>
            </button>
          </li>
        ))}
      </ol>

      {filteredQuotes.length === 0 && (
        <p className="empty-state" id="empty-state">
          Aucune citation trouvée.
        </p>
      )}

      <p className="sr-only" id="result-count" role="status">
        {filteredQuotes.length} citation{filteredQuotes.length > 1 ? 's' : ''} à découvrir
      </p>
    </section>
  );
};
