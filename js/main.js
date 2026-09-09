document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.site-header');
    const toggle = document.querySelector('.mobile-nav-toggle');
    if (!header || !toggle) return;
    const mobile = matchMedia('(max-width: 767px)');
    const hover = matchMedia('(hover: hover) and (pointer: fine)');
    const items = [...header.querySelectorAll('.main-nav__item--dropdown')];
    const background = [...document.querySelectorAll('main, .site-footer')];
    function setDropdown(item, open) {
        item.classList.toggle('is-open', open);
        item.querySelector('.main-nav__toggle').setAttribute('aria-expanded', String(open));
        item.querySelector('.toggle-icon').textContent = open ? '−' : '+';
    }
    function setMenu(open, restore = false) {
        header.classList.toggle('nav-open', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
        document.body.style.overflow = open ? 'hidden' : '';
        background.forEach(el => el.inert = open);
        if (!open) items.forEach(item => setDropdown(item, false));
        if (restore) toggle.focus();
    }
    toggle.addEventListener('click', () => setMenu(!header.classList.contains('nav-open')));
    mobile.addEventListener('change', () => setMenu(false));
    items.forEach(item => {
        const button = item.querySelector('.main-nav__toggle');
        button.addEventListener('click', () => setDropdown(item, !item.classList.contains('is-open')));
        item.addEventListener('pointerenter', () => { if (!mobile.matches && hover.matches) setDropdown(item, true); });
        item.addEventListener('pointerleave', () => { if (!mobile.matches && hover.matches) setDropdown(item, false); });
        item.addEventListener('focusout', event => { if (!item.contains(event.relatedTarget)) setDropdown(item, false); });
        item.addEventListener('keydown', event => {
            const links = [...item.querySelectorAll('.dropdown-menu__link')];
            if (event.key === 'Escape' && item.classList.contains('is-open')) {
                event.preventDefault(); event.stopPropagation(); setDropdown(item, false); button.focus();
            } else if (['ArrowDown', 'ArrowUp'].includes(event.key)) {
                event.preventDefault(); setDropdown(item, true);
                const index = links.indexOf(document.activeElement);
                links[(index + (event.key === 'ArrowDown' ? 1 : links.length - 1) + links.length) % links.length].focus();
            }
        });
    });
    header.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
    document.addEventListener('click', event => { if (!event.target.closest('.main-nav__item--dropdown')) items.forEach(item => setDropdown(item, false)); });
    document.addEventListener('keydown', event => {
        if (!header.classList.contains('nav-open')) return;
        if (event.key === 'Escape') { event.preventDefault(); setMenu(false, true); }
        if (event.key === 'Tab') {
            const controls = [...header.querySelectorAll('a, button')].filter(el => el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden');
            const first = controls[0], last = controls[controls.length - 1];
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        }
    });
});

