document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.site-header');
    const mobileToggle = document.querySelector('.mobile-nav-toggle');
    const dropdownItems = document.querySelectorAll('.main-nav__item--dropdown');
    
    // Function to close mobile menu
    const closeMobileMenu = () => {
        if (!header.classList.contains('nav-open')) return;
        header.classList.remove('nav-open');
        mobileToggle.setAttribute('aria-expanded', 'false');
        mobileToggle.setAttribute('aria-label', 'Open navigation');
        document.body.style.overflow = ''; // Remove scroll lock
        
        dropdownItems.forEach(item => {
            item.classList.remove('is-open');
            const toggleBtn = item.querySelector('.main-nav__toggle');
            if (toggleBtn) {
                toggleBtn.setAttribute('aria-expanded', 'false');
            }
        });
    };

    // Mobile Menu Toggle
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
            
            if (isExpanded) {
                closeMobileMenu();
            } else {
                mobileToggle.setAttribute('aria-expanded', 'true');
                header.classList.add('nav-open');
                mobileToggle.setAttribute('aria-label', 'Close navigation');
                document.body.style.overflow = 'hidden'; // Apply scroll lock
            }
        });
    }

    // Dropdown Toggles (for mobile and desktop click interaction)
    dropdownItems.forEach(item => {
        const toggleBtn = item.querySelector('.main-nav__toggle');
        const icon = item.querySelector('.toggle-icon');
        
        if (toggleBtn) {
            toggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                
                const isOpen = item.classList.contains('is-open');

                if (isOpen) {
                    item.classList.remove('is-open');
                    toggleBtn.setAttribute('aria-expanded', 'false');
                    if (icon) icon.textContent = '+';
                } else {
                    item.classList.add('is-open');
                    toggleBtn.setAttribute('aria-expanded', 'true');
                    if (icon) icon.textContent = '−';
                }
            });
        }
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.main-nav__item--dropdown') && !e.target.closest('.mobile-nav-toggle')) {
            dropdownItems.forEach(item => {
                item.classList.remove('is-open');
                const toggleBtn = item.querySelector('.main-nav__toggle');
                const icon = item.querySelector('.toggle-icon');
                if (toggleBtn) {
                    toggleBtn.setAttribute('aria-expanded', 'false');
                }
                if (icon) icon.textContent = '+';
            });
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // Close mobile menu if open
            if (header.classList.contains('nav-open')) {
                closeMobileMenu();
                mobileToggle.focus();
            }
            
            // Close dropdowns if open
            dropdownItems.forEach(item => {
                if (item.classList.contains('is-open')) {
                    item.classList.remove('is-open');
                    const toggleBtn = item.querySelector('.main-nav__toggle');
                    const icon = item.querySelector('.toggle-icon');
                    if (toggleBtn) {
                        toggleBtn.setAttribute('aria-expanded', 'false');
                        toggleBtn.focus();
                    }
                    if (icon) icon.textContent = '+';
                }
            });
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
  const DRAG_RESISTANCE = 0.42;
  const MIN_SWIPE_THRESHOLD = 50;
  const MAX_SWIPE_THRESHOLD = 80;

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

  let pointerId = null;
  let dragStartX = 0;
  let dragDelta = 0;
  let baseTrackX = 0;

  let transitionToken = 0;

  /* =========================================================
     HELPERS
     ========================================================= */

  const mod = (value, length) => ((value % length) + length) % length;

  const wait = (ms) =>
    new Promise(resolve => window.setTimeout(resolve, ms));

  function setTrackTransition(enabled) {
    track.style.transition = enabled
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
    image.loading = physicalIndex <= 2 ? "eager" : "lazy";

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

    viewport.addEventListener("mouseenter", stopAutoplay);
    viewport.addEventListener("mouseleave", restartAutoplay);
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
      renderSlider({
        animate: false,
        source: "resize"
      });
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
