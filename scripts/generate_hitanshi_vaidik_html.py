import os
import json

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MANIFEST_FILE = os.path.join(BASE_DIR, "assets", "images", "couples", "hitanshi-vaidik", "manifest.json")
OUTPUT_HTML = os.path.join(BASE_DIR, "hitanshi-vaidik.html")

with open(MANIFEST_FILE, "r", encoding="utf-8") as f:
    items = json.load(f)

print(f"Loaded {len(items)} items from manifest.")

# Generate gallery items HTML
gallery_html_parts = []
for idx, item in enumerate(items):
    eager_str = 'loading="eager" fetchpriority="high"' if idx < 8 else 'loading="lazy"'
    item_html = f'''        <div class="cgl-item" data-image-id="{item['index']}">
            <a href="assets/images/couples/hitanshi-vaidik/{item['filename']}" class="cgl-item__link" aria-label="Enlarge photograph {item['index']}">
                <img class="cgl-item__img"
                     src="assets/images/couples/hitanshi-vaidik/{item['thumb']}"
                     srcset="assets/images/couples/hitanshi-vaidik/{item['thumb']} 700w, assets/images/couples/hitanshi-vaidik/{item['filename']} 1400w"
                     sizes="(max-width: 767px) 50vw, (max-width: 1180px) 33vw, 25vw"
                     width="{item['width']}"
                     height="{item['height']}"
                     alt="{item['alt']}"
                     {eager_str}
                     decoding="async">
            </a>
            <button type="button" class="cgl-item__fav" aria-label="Add to favorites">
                <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            </button>
        </div>'''
    gallery_html_parts.append(item_html)

gallery_inner_html = "\n".join(gallery_html_parts)

