/**
 * DIVINE PHOTO STUDIO — Pre-Weddings Page Interactive Scripts
 * Handles click-to-load video embed with YouTube-nocookie and fallback,
 * while category-archive.js manages lightbox and scroll-reveals.
 */
(() => {
    'use strict';

    // Click-to-load YouTube Video Player per Rule 32
    const filmFrame = document.querySelector('[data-pw-film]');
    if (filmFrame) {
        const trigger = filmFrame.querySelector('.pw-film-trigger');
        const videoId = filmFrame.getAttribute('data-video-id');
        const videoTitle = filmFrame.getAttribute('data-video-title') || 'Pre-Wedding Film';

        if (trigger && videoId) {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();

                // Create privacy-enhanced iframe embed
                const iframe = document.createElement('iframe');
                iframe.setAttribute('src', `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`);
                iframe.setAttribute('title', videoTitle);
                iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
                iframe.setAttribute('allowfullscreen', 'true');
                iframe.className = 'pw-film-iframe';

                // Handle load error gracefully
                iframe.onerror = () => {
                    const fallback = filmFrame.querySelector('.pw-film-fallback');
                    if (fallback) {
                        fallback.style.display = 'block';
                    }
                };

                // Clear trigger and mount player
                filmFrame.innerHTML = '';
                filmFrame.appendChild(iframe);
                iframe.focus();
            });
        }
    }
})();
