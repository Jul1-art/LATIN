import React, { useEffect, useState, useCallback } from 'react';
import { QUOTES } from '../data/quotes';
import { IconClose, IconCopy, IconArrow } from './Icons';

interface ReaderModalProps {
  quoteIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onSelectQuote: (index: number) => void;
}

export const ReaderModal: React.FC<ReaderModalProps> = ({
  quoteIndex,
  isOpen,
  onClose,
  onSelectQuote,
}) => {
  const [copyStatus, setCopyStatus] = useState('');

  const quote = QUOTES[quoteIndex] || QUOTES[0];
  const total = QUOTES.length;

  const handlePrev = useCallback(() => {
    onSelectQuote((quoteIndex - 1 + total) % total);
    setCopyStatus('');
  }, [quoteIndex, total, onSelectQuote]);

  const handleNext = useCallback(() => {
    onSelectQuote((quoteIndex + 1) % total);
    setCopyStatus('');
  }, [quoteIndex, total, onSelectQuote]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.classList.add('reader-open');

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('reader-open');
    };
  }, [isOpen, onClose, handlePrev, handleNext]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        `${quote.latin}\n${quote.translation}\n— ${quote.author}`
      );
      setCopyStatus('Citation copiée.');
    } catch {
      setCopyStatus('La copie est indisponible. Vous pouvez sélectionner le texte.');
    }
  };

  if (!isOpen) return null;

  const positionText = `${String(quoteIndex + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;

  return (
    <div
      className="reader-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reader-latin"
      aria-describedby="reader-translation"
    >
      <div className="reader-top">
        <span className="wordmark">
          LATIN<span className="brand-period">.</span>
        </span>
        <button
          type="button"
          className="reader-close"
          onClick={onClose}
          aria-label="Fermer la lecture"
        >
          Fermer <IconClose />
        </button>
      </div>

      <div className="reader-content">
        <h2 id="reader-latin">{quote.latin}</h2>
        <p id="reader-translation">{quote.translation}</p>
        <p className="reader-author" id="reader-author">{quote.author}</p>

        <button
          type="button"
          className="copy-button"
          id="copy-quote"
          onClick={handleCopy}
        >
          <IconCopy /> Copier
        </button>
        <p className="copy-status" id="copy-status" role="status">
          {copyStatus}
        </p>
      </div>

      <div className="reader-bottom">
        <button
          type="button"
          className="reader-prev"
          id="previous-quote"
          onClick={handlePrev}
          aria-label="Citation précédente"
        >
          <IconArrow />
          <span>Précédente</span>
        </button>
        <span id="reader-position">{positionText}</span>
        <button
          type="button"
          id="next-quote"
          onClick={handleNext}
          aria-label="Citation suivante"
        >
          <span>Suivante</span>
          <IconArrow />
        </button>
      </div>
    </div>
  );
};
