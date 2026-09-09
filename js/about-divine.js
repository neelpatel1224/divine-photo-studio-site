/* Section 11 — About / Meet the Partners scroll reveal */
(() => {
    const section = document.querySelector('.partners');
    if (!section || !('IntersectionObserver' in window)) return;

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motion.matches) return;

    const items = section.querySelectorAll('[data-partner-reveal]');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('partners__revealed');
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.12 });

    items.forEach(item => observer.observe(item));
    section.classList.add('partners--motion');

    const handleReducedMotion = () => {
        if (!motion.matches) return;
        observer.disconnect();
        section.classList.remove('partners--motion');
    };

    motion.addEventListener('change', handleReducedMotion);
})();
