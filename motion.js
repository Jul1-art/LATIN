'use strict';

(() => {
  function setupMotion() {
    const root = document.documentElement;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const precisePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const portrait = document.querySelector('.portrait-frame');
    const portraitImage = document.querySelector('.portrait-parallax > img');
    const featured = document.querySelector('.featured');
    const footerWord = document.querySelector('#footer-word');
    const list = document.querySelector('#quote-list');
    const animations = new Set();
    const pendingReveals = new Map();
    const revealed = new WeakSet();
    const footerBaseLetters = footerWord ? [...footerWord.querySelectorAll('.footer-word-base .footer-letter')] : [];
    const footerBounces = new Map();
    let lastFooterLetter = null;
    const ease = 'cubic-bezier(.16,1,.3,1)';
    const supported = typeof Element.prototype.animate === 'function' && typeof IntersectionObserver === 'function' && typeof requestAnimationFrame === 'function';
    const tilt = { x: 0, y: 0, targetX: 0, targetY: 0 };
    let enabled = false;
    let heroPlayed = false;
    let revealObserver = null;
    let sceneFrame = 0;
    let pointerFrame = 0;

    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

    function animate(element, keyframes, options = {}, complete) {
      if (!element || !enabled) return null;
      try {
        const animation = element.animate(keyframes, { duration: 850, easing: ease, fill: 'both', ...options });
        animations.add(animation);
        animation.finished.then(() => {
          animations.delete(animation);
          if (enabled && complete) complete();
          animation.cancel();
        }).catch(() => { animations.delete(animation); });
        return animation;
      } catch {
        return null;
      }
    }

    function playHero() {
      heroPlayed = true;
      document.querySelectorAll('.hero-line-inner').forEach((line, index) => {
        animate(line, [
          { transform: 'translate3d(0,110%,0)' },
          { transform: 'translate3d(0,0,0)' }
        ], { duration: 1250, delay: 100 + index * 140 });
      });
      [document.querySelector('.hero-description'), document.querySelector('.hero .button'), document.querySelector('.hero-film-button')].forEach((element, index) => {
        animate(element, [
          { opacity: 0, transform: 'translate3d(0,18px,0)' },
          { opacity: 1, transform: 'translate3d(0,0,0)' }
        ], { duration: 850, delay: 470 + index * 100 });
      });
      animate(portrait, [
        { clipPath: 'inset(0 0 100% 0)' },
        { clipPath: 'inset(0 0 0% 0)' }
      ], { duration: 1450, delay: 140 });
      if (portraitImage) portraitImage.style.transform = 'scale(1.04)';
      animate(portraitImage, [
        { transform: 'scale(1.12)' },
        { transform: 'scale(1.04)' }
      ], { duration: 1850, delay: 140 });
    }

    function prepareReveal(element) {
      if (!enabled || !revealObserver || revealed.has(element) || pendingReveals.has(element)) return;
      const animation = animate(element, [
        { opacity: 0, transform: 'translate3d(0,24px,0)' },
        { opacity: 1, transform: 'translate3d(0,0,0)' }
      ], { duration: 800 });
      if (!animation) return;
      animation.pause();
      animation.currentTime = 0;
      pendingReveals.set(element, animation);
      revealObserver.observe(element);
    }

    function setupReveals() {
      revealObserver = new IntersectionObserver(entries => {
        let stagger = 0;
        entries.forEach(entry => {
          if (!entry.isIntersecting || !enabled) return;
          const animation = pendingReveals.get(entry.target);
          revealObserver.unobserve(entry.target);
          revealed.add(entry.target);
          pendingReveals.delete(entry.target);
          if (!animation) return;
          animation.effect.updateTiming({ delay: Math.min(stagger++, 3) * 65 });
          animation.play();
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });
      document.querySelectorAll('.quote-item, .collection-heading').forEach(prepareReveal);
      if (footerWord) prepareReveal(footerWord);
    }

    function updateScene() {
      sceneFrame = 0;
      if (!enabled) return;
      const height = window.innerHeight;
      if (portrait) {
        const rect = portrait.getBoundingClientRect();
        const progress = clamp((height / 2 - rect.top - rect.height / 2) / ((height + rect.height) / 2), -1, 1);
        const travel = Math.min(25, rect.height * 0.018);
        portrait.style.setProperty('--portrait-y', `${(progress * travel).toFixed(2)}px`);
      }
      if (featured) {
        const rect = featured.getBoundingClientRect();
        const progress = clamp((height - rect.top) / ((height + rect.height) / 2), 0, 1);
        featured.style.setProperty('--quote-fill', `${(progress * 100).toFixed(2)}%`);
        featured.style.setProperty('--quote-shift', `${(12 - progress * 24).toFixed(2)}px`);
      }
    }

    function queueScene() {
      if (enabled && !sceneFrame) sceneFrame = requestAnimationFrame(updateScene);
    }

    function bounceFooterLetter(letter, delay = 0, restart = false) {
      if (!enabled || !letter) return;
      const previous = footerBounces.get(letter);
      if (previous) {
        if (!restart) return;
        previous.cancel();
        animations.delete(previous);
        footerBounces.delete(letter);
      }
      const lift = Math.min(42, Math.max(18, letter.offsetHeight * 0.16));
      const direction = Number(letter.dataset.position) % 2 ? 1 : -1;
      const animation = animate(letter, [
        { offset: 0, transform: 'translate3d(0,0,0) scale(1,1)' },
        { offset: 0.12, transform: 'translate3d(0,0,0) scale(1.08,.90)', easing: 'cubic-bezier(.2,.65,.35,1)' },
        { offset: 0.35, transform: `translate3d(0,${-lift}px,0) rotate(${direction * 2}deg) scale(.96,1.07)`, easing: 'cubic-bezier(.55,0,.8,.4)' },
        { offset: 0.55, transform: 'translate3d(0,0,0) scale(1.06,.93)', easing: 'cubic-bezier(.2,.65,.35,1)' },
        { offset: 0.72, transform: `translate3d(0,${-lift * 0.38}px,0) rotate(${-direction * 0.8}deg) scale(.99,1.03)`, easing: 'cubic-bezier(.55,0,.8,.4)' },
        { offset: 0.87, transform: 'translate3d(0,0,0) scale(1.02,.98)' },
        { offset: 0.94, transform: `translate3d(0,${-lift * 0.10}px,0)` },
        { offset: 1, transform: 'translate3d(0,0,0) scale(1,1)' }
      ], { duration: 900, delay, easing: 'linear' }, () => {
        if (footerBounces.get(letter) === animation) footerBounces.delete(letter);
      });
      if (animation) footerBounces.set(letter, animation);
    }

    function bounceFooter(restart = false) {
      footerBaseLetters.forEach((letter, index) => bounceFooterLetter(letter, index * 55, restart));
    }

    function updatePointers() {
      pointerFrame = 0;
      if (!enabled || !precisePointer.matches) return;
      tilt.x += (tilt.targetX - tilt.x) * 0.1;
      tilt.y += (tilt.targetY - tilt.y) * 0.1;
      if (portrait) {
        portrait.style.setProperty('--portrait-rx', `${tilt.x.toFixed(3)}deg`);
        portrait.style.setProperty('--portrait-ry', `${tilt.y.toFixed(3)}deg`);
      }
      if (Math.abs(tilt.targetX - tilt.x) > 0.008 || Math.abs(tilt.targetY - tilt.y) > 0.008) {
        pointerFrame = requestAnimationFrame(updatePointers);
      } else {
        tilt.x = tilt.targetX;
        tilt.y = tilt.targetY;
        if (portrait) {
          portrait.style.setProperty('--portrait-rx', `${tilt.x}deg`);
          portrait.style.setProperty('--portrait-ry', `${tilt.y}deg`);
        }
      }
    }

    function queuePointers() {
      if (enabled && precisePointer.matches && !pointerFrame) pointerFrame = requestAnimationFrame(updatePointers);
    }

    function resetPointers() {
      cancelAnimationFrame(pointerFrame);
      pointerFrame = 0;
      footerBounces.forEach(animation => { animation.cancel(); animations.delete(animation); });
      footerBounces.clear();
      lastFooterLetter = null;
      tilt.x = tilt.y = tilt.targetX = tilt.targetY = 0;
      if (portrait) {
        portrait.style.setProperty('--portrait-rx', '0deg');
        portrait.style.setProperty('--portrait-ry', '0deg');
      }
    }

    function disableMotion() {
      enabled = false;
      root.classList.remove('motion-ready');
      cancelAnimationFrame(sceneFrame);
      sceneFrame = 0;
      resetPointers();
      if (revealObserver) revealObserver.disconnect();
      revealObserver = null;
      animations.forEach(animation => animation.cancel());
      animations.clear();
      pendingReveals.clear();
      if (portrait) portrait.style.setProperty('--portrait-y', '0px');
      if (portraitImage) portraitImage.style.transform = 'none';
      if (featured) {
        featured.style.setProperty('--quote-fill', '100%');
        featured.style.setProperty('--quote-shift', '0px');
      }
    }

    function syncPreferences() {
      if (reducedMotion.matches || !supported) {
        heroPlayed = true;
        disableMotion();
        return;
      }
      if (enabled) return;
      enabled = true;
      try {
        setupReveals();
        root.classList.add('motion-ready');
        if (!heroPlayed && !['running', 'pending'].includes(window.latinIntroState)) playHero();
        else if (portraitImage) portraitImage.style.transform = 'scale(1.04)';
        queueScene();
      } catch {
        disableMotion();
      }
    }

    document.addEventListener('latin:intro-reveal', () => {
      if (enabled && !heroPlayed) playHero();
    });

    if (portrait) {
      portrait.addEventListener('pointermove', event => {
        if (!enabled || !precisePointer.matches || event.pointerType === 'touch') return;
        const rect = portrait.getBoundingClientRect();
        tilt.targetX = clamp(-(event.clientY - rect.top - rect.height / 2) / rect.height * 3.5, -2, 2);
        tilt.targetY = clamp((event.clientX - rect.left - rect.width / 2) / rect.width * 3.5, -2, 2);
        queuePointers();
      }, { passive: true });
      portrait.addEventListener('pointerleave', () => {
        tilt.targetX = tilt.targetY = 0;
        queuePointers();
      });
    }

    if (footerWord) {
      footerWord.addEventListener('pointerenter', event => {
        if (!enabled || !precisePointer.matches || event.pointerType === 'touch') return;
        lastFooterLetter = null;
        bounceFooter();
      }, { passive: true });
      footerWord.addEventListener('pointermove', event => {
        if (!enabled || !precisePointer.matches || event.pointerType === 'touch') return;
        const x = event.clientX - footerWord.getBoundingClientRect().left;
        const letter = footerBaseLetters.find(item => x >= item.offsetLeft && x <= item.offsetLeft + item.offsetWidth);
        if (letter && letter !== lastFooterLetter) bounceFooterLetter(letter);
        lastFooterLetter = letter;
      }, { passive: true });
      footerWord.addEventListener('pointerleave', () => { lastFooterLetter = null; });
      footerWord.addEventListener('focus', () => bounceFooter());
      footerWord.addEventListener('click', () => bounceFooter(true));
    }

    if (list && typeof MutationObserver === 'function') {
      new MutationObserver(records => {
        records.forEach(record => {
          record.removedNodes.forEach(node => {
            if (node.nodeType !== Node.ELEMENT_NODE) return;
            const rows = node.matches('.quote-item') ? [node] : [...node.querySelectorAll('.quote-item')];
            rows.forEach(row => {
              if (revealObserver) revealObserver.unobserve(row);
              const animation = pendingReveals.get(row);
              if (animation) { animation.cancel(); animations.delete(animation); }
              pendingReveals.delete(row);
            });
          });
          record.addedNodes.forEach(node => {
            if (node.nodeType !== Node.ELEMENT_NODE) return;
            if (node.matches('.quote-item')) prepareReveal(node);
            else node.querySelectorAll('.quote-item').forEach(prepareReveal);
          });
        });
      }).observe(list, { childList: true });
    }

    window.addEventListener('scroll', queueScene, { passive: true });
    window.addEventListener('resize', () => {
      queueScene();
    }, { passive: true });
    const listenToMedia = (query, listener) => {
      if (typeof query.addEventListener === 'function') query.addEventListener('change', listener);
      else if (typeof query.addListener === 'function') query.addListener(listener);
    };
    listenToMedia(reducedMotion, syncPreferences);
    listenToMedia(precisePointer, () => { if (!precisePointer.matches) resetPointers(); });
    syncPreferences();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setupMotion, { once: true });
  else setupMotion();
})();
