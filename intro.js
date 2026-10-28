'use strict';

(() => {
  const root = document.documentElement;
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let overlay = null;
  let style = null;
  let finished = false;
  let revealStarted = false;
  let safetyTimer = 0;
  let openingTimer = 0;
  let endTimer = 0;
  let previousOverflow = '';
  let previousFocus = null;
  const animations = [];
  const inertElements = [];

  function emit(name) {
    document.dispatchEvent(new CustomEvent(name));
  }

  function beginReveal() {
    if (revealStarted) return;
    revealStarted = true;
    window.latinIntroState = 'revealing';
    emit('latin:intro-reveal');
  }

  function finish() {
    if (finished) return;
    finished = true;
    clearTimeout(safetyTimer);
    clearTimeout(openingTimer);
    clearTimeout(endTimer);
    beginReveal();
    animations.forEach(animation => animation.cancel());
    animations.length = 0;
    root.classList.remove('intro-running');
    if (overlay) {
      document.body.style.overflow = previousOverflow;
      inertElements.forEach(({ element, inert }) => { element.inert = inert; });
      overlay.remove();
      if (previousFocus && previousFocus !== document.body && previousFocus.isConnected) {
        previousFocus.focus({ preventScroll: true });
      }
    }
    style?.remove();
    overlay = null;
    style = null;
    inertElements.length = 0;
    window.latinIntroState = 'finished';
    emit('latin:intro-finished');
  }

  function animate(element, keyframes, options) {
    const animation = element.animate(keyframes, { fill: 'both', ...options });
    animations.push(animation);
    return animation;
  }

  function openCurtains() {
    if (finished) return;
    beginReveal();
    try {
      overlay.querySelectorAll('.latin-intro-half').forEach((half, index) => {
        animate(half, [
          { transform: 'translate3d(0,0,0)' },
          { transform: `translate3d(${index === 0 ? '-101%' : '101%'},0,0)` }
        ], { duration: 780, easing: 'cubic-bezier(.76,0,.24,1)' });
      });
      animate(overlay.querySelector('.latin-intro-skip'), [{ opacity: 1 }, { opacity: 0 }], { duration: 200 });
      endTimer = window.setTimeout(finish, 790);
    } catch {
      finish();
    }
  }

  function start(replay = false) {
    if (overlay) return;
    if (document.hidden) {
      window.latinIntroState = 'pending';
      return;
    }
    const deepLink = !replay && location.hash && location.hash !== '#accueil';
    const staticIntro = motionPreference.matches || typeof Element.prototype.animate !== 'function';
    if (deepLink || (staticIntro && !replay)) {
      finish();
      return;
    }

    finished = false;
    revealStarted = false;
    try {
      previousFocus = document.activeElement;
      previousOverflow = document.body.style.overflow;
      window.latinIntroState = 'running';
      root.classList.add('intro-running');
      safetyTimer = window.setTimeout(finish, 6000);
      style = document.createElement('style');
      style.textContent = `
        .latin-intro { position:fixed; inset:0; width:100vw; z-index:1000; overflow:hidden; color:#f8f5f0; background:transparent; outline:none; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif; }
        .latin-intro-half { position:absolute; inset-block:0; width:50%; overflow:hidden; background:#121414; }
        .latin-intro-half:first-child { left:0; }
        .latin-intro-half:nth-child(2) { right:0; }
        .latin-intro-scene { position:absolute; inset-block:0; left:0; width:100vw; overflow:hidden; background:#121414; }
        .latin-intro-half:nth-child(2) .latin-intro-scene { left:-50vw; }
        .latin-intro-image { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; object-position:50% 36%; opacity:.8; transform:scale(1.07); }
        .latin-intro-shade { position:absolute; inset:0; background:linear-gradient(90deg,#121414 4%,#121414d9 22%,#12141420 68%),linear-gradient(0deg,#121414c9 0%,transparent 65%); }
        .latin-intro-title { position:absolute; left:5.4vw; right:5.4vw; bottom:9vh; display:flex; justify-content:space-between; margin:0; font-size:clamp(115px,28vw,450px); font-weight:500; line-height:.85; letter-spacing:-.075em; }
        .latin-intro-letter-mask { display:block; overflow:clip; padding-block:.04em; margin-block:-.04em; }
        .latin-intro-letter { display:block; transform-origin:50% 100%; }
        .latin-intro-skip { position:absolute; top:30px; right:5.5vw; display:flex; gap:16px; align-items:center; min-height:44px; padding:8px 0 8px 15px; border:0; background:transparent; color:#f8f5f0; font:500 11px -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif; cursor:pointer; }
        .latin-intro-skip svg { width:18px; height:18px; fill:none; stroke:currentColor; stroke-width:1.5; }
        .latin-intro-skip:focus-visible { outline:2px solid #b59a45; outline-offset:6px; }
        @media(max-width:760px) {
          .latin-intro-image { left:0; width:100%; object-position:51% 33%; }
          .latin-intro-shade { background:linear-gradient(0deg,#121414ed 0%,#12141430 70%); }
          .latin-intro-title { left:5.5vw; right:5.5vw; bottom:13vh; font-size:27vw; }
          .latin-intro-skip { top:20px; }
        }
      `;
      document.head.append(style);
      overlay = document.createElement('div');
      overlay.className = 'latin-intro';
      overlay.tabIndex = -1;
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-label', 'Introduction de LATIN');
      const source = document.querySelector('.portrait-parallax > img')?.getAttribute('src') || 'assets/roman-portrait.webp';
      for (let index = 0; index < 2; index += 1) {
        const half = document.createElement('div');
        half.className = 'latin-intro-half';
        half.setAttribute('aria-hidden', 'true');
        const scene = document.createElement('div');
        scene.className = 'latin-intro-scene';
        const image = document.createElement('img');
        image.className = 'latin-intro-image';
        image.src = source;
        image.alt = '';
        image.decoding = 'async';
        image.addEventListener('error', () => { if (overlay?.contains(image)) finish(); }, { once: true });
        scene.append(image);
        const shade = document.createElement('div');
        shade.className = 'latin-intro-shade';
        scene.append(shade);
        const title = document.createElement('p');
        title.className = 'latin-intro-title';
        [...'LATIN'].forEach(letter => {
          const mask = document.createElement('span');
          mask.className = 'latin-intro-letter-mask';
          const inner = document.createElement('span');
          inner.className = 'latin-intro-letter';
          inner.textContent = letter;
          mask.append(inner);
          title.append(mask);
        });
        scene.append(title);
        half.append(scene);
        overlay.append(half);
      }
      const skip = document.createElement('button');
      skip.className = 'latin-intro-skip';
      skip.type = 'button';
      skip.textContent = 'Passer';
      const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      arrow.setAttribute('aria-hidden', 'true');
      arrow.setAttribute('viewBox', '0 0 24 24');
      arrow.innerHTML = '<path d="M6 18 18 6M6 6h12v12"/>';
      skip.append(arrow);
      skip.addEventListener('click', finish);
      overlay.append(skip);
      overlay.addEventListener('keydown', event => {
        if (event.key === 'Escape') { event.preventDefault(); finish(); }
        if (event.key === 'Tab') { event.preventDefault(); skip.focus({ preventScroll: true }); }
      });
      [...document.body.children].forEach(element => {
        inertElements.push({ element, inert: element.inert });
        element.inert = true;
      });
      document.body.append(overlay);
      document.body.style.overflow = 'hidden';
      overlay.focus({ preventScroll: true });
      if (staticIntro) return;
      overlay.querySelectorAll('.latin-intro-image').forEach(image => {
        animate(image, [
          { opacity: 0, transform: 'scale(1.26) translate3d(2%,1%,0)' },
          { opacity: .8, offset: .3, transform: 'scale(1.16) translate3d(1%,0,0)' },
          { opacity: .8, transform: 'scale(1.07) translate3d(0,0,0)' }
        ], { duration: 2800, easing: 'cubic-bezier(.2,.55,.3,1)' });
      });
      overlay.querySelectorAll('.latin-intro-title').forEach(title => {
        title.querySelectorAll('.latin-intro-letter').forEach((letter, index) => {
          animate(letter, [
            { transform: 'translate3d(0,115%,0) rotate(5deg)' },
            { transform: 'translate3d(0,0,0) rotate(0deg)' }
          ], { duration: 1050, delay: 380 + index * 55, easing: 'cubic-bezier(.16,1,.3,1)' });
        });
      });
      openingTimer = window.setTimeout(openCurtains, 2050);
    } catch {
      finish();
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && overlay) finish();
    else if (!document.hidden && window.latinIntroState === 'pending') start();
  });
  document.querySelectorAll('[data-intro-replay]').forEach(button => button.addEventListener('click', () => start(true)));
  window.addEventListener('pagehide', () => { if (overlay) finish(); }, { once: true });
  const onPreferenceChange = () => { if (motionPreference.matches) finish(); };
  if (typeof motionPreference.addEventListener === 'function') motionPreference.addEventListener('change', onPreferenceChange);
  else if (typeof motionPreference.addListener === 'function') motionPreference.addListener(onPreferenceChange);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => start(), { once: true });
  else start();
})();
