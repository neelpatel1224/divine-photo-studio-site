/* Section 12 — Final Booking CTA scroll reveal */
(() => {
    const section = document.querySelector('.booking-cta');
    if (!section || !('IntersectionObserver' in window)) return;

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motion.matches) return;

    const items = section.querySelectorAll('[data-cta-reveal]');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('booking-cta__revealed');
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.15 });

    items.forEach(item => observer.observe(item));
    section.classList.add('booking-cta--motion');

    const handleReducedMotion = () => {
        if (!motion.matches) return;
        observer.disconnect();
        section.classList.remove('booking-cta--motion');
    };

    motion.addEventListener('change', handleReducedMotion);
})();