(() => {
  "use strict";

  /* =========================================================
     DATA
     ========================================================= */

  const SLIDES = Object.freeze([
    Object.freeze({
      src: "assets/images/hero/hero1.JPG",
      alt: "Editorial wedding portrait",
      category: "WEDDING STORY",
      location: "GUJARAT",
      year: "2026"
    }),
    Object.freeze({
      src: "assets/images/hero/hero6.jpg",
      alt: "Candid couple moment",
      category: "A QUIET MOMENT",
      location: "WEDDING",
      year: "2026"
    }),
    Object.freeze({
      src: "assets/images/hero/hero9.jpg",
      alt: "Bridal portrait details",
      category: "BRIDAL DETAILS",
      location: "HERITAGE",
      year: "2026"
    }),
    Object.freeze({
      src: "assets/images/hero/hero11.jpg",
      alt: "Family moments",
      category: "FAMILY STORY",
      location: "GUJARAT",
      year: "2026"
    }),
    Object.freeze({
      src: "assets/images/hero/hero14.jpg",
      alt: "Intimate portrait",
      category: "INTIMATE PORTRAIT",
      location: "STUDIO",
      year: "2026"
    })
  ]);

  const AUTOPLAY_DELAY = 6500;
  const TRANSITION_MS = 900;

  /* =========================================================
     DOM
     ========================================================= */

  const viewport = document.getElementById("galleryViewport");
  const track = document.getElementById("galleryTrack");
  const prevButton = document.getElementById("prevButton");
  const nextButton = document.getElementById("nextButton");

  const counter = document.getElementById("counter");
  const metaCategory = document.getElementById("metaCategory");
  const metaLocation = document.getElementById("metaLocation");
  const metaYear = document.getElementById("metaYear");
  const galleryStatus = document.getElementById("galleryStatus");

  if (!viewport || !track || !counter || SLIDES.length === 0) return;

  /* =========================================================
     STATE
     =========================================================

     currentIndex = logical slide. Always 0..SLIDES.length-1.
     physicalIndex = DOM slide, including clones.

     DOM:
       0 = clone last
       1 = real 0
       ...
       N = real N-1
       N+1 = clone first
  */

  let currentIndex = 0;
  let physicalIndex = 1;

  let autoplayTimer = null;
  let isAnimating = false;
  let isDragging = false;

  let baseTrackX = 0;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let inView = false;
  let hovered = false;

  /* =========================================================
     HELPERS
     ========================================================= */

  const mod = (value, length) => ((value % length) + length) % length;


  function setTrackTransition(enabled) {
    track.style.transition = enabled && !reducedMotion.matches
      ? `transform ${TRANSITION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`
      : "none";
  }

  function createSlide(item, physicalIndex, logicalIndex, isClone = false) {
    const figure = document.createElement("figure");

    figure.className = "dps-gallery__slide";
    figure.dataset.physicalIndex = String(physicalIndex);
    figure.dataset.logicalIndex = String(logicalIndex);

    if (isClone) {
      figure.dataset.clone = "true";
      figure.setAttribute("aria-hidden", "true");
    }

    const image = document.createElement("img");

    image.className = "dps-gallery__image";
    image.src = item.src;
    image.alt = item.alt;
    image.draggable = false;
    image.decoding = "async";
    image.loading = physicalIndex === 1 ? "eager" : "lazy";
    if (physicalIndex === 1) {
      image.setAttribute("fetchpriority", "high");
    }

    figure.appendChild(image);
    return figure;
  }

  function buildTrack() {
    const fragment = document.createDocumentFragment();
    const lastIndex = SLIDES.length - 1;

    fragment.appendChild(
      createSlide(SLIDES[lastIndex], 0, lastIndex, true)
    );

    SLIDES.forEach((item, index) => {
      fragment.appendChild(
        createSlide(item, index + 1, index, false)
      );
    });

    fragment.appendChild(
      createSlide(SLIDES[0], SLIDES.length + 1, 0, true)
    );

    track.replaceChildren(fragment);
  }

  function getSlides() {
    return Array.from(
      track.querySelectorAll(".dps-gallery__slide")
    );
  }

  function getPhysicalSlide(index = physicalIndex) {
    return getSlides()[index] || null;
  }

  function calculateTrackX(slide) {
    if (!slide) return 0;

    const viewportCenter = viewport.clientWidth / 2;
    const slideCenter =
      slide.offsetLeft + slide.offsetWidth / 2;

    return viewportCenter - slideCenter;
  }

  function applyTrackPosition({ animate = true } = {}) {
    const activeSlide = getPhysicalSlide();

    if (!activeSlide) return;

    baseTrackX = calculateTrackX(activeSlide);

    setTrackTransition(animate);

    track.style.transform =
      `translate3d(${baseTrackX}px, 0, 0)`;
  }

  /* =========================================================
     ONE VISUAL STATE SYSTEM
     Position NEVER comes from these classes.
     ========================================================= */

  function updateSlideVisualStates() {
    const slides = getSlides();

    slides.forEach((slide, index) => {
      slide.classList.remove(
        "is-active",
        "is-neighbor",
        "is-inactive"
      );

      if (index === physicalIndex) {
        slide.classList.add("is-active");
        return;
      }

      if (
        index === physicalIndex - 1 ||
        index === physicalIndex + 1
      ) {
        slide.classList.add("is-neighbor");
        return;
      }

      slide.classList.add("is-inactive");
    });
  }

  function updateCounter() {
    counter.textContent =
      `${String(currentIndex + 1).padStart(2, "0")} / ` +
      `${String(SLIDES.length).padStart(2, "0")}`;
  }

  function updateMetadata() {
    const item = SLIDES[currentIndex];

    metaCategory.textContent = item.category;
    metaLocation.textContent = item.location;
    metaYear.textContent = item.year;
  }

  function updateAccessibility() {
    const item = SLIDES[currentIndex];

    galleryStatus.textContent =
      `Photograph ${currentIndex + 1} of ${SLIDES.length}: ` +
      `${item.category}, ${item.location}, ${item.year}`;
  }

  /* =========================================================
     CENTRAL RENDER FUNCTION
     ========================================================= */

  function renderSlider(options = {}) {
    applyTrackPosition({
      animate: options.animate !== false
    });

    updateSlideVisualStates();
    updateCounter();
    updateMetadata();
    updateAccessibility();
  }

  /* =========================================================
     NAVIGATION
     ========================================================= */

  function goToSlide(index, source = "manual") {
    if (isAnimating) return;

    const nextIndex = mod(index, SLIDES.length);

    // All normal navigation moves exactly one physical position.
    // This is important at 01↔05 boundaries because the clone must
    // be animated into view before it is normalized.
    const forward =
      nextIndex === mod(currentIndex + 1, SLIDES.length);

    const backward =
      nextIndex === mod(currentIndex - 1, SLIDES.length);

    if (forward) {
      physicalIndex += 1;
    } else if (backward) {
      physicalIndex -= 1;
    } else {
      // Supports Home/End without introducing a second slider engine.
      physicalIndex = nextIndex + 1;
    }

    currentIndex = nextIndex;
    isAnimating = true;

    renderSlider({
      animate: true,
      source
    });

    if (reducedMotion.matches) normalizeAfterBoundary();
    restartAutoplay();
  }

  /* =========================================================
     SEAMLESS CLONE WRAP
     ========================================================= */

  function normalizeAfterBoundary() {
    const lastRealPhysical = SLIDES.length;
    const firstRealPhysical = 1;

    if (physicalIndex === SLIDES.length + 1) {
      physicalIndex = firstRealPhysical;
    } else if (physicalIndex === 0) {
      physicalIndex = lastRealPhysical;
    } else {
      isAnimating = false;
      return;
    }

    // Jump invisibly to the equivalent real slide.
    setTrackTransition(false);
    renderSlider({ animate: false, source: "boundary-reset" });

    // Force layout so the no-transition position is committed.
    void track.offsetWidth;

    // Restore the normal transition for the next interaction.
    setTrackTransition(true);
    isAnimating = false;
  }

  function handleTransitionEnd(event) {
    if (event.target !== track || event.propertyName !== "transform") {
      return;
    }

    normalizeAfterBoundary();
  }

  /* =========================================================
     AUTOPLAY — ONE TIMER ONLY
     ========================================================= */

  function stopAutoplay() {
    if (autoplayTimer !== null) {
      window.clearTimeout(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function startAutoplay() {
    stopAutoplay();
    if (document.hidden || reducedMotion.matches || !inView || hovered || isDragging) return;

    autoplayTimer = window.setTimeout(() => {
      autoplayTimer = null;
      goToSlide(currentIndex + 1, "autoplay");
    }, AUTOPLAY_DELAY);
  }

  function restartAutoplay() {
    startAutoplay();
  }

  /* =========================================================
     TOUCH SWIPE + PEEK CLICKS
     ========================================================= */

  function setupTouchSwipe() {
    let startX = 0;
    let startY = 0;
    let deltaX = 0;
    let isHorizontal = null;

    viewport.addEventListener("touchstart", (e) => {
      if (e.touches.length !== 1) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      deltaX = 0;
      isHorizontal = null;
      stopAutoplay();
    }, { passive: true });

    viewport.addEventListener("touchmove", (e) => {
      if (e.touches.length !== 1) return;
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const diffX = currentX - startX;
      const diffY = currentY - startY;

      if (isHorizontal === null) {
        if (Math.abs(diffX) > 8 || Math.abs(diffY) > 8) {
          isHorizontal = Math.abs(diffX) > Math.abs(diffY);
        }
      }

      if (isHorizontal) {
        deltaX = diffX;
      }
    }, { passive: true });

    viewport.addEventListener("touchend", () => {
      if (isHorizontal && Math.abs(deltaX) >= 40) {
        if (deltaX < 0) {
          goToSlide(currentIndex + 1, "swipe-left");
        } else {
          goToSlide(currentIndex - 1, "swipe-right");
        }
      } else {
        restartAutoplay();
      }
      isHorizontal = null;
      deltaX = 0;
    }, { passive: true });

    viewport.addEventListener("touchcancel", () => {
      restartAutoplay();
      isHorizontal = null;
      deltaX = 0;
    }, { passive: true });
  }

  function setupPeekClicks() {
    track.addEventListener("click", (e) => {
      const slide = e.target.closest(".dps-gallery__slide");
      if (!slide || slide.classList.contains("is-active")) return;
      const pIndex = parseInt(slide.dataset.physicalIndex, 10);
      if (pIndex === physicalIndex + 1) {
        goToSlide(currentIndex + 1, "peek-next");
      } else if (pIndex === physicalIndex - 1) {
        goToSlide(currentIndex - 1, "peek-prev");
      }
    });
  }

  /* =========================================================
     HOVER PAUSE
     Only enabled on devices that genuinely support hover.
     ========================================================= */

  function setupHoverPause() {
    if (!window.matchMedia("(hover: hover)").matches) return;

    viewport.addEventListener("mouseenter", () => { hovered = true; stopAutoplay(); });
    viewport.addEventListener("mouseleave", () => { hovered = false; restartAutoplay(); });
  }

  /* =========================================================
     CONTROLS + KEYBOARD
     ========================================================= */

  function setupControls() {
    prevButton.addEventListener("click", () => {
      goToSlide(currentIndex - 1, "manual");
    });

    nextButton.addEventListener("click", () => {
      goToSlide(currentIndex + 1, "manual");
    });
  }

  function setupKeyboard() {
    viewport.tabIndex = 0;

    viewport.addEventListener("keydown", event => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goToSlide(currentIndex - 1, "keyboard");
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        goToSlide(currentIndex + 1, "keyboard");
      }

      if (event.key === "Home") {
        event.preventDefault();
        goToSlide(0, "keyboard");
      }

      if (event.key === "End") {
        event.preventDefault();
        goToSlide(SLIDES.length - 1, "keyboard");
      }
    });
  }

  /* =========================================================
     RESPONSIVE RESIZE
     ========================================================= */

  function setupResizeObserver() {
    const observer = new ResizeObserver(() => {
      // currentIndex and physicalIndex remain untouched.
      // Only the physical center is recalculated.
      normalizeAfterBoundary();
      renderSlider({ animate: false, source: "resize" });
    });

    observer.observe(viewport);
  }

  /* =========================================================
     VISIBILITY / TAB PERFORMANCE
     ========================================================= */

  function setupVisibilityHandling() {
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        stopAutoplay();
      } else {
        restartAutoplay();
      }
    });
  }

  /* =========================================================
     IMAGE ERROR HANDLING
     ========================================================= */

  function setupImageErrorHandling() {
    track.addEventListener("error", event => {
      if (event.target instanceof HTMLImageElement) {
        event.target.setAttribute(
          "alt",
          "Photograph unavailable"
        );
      }
    }, true);
  }

  /* =========================================================
     INIT
     ========================================================= */

  function init() {
    buildTrack();

    track.addEventListener(
      "transitionend",
      handleTransitionEnd
    );

    setupControls();
    setupKeyboard();
    setupTouchSwipe();
    setupPeekClicks();
    setupHoverPause();
    setupResizeObserver();
    setupVisibilityHandling();
    new IntersectionObserver(entries => { inView = entries[0].isIntersecting; restartAutoplay(); }).observe(viewport);
    reducedMotion.addEventListener('change', () => { normalizeAfterBoundary(); restartAutoplay(); });
    let mouseStart = null;
    viewport.addEventListener('pointerdown', event => {
      if (event.pointerType !== 'mouse' || event.button !== 0 || event.target.closest('button')) return;
      mouseStart = event.clientX; isDragging = true; stopAutoplay(); viewport.setPointerCapture(event.pointerId);
    });
    viewport.addEventListener('pointerup', event => {
      if (mouseStart === null) return;
      const delta = event.clientX - mouseStart; mouseStart = null; isDragging = false;
      if (Math.abs(delta) >= 50) goToSlide(currentIndex + (delta < 0 ? 1 : -1), 'pointer');
      restartAutoplay();
    });
    viewport.addEventListener('pointercancel', () => { mouseStart = null; isDragging = false; restartAutoplay(); });
    setupImageErrorHandling();

    requestAnimationFrame(() => {
      renderSlider({
        animate: false,
        source: "init"
      });

      startAutoplay();
    });
  }

  init();
})();
