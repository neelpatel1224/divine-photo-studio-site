/* Section 09 — Trust / Recognition scroll reveal */
(() => {
    const section = document.querySelector('.trust');
    if (!section || !('IntersectionObserver' in window)) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motion.matches) return;
    const items = section.querySelectorAll('[data-trust-reveal]');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('trust__revealed');
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.1 });
    items.forEach(item => observer.observe(item));
    section.classList.add('trust--motion');
    const showAll = () => {
        if (!motion.matches) return;
        observer.disconnect();
        section.classList.remove('trust--motion');
    };
    motion.addEventListener('change', showAll);
})();
