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
    const footerLetters = footerWord ? [...footerWord.querySelectorAll('.footer-letter')] : [];
    const footerBaseLetters = footerWord ? [...footerWord.querySelectorAll('.footer-word-base .footer-letter')] : [];
    const footerCenters = new Map();
    const ease = 'cubic-bezier(.16,1,.3,1)';
    const supported = typeof Element.prototype.animate === 'function' && typeof IntersectionObserver === 'function' && typeof requestAnimationFrame === 'function';
    const footer = { x: 0, y: 0, vx: 0, vy: 0, trailX: 0, trailY: 0, opacity: 0, targetX: 0, targetY: 0, targetOpacity: 0 };
    const tilt = { x: 0, y: 0, targetX: 0, targetY: 0 };
    let enabled = false;
    let heroPlayed = false;
    let revealObserver = null;
    let sceneFrame = 0;
    let pointerFrame = 0;
    let touchTimer = 0;
    let lastPointerTime = 0;
    let footerWidth = 1;

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
      [document.querySelector('.hero-description'), document.querySelector('.hero .button')].forEach((element, index) => {
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

    function measureFooter() {
      if (!footerWord) return;
      const bounds = footerWord.getBoundingClientRect();
      footerWidth = Math.max(bounds.width, 1);
      footerCenters.clear();
      footerBaseLetters.forEach(letter => {
        const rect = letter.getBoundingClientRect();
        footerCenters.set(letter.dataset.position, {
          center: rect.left - bounds.left + rect.width / 2,
          width: Math.max(rect.width, 35)
        });
      });
    }

    function renderFooter() {
      if (!footerWord) return;
      footerWord.style.setProperty('--spot-x', `${footer.x.toFixed(2)}px`);
      footerWord.style.setProperty('--spot-y', `${footer.y.toFixed(2)}px`);
      footerWord.style.setProperty('--spot-opacity', footer.opacity.toFixed(4));
      footerWord.style.setProperty('--trail-x', `${footer.trailX.toFixed(2)}px`);
      footerWord.style.setProperty('--trail-y', `${footer.trailY.toFixed(2)}px`);
      footerWord.style.setProperty('--sheen-position', `${(15 + footer.x / footerWidth * 70).toFixed(2)}%`);
      footerLetters.forEach(letter => {
        const geometry = footerCenters.get(letter.dataset.position);
        if (!geometry) return;
        const distance = (footer.x - geometry.center) / Math.max(geometry.width * 1.15, 60);
        const influence = Math.exp(-distance * distance * 1.5) * footer.opacity;
        letter.style.setProperty('--letter-x', `${(clamp(distance, -1, 1) * 6 * influence).toFixed(2)}px`);
        letter.style.setProperty('--letter-scale', (1 + influence * 0.32).toFixed(4));
      });
    }

    function updatePointers(timestamp) {
      pointerFrame = 0;
      if (!enabled || !precisePointer.matches) return;
      const dt = Math.min(1 / 30, Math.max(1 / 240, (timestamp - (lastPointerTime || timestamp - 16.67)) / 1000));
      lastPointerTime = timestamp;
      const damping = Math.exp(-17 * dt);
      footer.vx = (footer.vx + (footer.targetX - footer.x) * 240 * dt) * damping;
      footer.vy = (footer.vy + (footer.targetY - footer.y) * 240 * dt) * damping;
      footer.x += footer.vx * dt;
      footer.y += footer.vy * dt;
      const trailEase = 1 - Math.exp(-7 * dt);
      footer.trailX += (footer.x - footer.trailX) * trailEase;
      footer.trailY += (footer.y - footer.trailY) * trailEase;
      footer.opacity += (footer.targetOpacity - footer.opacity) * (1 - Math.exp(-10 * dt));
      tilt.x += (tilt.targetX - tilt.x) * 0.1;
      tilt.y += (tilt.targetY - tilt.y) * 0.1;
      renderFooter();
      if (portrait) {
        portrait.style.setProperty('--portrait-rx', `${tilt.x.toFixed(3)}deg`);
        portrait.style.setProperty('--portrait-ry', `${tilt.y.toFixed(3)}deg`);
      }
      const unsettled = Math.abs(footer.targetX - footer.x) > 0.05 || Math.abs(footer.targetY - footer.y) > 0.05 || Math.abs(footer.targetOpacity - footer.opacity) > 0.004 || Math.abs(tilt.targetX - tilt.x) > 0.008 || Math.abs(tilt.targetY - tilt.y) > 0.008 || Math.abs(footer.vx) > 0.15 || Math.abs(footer.vy) > 0.15 || Math.abs(footer.x - footer.trailX) > 0.1 || Math.abs(footer.y - footer.trailY) > 0.1;
      if (unsettled) pointerFrame = requestAnimationFrame(updatePointers);
      else {
        footer.x = footer.targetX;
        footer.y = footer.targetY;
        footer.opacity = footer.targetOpacity;
        footer.vx = footer.vy = 0;
        footer.trailX = footer.x;
        footer.trailY = footer.y;
        lastPointerTime = 0;
        tilt.x = tilt.targetX;
        tilt.y = tilt.targetY;
        renderFooter();
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
      lastPointerTime = 0;
      footer.vx = footer.vy = 0;
      footer.opacity = footer.targetOpacity = 0;
      tilt.x = tilt.y = tilt.targetX = tilt.targetY = 0;
      renderFooter();
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
        measureFooter();
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
        measureFooter();
        const rect = footerWord.getBoundingClientRect();
        footer.trailX = footer.x = footer.targetX = clamp(event.clientX - rect.left, 0, rect.width);
        footer.trailY = footer.y = footer.targetY = clamp(event.clientY - rect.top, 0, rect.height);
        footer.vx = footer.vy = 0;
        footer.targetOpacity = 1;
        queuePointers();
      }, { passive: true });
      footerWord.addEventListener('pointermove', event => {
        if (!enabled || !precisePointer.matches || event.pointerType === 'touch') return;
        const rect = footerWord.getBoundingClientRect();
        footer.targetX = clamp(event.clientX - rect.left, 0, rect.width);
        footer.targetY = clamp(event.clientY - rect.top, 0, rect.height);
        footer.targetOpacity = 1;
        queuePointers();
      }, { passive: true });
      footerWord.addEventListener('pointerleave', () => {
        footer.targetOpacity = 0;
        queuePointers();
      });
      footerWord.addEventListener('focus', () => footerWord.classList.add('is-focused'));
      footerWord.addEventListener('blur', () => footerWord.classList.remove('is-focused'));
      footerWord.addEventListener('pointerdown', event => {
        if (event.pointerType !== 'touch' && precisePointer.matches) return;
        clearTimeout(touchTimer);
        footerWord.classList.add('is-touch-active');
      }, { passive: true });
      const finishTouch = () => {
        clearTimeout(touchTimer);
        touchTimer = window.setTimeout(() => footerWord.classList.remove('is-touch-active'), 450);
      };
      footerWord.addEventListener('pointerup', finishTouch, { passive: true });
      footerWord.addEventListener('pointercancel', finishTouch, { passive: true });
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
      measureFooter();
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
