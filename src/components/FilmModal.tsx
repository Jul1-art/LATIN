import React, { useEffect, useRef, useState, useCallback } from 'react';
import { FILM_CHAPTERS } from '../data/quotes';
import {
  IconPlay,
  IconPause,
  IconSound,
  IconMuted,
  IconExpand,
  IconContract,
  IconSettings,
  IconClose,
  IconArrow,
} from './Icons';

interface FilmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCredits: () => void;
}

export const FilmModal: React.FC<FilmModalProps> = ({
  isOpen,
  onClose,
  onOpenCredits,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [mode, setMode] = useState<'launch' | 'playing' | 'paused' | 'ended'>('launch');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(105);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'playback' | 'chapters'>('playback');
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimerRef = useRef<number | null>(null);

  const formatTime = (secs: number) => {
    const s = Math.max(0, Math.floor(Number.isFinite(secs) ? secs : 0));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  };

  const showControlsTemporarily = useCallback(() => {
    setControlsVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (mode === 'playing') {
      hideTimerRef.current = window.setTimeout(() => {
        setControlsVisible(false);
      }, 2600);
    }
  }, [mode]);

  const handlePlay = useCallback(async () => {
    if (mode === 'ended') {
      if (videoRef.current) videoRef.current.currentTime = 0;
      if (audioRef.current) audioRef.current.currentTime = 0;
      setCurrentTime(0);
    }
    setMode('playing');
    try {
      if (videoRef.current) await videoRef.current.play();
      if (audioRef.current) await audioRef.current.play();
    } catch {
      // Autoplay fallback
    }
  }, [mode]);

  const handlePause = useCallback(() => {
    setMode('paused');
    if (videoRef.current) videoRef.current.pause();
    if (audioRef.current) audioRef.current.pause();
  }, []);

  const handleTogglePlay = useCallback(() => {
    if (mode === 'playing') handlePause();
    else handlePlay();
  }, [mode, handlePause, handlePlay]);

  const handleToggleSound = useCallback(() => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (videoRef.current) videoRef.current.muted = newMuted;
    if (audioRef.current) audioRef.current.muted = newMuted;
    showControlsTemporarily();
  }, [isMuted, showControlsTemporarily]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    const muted = val === 0;
    setIsMuted(muted);
    if (videoRef.current) {
      videoRef.current.volume = val / 100;
      videoRef.current.muted = muted;
    }
    if (audioRef.current) {
      audioRef.current.volume = val / 100;
      audioRef.current.muted = muted;
    }
    showControlsTemporarily();
  };

  const handleSeek = (newTime: number) => {
    const clamped = Math.max(0, Math.min(duration, newTime));
    setCurrentTime(clamped);
    if (videoRef.current) videoRef.current.currentTime = clamped;
    if (audioRef.current) audioRef.current.currentTime = clamped;
    if (mode === 'ended') setMode('paused');
    showControlsTemporarily();
  };

  const handleSpeedChange = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) videoRef.current.playbackRate = rate;
    if (audioRef.current) audioRef.current.playbackRate = rate;
    showControlsTemporarily();
  };

  const handleChapterClick = (startTime: number) => {
    setSettingsOpen(false);
    handleSeek(startTime);
    handlePlay();
  };

  const handleToggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      // ignore
    }
    showControlsTemporarily();
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      showControlsTemporarily();
      if (e.key === 'Escape') {
        if (settingsOpen) {
          e.preventDefault();
          setSettingsOpen(false);
          return;
        }
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
          return;
        }
        e.preventDefault();
        onClose();
      } else if (e.key === ' ' || e.key.toLowerCase() === 'k') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleSeek(currentTime - 5);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleSeek(currentTime + 5);
      } else if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        handleToggleSound();
      } else if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        handleToggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.classList.add('film-open');

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('film-open');
    };
  }, [
    isOpen,
    currentTime,
    duration,
    settingsOpen,
    onClose,
    handleTogglePlay,
    handleToggleSound,
    showControlsTemporarily,
  ]);

  // Sync timer when playing
  useEffect(() => {
    if (mode !== 'playing') return;
    const interval = setInterval(() => {
      const vidTime = videoRef.current?.currentTime;
      const audTime = audioRef.current?.currentTime;
      const t = vidTime ?? audTime ?? currentTime;
      if (t >= duration) {
        setMode('ended');
        setCurrentTime(duration);
      } else {
        setCurrentTime(t);
      }
    }, 250);
    return () => clearInterval(interval);
  }, [mode, duration, currentTime]);

  if (!isOpen) return null;

  const currentChapter = FILM_CHAPTERS.find(
    (c) => currentTime >= c.start && currentTime < c.end
  );

  return (
    <div
      ref={containerRef}
      className={`latin-film ${mode === 'launch' ? 'is-launch' : ''} ${
        mode === 'ended' ? 'has-ended' : ''
      } ${!controlsVisible && mode === 'playing' ? 'is-controls-hidden' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="LATIN — le film"
      onPointerMove={showControlsTemporarily}
      onClick={(e) => {
        if ((e.target as HTMLElement).tagName === 'VIDEO') {
          handleTogglePlay();
        }
      }}
    >
      <video
        ref={videoRef}
        className="latin-film-video"
        playsInline
        preload="metadata"
        poster="/assets/latin-intro-poster.webp"
        onLoadedMetadata={() => {
          if (videoRef.current && Number.isFinite(videoRef.current.duration)) {
            setDuration(videoRef.current.duration);
          }
        }}
        onEnded={() => setMode('ended')}
        src="/assets/latin-intro.mp4"
      />

      <audio
        ref={audioRef}
        src="/film/music/adventure.mp3"
        preload="metadata"
      />

      <div className="latin-film-shade" aria-hidden="true" />

      {/* Top Bar with Close Button */}
      <div className="latin-film-top">
        <button
          type="button"
          className="latin-film-close"
          onClick={onClose}
          aria-label="Fermer le film"
          title="Fermer le film"
        >
          <IconClose />
        </button>
      </div>

      {/* Center Card for Launch or Replay */}
      {(mode === 'launch' || mode === 'ended') && (
        <div className="latin-film-card">
          <div className="latin-film-card-actions">
            <button
              type="button"
              className="latin-film-primary"
              onClick={handlePlay}
              aria-label={mode === 'ended' ? 'Revoir le film' : 'Lancer le film'}
            >
              <IconPlay />
              <span className="latin-film-primary-label">
                {mode === 'ended' ? 'Revoir le film' : 'Lancer le film'}
              </span>
            </button>

            {mode === 'ended' && (
              <button
                type="button"
                className="latin-film-explore"
                onClick={onClose}
              >
                <span>Explorer le site</span>
                <IconArrow />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Controls Bottom Panel */}
      <div className="latin-film-panel">
        <input
          type="range"
          className="latin-film-range latin-film-seek"
          min="0"
          max={duration}
          step="0.1"
          value={currentTime}
          onChange={(e) => handleSeek(Number(e.target.value))}
          aria-label="Progression du film"
          style={{
            ['--range-progress' as string]: `${(currentTime / duration) * 100}%`,
          }}
        />

        <div className="latin-film-controls-row">
          <div className="latin-film-left">
            <button
              type="button"
              className="latin-film-icon-button latin-film-play"
              onClick={handleTogglePlay}
              aria-label={mode === 'playing' ? 'Mettre le film en pause' : 'Lire le film'}
            >
              {mode === 'playing' ? <IconPause /> : <IconPlay />}
            </button>

            <div className="latin-film-audio">
              <button
                type="button"
                className="latin-film-icon-button"
                onClick={handleToggleSound}
                aria-label={isMuted ? 'Activer le son' : 'Couper le son'}
              >
                {isMuted || volume === 0 ? <IconMuted /> : <IconSound />}
              </button>
              <input
                type="range"
                className="latin-film-range latin-film-volume"
                min="0"
                max="100"
                step="1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                aria-label="Volume"
                style={{
                  ['--range-progress' as string]: `${isMuted ? 0 : volume}%`,
                }}
              />
              <span className="latin-film-volume-value" aria-hidden="true">
                {isMuted ? '0%' : `${volume}%`}
              </span>
            </div>

            <div className="latin-film-time" aria-hidden="true">
              <span>{formatTime(currentTime)}</span>
              <span> / </span>
              <span>{formatTime(duration)}</span>
              {currentChapter && (
                <span style={{ marginLeft: 8, color: '#b59a45' }}>
                  • {currentChapter.latin}
                </span>
              )}
            </div>
          </div>

          <div className="latin-film-right">
            <button
              type="button"
              className="latin-film-icon-button"
              onClick={() => {
                setSettingsOpen(!settingsOpen);
                showControlsTemporarily();
              }}
              aria-expanded={settingsOpen}
              aria-label="Réglages du film"
              title="Réglages et chapitres"
            >
              <IconSettings />
            </button>

            <button
              type="button"
              className="latin-film-icon-button"
              onClick={handleToggleFullscreen}
              aria-label={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
              title={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
            >
              {isFullscreen ? <IconContract /> : <IconExpand />}
            </button>
          </div>
        </div>

        {/* Settings Popup */}
        {settingsOpen && (
          <div
            id="latin-film-settings"
            className="latin-film-settings"
            role="group"
            aria-label="Réglages et chapitres du film"
          >
            <div className="latin-film-tabs">
              <button
                type="button"
                aria-pressed={settingsTab === 'playback'}
                onClick={() => setSettingsTab('playback')}
              >
                Lecture
              </button>
              <button
                type="button"
                aria-pressed={settingsTab === 'chapters'}
                onClick={() => setSettingsTab('chapters')}
              >
                Chapitres
              </button>
            </div>

            {settingsTab === 'playback' && (
              <div>
                <p className="latin-film-settings-title">Vitesse de lecture</p>
                <div className="latin-film-speeds">
                  {[0.75, 1, 1.25, 1.5].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      aria-pressed={playbackRate === rate}
                      onClick={() => handleSpeedChange(rate)}
                    >
                      {String(rate).replace('.', ',')}×
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="latin-film-credit"
                  onClick={() => {
                    setSettingsOpen(false);
                    onOpenCredits();
                  }}
                >
                  Sources et crédits ↗
                </button>
              </div>
            )}

            {settingsTab === 'chapters' && (
              <div className="latin-film-chapters">
                {FILM_CHAPTERS.map((chap, idx) => {
                  const isCurrent =
                    currentTime >= chap.start && currentTime < chap.end;
                  return (
                    <button
                      key={idx}
                      type="button"
                      className={`latin-film-chapter ${
                        isCurrent ? 'is-current' : ''
                      }`}
                      onClick={() => handleChapterClick(chap.start)}
                      aria-current={isCurrent ? 'true' : undefined}
                    >
                      <span className="latin-film-chapter-time">
                        {formatTime(chap.start)}
                      </span>
                      <span>{chap.latin}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
