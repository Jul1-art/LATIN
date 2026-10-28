'use strict';

(() => {
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const MEDIA = 'assets/latin-intro.mp4';
  const POSTER = 'assets/latin-intro-poster.webp';
  const MOBILE_MEDIA = 'assets/latin-intro-mobile.mp4';
  const MOBILE_POSTER = 'assets/latin-intro-mobile-poster.webp';
  const LOAD_TIMEOUT_MS = 12000;
  let current = null;
  let pendingReplay = false;

  const css = `
    .latin-film { position:fixed; inset:0; z-index:1000; overflow:hidden; background:#121414; color:#f8f5f0; outline:none; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif; }
    .latin-film-video { display:block; width:100%; height:100%; object-fit:contain; background:#121414; }
    .latin-film-top, .latin-film-bottom { position:absolute; left:0; right:0; display:flex; align-items:center; justify-content:space-between; gap:20px; padding:24px 5.5vw; pointer-events:none; }
    .latin-film-top { top:0; background:linear-gradient(#121414ba,transparent); }
    .latin-film-bottom { bottom:3px; padding-top:55px; background:linear-gradient(transparent,#121414d9); }
    .latin-film-controls { display:flex; align-items:center; gap:24px; }
    .latin-film-controls button:first-child { padding-inline:15px; border:1px solid #ffffff60; border-radius:24px; background:#12141470; }
    .latin-film button, .latin-film a { pointer-events:auto; color:inherit; font:500 11px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif; text-decoration:none; }
    .latin-film button { display:inline-flex; align-items:center; gap:10px; min-height:44px; padding:10px 0; border:0; background:transparent; cursor:pointer; }
    .latin-film a { display:inline-flex; align-items:center; min-height:44px; }
    .latin-film button:focus-visible, .latin-film a:focus-visible { outline:2px solid #d4af37; outline-offset:7px; }
    .latin-film svg { display:block; width:18px; height:18px; flex-shrink:0; fill:none; stroke:currentColor; stroke-width:1.5; stroke-linecap:round; stroke-linejoin:round; }
    .latin-film-brand { font-size:18px; font-weight:650; letter-spacing:-.05em; }
    .latin-film-progress { position:absolute; bottom:0; left:0; width:100%; height:3px; border:0; border-radius:0; background:#ffffff28; appearance:none; -webkit-appearance:none; }
    .latin-film-progress::-webkit-progress-bar { background:#ffffff28; }
    .latin-film-progress::-webkit-progress-value { background:#b59a45; }
    .latin-film-progress::-moz-progress-bar { background:#b59a45; }
    .latin-film-start { position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); padding:18px 26px!important; border:1px solid #ffffff70!important; border-radius:4px; background:#121414b3!important; }
    .latin-film-status { position:absolute; left:20px; right:20px; top:50%; transform:translateY(-50%); margin:0; text-align:center; font-size:12px; }
    .latin-film-description { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip-path:inset(50%); white-space:nowrap; }
    .latin-film [hidden] { display:none!important; }
    @media(max-width:600px) {
      .latin-film-top, .latin-film-bottom { padding-inline:6vw; }
      .latin-film-top { padding-top:16px; }
      .latin-film-bottom { padding-bottom:16px; }
      .latin-film-controls { gap:17px; }
      .latin-film button, .latin-film a { font-size:10px; }
      .latin-film-brand { font-size:17px; }
    }
  `;

  function emit(name) {
    document.dispatchEvent(new CustomEvent(name));
  }

  function markFinished() {
    window.latinIntroState = 'finished';
    emit('latin:intro-reveal');
    emit('latin:intro-finished');
  }

  function clearLoadTimer(state) {
    clearTimeout(state.loadTimer);
    state.loadTimer = 0;
  }

  function armLoadTimer(state) {
    if (current !== state || state.closing || state.userPaused || document.hidden) return;
    clearLoadTimer(state);
    state.loadTimer = window.setTimeout(() => {
      if (current === state && !state.closing) closeFilm(state, false);
    }, LOAD_TIMEOUT_MS);
  }

  function updateButtons(state) {
    state.sound.textContent = state.video.muted ? 'Activer le son' : 'Couper le son';
    state.sound.setAttribute('aria-pressed', String(!state.video.muted));
    state.pause.textContent = state.video.paused ? 'Reprendre' : 'Pause';
    state.pause.setAttribute('aria-label', state.video.paused ? 'Reprendre le film' : 'Mettre le film en pause');
  }

  async function tryPlay(state) {
    if (current !== state || state.closing || document.hidden) return;
    state.userPaused = false;
    state.status.hidden = state.started;
    state.start.hidden = true;
    armLoadTimer(state);
    try {
      await state.video.play();
    } catch (error) {
      if (current !== state || state.closing) return;
      // A policy denial leaves an explicit play action; invalid media returns to the page.
      if (error.name === 'NotAllowedError') {
        clearLoadTimer(state);
        state.status.hidden = true;
        state.start.hidden = false;
      } else if (error.name !== 'AbortError') {
        closeFilm(state, false);
      }
    }
    if (current === state) updateButtons(state);
  }

  function cleanup(state) {
    if (current !== state) return;
    clearLoadTimer(state);
    state.video.pause();
    state.video.removeAttribute('src');
    state.video.load();
    state.overlay.remove();
    state.style.remove();
    state.inertElements.forEach(({ element, inert }) => { element.inert = inert; });
    state.inertElements.length = 0;
    document.body.style.overflow = state.previousOverflow;
    root.classList.remove('intro-running');
    current = null;
    window.latinIntroState = 'finished';
    if (state.previousFocus && state.previousFocus !== document.body && state.previousFocus.isConnected) {
      state.previousFocus.focus({ preventScroll: true });
    }
    emit('latin:intro-finished');
  }

  function closeFilm(state, fade = true) {
    if (current !== state || state.closing) return;
    state.closing = true;
    clearLoadTimer(state);
    state.video.pause();
    window.latinIntroState = 'revealing';
    emit('latin:intro-reveal');
    if (fade && !reducedMotion.matches && typeof state.overlay.animate === 'function') {
      try {
        state.exit = state.overlay.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 360, easing: 'ease-out', fill: 'forwards' });
        state.exit.finished.then(() => cleanup(state)).catch(() => cleanup(state));
        return;
      } catch { /* Cleanup is the safe fallback when Web Animations is unavailable. */ }
    }
    cleanup(state);
  }

  function button(label, className = '') {
    const element = document.createElement('button');
    element.type = 'button';
    element.textContent = label;
    element.className = className;
    return element;
  }

  function startFilm(replay = false) {
    if (current) return;
    if (document.hidden) {
      pendingReplay = replay;
      window.latinIntroState = 'pending';
      return;
    }
    const deepLink = !replay && location.hash && location.hash !== '#accueil';
    if (deepLink || (reducedMotion.matches && !replay)) {
      markFinished();
      return;
    }

    const state = {
      closing: false, started: false, userPaused: false, resumeAfterVisibility: false,
      loadTimer: 0, inertElements: [], previousOverflow: document.body.style.overflow,
      previousFocus: document.activeElement
    };
    current = state;
    try {
      state.style = document.createElement('style');
      state.style.textContent = css;
      document.head.append(state.style);
      state.overlay = document.createElement('div');
      state.overlay.className = 'latin-film';
      state.overlay.tabIndex = -1;
      state.overlay.setAttribute('role', 'dialog');
      state.overlay.setAttribute('aria-modal', 'true');
      state.overlay.setAttribute('aria-label', 'Le latin, pour la vie — le film');
      state.overlay.setAttribute('aria-describedby', 'latin-film-description');

      state.video = document.createElement('video');
      state.video.className = 'latin-film-video';
      state.video.preload = 'auto';
      state.video.playsInline = true;
      state.video.setAttribute('playsinline', '');
      state.video.defaultMuted = true;
      state.video.muted = true;
      state.video.volume = 0.7;
      const portrait = window.matchMedia('(max-aspect-ratio: 3/4)').matches;
      state.video.poster = portrait ? MOBILE_POSTER : POSTER;
      state.video.setAttribute('aria-label', 'Film LATIN : archives de New York, nature et visualisation de la Terre par la NASA');
      state.overlay.append(state.video);

      const description = document.createElement('p');
      description.id = 'latin-film-description';
      description.className = 'latin-film-description';
      description.textContent = 'Archives de New York, séquences de nature et visualisation NASA de la Terre la nuit, accompagnées de musique instrumentale. Titres : « Carpe diem. », « LATIN. Pour la vie. ». Le film peut être mis en pause ou passé. Les sources et les licences sont détaillées dans les crédits.';
      state.overlay.append(description);

      const top = document.createElement('div');
      top.className = 'latin-film-top';
      const brand = document.createElement('span');
      brand.className = 'latin-film-brand';
      brand.textContent = 'LATIN.';
      const skip = button('Passer');
      skip.addEventListener('click', () => closeFilm(state));
      top.append(brand, skip);
      state.overlay.append(top);

      const bottom = document.createElement('div');
      bottom.className = 'latin-film-bottom';
      const controls = document.createElement('div');
      controls.className = 'latin-film-controls';
      state.sound = button('Activer le son');
      state.sound.setAttribute('aria-pressed', 'false');
      state.sound.addEventListener('click', () => {
        const enablingSound = state.video.muted;
        state.video.muted = !enablingSound;
        updateButtons(state);
        // Retry inside this user gesture when muted autoplay was denied.
        // Preserve an intentional pause made with the pause button.
        if (enablingSound && !state.userPaused) tryPlay(state);
      });
      state.pause = button('Pause');
      state.pause.addEventListener('click', () => {
        if (state.video.paused) tryPlay(state);
        else {
          state.userPaused = true;
          clearLoadTimer(state);
          state.video.pause();
          state.status.hidden = true;
          updateButtons(state);
        }
      });
      controls.append(state.sound, state.pause);
      const credits = document.createElement('a');
      credits.href = 'media-credits.html';
      credits.target = '_blank';
      credits.rel = 'noopener';
      credits.textContent = 'Crédits';
      credits.setAttribute('aria-label', 'Crédits du film, nouvel onglet');
      bottom.append(controls, credits);
      state.overlay.append(bottom);

      state.progress = document.createElement('progress');
      state.progress.className = 'latin-film-progress';
      state.progress.max = 1;
      state.progress.value = 0;
      state.progress.setAttribute('aria-label', 'Progression du film');
      state.overlay.append(state.progress);
      state.start = button('Lire le film', 'latin-film-start');
      state.start.hidden = true;
      state.start.addEventListener('click', () => tryPlay(state));
      state.overlay.append(state.start);
      state.status = document.createElement('p');
      state.status.className = 'latin-film-status';
      state.status.setAttribute('role', 'status');
      state.status.textContent = 'Chargement du film…';
      state.overlay.append(state.status);

      state.overlay.addEventListener('keydown', event => {
        if (event.key === 'Escape') { event.preventDefault(); closeFilm(state); }
        if (event.key === 'Tab') {
          const focusable = [...state.overlay.querySelectorAll('button:not([hidden]), a[href]')];
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (event.shiftKey && (document.activeElement === first || document.activeElement === state.overlay)) {
            event.preventDefault(); last.focus();
          } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === state.overlay)) {
            event.preventDefault(); first.focus();
          }
        }
      });
      state.video.addEventListener('playing', () => {
        if (current !== state || state.closing) return;
        state.started = true;
        state.status.hidden = true;
        state.start.hidden = true;
        clearLoadTimer(state);
        updateButtons(state);
      });
      state.video.addEventListener('pause', () => { if (current === state) updateButtons(state); });
      state.video.addEventListener('waiting', () => {
        if (current !== state || state.closing || state.video.paused) return;
        state.status.hidden = state.started;
        armLoadTimer(state);
      });
      state.video.addEventListener('stalled', () => {
        if (current === state && state.video.readyState < 3 && !state.video.paused) armLoadTimer(state);
      });
      state.video.addEventListener('timeupdate', () => {
        if (current !== state || !Number.isFinite(state.video.duration) || !state.video.duration) return;
        state.progress.value = state.video.currentTime / state.video.duration;
      });
      state.video.addEventListener('ended', () => closeFilm(state));
      state.video.addEventListener('error', () => closeFilm(state, false));

      [...document.body.children].forEach(element => {
        state.inertElements.push({ element, inert: element.inert });
        element.inert = true;
      });
      document.body.append(state.overlay);
      document.body.style.overflow = 'hidden';
      root.classList.add('intro-running');
      window.latinIntroState = 'running';
      state.overlay.focus({ preventScroll: true });
      state.video.src = portrait ? MOBILE_MEDIA : MEDIA;
      tryPlay(state);
    } catch {
      // A partial setup must never leave the application hidden or inert.
      if (state.video && state.overlay && state.style) closeFilm(state, false);
      else {
        state.overlay?.remove();
        state.style?.remove();
        state.inertElements.forEach(({ element, inert }) => { element.inert = inert; });
        document.body.style.overflow = state.previousOverflow;
        root.classList.remove('intro-running');
        current = null;
        markFinished();
      }
    }
  }

  function init() {
    document.querySelectorAll('[data-intro-replay]').forEach(control => control.addEventListener('click', () => startFilm(true)));
    document.addEventListener('visibilitychange', () => {
      if (!current) {
        if (!document.hidden && window.latinIntroState === 'pending') startFilm(pendingReplay);
        return;
      }
      if (document.hidden) {
        current.resumeAfterVisibility = !current.video.paused;
        clearLoadTimer(current);
        current.video.pause();
      } else if (current.resumeAfterVisibility && !current.userPaused) {
        current.resumeAfterVisibility = false;
        tryPlay(current);
      }
    });
    window.addEventListener('pagehide', () => { if (current) closeFilm(current, false); });
    const onReducedMotion = () => {
      if (!reducedMotion.matches || !current) return;
      if (current.exit) { current.exit.cancel(); cleanup(current); }
      else closeFilm(current, false);
    };
    if (typeof reducedMotion.addEventListener === 'function') reducedMotion.addEventListener('change', onReducedMotion);
    else if (typeof reducedMotion.addListener === 'function') reducedMotion.addListener(onReducedMotion);
    startFilm();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
