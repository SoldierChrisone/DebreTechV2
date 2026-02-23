/**
 * DebreTech V3 - Premium JavaScript
 * Modular, Secure, Performant
 */
'use strict';

/* ====================
   Configuration
   ==================== */
const CONFIG = {
    TYPING_SPEED: 75,
    TYPING_PAUSE: 2200,
    FORM_COOLDOWN: 5000,
    FORM_MAX_ATTEMPTS: 5,
    SCROLL_THRESHOLD: 50,
    THROTTLE_MS: 100,
    PARTICLE_MAX: 60,
    PARTICLE_CONNECT_DIST: 130
};

const TITLES = [
    'IT Infrastruktúra Szakértő',
    'TAK & WireGuard Specialist',
    'Megbízható Partner'
];

/* ====================
   Utilities
   ==================== */
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

const throttle = (fn, ms) => {
    let last = 0;
    return (...args) => {
        const now = Date.now();
        if (now - last >= ms) { last = now; fn(...args); }
    };
};

const sanitize = str => {
    if (typeof str !== 'string') return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return str.replace(/[&<>"']/g, c => map[c]);
};

const announce = msg => {
    const el = $('#announcer');
    if (el) { el.textContent = msg; }
};

/* ====================
   Theme Toggle (Dark/Light)
   ==================== */
function initTheme() {
    const toggle = $('#themeToggle');
    if (!toggle) return;

    const saved = localStorage.getItem('debretech-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'dark'); // default dark

    document.documentElement.setAttribute('data-theme', theme);

    toggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('debretech-theme', next);
        announce(next === 'dark' ? 'Sötét mód bekapcsolva' : 'Világos mód bekapcsolva');
    });

    // Listen for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem('debretech-theme')) {
            document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        }
    });
}

/* ====================
   Cookie Consent
   ==================== */
function initCookieConsent() {
    const banner = $('#cookieBanner');
    const accept = $('#cookieAccept');
    const decline = $('#cookieDecline');

    if (!banner) return;

    const consent = localStorage.getItem('debretech-cookie-consent');
    if (consent) return; // Already answered

    // Show banner after short delay
    setTimeout(() => banner.classList.add('visible'), 1500);

    const handleConsent = (accepted) => {
        localStorage.setItem('debretech-cookie-consent', accepted ? 'accepted' : 'declined');
        banner.classList.remove('visible');
        announce(accepted ? 'Sütik elfogadva' : 'Sütik elutasítva');
    };

    accept?.addEventListener('click', () => handleConsent(true));
    decline?.addEventListener('click', () => handleConsent(false));
}

/* ====================
   Navigation
   ==================== */
function initNav() {
    const nav = $('#nav');
    const toggle = $('#navToggle');
    const menu = $('#navMenu');

    if (!nav || !toggle || !menu) return;

    // Scroll effect
    const handleScroll = throttle(() => {
        nav.classList.toggle('scrolled', window.scrollY > CONFIG.SCROLL_THRESHOLD);
    }, CONFIG.THROTTLE_MS);

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Mobile toggle
    toggle.addEventListener('click', () => {
        const isOpen = menu.classList.toggle('active');
        toggle.classList.toggle('active', isOpen);
        toggle.setAttribute('aria-expanded', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
        announce(isOpen ? 'Menü megnyitva' : 'Menü bezárva');
    });

    // Close on link click
    $$('.nav__link').forEach(link => {
        link.addEventListener('click', () => {
            menu.classList.remove('active');
            toggle.classList.remove('active');
            toggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        });
    });

    // Active link on scroll
    const sections = $$('section[id]');
    const updateActive = throttle(() => {
        const scrollY = window.scrollY + 120;
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.id;
            const link = $(`.nav__link[href="#${id}"]`);
            if (link) {
                link.classList.toggle('active', scrollY >= top && scrollY < top + height);
            }
        });
    }, CONFIG.THROTTLE_MS);

    window.addEventListener('scroll', updateActive, { passive: true });
}

/* ====================
   Typing Effect
   ==================== */
