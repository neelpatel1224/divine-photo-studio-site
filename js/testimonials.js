/* Section 10 — Testimonials scroll reveal */
(() => {
    const section = document.querySelector('.testimonials');
    if (!section || !('IntersectionObserver' in window)) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motion.matches) return;
    const items = section.querySelectorAll('[data-testimonial-reveal]');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('testimonials__revealed');
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.1 });
    items.forEach(item => observer.observe(item));
    section.classList.add('testimonials--motion');
    const showAll = () => {
        if (!motion.matches) return;
        observer.disconnect();
        section.classList.remove('testimonials--motion');
    };
    motion.addEventListener('change', showAll);
})();
