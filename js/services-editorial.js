/* Section 05: reveal once, with visible content as the default. */
(() => {
    const section = document.querySelector('.services-editorial');
    if (!section) return;
    if (!('IntersectionObserver' in window)) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motion.matches) return;
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('service-entry--revealing');
            observer.unobserve(entry.target);
        });
    }, { threshold:0, rootMargin:'0px 0px -24px 0px' });
    section.querySelectorAll('.service-entry').forEach(row => observer.observe(row));
    motion.addEventListener('change', () => {
        if (!motion.matches) return;
        observer.disconnect();
        section.querySelectorAll('.service-entry--revealing').forEach(row => row.classList.remove('service-entry--revealing'));
    });
})();