function initTyping() {
    const el = $('#typedTitle');
    if (!el) return;

    // Add cursor element
    const cursor = document.createElement('span');
    cursor.className = 'cursor';
    cursor.setAttribute('aria-hidden', 'true');

    let titleIndex = 0, charIndex = 0, isDeleting = false;

    function type() {
        const current = TITLES[titleIndex];

        if (isDeleting) {
            el.textContent = current.substring(0, charIndex--);
            el.appendChild(cursor);
            if (charIndex < 0) {
                isDeleting = false;
                titleIndex = (titleIndex + 1) % TITLES.length;
            }
        } else {
            el.textContent = current.substring(0, charIndex++);
            el.appendChild(cursor);
            if (charIndex > current.length) {
                isDeleting = true;
                setTimeout(type, CONFIG.TYPING_PAUSE);
                return;
            }
        }

        setTimeout(type, isDeleting ? 35 : CONFIG.TYPING_SPEED);
    }

    type();
}

/* ====================
   Particles (Optimized)
   ==================== */
function initParticles() {
    const canvas = $('#particles');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [], animId;
    let width, height;

    function resize() {
        width = canvas.width = canvas.offsetWidth;
        height = canvas.height = canvas.offsetHeight;
    }

    function createParticles() {
        particles = [];
        const count = Math.min(CONFIG.PARTICLE_MAX, Math.floor(width * height / 18000));
        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                r: Math.random() * 2 + 0.5,
                dx: (Math.random() - 0.5) * 0.4,
                dy: (Math.random() - 0.5) * 0.4,
                opacity: Math.random() * 0.5 + 0.3
            });
        }
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);

        // Detect theme for particle color
        const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
        const baseColor = isDark ? '0, 212, 255' : '2, 132, 199';

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.x += p.dx;
            p.y += p.dy;

            if (p.x < 0 || p.x > width) p.dx *= -1;
            if (p.y < 0 || p.y > height) p.dy *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${baseColor}, ${p.opacity})`;
            ctx.fill();

            // Optimized connections: only check nearby particles (forward-only)
            for (let j = i + 1; j < particles.length; j++) {
                const q = particles[j];
                const dx = p.x - q.x;
                const dy = p.y - q.y;
                const distSq = dx * dx + dy * dy;
                const maxDistSq = CONFIG.PARTICLE_CONNECT_DIST * CONFIG.PARTICLE_CONNECT_DIST;

                if (distSq < maxDistSq) {
                    const alpha = (1 - distSq / maxDistSq) * 0.15;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(q.x, q.y);
                    ctx.strokeStyle = `rgba(${baseColor}, ${alpha})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }

        animId = requestAnimationFrame(draw);
    }

    resize();
    createParticles();
    draw();

    window.addEventListener('resize', throttle(() => {
        resize();
        createParticles();
    }, 250));

    // Pause when hidden
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(animId);
        } else {
            draw();
        }
    });
}

/* ====================
   Form (Enhanced Validation)
   ==================== */
function initForm() {
    const form = $('#contactForm');
    if (!form) return;

    const message = $('#formMessage');
    const honeypot = form.querySelector('[name="website"]');
    let lastSubmit = 0;
    let attempts = 0;

    const showMessage = (type, text) => {
        message.className = `form__message ${type}`;
        message.textContent = text;
        if (type === 'success') {
            setTimeout(() => { message.className = 'form__message'; message.textContent = ''; }, 5000);
        }
    };

    const isValidEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    // Real-time validation feedback
    form.querySelectorAll('input[required], textarea[required]').forEach(input => {
        input.addEventListener('blur', () => {
            if (input.value.trim() && input.checkValidity()) {
                input.style.borderColor = 'var(--c-success)';
            } else if (input.value.trim()) {
                input.style.borderColor = 'var(--c-warning)';
            } else {
                input.style.borderColor = '';
            }
        });
        input.addEventListener('input', () => {
            input.style.borderColor = '';
        });
    });

    form.addEventListener('submit', async e => {
        e.preventDefault();

        // Honeypot check
        if (honeypot?.value) {
            console.warn('Honeypot triggered');
            showMessage('success', 'Köszönjük üzenetét!');
            form.reset();
            return;
        }

        // Rate limiting with exponential backoff
        const now = Date.now();
        const cooldown = CONFIG.FORM_COOLDOWN * Math.pow(2, Math.max(0, attempts - 2));
        const remaining = cooldown - (now - lastSubmit);

        if (remaining > 0 && attempts >= 2) {
            showMessage('error', `Túl sok próbálkozás. Várjon ${Math.ceil(remaining / 1000)} másodpercet.`);
            return;
        }

        // Validate
        const name = form.name.value.trim();
        const email = form.email.value.trim();
        const msg = form.message.value.trim();

        if (!name || name.length < 2) {
            showMessage('error', 'Adja meg a nevét (min. 2 karakter).');
            form.name.focus();
            return;
        }

        if (!email || !isValidEmail(email)) {
            showMessage('error', 'Érvényes email címet adjon meg.');
            form.email.focus();
            return;
        }

        if (!msg || msg.length < 10) {
            showMessage('error', 'Az üzenet túl rövid (min. 10 karakter).');
            form.message.focus();
            return;
        }

        // Submit
        const btn = form.querySelector('button[type="submit"]');
        btn.classList.add('loading');
        btn.disabled = true;

        try {
            // Simulate API call
            await new Promise(r => setTimeout(r, 1500));

            lastSubmit = Date.now();
            attempts++;
            showMessage('success', '✅ Üzenet elküldve! Hamarosan jelentkezünk.');
            announce('Üzenet sikeresen elküldve');
            form.reset();
            form.querySelectorAll('input, textarea').forEach(i => i.style.borderColor = '');

            console.log('Form submitted:', { name: sanitize(name), email: sanitize(email) });
        } catch (err) {
            console.error('Form error:', err);
            showMessage('error', 'Hiba történt. Próbálja újra.');
        } finally {
            btn.classList.remove('loading');
            btn.disabled = false;
        }
    });
}

