/* Shared category enhancement: real image anchors work without JavaScript. */
(() => {
  'use strict';
  const root = document.querySelector('[data-category-archive]');
  if (!root) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  if ('IntersectionObserver' in window && !motion.matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        // Add the animation only once the element is on screen. Never hide waiting content.
        entry.target.classList.add('archive-revealed');
        observer.unobserve(entry.target);
      });
    }, { threshold: .08 });
    root.querySelectorAll('[data-archive-reveal]').forEach(el => observer.observe(el));
    motion.addEventListener('change', () => {
      if (motion.matches) {
        observer.disconnect();
        root.querySelectorAll('.archive-revealed').forEach(el => el.classList.remove('archive-revealed'));
      }
    });
  }
  const dialog = document.querySelector('#archive-lightbox');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  const links = [...root.querySelectorAll('[data-archive-image]')];
  const image = dialog.querySelector('img');
  const caption = dialog.querySelector('[data-lightbox-caption]');
  let current = 0;
  let opener = null;
  let previousOverflow = '';
  function render() {
    const link = links[current];
    image.src = link.href;
    image.alt = link.querySelector('img').alt;
    caption.textContent = `${current + 1} / ${links.length} — ${image.alt}`;
  }
  function step(delta) { current = (current + delta + links.length) % links.length; render(); }
  links.forEach((link, index) => link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    current = index; opener = link; previousOverflow = document.body.style.overflow;
    render(); dialog.showModal(); document.body.style.overflow = 'hidden';
    dialog.querySelector('[data-lightbox-close]').focus();
  }));
  dialog.querySelector('[data-lightbox-close]').addEventListener('click', () => dialog.close());
  dialog.querySelector('[data-lightbox-prev]').addEventListener('click', () => step(-1));
  dialog.querySelector('[data-lightbox-next]').addEventListener('click', () => step(1));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); step(event.key === 'ArrowLeft' ? -1 : 1); }
    if (event.key === 'Tab') {
      const controls = [...dialog.querySelectorAll('button')];
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  let touchStartX = 0;
  dialog.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  dialog.addEventListener('touchend', e => {
    const diff = e.changedTouches[0].screenX - touchStartX;
    if (Math.abs(diff) > 50) {
      step(diff < 0 ? 1 : -1);
    }
  }, { passive: true });
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => { document.body.style.overflow = previousOverflow; opener?.focus({ preventScroll: true }); });
})();
