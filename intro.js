'use strict';

(() => {
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const MEDIA = 'assets/latin-intro.mp4?v=4';
  const POSTER = 'assets/latin-intro-poster.webp?v=4';
  const MOBILE_MEDIA = 'assets/latin-intro-mobile.mp4?v=4';
  const MOBILE_POSTER = 'assets/latin-intro-mobile-poster.webp?v=4';
  const LOAD_TIMEOUT_MS = 12000;
  const HIDE_DELAY_MS = 2600;
  let current = null;
  let pendingReplay = false;

  const icons = {
    play: '<path d="m9 5 11 7-11 7z" fill="currentColor" stroke="none"/>',
    pause: '<path d="M8 5v14M16 5v14" stroke-width="3.5"/>',
    stop: '<rect x="6" y="6" width="12" height="12" rx="1" fill="currentColor" stroke="none"/>',
    restart: '<path d="M4 10a8 8 0 1 1 1 7M4 4v6h6"/>',
    sound: '<path d="m11 5-5 4H3v6h3l5 4zM15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14"/>',
    muted: '<path d="m11 5-5 4H3v6h3l5 4zM16 9l5 6M16 15l5-6"/>',
    expand: '<path d="M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5"/>',
    contract: '<path d="M3 8h5V3M21 8h-5V3M8 21v-5H3M16 21v-5h5"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>',
    arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>'
  };

  const css = `
    html.intro-running { scrollbar-gutter:auto; }
    .latin-film { position:fixed; inset:0; width:100vw; height:100vh; height:100dvh; z-index:1000; overflow:hidden; isolation:isolate; background:#080a09; color:#f8f5f0; outline:none; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif; }
    .latin-film *, .latin-film *::before, .latin-film *::after { box-sizing:border-box; }
    .latin-film-poster, .latin-film-video { position:absolute; inset:0; display:block; width:100%; height:100%; object-fit:contain; background:#080a09; }
    .latin-film.is-cover .latin-film-poster, .latin-film.is-cover .latin-film-video { object-fit:cover; }
    .latin-film-poster { opacity:.68; animation:latin-film-poster-in 1.1s cubic-bezier(.16,1,.3,1) backwards; }
    .latin-film-video { transition:opacity .6s; }
    .latin-film.is-launch .latin-film-video, .latin-film.is-stopped .latin-film-video, .latin-film.has-ended .latin-film-video { opacity:0; }
    .latin-film-shade { position:absolute; inset:0; pointer-events:none; background:linear-gradient(180deg,#080a0970 0%,transparent 30%,transparent 60%,#080a0980 100%); }
    .latin-film.is-launch .latin-film-shade, .latin-film.is-stopped .latin-film-shade, .latin-film.has-ended .latin-film-shade { background:linear-gradient(180deg,#080a0960,#080a0940 35%,#080a09b8); }
    .latin-film button, .latin-film a, .latin-film input { font:inherit; }
    .latin-film button, .latin-film a { -webkit-tap-highlight-color:transparent; touch-action:manipulation; }
    .latin-film button { display:inline-flex; align-items:center; justify-content:center; gap:11px; color:inherit; border:0; background:none; cursor:pointer; }
    .latin-film button:disabled { cursor:default; opacity:.4; }
    .latin-film a { color:inherit; text-decoration:none; }
    .latin-film :is(button,a,input):focus-visible { outline:2px solid #d4af37; outline-offset:5px; }
    .latin-film svg { display:block; width:21px; height:21px; flex-shrink:0; fill:none; stroke:currentColor; stroke-width:1.6; stroke-linecap:round; stroke-linejoin:round; }
    .latin-film-top { position:absolute; inset:0 0 auto; z-index:3; display:flex; align-items:center; justify-content:space-between; gap:20px; padding:18px clamp(20px,4vw,64px); background:linear-gradient(#080a0980,transparent); transition:opacity .35s,transform .35s; }
    .latin-film-brand { font-size:21px; font-weight:650; letter-spacing:-.065em; }
    .latin-film-brand span { color:#b59a45; }
    .latin-film-close { min-height:44px; padding:9px 0 9px 16px; font-size:11px!important; }
    .latin-film-close svg { width:18px; height:18px; }
    .latin-film-card { animation:latin-film-card-in .8s cubic-bezier(.16,1,.3,1) .1s backwards; position:absolute; z-index:2; top:44%; left:20px; right:20px; transform:translateY(-50%); text-align:center; }
    .latin-film-overline { margin:0 0 18px; color:#d1c08a; font-size:9px; line-height:1.6; letter-spacing:.23em; text-transform:uppercase; }
    .latin-film-title { margin:0; font-size:clamp(64px,9vw,132px); font-weight:500; line-height:1; letter-spacing:-.075em; }
    .latin-film-subtitle { margin:14px 0 28px; font-size:clamp(15px,2vw,22px); letter-spacing:-.02em; color:#e0dfd4; }
    .latin-film-card-actions { display:flex; justify-content:center; align-items:center; gap:18px; flex-wrap:wrap; }
    .latin-film-primary { min-height:54px; padding:15px 25px!important; border-radius:999px; background:#f8f5f0!important; color:#121414!important; font-size:12px!important; font-weight:550!important; transition:transform .4s cubic-bezier(.16,1,.3,1),background .25s; }
    .latin-film-primary:hover { transform:translateY(-3px); background:#e8e2d2!important; }
    .latin-film-primary svg { width:19px; height:19px; }
    .latin-film-explore { min-height:48px; padding:12px 4px!important; font-size:11px!important; }
    .latin-film-card-note { margin:18px 0 0; color:#c9cbbf; font-size:10px; letter-spacing:.03em; }
    .latin-film-center-play { position:absolute; z-index:2; left:50%; top:45%; transform:translate(-50%,-50%); width:76px; height:76px; border:1px solid #ffffff60!important; border-radius:50%; background:#080a0980!important; backdrop-filter:blur(10px); }
    .latin-film-center-play svg { width:28px; height:28px; margin-left:3px; }
    .latin-film-status { position:absolute; z-index:4; left:20px; right:20px; top:48%; margin:0; transform:translateY(-50%); color:#f8f5f0; font-size:12px; text-align:center; }
    .latin-film-panel { animation:latin-film-panel-in .7s cubic-bezier(.16,1,.3,1) .2s backwards; position:absolute; z-index:3; bottom:max(22px,env(safe-area-inset-bottom)); left:clamp(16px,4vw,64px); right:clamp(16px,4vw,64px); max-width:1150px; margin-inline:auto; padding:15px 18px 12px; border:1px solid #ffffff24; border-radius:18px; background:#121414b8; backdrop-filter:blur(18px); box-shadow:0 12px 40px #0003; transition:opacity .35s,transform .35s; }
    .latin-film-timeline-labels { display:flex; align-items:center; justify-content:space-between; gap:20px; margin:0 2px 0; color:#c9ccbf; font-size:10px; font-variant-numeric:tabular-nums; }
    .latin-film-range { display:block; appearance:none; -webkit-appearance:none; min-width:0; height:44px; margin:0; border:0; border-radius:3px; background:transparent; cursor:pointer; accent-color:#b59a45; }
    .latin-film-range::-webkit-slider-runnable-track { height:3px; border-radius:3px; background:linear-gradient(to right,#b59a45 0 var(--range-progress,0%),#ffffff30 var(--range-progress,0%) 100%); }
    .latin-film-range::-moz-range-track { height:3px; border-radius:3px; background:linear-gradient(to right,#b59a45 0 var(--range-progress,0%),#ffffff30 var(--range-progress,0%) 100%); }
    .latin-film-range::-webkit-slider-thumb { appearance:none; -webkit-appearance:none; width:12px; height:12px; margin-top:-4.5px; border:0; border-radius:50%; background:#f8f5f0; box-shadow:0 0 0 3px #f8f5f010; }
    .latin-film-range::-moz-range-thumb { width:12px; height:12px; border:0; border-radius:50%; background:#f8f5f0; }
    .latin-film-seek { width:100%; height:44px; margin-block:0 2px; }
    .latin-film-seek:disabled { cursor:default; opacity:.35; }
    .latin-film-controls-row { display:grid; grid-template-columns:auto 1fr auto; align-items:center; gap:14px; }
    .latin-film-transport, .latin-film-audio { display:flex; align-items:center; gap:4px; }
    .latin-film-audio { justify-content:flex-end; gap:9px; }
    .latin-film-icon-button { width:44px; height:44px; padding:10px; border-radius:50%; transition:background .25s; }
    .latin-film-icon-button:hover { background:#ffffff12; }
    .latin-film-play { background:#f8f5f0!important; color:#121414!important; }
    .latin-film-play:hover { background:#e8e2d2!important; }
    .latin-film-volume { width:86px; }
    .latin-film-credit { display:inline-flex; align-items:center; min-height:44px; padding:10px 13px; color:#c9ccbf!important; font-size:10px!important; }
    .latin-film.is-controls-hidden .latin-film-top { opacity:0; transform:translateY(-10px); pointer-events:none; }
    .latin-film.is-controls-hidden .latin-film-panel { opacity:0; transform:translateY(16px); pointer-events:none; }
    .latin-film-description { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip-path:inset(50%); white-space:nowrap; }
    .latin-film [hidden] { display:none!important; }
    @keyframes latin-film-poster-in { from { opacity:.25; transform:scale(1.035); } to { opacity:.68; transform:scale(1); } }
    @keyframes latin-film-card-in { from { opacity:0; transform:translateY(calc(-50% + 14px)); } to { opacity:1; transform:translateY(-50%); } }
    @keyframes latin-film-panel-in { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
    @media(max-width:600px) {
      .latin-film-top { padding:12px 20px; }
      .latin-film-brand { font-size:20px; }
      .latin-film-card { top:37%; }
      .latin-film-overline { margin-bottom:15px; font-size:8px; }
      .latin-film-subtitle { margin:12px 0 23px; }
      .latin-film-primary { min-height:50px; padding:14px 21px!important; font-size:11px!important; }
      .latin-film-card-actions { gap:8px 16px; }
      .latin-film-card-note { font-size:9px; margin-top:14px; }
      .latin-film-panel { bottom:max(14px,env(safe-area-inset-bottom)); padding:13px 13px 8px; border-radius:15px; }
      .latin-film-controls-row { grid-template-columns:1fr auto; gap:3px 12px; }
      .latin-film-transport { grid-column:1; grid-row:1; }
      .latin-film-fullscreen { grid-column:2; grid-row:1; }
      .latin-film-audio { grid-column:1 / -1; grid-row:2; justify-content:flex-start; gap:9px; border-top:1px solid #ffffff16; padding-top:4px; }
      .latin-film-volume { flex:1; width:auto; }
      .latin-film-credit { margin-left:5px; padding-inline:5px; }
      .latin-film-center-play { top:40%; width:68px; height:68px; }
    }
    @media(max-height:520px) {
      .latin-film-card { top:39%; }
      .latin-film-title { font-size:56px; }
      .latin-film-overline, .latin-film-subtitle { display:none; }
      .latin-film-card-actions { margin-top:15px; }
      .latin-film-card-note { margin-top:9px; }
      .latin-film-top { padding-block:8px; }
      .latin-film-panel { bottom:12px; padding-block:10px 5px; }
      .latin-film-seek { margin-block:-3px 0; }
    }
    @media(prefers-reduced-motion:reduce) { .latin-film, .latin-film * { animation:none!important; transition:none!important; } }
  `;

  function emit(name) {
    document.dispatchEvent(new CustomEvent(name));
  }

  function markFinished() {
    window.latinIntroState = 'finished';
    emit('latin:intro-reveal');
    emit('latin:intro-finished');
  }

  function icon(name) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = icons[name];
    return svg;
  }

  function setButton(button, label, name) {
    button.setAttribute('aria-label', label);
    button.title = label;
    button.replaceChildren(icon(name));
  }

  function iconButton(label, name, className = '') {
    const element = document.createElement('button');
    element.type = 'button';
    element.className = `latin-film-icon-button ${className}`;
    setButton(element, label, name);
    return element;
  }

  function formatTime(value) {
    const seconds = Math.max(0, Math.floor(Number.isFinite(value) ? value : 0));
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  }

  function isActive(state) {
    return current === state && !state.closing;
  }

  function listen(state, target, name, handler, options = {}) {
    target.addEventListener(name, handler, { ...options, signal: state.events.signal });
  }

  function clearLoadTimer(state) {
    clearTimeout(state.loadTimer);
    state.loadTimer = 0;
  }

  function clearHideTimer(state) {
    clearTimeout(state.hideTimer);
    state.hideTimer = 0;
  }

  function canHideControls(state) {
    return isActive(state) && state.mode === 'playing' && !state.video.paused && !state.loading && !state.scrubbing && !state.pointerOverControls && !(state.keyboardMode && state.overlay.contains(document.activeElement) && document.activeElement !== state.overlay && document.activeElement !== state.video);
  }

  function scheduleHide(state) {
    clearHideTimer(state);
    if (!canHideControls(state)) return;
    state.hideTimer = window.setTimeout(() => {
      if (canHideControls(state)) state.overlay.classList.add('is-controls-hidden');
    }, HIDE_DELAY_MS);
  }

  function showControls(state) {
    if (!isActive(state)) return;
    state.overlay.classList.remove('is-controls-hidden');
    scheduleHide(state);
  }

  function armLoadTimer(state) {
    if (!isActive(state) || state.userPaused || document.hidden) return;
    clearLoadTimer(state);
    state.loadTimer = window.setTimeout(() => {
      if (isActive(state)) closeFilm(state, false);
    }, LOAD_TIMEOUT_MS);
  }

  function updateTimeline(state) {
    if (!isActive(state)) return;
    const duration = Number.isFinite(state.video.duration) ? state.video.duration : 0;
    const time = Math.min(duration || Infinity, state.video.currentTime || 0);
    state.elapsed.textContent = formatTime(time);
    state.duration.textContent = duration ? formatTime(duration) : '—:—';
    state.seek.disabled = !duration;
    if (duration) {
      state.seek.max = String(duration);
      if (!state.scrubbing) state.seek.value = String(time);
      state.seek.style.setProperty('--range-progress', `${time / duration * 100}%`);
      state.seek.setAttribute('aria-valuetext', `${formatTime(time)} sur ${formatTime(duration)}`);
    }
    state.cardNote.textContent = state.mode === 'ended' ? `${formatTime(duration)} · Le latin, pour la vie.` : `Son ${state.video.muted || !state.video.volume ? 'coupé' : 'activé'}${duration ? ` · ${formatTime(duration)}` : ''}`;
  }

  function updateState(state) {
    if (!isActive(state)) return;
    const mode = state.mode;
    const cardVisible = ['launch', 'stopped', 'ended'].includes(mode);
    state.overlay.classList.toggle('is-launch', mode === 'launch');
    state.overlay.classList.toggle('is-stopped', mode === 'stopped');
    state.overlay.classList.toggle('has-ended', mode === 'ended');
    state.card.hidden = !cardVisible || state.loading;
    state.centerPlay.hidden = mode !== 'paused' || state.loading || state.scrubbing;
    state.explore.hidden = mode !== 'ended';
    state.primaryLabel.textContent = mode === 'ended' ? 'Revoir le film' : 'Lancer le film';
    const playing = !state.video.paused && mode === 'playing';
    setButton(state.play, playing ? 'Mettre le film en pause' : (state.started && mode !== 'stopped' && mode !== 'ended' ? 'Reprendre le film' : 'Lire le film'), playing ? 'pause' : 'play');
    const audible = !state.video.muted && state.video.volume > 0;
    setButton(state.sound, audible ? 'Couper le son' : 'Activer le son', audible ? 'sound' : 'muted');
    state.sound.setAttribute('aria-pressed', String(audible));
    state.volume.value = String(Math.round(state.video.volume * 100));
    state.volume.style.setProperty('--range-progress', `${state.video.volume * 100}%`);
    updateTimeline(state);
    if (mode !== 'playing' || state.loading) {
      clearHideTimer(state);
      state.overlay.classList.remove('is-controls-hidden');
    } else scheduleHide(state);
  }

  async function playFilm(state, restart = false) {
    if (!isActive(state) || document.hidden) return;
    if (state.card.contains(document.activeElement)) state.overlay.focus({ preventScroll: true });
    if (restart || state.mode === 'ended') state.video.currentTime = 0;
    state.userPaused = false;
    state.mode = 'playing';
    state.loading = !state.started && state.video.readyState < 3;
    state.status.hidden = !state.loading;
    updateState(state);
    armLoadTimer(state);
    try {
      await state.video.play();
      if (!isActive(state)) return;
      if (state.card.contains(document.activeElement)) state.overlay.focus({ preventScroll: true });
    } catch (error) {
      if (!isActive(state)) return;
      clearLoadTimer(state);
      state.loading = false;
      state.status.hidden = true;
      if (error.name === 'NotAllowedError') state.mode = state.started ? 'paused' : 'launch';
      else if (error.name === 'AbortError') return;
      else { closeFilm(state, false); return; }
    }
    updateState(state);
  }

  function pauseFilm(state) {
    if (!isActive(state)) return;
    state.userPaused = true;
    state.loading = false;
    state.mode = 'paused';
    state.status.hidden = true;
    clearLoadTimer(state);
    state.video.pause();
    updateState(state);
  }

  function stopFilm(state) {
    if (!isActive(state)) return;
    state.mode = 'stopped';
    state.userPaused = true;
    state.loading = false;
    state.scrubbing = false;
    state.status.hidden = true;
    clearLoadTimer(state);
    state.video.pause();
    if (state.video.readyState > 0) state.video.currentTime = 0;
    updateState(state);
  }

  function togglePlayback(state) {
    if (!isActive(state)) return;
    if (state.video.paused || state.mode === 'ended') playFilm(state);
    else pauseFilm(state);
  }

  function toggleSound(state) {
    if (!isActive(state)) return;
    if (state.video.muted || !state.video.volume) {
      if (!state.video.volume) state.video.volume = state.lastVolume || .75;
      state.video.muted = false;
    } else state.video.muted = true;
    updateState(state);
    showControls(state);
  }

  function seekTo(state, value) {
    if (!isActive(state) || !Number.isFinite(state.video.duration)) return;
    state.video.currentTime = Math.max(0, Math.min(state.video.duration, value));
    if (state.mode === 'ended' || state.mode === 'stopped' || state.mode === 'launch') state.mode = 'paused';
    updateTimeline(state);
    updateState(state);
    showControls(state);
  }

  function beginScrub(state) {
    if (!isActive(state) || state.scrubbing) return;
    state.resumeAfterScrub = !state.video.paused;
    state.scrubbing = true;
    state.video.pause();
    clearLoadTimer(state);
    showControls(state);
  }

  function finishScrub(state) {
    if (!isActive(state) || !state.scrubbing) return;
    state.scrubbing = false;
    if (Number.isFinite(state.video.duration) && state.video.currentTime >= state.video.duration - .05) {
      state.mode = 'ended';
      state.resumeAfterScrub = false;
    }
    if (state.resumeAfterScrub) playFilm(state);
    else updateState(state);
    state.resumeAfterScrub = false;
    showControls(state);
  }

  function updateFit(state) {
    if (!isActive(state)) return;
    const videoRatio = state.video.videoWidth && state.video.videoHeight ? state.video.videoWidth / state.video.videoHeight : state.portrait ? 9 / 16 : 16 / 9;
    const screenRatio = window.innerWidth / window.innerHeight;
    const difference = Math.max(videoRatio / screenRatio, screenRatio / videoRatio);
    state.overlay.classList.toggle('is-cover', difference < (state.portrait ? 1.25 : 1.35));
  }

  function updateFullscreen(state) {
    if (!isActive(state)) return;
    const fullscreen = document.fullscreenElement === state.overlay || !!state.video.webkitDisplayingFullscreen;
    setButton(state.fullscreen, fullscreen ? 'Quitter le plein écran' : 'Plein écran', fullscreen ? 'contract' : 'expand');
    updateFit(state);
    showControls(state);
  }

  async function toggleFullscreen(state) {
    if (!isActive(state)) return;
    try {
      if (document.fullscreenElement === state.overlay) await document.exitFullscreen();
      else if (state.overlay.requestFullscreen) await state.overlay.requestFullscreen();
      else if (state.video.webkitDisplayingFullscreen && state.video.webkitExitFullscreen) state.video.webkitExitFullscreen();
      else if (state.video.webkitEnterFullscreen) state.video.webkitEnterFullscreen();
    } catch { showControls(state); }
  }

  function cleanup(state) {
    if (current !== state) return;
    clearLoadTimer(state);
    clearHideTimer(state);
    state.events.abort();
    state.video.pause();
    state.video.removeAttribute('src');
    state.video.load();
    state.overlay.remove();
    state.style.remove();
    state.inertElements.forEach(({ element, inert }) => { element.inert = inert; });
    document.body.style.overflow = state.previousOverflow;
    root.classList.remove('intro-running');
    current = null;
    window.latinIntroState = 'finished';
    if (state.previousFocus && state.previousFocus !== document.body && state.previousFocus.isConnected) state.previousFocus.focus({ preventScroll: true });
    emit('latin:intro-finished');
  }

  function closeFilm(state, fade = true) {
    if (!isActive(state)) return;
    state.closing = true;
    clearLoadTimer(state);
    clearHideTimer(state);
    state.video.pause();
    if (document.fullscreenElement === state.overlay && document.exitFullscreen) document.exitFullscreen().catch(() => {});
    window.latinIntroState = 'revealing';
    emit('latin:intro-reveal');
    if (fade && !reducedMotion.matches && state.overlay.animate) {
      state.exit = state.overlay.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 420, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'forwards' });
      state.exit.finished.then(() => cleanup(state)).catch(() => cleanup(state));
    } else cleanup(state);
  }

  function trapFocus(state, event) {
    const elements = [...state.overlay.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled)')].filter(element => !element.closest('[hidden]'));
    const first = elements[0];
    const last = elements[elements.length - 1];
    if (!first) return;
    if (event.shiftKey && (document.activeElement === first || document.activeElement === state.overlay || document.activeElement === state.video)) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && (document.activeElement === last || document.activeElement === state.overlay || document.activeElement === state.video)) { event.preventDefault(); first.focus(); }
  }

  function startFilm(replay = false) {
    if (current) return;
    if (document.hidden) { pendingReplay = replay; window.latinIntroState = 'pending'; return; }
    const deepLink = !replay && location.hash && location.hash !== '#accueil';
    if (deepLink || (reducedMotion.matches && !replay)) { markFinished(); return; }
    const state = {
      closing: false, started: false, userPaused: true, mode: 'launch', loading: false,
      scrubbing: false, resumeAfterScrub: false, resumeAfterVisibility: false,
      keyboardMode: false, pointerOverControls: false, lastVolume: .75,
      loadTimer: 0, hideTimer: 0, inertElements: [], events: new AbortController(),
      previousOverflow: document.body.style.overflow, previousFocus: document.activeElement,
      portrait: window.matchMedia('(max-aspect-ratio: 3/4)').matches
    };
    current = state;
    try {
      state.style = document.createElement('style');
      state.style.textContent = css;
      document.head.append(state.style);
      state.overlay = document.createElement('div');
      state.overlay.className = 'latin-film is-launch';
      state.overlay.tabIndex = -1;
      state.overlay.setAttribute('role', 'dialog');
      state.overlay.setAttribute('aria-modal', 'true');
      state.overlay.setAttribute('aria-label', 'LATIN — le film');
      state.overlay.setAttribute('aria-describedby', 'latin-film-description');

      const poster = document.createElement('img');
      poster.className = 'latin-film-poster';
      poster.src = state.portrait ? MOBILE_POSTER : POSTER;
      poster.alt = '';
      state.overlay.append(poster);
      state.video = document.createElement('video');
      state.video.className = 'latin-film-video';
      state.video.preload = 'metadata';
      state.video.playsInline = true;
      state.video.setAttribute('playsinline', '');
      state.video.defaultMuted = false;
      state.video.muted = false;
      state.video.volume = .75;
      state.video.poster = poster.src;
      state.video.tabIndex = -1;
      state.video.setAttribute('aria-label', 'Film LATIN : archives de New York, nature et visualisation NASA de la Terre');
      state.overlay.append(state.video);
      const shade = document.createElement('div');
      shade.className = 'latin-film-shade';
      shade.setAttribute('aria-hidden', 'true');
      state.overlay.append(shade);
      const description = document.createElement('p');
      description.id = 'latin-film-description';
      description.className = 'latin-film-description';
      description.textContent = 'Archives urbaines de New York, séquences de nature et visualisation NASA de la Terre la nuit, avec musique instrumentale. Le film se lance avec le son. Vous pouvez le mettre en pause, l’arrêter, le relancer, choisir un passage, régler le volume ou couper le son. Les sources sont détaillées dans les crédits.';
      state.overlay.append(description);

      const header = document.createElement('div');
      header.className = 'latin-film-top';
      const brand = document.createElement('span');
      brand.className = 'latin-film-brand';
      brand.innerHTML = 'LATIN<span>.</span>';
      const close = document.createElement('button');
      close.type = 'button';
      close.className = 'latin-film-close';
      close.setAttribute('aria-label', 'Fermer le film');
      close.append(document.createTextNode('Passer'), icon('close'));
      close.addEventListener('click', () => closeFilm(state));
      header.append(brand, close);
      state.overlay.append(header);

      state.card = document.createElement('div');
      state.card.className = 'latin-film-card';
      const overline = document.createElement('p');
      overline.className = 'latin-film-overline';
      overline.textContent = 'Le film';
      const title = document.createElement('h2');
      title.className = 'latin-film-title';
      title.textContent = 'LATIN.';
      const subtitle = document.createElement('p');
      subtitle.className = 'latin-film-subtitle';
      subtitle.textContent = 'Pour la vie.';
      const actions = document.createElement('div');
      actions.className = 'latin-film-card-actions';
      const primary = document.createElement('button');
      primary.type = 'button';
      primary.className = 'latin-film-primary';
      state.primaryLabel = document.createElement('span');
      state.primaryLabel.textContent = 'Lancer le film';
      primary.append(icon('play'), state.primaryLabel);
      primary.addEventListener('click', () => playFilm(state, state.mode === 'ended'));
      state.explore = document.createElement('button');
      state.explore.type = 'button';
      state.explore.className = 'latin-film-explore';
      state.explore.append(document.createTextNode('Explorer le site'), icon('arrow'));
      state.explore.hidden = true;
      state.explore.addEventListener('click', () => closeFilm(state));
      actions.append(primary, state.explore);
      state.cardNote = document.createElement('p');
      state.cardNote.className = 'latin-film-card-note';
      state.card.append(overline, title, subtitle, actions, state.cardNote);
      state.overlay.append(state.card);
      state.centerPlay = iconButton('Reprendre le film', 'play', 'latin-film-center-play');
      state.centerPlay.hidden = true;
      state.centerPlay.addEventListener('click', () => playFilm(state));
      state.overlay.append(state.centerPlay);
      state.status = document.createElement('p');
      state.status.className = 'latin-film-status';
      state.status.setAttribute('role', 'status');
      state.status.textContent = 'Chargement du film…';
      state.status.hidden = true;
      state.overlay.append(state.status);

      state.panel = document.createElement('div');
      state.panel.className = 'latin-film-panel';
      const timeLabels = document.createElement('div');
      timeLabels.className = 'latin-film-timeline-labels';
      timeLabels.setAttribute('aria-hidden', 'true');
      state.elapsed = document.createElement('span');
      state.elapsed.textContent = '0:00';
      state.duration = document.createElement('span');
      state.duration.textContent = '—:—';
      timeLabels.append(state.elapsed, state.duration);
      state.seek = document.createElement('input');
      state.seek.type = 'range';
      state.seek.className = 'latin-film-range latin-film-seek';
      state.seek.min = '0'; state.seek.max = '1'; state.seek.step = '.1'; state.seek.value = '0';
      state.seek.disabled = true;
      state.seek.setAttribute('aria-label', 'Progression du film');
      const row = document.createElement('div');
      row.className = 'latin-film-controls-row';
      const transport = document.createElement('div');
      transport.className = 'latin-film-transport';
      state.play = iconButton('Lire le film', 'play', 'latin-film-play');
      state.play.addEventListener('click', () => togglePlayback(state));
      const stop = iconButton('Arrêter le film', 'stop');
      stop.addEventListener('click', () => stopFilm(state));
      const restart = iconButton('Recommencer le film', 'restart');
      restart.addEventListener('click', () => playFilm(state, true));
      transport.append(state.play, stop, restart);
      const audio = document.createElement('div');
      audio.className = 'latin-film-audio';
      state.sound = iconButton('Couper le son', 'sound');
      state.sound.setAttribute('aria-pressed', 'true');
      state.sound.addEventListener('click', () => toggleSound(state));
      state.volume = document.createElement('input');
      state.volume.type = 'range';
      state.volume.className = 'latin-film-range latin-film-volume';
      state.volume.min = '0'; state.volume.max = '100'; state.volume.step = '1'; state.volume.value = '75';
      state.volume.setAttribute('aria-label', 'Volume');
      state.volume.addEventListener('input', () => {
        state.video.volume = Number(state.volume.value) / 100;
        state.video.muted = !state.video.volume;
        if (state.video.volume) state.lastVolume = state.video.volume;
        updateState(state); showControls(state);
      });
      const credit = document.createElement('a');
      credit.className = 'latin-film-credit';
      credit.href = 'media-credits.html'; credit.target = '_blank'; credit.rel = 'noopener';
      credit.textContent = 'Crédits';
      credit.setAttribute('aria-label', 'Crédits du film, nouvel onglet');
      audio.append(state.sound, state.volume, credit);
      state.fullscreen = iconButton('Plein écran', 'expand', 'latin-film-fullscreen');
      state.fullscreen.hidden = !state.overlay.requestFullscreen && !state.video.webkitEnterFullscreen;
      state.fullscreen.addEventListener('click', () => toggleFullscreen(state));
      row.append(transport, audio, state.fullscreen);
      state.panel.append(timeLabels, state.seek, row);
      state.overlay.append(state.panel);

      listen(state, state.overlay, 'pointermove', () => showControls(state), { passive: true });
      listen(state, state.overlay, 'pointerdown', () => { state.keyboardMode = false; showControls(state); }, { passive: true });
      listen(state, state.overlay, 'focusin', () => showControls(state));
      listen(state, state.overlay, 'focusout', () => queueMicrotask(() => { if (isActive(state)) scheduleHide(state); }));
      listen(state, state.panel, 'pointerenter', () => { if (finePointer.matches) { state.pointerOverControls = true; showControls(state); } }, { passive: true });
      listen(state, state.panel, 'pointerleave', () => { state.pointerOverControls = false; scheduleHide(state); }, { passive: true });
      listen(state, state.video, 'click', () => {
        if (state.mode === 'launch' || state.mode === 'stopped' || state.mode === 'ended') return;
        if (finePointer.matches) togglePlayback(state);
        else if (state.overlay.classList.contains('is-controls-hidden')) showControls(state);
        else if (canHideControls(state)) { clearHideTimer(state); state.overlay.classList.add('is-controls-hidden'); }
      });
      listen(state, state.seek, 'pointerdown', () => beginScrub(state));
      listen(state, state.seek, 'input', () => { beginScrub(state); seekTo(state, Number(state.seek.value)); });
      listen(state, state.seek, 'change', () => finishScrub(state));
      listen(state, window, 'pointerup', () => finishScrub(state), { passive: true });
      listen(state, window, 'pointercancel', () => finishScrub(state), { passive: true });
      listen(state, state.overlay, 'keydown', event => {
        state.keyboardMode = true;
        showControls(state);
        if (event.key === 'Tab') { trapFocus(state, event); return; }
        if (event.key === 'Escape') {
          if (document.fullscreenElement || state.video.webkitDisplayingFullscreen) return;
          event.preventDefault(); closeFilm(state); return;
        }
        if (event.target.matches('input')) return;
        const key = event.key.toLowerCase();
        if ((key === ' ' && !event.target.closest('button,a')) || key === 'k') { event.preventDefault(); togglePlayback(state); }
        else if (key === 'arrowleft' || key === 'arrowright') { event.preventDefault(); seekTo(state, state.video.currentTime + (key === 'arrowleft' ? -5 : 5)); }
        else if (key === 'm') { event.preventDefault(); toggleSound(state); }
        else if (key === 'f') { event.preventDefault(); toggleFullscreen(state); }
      });
      listen(state, state.video, 'loadedmetadata', () => { updateTimeline(state); updateFit(state); });
      listen(state, state.video, 'durationchange', () => updateTimeline(state));
      listen(state, state.video, 'timeupdate', () => updateTimeline(state));
      listen(state, state.video, 'volumechange', () => updateState(state));
      listen(state, state.video, 'playing', () => {
        state.started = true; state.mode = 'playing'; state.loading = false; state.status.hidden = true;
        clearLoadTimer(state); updateState(state);
      });
      listen(state, state.video, 'pause', () => {
        if (!isActive(state)) return;
        if (state.mode === 'playing' && !state.scrubbing && !state.video.ended) state.mode = 'paused';
        updateState(state);
      });
      listen(state, state.video, 'waiting', () => {
        if (!isActive(state) || state.video.paused || state.scrubbing) return;
        state.loading = true; state.status.hidden = false; updateState(state); armLoadTimer(state);
      });
      listen(state, state.video, 'stalled', () => { if (!state.video.paused && state.video.readyState < 3) armLoadTimer(state); });
      listen(state, state.video, 'ended', () => {
        if (!isActive(state)) return;
        state.mode = 'ended'; state.userPaused = true; state.loading = false; state.status.hidden = true;
        clearLoadTimer(state); updateState(state);
      });
      listen(state, state.video, 'error', () => closeFilm(state, false));
      listen(state, document, 'fullscreenchange', () => updateFullscreen(state));
      listen(state, state.video, 'webkitbeginfullscreen', () => updateFullscreen(state));
      listen(state, state.video, 'webkitendfullscreen', () => updateFullscreen(state));
      listen(state, window, 'resize', () => updateFit(state), { passive: true });

      [...document.body.children].forEach(element => { state.inertElements.push({ element, inert: element.inert }); element.inert = true; });
      document.body.append(state.overlay);
      document.body.style.overflow = 'hidden';
      root.classList.add('intro-running');
      window.latinIntroState = 'running';
      state.overlay.focus({ preventScroll: true });
      state.video.src = state.portrait ? MOBILE_MEDIA : MEDIA;
      updateFit(state);
      updateState(state);
      if (replay) playFilm(state);
    } catch {
      if (state.video && state.overlay && state.style) closeFilm(state, false);
      else {
        state.events.abort(); state.overlay?.remove(); state.style?.remove();
        state.inertElements.forEach(({ element, inert }) => { element.inert = inert; });
        document.body.style.overflow = state.previousOverflow;
        root.classList.remove('intro-running'); current = null; markFinished();
      }
    }
  }

  function init() {
    document.querySelectorAll('[data-intro-replay]').forEach(control => control.addEventListener('click', () => startFilm(true)));
    document.addEventListener('visibilitychange', () => {
      if (!current) { if (!document.hidden && window.latinIntroState === 'pending') startFilm(pendingReplay); return; }
      if (document.hidden) {
        current.resumeAfterVisibility = !current.video.paused;
        clearLoadTimer(current); clearHideTimer(current); current.video.pause();
      } else if (current.resumeAfterVisibility && !current.userPaused) {
        current.resumeAfterVisibility = false; playFilm(current);
      }
    });
    window.addEventListener('pagehide', () => { if (current) closeFilm(current, false); });
    const preferenceChange = () => {
      if (!reducedMotion.matches || !current) return;
      if (current.exit) { current.exit.cancel(); cleanup(current); }
      else closeFilm(current, false);
    };
    if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', preferenceChange);
    else if (reducedMotion.addListener) reducedMotion.addListener(preferenceChange);
    startFilm();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