/* ====================
   Stats Counter
   ==================== */
function initStats() {
    const stats = $$('.stat__num[data-count]');
    if (!stats.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.count, 10);
                const suffix = el.dataset.suffix || '';
                let current = 0;
                const duration = 1500;
                const steps = 60;
                const stepValue = target / steps;
                const interval = duration / steps;

                const counter = setInterval(() => {
                    current = Math.min(current + stepValue, target);
                    el.textContent = Math.round(current) + suffix;
                    if (current >= target) {
                        el.textContent = target + suffix;
                        clearInterval(counter);
                    }
                }, interval);

                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    stats.forEach(stat => observer.observe(stat));
}

/* ====================
   Floating Button
   ==================== */
function initFloating() {
    const floating = $('#floating');
    const toggle = $('#floatingToggle');

    if (!floating || !toggle) return;

    const closeIcon = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>';
    const openIcon = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';

    toggle.addEventListener('click', () => {
        const isOpen = floating.classList.toggle('active');
        toggle.setAttribute('aria-expanded', isOpen);
        toggle.innerHTML = isOpen ? closeIcon : openIcon;
    });
}

/* ====================
   Back to Top
   ==================== */
function initBackToTop() {
    const btn = $('#backToTop');
    if (!btn) return;

    const handleScroll = throttle(() => {
        btn.classList.toggle('visible', window.scrollY > 300);
    }, CONFIG.THROTTLE_MS);

    window.addEventListener('scroll', handleScroll, { passive: true });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/* ====================
   Keyboard Navigation
   ==================== */
function initKeyboard() {
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            // Close mobile menu
            const menu = $('#navMenu');
            const toggle = $('#navToggle');
            if (menu?.classList.contains('active')) {
                menu.classList.remove('active');
                toggle?.classList.remove('active');
                toggle?.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
                toggle?.focus();
            }

            // Close floating menu
            const floating = $('#floating');
            const floatToggle = $('#floatingToggle');
            if (floating?.classList.contains('active')) {
                floating.classList.remove('active');
                floatToggle?.setAttribute('aria-expanded', 'false');
                floatToggle.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
                floatToggle?.focus();
            }
        }
    });
}

/* ====================
   Scroll Reveal Animations
   ==================== */
function initScrollReveal() {
    const elements = $$('.reveal');
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    elements.forEach(el => observer.observe(el));
}

/* ====================
   Initialize
   ==================== */
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Critical path
        initTheme();
        initNav();
        initTyping();
        initParticles();

        // Non-critical (lazy)
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                initForm();
                initStats();
                initFloating();
                initBackToTop();
                initKeyboard();
                initScrollReveal();
                initCookieConsent();
            });
        } else {
            setTimeout(() => {
                initForm();
                initStats();
                initFloating();
                initBackToTop();
                initKeyboard();
                initScrollReveal();
                initCookieConsent();
            }, 100);
        }

        console.log('🚀 DebreTech V3 initialized');
    } catch (err) {
        console.error('Init error:', err);
    }
});
