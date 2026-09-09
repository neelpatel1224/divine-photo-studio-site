/* ==========================================================================
   Section 13 — Light Editorial Footer JavaScript
   DIVINE PHOTO STUDIO
   ========================================================================== */

(() => {
    'use strict';

    // 1. Dynamic Copyright Year
    const yearEl = document.getElementById('footer-year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    // 2. Back to Top Smooth Scrolling
    const backToTopBtn = document.getElementById('footer-back-to-top');
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            window.scrollTo({
                top: 0,
                behavior: prefersReducedMotion ? 'auto' : 'smooth'
            });
        });
    }

    // 3. Optional Image Strip Horizontal Scroll Controls
    const strip = document.getElementById('footer-image-strip');
    const prevBtn = document.getElementById('footer-strip-prev');
    const nextBtn = document.getElementById('footer-strip-next');
    const controlsContainer = strip ? strip.parentElement.querySelector('.site-footer__strip-controls') : null;

    if (strip && prevBtn && nextBtn && controlsContainer) {
        const updateControlsVisibility = () => {
            // Show subtle prev/next arrows only when horizontal overflow is present on desktop
            if (window.innerWidth >= 1024 && strip.scrollWidth > strip.clientWidth + 16) {
                controlsContainer.style.display = 'flex';
            } else {
                controlsContainer.style.display = 'none';
            }
        };

        updateControlsVisibility();
        window.addEventListener('resize', updateControlsVisibility);

        prevBtn.addEventListener('click', () => {
            const scrollAmount = Math.max(strip.clientWidth * 0.4, 200);
            strip.scrollBy({ left: -scrollAmount, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
        });

        nextBtn.addEventListener('click', () => {
            const scrollAmount = Math.max(strip.clientWidth * 0.4, 200);
            strip.scrollBy({ left: scrollAmount, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
        });
    }
})();
