/* Section 03 only: JS translates shells; CSS animates their inner groups. */
(() => {
    const svg = document.querySelector('.philosophy-vectors');
    if (!svg) return;
    const section = svg.closest('.philosophy');
    const shells = [...svg.querySelectorAll('.philosophy-vector-shell')];
    const allowed = matchMedia('(hover: hover) and (pointer: fine) and (min-width: 768px) and (prefers-reduced-motion: no-preference)');
    let frame = 0, x = 0, y = 0, targetX = 0, targetY = 0;
    const tick = () => {
        frame = 0;
        if (!allowed.matches || document.hidden) { reset(); return; }
        x += (targetX - x) * .06;
        y += (targetY - y) * .06;
        // Convert screen pixels to SVG units so the visible motion stays bounded.
        const scale = Math.max(svg.clientWidth / 1440, svg.clientHeight / 900) || 1;
        shells.forEach(shell => {
            const depth = Number(shell.dataset.vectorDepth) / scale;
            shell.style.transform = `translate3d(${x * depth}px, ${y * depth}px, 0)`;
        });
        if (Math.abs(targetX - x) + Math.abs(targetY - y) > .001) frame = requestAnimationFrame(tick);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(tick); };
    const move = event => {
        if (!allowed.matches || document.hidden) { reset(); return; }
        const rect = section.getBoundingClientRect();
        targetX = Math.max(-1,Math.min(1,(event.clientX - rect.left) / rect.width * 2 - 1));
        targetY = Math.max(-1,Math.min(1,(event.clientY - rect.top) / rect.height * 2 - 1));
        schedule();
    };
    const leave = () => { targetX = 0; targetY = 0; schedule(); };
    const reset = () => {
        cancelAnimationFrame(frame); frame = 0;
        x = y = targetX = targetY = 0;
        shells.forEach(shell => shell.style.removeProperty('transform'));
    };
    const configure = () => {
        section.removeEventListener('pointermove',move);
        section.removeEventListener('pointerleave',leave);
        reset();
        if (allowed.matches && !document.hidden) {
            section.addEventListener('pointermove',move,{ passive:true });
            section.addEventListener('pointerleave',leave,{ passive:true });
        }
    };
    allowed.addEventListener('change',configure);
    document.addEventListener('visibilitychange',configure);
    configure();
})();

