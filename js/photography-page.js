/**
 * DIVINE PHOTO STUDIO — PHOTOGRAPHY PAGE
 * JavaScript Controller: js/photography-page.js
 * Heritage Sage Editorial System
 */

(function () {
  'use strict';

  // 1. Restrained Scroll Reveals
  function initEditorialReveals() {
    const revealElements = document.querySelectorAll('[data-photo-reveal]');
    if (!revealElements.length) return;

    if ('IntersectionObserver' in window) {
      const observerOptions = {
        root: null,
        rootMargin: '0px 0px -40px 0px',
        threshold: 0.1
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
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) document.documentElement.classList.add('photo-motion');
      matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () => document.documentElement.classList.remove('photo-motion'));
    } else {
      revealElements.forEach((el) => el.classList.add('is-revealed'));
    }
  }

  // 2. Sticky Category Navigation Active Highlighting
  function initCategoryNavSpy() {
    const navLinks = document.querySelectorAll('.photo-category-nav__link');
    const sections = document.querySelectorAll('.photo-chapter[id]');
    if (!navLinks.length || !sections.length) return;

    if ('IntersectionObserver' in window) {
      const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0
      };

      const spyObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach((link) => {
              if (link.getAttribute('href') === `#${id}`) {
                link.classList.add('is-active');
              } else {
                link.classList.remove('is-active');
              }
            });
          }
        });
      }, observerOptions);

      sections.forEach((sec) => spyObserver.observe(sec));
    }
  }

  // 3. Accessible Photography Lightbox
  function initLightbox() {
    const lightbox = document.getElementById('photo-lightbox');
    const lightboxImg = document.getElementById('photo-lightbox-img');
    const lightboxCaption = document.getElementById('photo-lightbox-caption');
    const closeBtn = document.getElementById('photo-lightbox-close');
    const prevBtn = document.getElementById('photo-lightbox-prev');
    const nextBtn = document.getElementById('photo-lightbox-next');

    if (!lightbox || !lightboxImg) return;

    // Collect all zoomable images
    const frames = Array.from(document.querySelectorAll('.photo-frame, .photo-featured-story__frame'));
    if (!frames.length) return;

    let currentIndex = 0;
    let lastActiveElement = null;

    function openLightbox(index) {
      currentIndex = index;
      lastActiveElement = document.activeElement;
      updateLightboxContent();
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden'; // lock scroll
      document.querySelectorAll('body > header, body > main, body > footer').forEach(el => { if (!el.contains(lightbox)) el.inert = true; });
      closeBtn.focus();
    }

    function closeLightbox() {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      document.querySelectorAll('body > header, body > main, body > footer').forEach(el => el.inert = false);
      if (lastActiveElement && typeof lastActiveElement.focus === 'function') {
        lastActiveElement.focus();
      }
    }

    function updateLightboxContent() {
      const frame = frames[currentIndex];
      const img = frame.querySelector('img');
      if (!img) return;

      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt || 'Divine Photo Studio photograph';
      if (lightboxCaption) {
        lightboxCaption.textContent = img.alt || '';
      }
    }

    function showPrev() {
      currentIndex = (currentIndex - 1 + frames.length) % frames.length;
      updateLightboxContent();
    }

    function showNext() {
      currentIndex = (currentIndex + 1) % frames.length;
      updateLightboxContent();
    }

    // Attach click triggers to frames
    frames.forEach((frame, idx) => {
      frame.setAttribute('tabindex', '0');
      frame.setAttribute('role', 'button');
      frame.setAttribute('aria-label', 'Enlarge photograph');

      frame.addEventListener('click', () => openLightbox(idx));
      frame.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(idx);
        }
      });
    });

    // Control buttons
    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (prevBtn) prevBtn.addEventListener('click', showPrev);
    if (nextBtn) nextBtn.addEventListener('click', showNext);

    // Click outside to close
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });

    // Keyboard support
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('is-open')) return;

      if (e.key === 'Tab') {
        const controls = [closeBtn, prevBtn, nextBtn].filter(Boolean);
        const index = controls.indexOf(document.activeElement);
        e.preventDefault();
        controls[(index + (e.shiftKey ? controls.length - 1 : 1)) % controls.length].focus();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        showPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        showNext();
      }
    });
  }

  // 4. DOM Ready initialization
  function init() {
    initEditorialReveals();
    initCategoryNavSpy();
    initLightbox();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
