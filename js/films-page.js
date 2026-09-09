/**
 * DIVINE PHOTO STUDIO — FILMS PAGE JAVASCRIPT
 * Warm Ivory Light Editorial Theme
 * Poster-first video interface, direct YouTube watch handlers, and scroll reveals
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // 1. Poster-First Film Player & Direct YouTube Watch Handlers
  function initFilmPlayers() {
    const filmFrames = document.querySelectorAll('.film-frame[data-video-id]');

    filmFrames.forEach((frame) => {
      const videoId = frame.dataset.videoId;
      const trigger = frame.querySelector('.film-frame__trigger');
      const entry = frame.closest('.film-entry');
      const watchLink = entry ? entry.querySelector('.film-watch-link') : null;

      if (!videoId) return;

      const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;

      // Ensure both trigger and caption link have the verified YouTube watch URL
      if (trigger && trigger.tagName.toLowerCase() === 'a') {
        trigger.setAttribute('href', watchUrl);
        trigger.setAttribute('target', '_blank');
        trigger.setAttribute('rel', 'noopener noreferrer');
      }

      if (watchLink && watchLink.tagName.toLowerCase() === 'a') {
        watchLink.setAttribute('href', watchUrl);
        watchLink.setAttribute('target', '_blank');
        watchLink.setAttribute('rel', 'noopener noreferrer');
      }
    });
  }

  // 2. Scroll Reveal Animations with IntersectionObserver
  function initFilmReveals() {
    const revealElements = document.querySelectorAll('[data-film-reveal]');
    if (!revealElements.length) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      revealElements.forEach((el) => el.classList.add('is-revealed'));
      return;
    }

    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -8% 0px',
      threshold: 0.08
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    revealElements.forEach((el) => revealObserver.observe(el));
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) document.documentElement.classList.add('film-motion');
      matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () => document.documentElement.classList.remove('film-motion'));
  }

  // 3. Back to Top Smooth Scroll
  function initBackToTop() {
    const backToTopBtn = document.getElementById('footer-back-to-top');
    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    }
  }

  // Initialize
  initFilmPlayers();
  initFilmReveals();
  // Shared footer controller owns Back to Top.
});
