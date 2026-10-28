'use strict';

(() => {
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const MEDIA = 'assets/latin-intro.mp4?v=6';
  const POSTER = 'assets/latin-intro-poster.webp?v=6';
  const MOBILE_MEDIA = 'assets/latin-intro-mobile.mp4?v=6';
  const MOBILE_POSTER = 'assets/latin-intro-mobile-poster.webp?v=6';
  const LOAD_TIMEOUT_MS = 12000;
  const HIDE_DELAY_MS = 2600;
  let current = null;
  let pendingReplay = false;

  const icons = {
    play: '<path d="m9 5 11 7-11 7z" fill="currentColor" stroke="none"/>',
    pause: '<path d="M8 5v14M16 5v14" stroke-width="3.5"/>',
    sound: '<path d="m11 5-5 4H3v6h3l5 4zM15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14"/>',
    muted: '<path d="m11 5-5 4H3v6h3l5 4zM16 9l5 6M16 15l5-6"/>',
    expand: '<path d="M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5"/>',
    contract: '<path d="M3 8h5V3M21 8h-5V3M8 21v-5H3M16 21v-5h5"/>',
    settings: '<path d="m10 3-.5 2a7 7 0 0 0-1.8 1L5.8 5.5 3.9 8.8l1.5 1.4a7 7 0 0 0 0 2.1L3.9 14l1.9 3.3 1.9-.5a7 7 0 0 0 1.8 1l.5 2.1h4l.5-2.1a7 7 0 0 0 1.8-1l1.9.5 1.9-3.3-1.5-1.6a7 7 0 0 0 0-2.1l1.5-1.5-1.9-3.3-1.9.5a7 7 0 0 0-1.8-1L14 3z"/><circle cx="12" cy="11.5" r="3"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>',
    arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>'
  };

  const css = `
    html.intro-running { scrollbar-gutter:auto; }
    .latin-film { position:fixed; inset:0; width:100vw; height:100vh; height:100dvh; z-index:1000; overflow:hidden; isolation:isolate; background:#000; color:#fff; outline:none; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif; }
    .latin-film *, .latin-film *::before, .latin-film *::after { box-sizing:border-box; }
    .latin-film-poster, .latin-film-video { position:absolute; inset:0; display:block; width:100%; height:100%; object-fit:contain; background:#000; }
    .latin-film.is-cover .latin-film-poster, .latin-film.is-cover .latin-film-video { object-fit:cover; }
    .latin-film-poster { display:none; }
    .latin-film-video { transition:opacity .45s; }
    .latin-film.is-launch .latin-film-video, .latin-film.has-ended .latin-film-video { opacity:0; }
    .latin-film-shade { position:absolute; inset:0; pointer-events:none; background:linear-gradient(transparent 66%,#0009 100%); transition:opacity .35s; }
    .latin-film.is-launch .latin-film-shade, .latin-film.has-ended .latin-film-shade { background:none; }
    .latin-film button, .latin-film a, .latin-film input { font:inherit; }
    .latin-film button, .latin-film a { -webkit-tap-highlight-color:transparent; touch-action:manipulation; }
    .latin-film button { display:inline-flex; align-items:center; justify-content:center; gap:11px; color:inherit; border:0; background:none; cursor:pointer; }
    .latin-film button:disabled { cursor:default; opacity:.4; }
    .latin-film a { color:inherit; text-decoration:none; }
    .latin-film :is(button,a,input):focus-visible { outline:2px solid #fff; outline-offset:4px; }
    .latin-film svg { display:block; width:22px; height:22px; flex-shrink:0; fill:none; stroke:currentColor; stroke-width:1.8; stroke-linecap:round; stroke-linejoin:round; }
    .latin-film-top { position:absolute; inset:0 0 auto; z-index:3; display:flex; align-items:center; justify-content:flex-end; padding:20px 24px; pointer-events:none; transition:opacity .3s,transform .3s; }
    .latin-film-close { width:44px; height:44px; padding:12px; border-radius:50%; pointer-events:auto; opacity:.7; transition:opacity .2s,background .2s; }
    .latin-film-close:hover { opacity:1; background:#ffffff16; }
    .latin-film-close svg { width:20px; height:20px; }
    .latin-film-card { position:absolute; z-index:2; top:50%; left:20px; right:20px; transform:translateY(-50%); text-align:center; animation:latin-film-card-in .7s cubic-bezier(.16,1,.3,1) backwards; }
    .latin-film-card-actions { display:flex; justify-content:center; align-items:center; flex-direction:column; gap:24px; }
    .latin-film-primary { width:88px; height:88px; padding:16px!important; border-radius:50%; transition:transform .45s cubic-bezier(.16,1,.3,1),background .25s; }
    .latin-film-primary:hover { transform:scale(1.12); background:#ffffff0c; }
    .latin-film-primary svg { width:50px; height:50px; margin-left:5px; }
    .latin-film-primary-label { position:absolute; width:1px; height:1px; overflow:hidden; clip-path:inset(50%); }
    .latin-film.has-ended .latin-film-primary { width:auto; min-height:54px; height:auto; padding:14px 24px!important; border:1px solid #ffffff40; border-radius:999px; font-size:13px; }
    .latin-film.has-ended .latin-film-primary svg { width:20px; height:20px; margin:0; }
    .latin-film.has-ended .latin-film-primary-label { position:static; width:auto; height:auto; clip-path:none; }
    .latin-film-explore { min-height:44px; padding:10px 15px!important; font-size:12px!important; color:#aaa!important; transition:color .2s; }
    .latin-film-explore:hover { color:#fff!important; }
    .latin-film-explore svg { width:17px; height:17px; }
    .latin-film-status { position:absolute; z-index:4; left:20px; right:20px; top:50%; margin:0; transform:translateY(-50%); color:#aaa; font-size:12px; text-align:center; }
    .latin-film-panel { position:absolute; z-index:3; bottom:0; left:0; right:0; margin:0; padding:0 max(16px,env(safe-area-inset-right)) max(12px,env(safe-area-inset-bottom)) max(16px,env(safe-area-inset-left)); transition:opacity .3s,transform .3s; animation:latin-film-panel-in .65s cubic-bezier(.16,1,.3,1) .15s backwards; }
    .latin-film-range { display:block; appearance:none; -webkit-appearance:none; min-width:0; height:44px; margin:0; padding:0; border:0; background:transparent; cursor:pointer; accent-color:#fff; }
    .latin-film-range::-webkit-slider-runnable-track { height:3px; border-radius:3px; background:linear-gradient(to right,#fff 0 var(--range-progress,0%),#ffffff38 var(--range-progress,0%) 100%); }
    .latin-film-range::-moz-range-track { height:3px; border-radius:3px; background:linear-gradient(to right,#fff 0 var(--range-progress,0%),#ffffff38 var(--range-progress,0%) 100%); }
    .latin-film-range::-webkit-slider-thumb { appearance:none; -webkit-appearance:none; width:12px; height:12px; margin-top:-4.5px; border:0; border-radius:50%; background:#fff; }
    .latin-film-range::-moz-range-thumb { width:12px; height:12px; border:0; border-radius:50%; background:#fff; }
    .latin-film-seek { width:100%; height:36px; margin:0; }
    .latin-film-seek::-webkit-slider-thumb { width:11px; height:11px; margin-top:-4px; background:#ddd; }
    .latin-film-seek::-moz-range-thumb { width:11px; height:11px; background:#ddd; }
    .latin-film-seek:disabled { cursor:default; opacity:.35; }
    .latin-film-controls-row { display:flex; align-items:center; justify-content:space-between; min-height:44px; gap:16px; }
    .latin-film-left, .latin-film-right, .latin-film-audio { display:flex; align-items:center; gap:5px; }
    .latin-film-left { min-width:0; }
    .latin-film-right { flex-shrink:0; gap:8px; }
    .latin-film-audio { gap:9px; }
    .latin-film-icon-button { width:44px; height:44px; padding:10px; border-radius:8px; transition:background .2s,opacity .2s; }
    .latin-film-icon-button:hover { background:#ffffff12; }
    .latin-film-play svg { width:24px; height:24px; }
    .latin-film-volume { width:95px; }
    .latin-film-volume-value { width:34px; margin-left:1px; color:#bbb; font-size:10px; text-align:left; font-variant-numeric:tabular-nums; }
    .latin-film-time { display:flex; align-items:center; gap:4px; flex-shrink:0; margin-left:16px; padding:10px 17px; border-radius:999px; color:#ddd; background:#ffffff0b; font-size:11px; font-weight:550; font-variant-numeric:tabular-nums; line-height:1.5; white-space:nowrap; }
    .latin-film-settings { position:absolute; right:68px; bottom:calc(100% - 6px); width:245px; max-height:calc(100dvh - 130px); overflow:auto; padding:8px; border:1px solid #ffffff18; border-radius:12px; background:#161616f5; box-shadow:0 14px 60px #0008; backdrop-filter:blur(16px); }
    .latin-film-tabs { display:flex; gap:3px; padding:3px 3px 7px; border-bottom:1px solid #ffffff10; margin-bottom:5px; }
    .latin-film-tabs button { min-height:36px; flex:1; border-radius:7px; font-size:11px; color:#999; }
    .latin-film-tabs button[aria-pressed="true"] { background:#ffffff0d; color:#fff; }
    .latin-film-chapters { max-height:min(380px,calc(100dvh - 205px)); overflow-y:auto; scrollbar-width:thin; scrollbar-color:#555 transparent; }
    .latin-film-chapter { width:100%; min-height:48px; display:grid!important; grid-template-columns:32px 1fr; gap:9px!important; padding:9px 9px!important; border-radius:7px; text-align:left; font-size:12px!important; line-height:1.45; }
    .latin-film-chapter:hover, .latin-film-chapter.is-current { background:#ffffff0c; }
    .latin-film-chapter.is-current { color:#fff; }
    .latin-film-chapter-time { align-self:start; padding-top:2px; color:#888; font-size:9px; font-variant-numeric:tabular-nums; }
    .latin-film-settings-title { margin:10px 10px 9px; color:#888; font-size:10px; letter-spacing:.06em; }
    .latin-film-speeds { display:grid; grid-template-columns:repeat(4,1fr); gap:3px; margin:0 4px 8px; }
    .latin-film-speeds button { min-height:40px; padding:7px 2px; border-radius:7px; color:#aaa; font-size:12px; }
    .latin-film-speeds button:hover { background:#ffffff10; }
    .latin-film-speeds button[aria-pressed="true"] { color:#fff; background:#ffffff18; }
    .latin-film-credit { display:flex; align-items:center; min-height:42px; padding:10px 12px; margin-top:5px; border-top:1px solid #ffffff10; color:#999!important; font-size:11px!important; }
    .latin-film-credit:hover { color:#fff!important; }
    .latin-film.is-controls-hidden { cursor:none; }
    .latin-film.is-controls-hidden .latin-film-top { opacity:0; transform:translateY(-6px); pointer-events:none; }
    .latin-film.is-controls-hidden .latin-film-top button { pointer-events:none; }
    .latin-film.is-controls-hidden .latin-film-panel { opacity:0; transform:translateY(8px); pointer-events:none; }
    .latin-film.is-controls-hidden .latin-film-shade { opacity:0; }
    .latin-film-description { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip-path:inset(50%); white-space:nowrap; }
    .latin-film [hidden] { display:none!important; }
    @keyframes latin-film-card-in { from { opacity:0; } to { opacity:1; } }
    @keyframes latin-film-panel-in { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
    @media(max-width:700px) {
      .latin-film-top { padding:12px; }
      .latin-film-panel { padding-inline:12px; padding-bottom:max(8px,env(safe-area-inset-bottom)); }
      .latin-film-controls-row { gap:2px; }
      .latin-film-left, .latin-film-right { gap:0; }
      .latin-film-audio { gap:4px; }
      .latin-film-volume { width:58px; }
      .latin-film-volume-value { width:28px; font-size:9px; }
      .latin-film-time { margin-left:8px; padding:9px 12px; gap:3px; font-size:10px; }
      .latin-film-settings { right:50px; width:235px; }
    }
    @media(max-width:380px) {
      .latin-film-panel { padding-inline:8px; }
      .latin-film-volume { width:44px; }
      .latin-film-volume-value { display:none; }
      .latin-film-time { margin-left:5px; padding:9px 8px; font-size:9px; }
      .latin-film-audio { gap:2px; }
      .latin-film-right .latin-film-icon-button { width:40px; }
    }
    @media(max-height:450px) {
      .latin-film-top { padding-block:5px; }
      .latin-film-panel { padding-bottom:4px; }
      .latin-film-seek { height:28px; }
      .latin-film-settings { max-height:calc(100dvh - 110px); }
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
    return isActive(state) && state.mode === 'playing' && !state.video.paused && !state.loading && !state.scrubbing && !state.pointerOverControls && state.settings.hidden && !(state.keyboardMode && state.overlay.contains(document.activeElement) && document.activeElement !== state.overlay && document.activeElement !== state.video);
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
    state.chapterButtons?.forEach(({ button, chapter }) => {
      const active = time >= chapter.start && time < chapter.end;
      button.classList.toggle('is-current', active);
      if (active) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    });
  }

  function updateState(state) {
    if (!isActive(state)) return;
    const mode = state.mode;
    const cardVisible = ['launch', 'ended'].includes(mode);
    state.overlay.classList.toggle('is-launch', mode === 'launch');
    state.overlay.classList.toggle('has-ended', mode === 'ended');
    state.card.hidden = !cardVisible || state.loading;
    state.explore.hidden = mode !== 'ended';
    const primaryLabel = mode === 'ended' ? 'Revoir le film' : 'Lancer le film';
    state.primaryLabel.textContent = primaryLabel;
    state.primary.setAttribute('aria-label', primaryLabel);
    const playing = !state.video.paused && mode === 'playing';
    setButton(state.play, playing ? 'Mettre le film en pause' : (state.started && mode !== 'ended' ? 'Reprendre le film' : 'Lire le film'), playing ? 'pause' : 'play');
    const audible = !state.video.muted && state.video.volume > 0;
    setButton(state.sound, audible ? 'Couper le son' : 'Activer le son', audible ? 'sound' : 'muted');
    state.sound.setAttribute('aria-pressed', String(audible));
    state.volume.value = String(Math.round(state.video.volume * 100));
    state.volumeValue.textContent = `${state.video.muted ? 0 : Math.round(state.video.volume * 100)}%`;
    state.volume.style.setProperty('--range-progress', `${state.video.volume * 100}%`);
    updateTimeline(state);
    if (mode !== 'playing' || state.loading) {
      clearHideTimer(state);
      state.overlay.classList.remove('is-controls-hidden');
    } else scheduleHide(state);
  }

  async function playFilm(state) {
    if (!isActive(state) || document.hidden) return;
    if (state.card.contains(document.activeElement)) state.overlay.focus({ preventScroll: true });
    if (state.mode === 'ended') state.video.currentTime = 0;
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

  function togglePlayback(state) {
    if (!isActive(state)) return;
    if (state.video.paused || state.mode === 'ended') playFilm(state);
    else pauseFilm(state);
  }

  function toggleSound(state) {
    if (!isActive(state)) return;
    if (state.video.muted || !state.video.volume) {
      if (!state.video.volume) state.video.volume = state.lastVolume || 1;
      state.video.muted = false;
    } else state.video.muted = true;
    updateState(state);
    showControls(state);
  }

  function seekTo(state, value) {
    if (!isActive(state) || !Number.isFinite(state.video.duration)) return;
    state.video.currentTime = Math.max(0, Math.min(state.video.duration, value));
    if (state.mode === 'ended' || state.mode === 'launch') state.mode = 'paused';
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

  function openSettings(state, view) {
    if (!isActive(state)) return;
    state.settingsView = view === 'chapters' && state.chapterButtons.length ? 'chapters' : 'playback';
    state.settings.hidden = false;
    state.settingsToggle.setAttribute('aria-expanded', 'true');
    state.playbackSettings.hidden = state.settingsView !== 'playback';
    state.chapterSettings.hidden = state.settingsView !== 'chapters';
    state.playbackTab.setAttribute('aria-pressed', String(state.settingsView === 'playback'));
    state.chaptersTab.setAttribute('aria-pressed', String(state.settingsView === 'chapters'));
    showControls(state);
    if (state.keyboardMode) (state.settingsView === 'chapters' ? state.chaptersTab : state.playbackTab).focus();
  }

  function closeSettings(state, restoreFocus = true) {
    if (!isActive(state)) return;
    const containedFocus = state.settings.contains(document.activeElement);
    state.settings.hidden = true;
    state.settingsToggle.setAttribute('aria-expanded', 'false');
    if (restoreFocus && containedFocus) state.settingsToggle.focus({ preventScroll: true });
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
    const elements = [...state.overlay.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled)')].filter(element => !element.closest('[hidden]') && element.getClientRects().length);
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
      keyboardMode: false, pointerOverControls: false, lastVolume: 1, settingsView: 'playback', chapterButtons: [],
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
      state.video.volume = 1;
      state.video.poster = poster.src;
      state.video.tabIndex = -1;
      state.video.setAttribute('aria-label', 'LATIN — le film des treize citations');
      state.overlay.append(state.video);
      const shade = document.createElement('div');
      shade.className = 'latin-film-shade';
      shade.setAttribute('aria-hidden', 'true');
      state.overlay.append(shade);
      const description = document.createElement('p');
      description.id = 'latin-film-description';
      description.className = 'latin-film-description';
      description.textContent = 'Treize citations latines et leurs traductions, avec musique instrumentale. Le son est activé à 100 % au lancement. Vous pouvez mettre en pause, choisir une citation dans les paramètres, régler le volume, la vitesse et le plein écran. Raccourcis : espace ou K pour la lecture, flèches pour avancer ou reculer, M pour le son, F pour le plein écran, Échap pour fermer. Les sources figurent dans les crédits.';
      state.overlay.append(description);

      const header = document.createElement('div');
      header.className = 'latin-film-top';
      const close = iconButton('Fermer le film', 'close', 'latin-film-close');
      close.addEventListener('click', () => closeFilm(state));
      header.append(close);
      state.overlay.append(header);

      state.card = document.createElement('div');
      state.card.className = 'latin-film-card';
      const actions = document.createElement('div');
      actions.className = 'latin-film-card-actions';
      state.primary = document.createElement('button');
      state.primary.type = 'button';
      state.primary.className = 'latin-film-primary';
      state.primary.setAttribute('aria-label', 'Lancer le film');
      state.primaryLabel = document.createElement('span');
      state.primaryLabel.className = 'latin-film-primary-label';
      state.primaryLabel.textContent = 'Lancer le film';
      state.primary.append(icon('play'), state.primaryLabel);
      state.primary.addEventListener('click', () => playFilm(state));
      state.explore = document.createElement('button');
      state.explore.type = 'button';
      state.explore.className = 'latin-film-explore';
      state.explore.append(document.createTextNode('Explorer le site'), icon('arrow'));
      state.explore.hidden = true;
      state.explore.addEventListener('click', () => closeFilm(state));
      actions.append(state.primary, state.explore);
      state.card.append(actions);
      state.overlay.append(state.card);
      state.status = document.createElement('p');
      state.status.className = 'latin-film-status';
      state.status.setAttribute('role', 'status');
      state.status.textContent = 'Chargement du film…';
      state.status.hidden = true;
      state.overlay.append(state.status);

      state.panel = document.createElement('div');
      state.panel.className = 'latin-film-panel';
      state.seek = document.createElement('input');
      state.seek.type = 'range';
      state.seek.className = 'latin-film-range latin-film-seek';
      state.seek.min = '0'; state.seek.max = '1'; state.seek.step = '.1'; state.seek.value = '0';
      state.seek.disabled = true;
      state.seek.setAttribute('aria-label', 'Progression du film');
      const row = document.createElement('div');
      row.className = 'latin-film-controls-row';
      const left = document.createElement('div');
      left.className = 'latin-film-left';
      const right = document.createElement('div');
      right.className = 'latin-film-right';
      state.play = iconButton('Lire le film', 'play', 'latin-film-play');
      state.play.addEventListener('click', () => togglePlayback(state));
      const audio = document.createElement('div');
      audio.className = 'latin-film-audio';
      state.sound = iconButton('Couper le son', 'sound');
      state.sound.setAttribute('aria-pressed', 'true');
      state.sound.addEventListener('click', () => toggleSound(state));
      state.volume = document.createElement('input');
      state.volume.type = 'range';
      state.volume.className = 'latin-film-range latin-film-volume';
      state.volume.min = '0'; state.volume.max = '100'; state.volume.step = '1'; state.volume.value = '100';
      state.volume.setAttribute('aria-label', 'Volume');
      state.volume.addEventListener('input', () => {
        state.video.volume = Number(state.volume.value) / 100;
        state.video.muted = !state.video.volume;
        if (state.video.volume) state.lastVolume = state.video.volume;
        updateState(state); showControls(state);
      });
      state.volumeValue = document.createElement('span');
      state.volumeValue.className = 'latin-film-volume-value';
      state.volumeValue.setAttribute('aria-hidden', 'true');
      audio.append(state.sound, state.volume, state.volumeValue);
      const time = document.createElement('div');
      time.className = 'latin-film-time';
      time.setAttribute('aria-hidden', 'true');
      state.elapsed = document.createElement('span');
      state.elapsed.textContent = '0:00';
      state.duration = document.createElement('span');
      state.duration.textContent = '—:—';
      time.append(state.elapsed, document.createTextNode(' / '), state.duration);
      left.append(state.play, audio, time);
      state.settingsToggle = iconButton('Réglages du film', 'settings');
      state.settingsToggle.setAttribute('aria-expanded', 'false');
      state.settingsToggle.setAttribute('aria-controls', 'latin-film-settings');
      state.settingsToggle.addEventListener('click', () => {
        if (!state.settings.hidden) closeSettings(state);
        else openSettings(state, 'playback');
      });
      state.fullscreen = iconButton('Plein écran', 'expand', 'latin-film-fullscreen');
      state.fullscreen.hidden = !state.overlay.requestFullscreen && !state.video.webkitEnterFullscreen;
      state.fullscreen.addEventListener('click', () => toggleFullscreen(state));
      right.append(state.settingsToggle, state.fullscreen);
      row.append(left, right);
      state.settings = document.createElement('div');
      state.settings.id = 'latin-film-settings';
      state.settings.className = 'latin-film-settings';
      state.settings.setAttribute('role', 'group');
      state.settings.setAttribute('aria-label', 'Réglages et chapitres du film');
      state.settings.hidden = true;
      const tabs = document.createElement('div');
      tabs.className = 'latin-film-tabs';
      state.playbackTab = document.createElement('button');
      state.playbackTab.type = 'button'; state.playbackTab.textContent = 'Lecture';
      state.playbackTab.addEventListener('click', () => openSettings(state, 'playback'));
      state.chaptersTab = document.createElement('button');
      state.chaptersTab.type = 'button'; state.chaptersTab.textContent = 'Chapitres'; state.chaptersTab.hidden = true;
      state.chaptersTab.addEventListener('click', () => openSettings(state, 'chapters'));
      tabs.append(state.playbackTab, state.chaptersTab);
      state.playbackSettings = document.createElement('div');
      const speedTitle = document.createElement('p');
      speedTitle.className = 'latin-film-settings-title'; speedTitle.textContent = 'Vitesse de lecture';
      const speeds = document.createElement('div');
      speeds.className = 'latin-film-speeds';
      state.speedButtons = [.75, 1, 1.25, 1.5].map(rate => {
        const button = document.createElement('button'); button.type = 'button';
        button.textContent = `${String(rate).replace('.', ',')}×`;
        button.setAttribute('aria-label', `Vitesse ${String(rate).replace('.', ',')} fois`);
        button.setAttribute('aria-pressed', String(rate === 1));
        button.addEventListener('click', () => {
          state.video.playbackRate = rate;
          state.speedButtons.forEach(({ button: option, rate: value }) => option.setAttribute('aria-pressed', String(value === rate)));
          showControls(state);
        });
        speeds.append(button);
        return { button, rate };
      });
      const credit = document.createElement('a');
      credit.className = 'latin-film-credit'; credit.href = 'media-credits.html'; credit.target = '_blank'; credit.rel = 'noopener';
      credit.textContent = 'Sources et crédits'; credit.setAttribute('aria-label', 'Crédits du film, nouvel onglet');
      state.playbackSettings.append(speedTitle, speeds, credit);
      state.chapterSettings = document.createElement('div'); state.chapterSettings.className = 'latin-film-chapters'; state.chapterSettings.hidden = true;
      state.settings.append(tabs, state.playbackSettings, state.chapterSettings);
      state.panel.append(state.seek, row, state.settings);
      state.overlay.append(state.panel);
      fetch(new URL('film/chapters.json?v=6', document.baseURI), { signal: state.events.signal })
        .then(response => { if (!response.ok) throw new Error('Chapters unavailable'); return response.json(); })
        .then(data => {
          if (!isActive(state) || !Array.isArray(data.chapters)) return;
          const chapters = data.chapters.filter(chapter => Number.isFinite(chapter.start) && Number.isFinite(chapter.end) && chapter.end > chapter.start && typeof chapter.latin === 'string');
          chapters.forEach((chapter, index) => {
            const button = document.createElement('button'); button.type = 'button'; button.className = 'latin-film-chapter';
            const stamp = document.createElement('span'); stamp.className = 'latin-film-chapter-time'; stamp.textContent = formatTime(chapter.start);
            const text = document.createElement('span'); text.textContent = chapter.latin;
            button.append(stamp, text); button.setAttribute('aria-label', `${index + 1}. ${chapter.latin} À ${formatTime(chapter.start)}`);
            button.addEventListener('click', () => { closeSettings(state); seekTo(state, chapter.start); playFilm(state); });
            state.chapterSettings.append(button); state.chapterButtons.push({ button, chapter });
          });
          state.chaptersTab.hidden = !chapters.length;
          updateTimeline(state);
        }).catch(() => {});

      listen(state, state.overlay, 'pointermove', () => showControls(state), { passive: true });
      listen(state, state.overlay, 'pointerdown', event => {
        state.keyboardMode = false;
        if (!state.settings.hidden && !state.settings.contains(event.target) && !state.settingsToggle.contains(event.target)) closeSettings(state, false);
        showControls(state);
      }, { passive: true });
      listen(state, state.overlay, 'focusin', () => showControls(state));
      listen(state, state.overlay, 'focusout', () => queueMicrotask(() => { if (isActive(state)) scheduleHide(state); }));
      listen(state, state.panel, 'pointerenter', () => { if (finePointer.matches) { state.pointerOverControls = true; showControls(state); } }, { passive: true });
      listen(state, state.panel, 'pointerleave', () => { state.pointerOverControls = false; scheduleHide(state); }, { passive: true });
      listen(state, state.video, 'click', () => {
        if (state.mode === 'launch' || state.mode === 'ended') return;
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
          if (!state.settings.hidden) { event.preventDefault(); closeSettings(state); return; }
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
