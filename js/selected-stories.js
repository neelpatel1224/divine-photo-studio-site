/* Observe visible story boxes, never clipped images. Content is visible by default. */
(() => {
    const section = document.querySelector('.selected-stories');
    if (!section || !('IntersectionObserver' in window)) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motion.matches) return;
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('story--revealing');
            observer.unobserve(entry.target);
        });
    }, { threshold: 0, rootMargin: '0px 0px 40px 0px' });
    section.querySelectorAll('.story').forEach(story => observer.observe(story));
    motion.addEventListener('change', () => {
        if (motion.matches) {
            observer.disconnect();
            section.querySelectorAll('.story--revealing').forEach(story => story.classList.remove('story--revealing'));
        }
    });
})();
