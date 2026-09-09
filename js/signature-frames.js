(() => {
    const section = document.querySelector('.signature-frames');
    if (!section || !('IntersectionObserver' in window)) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motion.matches) return;
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('signature-frame--revealing');
            observer.unobserve(entry.target);
        });
    }, { threshold:0, rootMargin:'0px 0px -24px 0px' });
    section.querySelectorAll('.signature-frame').forEach(figure => observer.observe(figure));
    motion.addEventListener('change', () => {
        if (!motion.matches) return;
        observer.disconnect();
        section.querySelectorAll('.signature-frame--revealing').forEach(figure => figure.classList.remove('signature-frame--revealing'));
    });
})();
