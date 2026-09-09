(() => {
    const section = document.querySelector('.films');
    if (!section) return;
    const cover = section.querySelector('.films__video-cover');
    const media = section.querySelector('.films__media');
    const status = section.querySelector('#films-availability');
    let state = 'idle';
    let player;
    let timer;
    let mount;
    const fallback = () => {
        if (state === 'external') return;
        state = 'external';
        clearTimeout(timer);
        if (mount) mount.style.visibility = 'hidden';
        cover.hidden = false;
        cover.removeAttribute('aria-busy');
        cover.setAttribute('aria-label', 'Watch featured film on YouTube (opens in a new tab)');
        if (player) { try { player.destroy(); } catch (_) {} }
        if (mount) mount.remove();
        status.textContent = 'WATCH ON YOUTUBE — OPENS IN A NEW TAB';
        cover.focus({ preventScroll:true });
    };
    const startPlayer = () => {
        if (state !== 'loading') return;
        mount = document.createElement('div');
        mount.className = 'films__embed';
        mount.style.visibility = 'hidden';
        const iframe = document.createElement('iframe');
        const url = new URL('https://www.youtube-nocookie.com/embed/7-dNhAKm2Eg');
        Object.entries({ si:'_gTw3CeiM2EpDMhh', controls:'0', enablejsapi:'1', playsinline:'1', rel:'0', origin:location.origin }).forEach(([key,value]) => url.searchParams.set(key,value));
        iframe.src = url.href;
        iframe.title = 'DIVINE Photo Studio featured cinematic film';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        iframe.referrerPolicy = 'strict-origin-when-cross-origin';
        iframe.allowFullscreen = true;
        mount.appendChild(iframe);
        media.appendChild(mount);
        try {
            player = new YT.Player(iframe, { events: {
                onReady: event => { if (state === 'loading') event.target.playVideo(); },
                onStateChange: event => {
                    if (state === 'external') return;
                    if (event.data === YT.PlayerState.PLAYING) {
                        clearTimeout(timer);
                        state = 'playing';
                        mount.style.visibility = 'visible';
                        cover.hidden = true;
                        cover.removeAttribute('aria-busy');
                        status.textContent = 'FEATURED FILM';
                        iframe.focus();
                    }
                },
                onError: fallback,
                onAutoplayBlocked: fallback
            }});
        } catch (_) { fallback(); }
    };
    cover.addEventListener('click', event => {
        if (state === 'external' || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        if (state !== 'idle') return;
        state = 'loading';
        cover.setAttribute('aria-busy', 'true');
        status.textContent = 'LOADING FILM…';
        timer = setTimeout(fallback, 15000);
        if (window.YT && window.YT.Player) { startPlayer(); return; }
        const previousReady = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
            if (typeof previousReady === 'function') previousReady();
            startPlayer();
        };
        const script = document.createElement('script');
        script.src = 'https://www.youtube.com/iframe_api';
        script.onerror = fallback;
        document.head.appendChild(script);
    });
    const poster = section.querySelector('.films__poster');
    if (poster) {
        let fallbackUsed = false;
        const fallback = () => {
            if (fallbackUsed) return;
            fallbackUsed = true;
            poster.src = 'https://img.youtube.com/vi/7-dNhAKm2Eg/hqdefault.jpg';
        };
        poster.addEventListener('error', fallback);
        poster.addEventListener('load', () => {
            if (poster.naturalWidth < 480) fallback();
        });
        if (poster.complete && poster.naturalWidth < 480) fallback();
    }
    if (!('IntersectionObserver' in window)) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motion.matches) return;
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('films--revealing');
            observer.unobserve(entry.target);
        });
    }, { threshold:0, rootMargin:'0px 0px -24px 0px' });
    section.querySelectorAll('[data-films-reveal]').forEach(element => observer.observe(element));
    motion.addEventListener('change', () => {
        if (!motion.matches) return;
        observer.disconnect();
        section.querySelectorAll('.films--revealing').forEach(element => element.classList.remove('films--revealing'));
    });
})();
