/**
 * DIVINE PHOTO STUDIO — COUPLE STORIES JAVASCRIPT
 * Progressive story loading, scroll reveal animations, and smooth back-to-top
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // 1. Progressive Load More Stories
  function initLoadMoreStories() {
    const loadMoreBtn = document.getElementById('load-more-stories');
    const extraStories = document.querySelectorAll('.story-tile--extra');

    if (!loadMoreBtn || !extraStories.length) return;

    document.documentElement.classList.add('stories-enhanced');
    loadMoreBtn.addEventListener('click', () => {
      extraStories.forEach(tile => tile.classList.add('is-revealed'));
      const first = extraStories[0].querySelector('[tabindex], a') || extraStories[0];
      first.setAttribute('tabindex', '0');
      first.focus({ preventScroll: true });
      loadMoreBtn.closest('.stories-load-more').hidden = true;
    });
  }

  // 2. Scroll Reveal Animations with IntersectionObserver
  function initStoryReveals() {
    const revealElements = document.querySelectorAll('[data-story-reveal]');
    if (!revealElements.length) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      revealElements.forEach((el) => el.classList.add('is-revealed'));
      return;
    }

    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -6% 0px',
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
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) document.documentElement.classList.add('story-motion');
      matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () => document.documentElement.classList.remove('story-motion'));
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
  initLoadMoreStories();
  initStoryReveals();
  // Shared footer controller owns Back to Top.
});
