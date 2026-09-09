/* Reveal each part once; preserve readable content when motion is reduced. */
(() => {
    const section = document.querySelector('.experience');
    if (!section || !('IntersectionObserver' in window)) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motion.matches) return;
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('experience--revealing');
            observer.unobserve(entry.target);
        });
    }, { threshold:0, rootMargin:'0px 0px -24px 0px' });
    section.querySelectorAll('[data-experience-reveal]').forEach(element => observer.observe(element));
    motion.addEventListener('change', () => {
        if (!motion.matches) return;
        observer.disconnect();
        section.querySelectorAll('.experience--revealing').forEach(element => element.classList.remove('experience--revealing'));
    });
})();
