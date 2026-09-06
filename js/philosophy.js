/* Isolated, once-only Section 03 reveals. No shared slider or navigation state. */
(() => {
    const section = document.querySelector('.philosophy');
    if (!section || !('IntersectionObserver' in window)) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motion.matches) return;
    const items = section.querySelectorAll('[data-philosophy-reveal]');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('philosophy__revealed');
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.08 });
    items.forEach(item => observer.observe(item));
    section.classList.add('philosophy--motion');
    const showAll = () => {
        if (!motion.matches) return;
        observer.disconnect();
        section.classList.remove('philosophy--motion');
    };
    motion.addEventListener('change', showAll);
    section.addEventListener('focusin', () => {
        items.forEach(item => item.classList.add('philosophy__revealed'));
        observer.disconnect();
    });
})();