page_html = f'''<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <title>Hitanshi &amp; Vaidik | Couple Gallery | DIVINE PHOTO STUDIO</title>
    <meta name="description" content="A curated wedding celebration gallery of Hitanshi and Vaidik, documented with unhurried elegance by Divine Photo Studio.">
    <meta name="theme-color" content="#FFFDF8">

    <!-- Open Graph Social Metadata (Rule 51) -->
    <meta property="og:title" content="Hitanshi &amp; Vaidik | Couple Gallery | DIVINE PHOTO STUDIO">
    <meta property="og:description" content="A curated wedding celebration gallery of Hitanshi and Vaidik, documented with unhurried elegance by Divine Photo Studio.">
    <meta property="og:image" content="assets/images/couples/hitanshi-vaidik/cover.webp">
    <meta property="og:type" content="article">

    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Inter:wght@300;400;500;600&family=Montserrat:wght@300;400;500&display=swap" rel="stylesheet">

    <!-- Core Stylesheets -->
    <link rel="stylesheet" href="css/variables.css">
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/footer.css">
    <!-- Dedicated Couple Gallery Stylesheet -->
    <link rel="stylesheet" href="css/couple-gallery.css">
</head>

<body class="couple-gallery-page">

    <!-- ======================================================================
         01. Minimal Gallery Navigation (Rules 1–6, 12–14, 28)
         Left: ← BACK TO COUPLE STORIES (desktop) / ← STORIES (mobile)
         Right: HOME
         Inter 9–10px, uppercase, letter-spacing .20em, color #666B61, hover #B4794B
         Background: #F6F4EE, height: 60px desktop, 56px tablet, 50px mobile
         ====================================================================== -->
    <header class="cgl-nav" role="banner" aria-label="Gallery Navigation">
        <div class="cgl-nav__inner">
            <a href="couple-stories.html" class="cgl-nav__link cgl-nav__link--back" aria-label="Back to Couple Stories">
                <span class="cgl-nav__text cgl-nav__text--desktop">&larr; BACK TO COUPLE STORIES</span>
                <span class="cgl-nav__text cgl-nav__text--mobile">&larr; STORIES</span>
            </a>
            <a href="index.html" class="cgl-nav__link cgl-nav__link--home" aria-label="Divine Photo Studio Home">
                <span class="cgl-nav__text">HOME</span>
            </a>
        </div>
    </header>

    <main id="main-content">

        <!-- ==================================================================
             02. Large Cover Photograph (Rules 7–11)
             Immediate start after minimal navigation:
             Gap: Desktop 16px (12–20px target), Tablet 12px, Mobile 10px
             Height: 76dvh desktop (72–82dvh target), 60dvh mobile (55–68dvh target)
             Width: Desktop calc(100% - 40px), 1440px+ calc(100% - 32px), Mobile calc(100% - 16px)
             ================================================================== -->
        <section class="cgl-cover" aria-label="Gallery Cover Photograph">
            <div class="cgl-cover__wrap">
                <img class="cgl-cover__img"
                     src="assets/images/couples/hitanshi-vaidik/cover.webp"
                     srcset="assets/images/couples/hitanshi-vaidik/cover-900.webp 900w, assets/images/couples/hitanshi-vaidik/cover.webp 1920w"
                     sizes="(max-width: 767px) calc(100vw - 16px), 96vw"
                     alt="Hitanshi and Vaidik wedding ceremony cover portrait"
                     width="1920" height="1280"
                     loading="eager"
                     fetchpriority="high">
            </div>
        </section>

        <!-- ==================================================================
             03. Couple Identity & Gallery Actions (Rules 15–19, 31, 32)
             Structure:
             DATE (only if real)
             HITANSHI — VAIDIK (Cormorant Garamond clamp)
             DIVINE PHOTO STUDIO (no bullet on mobile)
             VIEW GALLERY  |  SHARE  |  SLIDESHOW  |  FAVORITES
             ================================================================== -->
        <!-- ==================================================================
             03. Couple Identity Strip (Desktop 3-Column / Mobile Stack) (Rules 5–13, 19)
             Desktop (>= 1024px):
               LEFT: DIVINE PHOTO STUDIO
               CENTER: Date + Couple Name (Cormorant Garamond clamp(34px, 3vw, 50px))
               RIGHT: VIEW GALLERY (Compact dark button)
             Mobile (< 1024px):
               Preserved stacked hierarchy with mobile action controls
             ================================================================== -->
        <section class="cgl-identity" id="gallery-identity" aria-labelledby="couple-title">
            <div class="cgl-identity__inner">
                <div class="cgl-identity__grid">
                    <div class="cgl-identity__col cgl-identity__col--left">
                        <span class="cgl-identity__studio">DIVINE PHOTO STUDIO</span>
                    </div>
                    <div class="cgl-identity__col cgl-identity__col--center">
                        <p class="cgl-identity__date">JANUARY 21ST, 2024</p>
                        <h1 class="cgl-identity__title" id="couple-title">HITANSHI &mdash; VAIDIK</h1>
                    </div>
                    <div class="cgl-identity__col cgl-identity__col--right">
                        <a href="#masonry-gallery" class="cgl-btn-view-gallery cgl-view-gallery-btn" id="btn-view-gallery">
                            VIEW GALLERY
                        </a>
                    </div>
                </div>

                <!-- Mobile Action Controls (< 1024px) -->
                <div class="cgl-identity__mobile-actions" role="toolbar" aria-label="Gallery Controls">
                    <a href="#masonry-gallery" class="cgl-action-btn cgl-action-btn--primary cgl-view-gallery-btn">
                        VIEW GALLERY
                    </a>
                    <button type="button" class="cgl-action-btn cgl-tool-btn cgl-tool-btn--share" id="btn-gallery-share" aria-label="Share gallery">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8m-4-6l-4-4l-4 4m4-4v13"/></svg>
                        <span>SHARE</span>
                    </button>
                    <button type="button" class="cgl-action-btn cgl-tool-btn cgl-tool-btn--slideshow" id="btn-gallery-slideshow" aria-label="Start slideshow">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                        <span>SLIDESHOW</span>
                    </button>
                    <button type="button" class="cgl-action-btn cgl-tool-btn cgl-tool-btn--favorites" id="btn-gallery-favorites" aria-label="Filter favorites">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                        <span>FAVORITES</span>
                        <span class="cgl-tool-badge">0</span>
                    </button>
                </div>
            </div>
        </section>

        <!-- ==================================================================
             04. Main Masonry Proof Gallery
             True mixed-height natural aspect ratios, dense continuous wall
             ================================================================== -->
        <section class="cgl-gallery" id="masonry-gallery" aria-label="Wedding Proof Gallery">
            <div class="cgl-empty-favorites">
                <p>No favorites saved yet. Click the heart icon on any photograph to save your favorites.</p>
            </div>
            <div class="cgl-masonry">
{gallery_inner_html}
            </div>
        </section>

        <!-- ==================================================================
             06. Quiet Desktop Return Bar & Back to Top (Rules 14, 15)
             ================================================================== -->
        <div class="cgl-back-to-top-wrap">
            <button type="button" class="cgl-back-to-top-btn" aria-label="Back to top of gallery">
                BACK TO TOP
            </button>
        </div>

        <nav class="cgl-desktop-exit-nav" aria-label="Gallery Exit Navigation">
            <div class="cgl-desktop-exit-nav__inner">
                <a href="couple-stories.html" class="cgl-exit-link">&larr; BACK TO COUPLE STORIES</a>
                <a href="index.html" class="cgl-exit-link">HOME</a>
            </div>
        </nav>

    </main>

    <!-- Subtle Desktop Edge Back Control (Rule 15 - Visible only after scrolling past hero on >= 1024px) -->
    <a href="couple-stories.html" class="cgl-desktop-floating-back" aria-label="Back to Couple Stories">
        &larr; STORIES
    </a>

    <!-- ======================================================================
         07. Existing Approved DIVINE Footer
         ====================================================================== -->
    <footer class="site-footer" aria-label="Site Footer">
        <div class="site-footer__container">
            <!-- Row A: Brand Block -->
            <div class="site-footer__brand-block">
                <a href="index.html" class="site-footer__brand-name" aria-label="Divine Photo Studio Home">
                    DiViNE PHOTO STUDIO
                </a>
                <p class="site-footer__brand-tagline">
                    Visual Storytellers &amp; Fine Art Wedding Cinematographers
                </p>
                <div class="site-footer__social-links" aria-label="Social media links">
                    <!-- TODO: Replace placeholder URLs with real social handles -->
                    <a href="https://instagram.com" class="site-footer__social-link" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                        <span>INSTAGRAM</span>
                    </a>
                    <span class="site-footer__social-separator" aria-hidden="true">/</span>
                    <a href="https://youtube.com" class="site-footer__social-link" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                        <span>YOUTUBE</span>
                    </a>
                    <span class="site-footer__social-separator" aria-hidden="true">/</span>
                    <a href="https://facebook.com" class="site-footer__social-link" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                        <span>FACEBOOK</span>
                    </a>
                </div>
            </div>

            <!-- Row B: Curated 7-Frame Photography Strip -->
            <div class="site-footer__strip-wrap" aria-label="Curated portfolio highlights">
                <div class="site-footer__strip" id="footer-strip" role="region" aria-label="Image gallery strip" tabindex="0">
                    <figure class="site-footer__strip-item site-footer__strip-item--l32 site-footer__strip-item--wide">
                        <img class="site-footer__strip-img" src="assets/images/footer/footer-01.jpg"
                            alt="Traditional wedding ceremony ritual" width="600" height="400" loading="lazy" decoding="async">
                    </figure>
                    <figure class="site-footer__strip-item site-footer__strip-item--p45">
                        <img class="site-footer__strip-img" src="assets/images/footer/footer-02.jpg"
                            alt="Quiet couple portrait during golden hour" width="400" height="500" loading="lazy" decoding="async">
                    </figure>
                    <figure class="site-footer__strip-item site-footer__strip-item--l32 site-footer__strip-item--wide">
                        <img class="site-footer__strip-img" src="assets/images/footer/footer-03.jpg"
                            alt="Reception celebration moment" width="600" height="400" loading="lazy" decoding="async">
                    </figure>
                    <figure class="site-footer__strip-item site-footer__strip-item--p45">
                        <img class="site-footer__strip-img" src="assets/images/footer/footer-04.jpg"
                            alt="Intimate engagement moment" width="400" height="500" loading="lazy" decoding="async">
                    </figure>
                    <figure class="site-footer__strip-item site-footer__strip-item--l32 site-footer__strip-item--wide">
                        <img class="site-footer__strip-img" src="assets/images/footer/footer-05.jpg"
                            alt="Corporate event photography" width="600" height="400" loading="lazy" decoding="async">
                    </figure>
                    <figure class="site-footer__strip-item site-footer__strip-item--p45">
                        <img class="site-footer__strip-img" src="assets/images/footer/footer-06.jpg"
                            alt="Tender baby shower celebration" width="400" height="500" loading="lazy" decoding="async">
                    </figure>
                    <figure class="site-footer__strip-item site-footer__strip-item--detail">
                        <img class="site-footer__strip-img" src="assets/images/footer/footer-07.jpg"
                            alt="Artful detail photograph" width="400" height="500" loading="lazy" decoding="async">
                    </figure>
                </div>
                <div class="site-footer__strip-controls" aria-hidden="true">
                    <button type="button" class="site-footer__strip-btn site-footer__strip-btn--prev"
                        id="footer-strip-prev" aria-label="Scroll images left">&larr;</button>
                    <button type="button" class="site-footer__strip-btn site-footer__strip-btn--next"
                        id="footer-strip-next" aria-label="Scroll images right">&rarr;</button>
                </div>
            </div>

            <!-- Row C: Bottom Information Row -->
            <div class="site-footer__info-row">
                <div class="site-footer__info-col site-footer__info-col--left">
                    <h3 class="site-footer__info-heading">Find us here</h3>
                    <address class="site-footer__address">
                        <span class="site-footer__address-line">[STUDIO ADDRESS]</span>
                        <span class="site-footer__address-line">Gujarat, India</span>
                    </address>
                </div>
                <div class="site-footer__info-col site-footer__info-col--right">
                    <h3 class="site-footer__info-heading">Contact us</h3>
                    <div class="site-footer__contact-details">
                        <span class="site-footer__contact-link">[PHONE NUMBER]</span>
                        <span class="site-footer__contact-link">[EMAIL ADDRESS]</span>
                    </div>
                </div>
            </div>

            <!-- Row D: Copyright + Back-to-Top -->
            <div class="site-footer__copyright-row">
                <p class="site-footer__copyright">
                    &copy; <span id="footer-year">2026</span> DIVINE PHOTO STUDIO
                </p>
                <button type="button" class="site-footer__back-to-top" id="footer-back-to-top" aria-label="Back to top">
                    <span class="site-footer__back-to-top-text">BACK TO TOP</span>
                    <span class="site-footer__back-to-top-arrow" aria-hidden="true">&uarr;</span>
                </button>
            </div>
        </div>
    </footer>

    <!-- ======================================================================
         08. Pixieset-Style Light Fullscreen Viewer Modal (Rules 17–25, 30, 67)
         Top bar: [ ← BACK ] ... [ SHARE ] [ FULLSCREEN ] [ × CLOSE ]
         ====================================================================== -->
    <div class="cgl-viewer" id="gallery-viewer" role="dialog" aria-modal="true" aria-label="Fullscreen photograph viewer" aria-hidden="true">
        <!-- Topbar -->
        <div class="cgl-viewer__topbar">
            <button type="button" class="cgl-viewer__close-btn" aria-label="Close viewer and return to gallery">
                &larr; BACK
            </button>
            <div class="cgl-viewer__top-actions">
                <button type="button" class="cgl-viewer__icon-btn cgl-viewer__fav-toggle" aria-label="Add to favorites">
                    <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                </button>
                <button type="button" class="cgl-viewer__icon-btn cgl-viewer__share-toggle" aria-label="Share photograph">
                    <svg viewBox="0 0 24 24"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8m-4-6l-4-4l-4 4m4-4v13" stroke="currentColor" stroke-width="1.8" fill="none"/></svg>
                </button>
                <button type="button" class="cgl-viewer__icon-btn cgl-viewer__fullscreen-toggle" aria-label="Enter fullscreen">
                    <svg viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" stroke="currentColor" stroke-width="1.8" fill="none"/></svg>
                </button>
                <button type="button" class="cgl-viewer__icon-btn" onclick="document.querySelector('.cgl-viewer__close-btn').click()" aria-label="Close viewer">
                    <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"></line><line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"></line></svg>
                </button>
            </div>
        </div>

        <!-- Stage -->
        <div class="cgl-viewer__stage">
            <button type="button" class="cgl-viewer__nav cgl-viewer__nav--prev" aria-label="Previous photograph">
                <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <div class="cgl-viewer__img-wrap">
                <img class="cgl-viewer__img" src="assets/images/couples/hitanshi-vaidik/cover.webp" alt="">
            </div>
            <button type="button" class="cgl-viewer__nav cgl-viewer__nav--next" aria-label="Next photograph">
                <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
        </div>

        <!-- Bottombar -->
        <div class="cgl-viewer__bottombar">
            <div class="cgl-viewer__meta-wrap">
                <span class="cgl-viewer__meta">1 / {len(items)}</span>
            </div>
            <div class="cgl-viewer__bottom-tools">
                <button type="button" class="cgl-viewer__slideshow-btn cgl-viewer__play-toggle" aria-label="Start slideshow">
                    <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3" fill="currentColor"></polygon></svg>
                    <span>SLIDESHOW</span>
                </button>
            </div>
        </div>
    </div>

    <!-- ======================================================================
         09. Share Fallback Modal (Rules 10–13)
         ====================================================================== -->
    <div class="cgl-share-modal" id="share-modal" role="dialog" aria-modal="true" aria-label="Share options" aria-hidden="true">
        <div class="cgl-share-card">
            <h3 class="cgl-share-card__title">SHARE GALLERY</h3>
            <button type="button" class="cgl-share-card__close" id="share-modal-close" aria-label="Close share panel">&times;</button>
            <div class="cgl-share-card__actions">
                <button type="button" class="cgl-share-btn cgl-share-btn--primary" id="copy-link-btn">
                    COPY LINK
                </button>
                <a href="#" target="_blank" rel="noopener noreferrer" class="cgl-share-btn" id="whatsapp-share-btn">
                    WHATSAPP
                </a>
            </div>
        </div>
    </div>

    <!-- Floating Inline Toast Notification (Rule 11) -->
    <div class="cgl-toast" id="cgl-toast" role="status" aria-live="polite">
        LINK COPIED
    </div>

    <!-- Core Scripts -->
    <script src="js/main.js?v=1.2"></script>
    <script src="js/footer.js"></script>
    <script src="js/couple-gallery.js"></script>
</body>

</html>
'''

with open(OUTPUT_HTML, "w", encoding="utf-8") as f:
    f.write(page_html)

print(f"[OK] Generated {OUTPUT_HTML} with V1 refinement markup successfully!")
