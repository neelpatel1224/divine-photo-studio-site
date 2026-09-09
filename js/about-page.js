/**
 * DIVINE PHOTO STUDIO — ABOUT / OUR STORY PAGE
 * JavaScript Controller: js/about-page.js
 * Heritage Sage Editorial System
 */

(function () {
  'use strict';

  // 1. Quiet, restrained scroll reveals for editorial elements
  function initEditorialReveals() {
    const revealElements = document.querySelectorAll('[data-about-reveal]');
    if (!revealElements.length) return;

    if ('IntersectionObserver' in window) {
      const observerOptions = {
        root: null,
        rootMargin: '0px 0px -40px 0px',
        threshold: 0.12
      };

      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      }, observerOptions);

      revealElements.forEach((el) => {
        revealObserver.observe(el);
      });
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) document.documentElement.classList.add('about-motion');
      matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () => document.documentElement.classList.remove('about-motion'));
    } else {
      // Fallback for browsers without IntersectionObserver
      revealElements.forEach((el) => el.classList.add('is-revealed'));
    }
  }

  // 2. DOM Ready initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEditorialReveals);
  } else {
    initEditorialReveals();
  }
})();
