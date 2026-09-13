/**
 * DIVINE PHOTO STUDIO — Individual Couple Gallery Script (V1 Refined)
 * 
 * Features:
 * - Decoupled dynamic gallery data structure (Rule 56-58)
 * - Pixieset-style light fullscreen viewer with 100dvh support
 * - Native Web Share API + Minimal fallback modal & toast notification (Rule 9-13)
 * - True Fullscreen API support (enter/exit toggle) (Rule 17-18, 30)
 * - 6-second Slideshow engine with Ken Burns motion & auto-hiding chrome (Rule 31-39)
 * - Mobile Touch Swipe navigation with strict directional thresholds (Rule 25)
 * - Browser History integration (Back button closes viewer) (Rule 29)
 * - Scroll position lock & precise restoration (Rule 28, 60)
 * - LocalStorage Favorites collection (Rule 42)
 * - Accessible dialog focus management & ARIA states (Rule 50-52)
 */

(function() {
    'use strict';

    // --------------------------------------------------------------------------
    // 01. Gallery Configuration & Architecture (Rule 56-58)
    // --------------------------------------------------------------------------
    window.DIVINE_GALLERY = window.DIVINE_GALLERY || {
        id: "hitanshi-vaidik",
        slug: "hitanshi-vaidik",
        title: "HITANSHI — VAIDIK",
        studio: "DIVINE PHOTO STUDIO",
        eventDate: "JANUARY 21ST, 2024",
        slideshowInterval: 6000 // 6 seconds per Rule 32
    };

    const config = window.DIVINE_GALLERY;

    // DOM Elements
    const gallery = document.querySelector('.cgl-masonry');
    const viewer = document.getElementById('gallery-viewer');
    if (!gallery || !viewer) return;

    const viewerImg = viewer.querySelector('.cgl-viewer__img');
    const viewerMeta = viewer.querySelector('.cgl-viewer__meta');
    const prevBtn = viewer.querySelector('.cgl-viewer__nav--prev');
    const nextBtn = viewer.querySelector('.cgl-viewer__nav--next');
    const closeBtn = viewer.querySelector('.cgl-viewer__close-btn');
    const viewerFavBtn = viewer.querySelector('.cgl-viewer__fav-toggle');
    const viewerPlayBtn = viewer.querySelector('.cgl-viewer__play-toggle');
    const viewerFullscreenBtn = viewer.querySelector('.cgl-viewer__fullscreen-toggle');
    const viewerShareBtn = viewer.querySelector('.cgl-viewer__share-toggle');

    const barPlayBtn = document.querySelector('.cgl-tool-btn--slideshow');
    const barFavBtn = document.querySelector('.cgl-tool-btn--favorites');
    const barShareBtn = document.querySelector('.cgl-tool-btn--share');
    const favCountBadge = document.querySelector('.cgl-tool-badge');
    const emptyFavoritesNotice = document.querySelector('.cgl-empty-favorites');

    // Share Elements
    const shareModal = document.getElementById('share-modal');
    const shareModalClose = document.getElementById('share-modal-close');
    const copyLinkBtn = document.getElementById('copy-link-btn');
    const whatsappShareBtn = document.getElementById('whatsapp-share-btn');
    const toast = document.getElementById('cgl-toast');

    // State
    const items = Array.from(gallery.querySelectorAll('.cgl-item'));
    let currentIndex = 0;
    let isOpen = false;
    let savedScrollY = 0;
    let slideshowTimer = null;
    let isSlideshowPlaying = false;
    let idleTimer = null;
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let historyPushed = false;

    // --------------------------------------------------------------------------
    // 02. Favorites Engine (LocalStorage) (Rule 42)
    // --------------------------------------------------------------------------
    const STORAGE_KEY = `divine_favs_${config.id}`;
    let favorites = new Set();

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            favorites = new Set(JSON.parse(stored));
        }
    } catch (e) {
        console.warn('LocalStorage unavailable for favorites', e);
    }

    function saveFavorites() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(favorites)));
        } catch (e) {}
        updateFavoritesUI();
    }

    function updateFavoritesUI() {
        if (favCountBadge) {
            favCountBadge.textContent = favorites.size;
        }

        // Update items heart icons
        items.forEach(item => {
            const id = item.getAttribute('data-image-id');
            const favBtn = item.querySelector('.cgl-item__fav');
            if (favBtn) {
                if (favorites.has(id)) {
                    favBtn.classList.add('is-favorite');
                    favBtn.setAttribute('aria-label', 'Remove from favorites');
                } else {
                    favBtn.classList.remove('is-favorite');
                    favBtn.setAttribute('aria-label', 'Add to favorites');
                }
            }
        });

        // Update viewer heart icon if open
        if (isOpen) {
            const currentItem = items[currentIndex];
            if (currentItem && viewerFavBtn) {
                const currentId = currentItem.getAttribute('data-image-id');
                if (favorites.has(currentId)) {
                    viewerFavBtn.classList.add('is-active');
                    viewerFavBtn.setAttribute('aria-label', 'Remove from favorites');
                } else {
                    viewerFavBtn.classList.remove('is-active');
                    viewerFavBtn.setAttribute('aria-label', 'Add to favorites');
                }
            }
        }
    }

    function toggleFavorite(id) {
        if (favorites.has(id)) {
            favorites.delete(id);
        } else {
            favorites.add(id);
        }
        saveFavorites();
    }

    // --------------------------------------------------------------------------
    // 03. Toast Notification Utility (Rule 11)
    // --------------------------------------------------------------------------
    let toastTimeout = null;
    function showToast(message) {
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('is-visible');
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.remove('is-visible');
        }, 1800);
    }

    // --------------------------------------------------------------------------
    // 04. Real Share Functionality & Fallback (Rules 9–13, 48, 54)
    // --------------------------------------------------------------------------
    function getShareUrl() {
        // Deep-link to current photo if viewer is open
        if (isOpen && items[currentIndex]) {
            const url = new URL(window.location.href);
            url.searchParams.set('photo', currentIndex + 1);
            return url.toString();
        }
        return window.location.href;
    }

    async function handleShare() {
        const shareData = {
            title: `${config.title} | ${config.studio}`,
            text: `View the wedding gallery of ${config.title} by ${config.studio}`,
            url: getShareUrl()
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
                return; // User shared successfully
            } catch (err) {
                // Ignore AbortError if user simply canceled the share sheet
                if (err.name === 'AbortError') return;
            }
        }

        // Web Share not supported or failed -> open fallback modal
        openShareModal();
    }

    function openShareModal() {
        if (!shareModal) return;
        shareModal.classList.add('is-open');
        shareModal.setAttribute('aria-hidden', 'false');

        // Update WhatsApp share href
        if (whatsappShareBtn) {
            const text = encodeURIComponent(`View the wedding gallery of ${config.title}: ${getShareUrl()}`);
            whatsappShareBtn.href = `https://api.whatsapp.com/send?text=${text}`;
        }
    }

    function closeShareModal() {
        if (!shareModal) return;
        shareModal.classList.remove('is-open');
        shareModal.setAttribute('aria-hidden', 'true');
    }

    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(getShareUrl());
                showToast('LINK COPIED');
                closeShareModal();
            } catch (err) {
                showToast('UNABLE TO COPY LINK');
            }
        });
    }

    if (shareModalClose) {
        shareModalClose.addEventListener('click', closeShareModal);
    }

    if (shareModal) {
        shareModal.addEventListener('click', (e) => {
            if (e.target === shareModal) closeShareModal();
        });
    }

    if (barShareBtn) barShareBtn.addEventListener('click', handleShare);
    if (viewerShareBtn) viewerShareBtn.addEventListener('click', handleShare);

    // --------------------------------------------------------------------------
    // 05. True Fullscreen API Integration (Rules 17–18, 30)
    // --------------------------------------------------------------------------
    function isFullscreenActive() {
        return !!(document.fullscreenElement || document.webkitFullscreenElement);
    }

    function updateFullscreenUI() {
        if (!viewerFullscreenBtn) return;
        const active = isFullscreenActive();
        if (active) {
            viewerFullscreenBtn.setAttribute('aria-label', 'Exit fullscreen');
            viewerFullscreenBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" stroke="currentColor" stroke-width="1.8" fill="none"/></svg>';
        } else {
            viewerFullscreenBtn.setAttribute('aria-label', 'Enter fullscreen');
            viewerFullscreenBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" stroke="currentColor" stroke-width="1.8" fill="none"/></svg>';
        }
    }

    function toggleFullscreen() {
        const docEl = document.documentElement;
        if (!isFullscreenActive()) {
            if (docEl.requestFullscreen) {
                docEl.requestFullscreen().catch(() => {});
            } else if (docEl.webkitRequestFullscreen) {
                docEl.webkitRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen().catch(() => {});
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }
    }

    if (viewerFullscreenBtn) {
        viewerFullscreenBtn.addEventListener('click', toggleFullscreen);
    }

    document.addEventListener('fullscreenchange', updateFullscreenUI);
    document.addEventListener('webkitfullscreenchange', updateFullscreenUI);

    // --------------------------------------------------------------------------
    // 06. Image Viewer Engine & Preloading (Rules 20, 22, 40)
    // --------------------------------------------------------------------------
    function preloadAdjacent(index) {
        const nextIdx = (index + 1) % items.length;
        const next2Idx = (index + 2) % items.length;
        const prevIdx = (index - 1 + items.length) % items.length;

        [nextIdx, next2Idx, prevIdx].forEach(idx => {
            const link = items[idx].querySelector('.cgl-item__link');
            if (link && link.href) {
                const img = new Image();
                img.src = link.href;
            }
        });
    }

    function showImage(index) {
        if (index < 0 || index >= items.length) return;
        currentIndex = index;
        const item = items[currentIndex];
        const link = item.querySelector('.cgl-item__link');
        const img = item.querySelector('.cgl-item__img');

        const fullSrc = link ? link.href : img.src;
        const altText = img.alt || `Photograph ${index + 1}`;

        // Soft crossfade transition (Rule 35)
        viewerImg.style.opacity = '0.35';
        const temp = new Image();
        temp.onload = function() {
            viewerImg.src = fullSrc;
            viewerImg.alt = altText;
            viewerImg.style.opacity = '1';
        };
        temp.src = fullSrc;

        // Meta update (e.g. "12 / 64")
        if (viewerMeta) {
            viewerMeta.textContent = `${index + 1} / ${items.length}`;
        }

        updateFavoritesUI();
        preloadAdjacent(index);
    }

    function step(delta) {
        const nextIdx = (currentIndex + delta + items.length) % items.length;
        showImage(nextIdx);
    }

    // --------------------------------------------------------------------------
    // 07. Browser History Integration & Scroll Restoration (Rules 28, 29, 60)
    // --------------------------------------------------------------------------
    function openViewer(index) {
        savedScrollY = window.scrollY || window.pageYOffset;
        document.body.style.position = 'fixed';
        document.body.style.top = `-${savedScrollY}px`;
        document.body.style.width = '100%';

        viewer.classList.add('is-open');
        viewer.setAttribute('aria-hidden', 'false');
        isOpen = true;

        showImage(index);

        // Push lightweight history state so browser Back closes viewer (Rule 29)
        if (!historyPushed) {
            try {
                window.history.pushState({ galleryViewerOpen: true }, '');
                historyPushed = true;
            } catch (e) {}
        }

        updateFullscreenUI();
        if (closeBtn) closeBtn.focus();
    }

    function closeViewer(fromHistory = false) {
        if (!isOpen) return;
        stopSlideshow();

        if (isFullscreenActive()) {
            if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
            else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        }

        viewer.classList.remove('is-open', 'is-idle', 'is-slideshow-active');
        viewer.setAttribute('aria-hidden', 'true');
        isOpen = false;

        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, savedScrollY); // Rule 28, 60: restore exact scroll

        // Back out history state if closed via button/escape
        if (!fromHistory && historyPushed) {
            historyPushed = false;
            try {
                window.history.back();
            } catch (e) {}
        } else {
            historyPushed = false;
        }

        // Restore focus to clicked item
        const activeItem = items[currentIndex];
        if (activeItem) {
            const link = activeItem.querySelector('.cgl-item__link');
            if (link) link.focus({ preventScroll: true });
        }
    }

    // Handle browser Back button (Rule 29)
    window.addEventListener('popstate', (e) => {
        if (isOpen) {
            closeViewer(true);
        }
    });

    // --------------------------------------------------------------------------
    // 08. Refined Slideshow Engine with Chrome Auto-Hide (Rules 31–39)
    // --------------------------------------------------------------------------
    function resetIdleTimer() {
        viewer.classList.remove('is-idle');
        clearTimeout(idleTimer);
        if (isSlideshowPlaying) {
            idleTimer = setTimeout(() => {
                viewer.classList.add('is-idle'); // Rule 33: hide chrome after 3s inactivity
            }, 3000);
        }
    }

    function startSlideshow() {
        isSlideshowPlaying = true;
        viewer.classList.add('is-slideshow-active');

        const pauseSvg = '<svg viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" fill="currentColor"/><rect x="14" y="4" width="4" height="16" fill="currentColor"/></svg>';
        if (viewerPlayBtn) {
            viewerPlayBtn.classList.add('is-active');
            viewerPlayBtn.setAttribute('aria-label', 'Pause slideshow');
            viewerPlayBtn.innerHTML = pauseSvg;
        }
        if (barPlayBtn) {
            barPlayBtn.classList.add('is-active');
            barPlayBtn.setAttribute('aria-label', 'Pause slideshow');
            const span = barPlayBtn.querySelector('span');
            if (span) span.textContent = 'PAUSE';
        }

        if (!isOpen) {
            openViewer(0);
        }

        resetIdleTimer();

        clearInterval(slideshowTimer);
        slideshowTimer = setInterval(() => {
            step(1);
        }, config.slideshowInterval); // Rule 32: 6 seconds
    }

    function stopSlideshow() {
        isSlideshowPlaying = false;
        clearInterval(slideshowTimer);
        slideshowTimer = null;
        clearTimeout(idleTimer);

        viewer.classList.remove('is-slideshow-active', 'is-idle');

        const playSvg = '<svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3" fill="currentColor"/></svg>';
        if (viewerPlayBtn) {
            viewerPlayBtn.classList.remove('is-active');
            viewerPlayBtn.setAttribute('aria-label', 'Start slideshow');
            viewerPlayBtn.innerHTML = playSvg;
        }
        if (barPlayBtn) {
            barPlayBtn.classList.remove('is-active');
            barPlayBtn.setAttribute('aria-label', 'Start slideshow');
            const span = barPlayBtn.querySelector('span');
            if (span) span.textContent = 'SLIDESHOW';
        }
    }

    function toggleSlideshow() {
        if (isSlideshowPlaying) {
            stopSlideshow();
        } else {
            startSlideshow();
        }
    }

    // Page Visibility API (Rule 38)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            if (isSlideshowPlaying) {
                clearInterval(slideshowTimer);
            }
        } else {
            if (isSlideshowPlaying) {
                slideshowTimer = setInterval(() => {
                    step(1);
                }, config.slideshowInterval);
            }
        }
    });

    // Reset idle timer on user motion inside viewer
    viewer.addEventListener('mousemove', resetIdleTimer);
    viewer.addEventListener('touchstart', resetIdleTimer, { passive: true });

    // --------------------------------------------------------------------------
    // 09. Event Listeners & Touch Gestures (Rules 25–27)
    // --------------------------------------------------------------------------
    items.forEach((item, idx) => {
        const link = item.querySelector('.cgl-item__link');
        const favBtn = item.querySelector('.cgl-item__fav');

        if (link) {
            link.addEventListener('click', (e) => {
                if (e.ctrlKey || e.metaKey || e.shiftKey) return;
                e.preventDefault();
                openViewer(idx);
            });
        }

        if (favBtn) {
            favBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                const id = item.getAttribute('data-image-id');
                toggleFavorite(id);
            });
        }
    });

    if (prevBtn) prevBtn.addEventListener('click', () => { step(-1); if (isSlideshowPlaying) startSlideshow(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { step(1); if (isSlideshowPlaying) startSlideshow(); });
    if (closeBtn) closeBtn.addEventListener('click', () => closeViewer(false));

    if (viewerFavBtn) {
        viewerFavBtn.addEventListener('click', () => {
            const currentItem = items[currentIndex];
            if (currentItem) {
                const id = currentItem.getAttribute('data-image-id');
                toggleFavorite(id);
            }
        });
    }

    if (viewerPlayBtn) viewerPlayBtn.addEventListener('click', toggleSlideshow);
    if (barPlayBtn) barPlayBtn.addEventListener('click', toggleSlideshow);

    // Sticky Bar Favorites Filter Toggle
    let isFilterActive = false;
    if (barFavBtn) {
        barFavBtn.addEventListener('click', () => {
            isFilterActive = !isFilterActive;
            barFavBtn.classList.toggle('is-active', isFilterActive);

            let visibleCount = 0;
            items.forEach(item => {
                const id = item.getAttribute('data-image-id');
                if (isFilterActive) {
                    if (favorites.has(id)) {
                        item.style.display = 'block';
                        visibleCount++;
                    } else {
                        item.style.display = 'none';
                    }
                } else {
                    item.style.display = 'block';
                    visibleCount++;
                }
            });

            if (emptyFavoritesNotice) {
                emptyFavoritesNotice.style.display = (isFilterActive && visibleCount === 0) ? 'block' : 'none';
            }
        });
    }

    // Keyboard Navigation (Rule 24)
    window.addEventListener('keydown', (e) => {
        if (!isOpen) return;

        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                step(-1);
                if (isSlideshowPlaying) startSlideshow(); // Rule 36: reset timer
                break;
            case 'ArrowRight':
                e.preventDefault();
                step(1);
                if (isSlideshowPlaying) startSlideshow(); // Rule 36: reset timer
                break;
            case 'Escape':
                e.preventDefault();
                closeViewer(false);
                break;
            case ' ':
                e.preventDefault();
                toggleSlideshow();
                break;
        }
    });

    // Touch Swipe Navigation (Rule 25)
    viewer.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
        touchStartTime = Date.now();
    }, { passive: true });

    viewer.addEventListener('touchend', (e) => {
        const deltaX = e.changedTouches[0].screenX - touchStartX;
        const deltaY = e.changedTouches[0].screenY - touchStartY;
        const duration = Date.now() - touchStartTime;

        // Strict horizontal swipe check (>45px horizontal, less than 50px vertical)
        if (Math.abs(deltaX) > 45 && Math.abs(deltaY) < 55 && duration < 600) {
            if (deltaX < 0) {
                step(1); // Swipe left -> Next
            } else {
                step(-1); // Swipe right -> Prev
            }
            if (isSlideshowPlaying) startSlideshow(); // Reset slideshow timer on manual interaction
        }
    }, { passive: true });

    // Smooth Scroll Buttons (Rule 12 & 21)
    const viewGalleryBtns = document.querySelectorAll('.cgl-view-gallery-btn');
    viewGalleryBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.getElementById('masonry-gallery') || document.getElementById('gallery-start');
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    const backToTopBtn = document.querySelector('.cgl-back-to-top-btn');
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Subtle Desktop Edge Back Control (Rule 15)
    const floatingBack = document.querySelector('.cgl-desktop-floating-back');
    if (floatingBack) {
        window.addEventListener('scroll', () => {
            if (window.innerWidth >= 1024) {
                if (window.scrollY > 400) {
                    floatingBack.classList.add('is-visible');
                } else {
                    floatingBack.classList.remove('is-visible');
                }
            } else {
                floatingBack.classList.remove('is-visible');
            }
        }, { passive: true });
    }

    // Check deep-link query parameter on page load (e.g. ?photo=12) (Rule 48)
    try {
        const params = new URLSearchParams(window.location.search);
        const photoNum = parseInt(params.get('photo'), 10);
        if (photoNum >= 1 && photoNum <= items.length) {
            setTimeout(() => {
                openViewer(photoNum - 1);
            }, 300);
        }
    } catch (e) {}

    // Initialize UI
    updateFavoritesUI();

})();
