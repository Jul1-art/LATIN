document.addEventListener('DOMContentLoaded', () => {
    const quotes = [
        { latin: "Tu quoque, mi fili !", translation: "Toi aussi, mon fils !", author: "Jules César, 44 av. J.-C.", icon: "account_balance" },
        { latin: "Memento mori.", translation: "Souviens-toi que tu vas mourir.", author: "Tradition Stoïcienne", icon: "hourglass_empty" },
        { latin: "Alea jacta est.", translation: "Le sort en est jeté.", author: "Jules César, 49 av. J.-C.", icon: "swords" },
        { latin: "Carpe diem.", translation: "Cueille le jour.", author: "Horace, 23 av. J.-C.", icon: "local_florist" },
        { latin: "Dura lex, sed lex.", translation: "La loi est dure, mais c'est la loi.", author: "Maxime Juridique", icon: "gavel" },
        { latin: "Mens sana in corpore sano.", translation: "Un esprit sain dans un corps sain.", author: "Juvénal, Ier-IIe siècle", icon: "self_improvement" },
        { latin: "Si vis pacem, para bellum.", translation: "Si tu veux la paix, prépare la guerre.", author: "Végèce, IVe siècle", icon: "shield" },
        { latin: "Errare humanum est, perseverare diabolicum.", translation: "L'erreur est humaine, persévérer est diabolique.", author: "Sénèque (attribué)", icon: "psychology_alt" },
        { latin: "Veni, vidi, vici.", translation: "Je suis venu, j'ai vu, j'ai vaincu.", author: "Jules César, 47 av. J.-C.", icon: "emoji_events" },
        { latin: "Ave !", translation: "Salut ! / Je te salue !", author: "Salutation Romaine", icon: "waving_hand" },
        { latin: "Omnes vulnerant, ultima necat.", translation: "Toutes blessent, la dernière tue.", author: "Inscription de cadran solaire", icon: "watch" },
        { latin: "Audacibus fortuna juvat.", translation: "La fortune sourit aux audacieux.", author: "Virgile, Ier siècle av. J.-C.", icon: "monetization_on" },
        { latin: "Ad astra per ardua.", translation: "Vers les étoiles à travers les difficultés.", author: "Devise latine", icon: "stars" }
    ];

    const container = document.getElementById('quotes-container');
    const detailOverlay = document.getElementById('detail-overlay');
    const detailLatin = document.getElementById('detail-latin');
    const detailTranslation = document.getElementById('detail-translation');
    const detailIcon = document.getElementById('detail-icon');
    const detailAuthor = document.getElementById('detail-author');
    const exitusBtn = document.getElementById('exitus-btn');

    // ─── Génération des cartes citations (responsive mobile) ───────────────
    quotes.forEach((quote) => {
        const iconName = quote.icon || 'account_balance';
        const cardHTML = `
            <section class="h-screen w-full snap-center flex flex-col items-center justify-center p-4 md:p-8 shrink-0 [perspective:1200px] relative overflow-hidden">
                <!-- Énorme lettre en filigrane (Watermark) -->
                <div class="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] md:opacity-[0.02] mix-blend-plus-lighter">
                    <span class="text-[25rem] md:text-[45rem] font-headline-display text-[#d4af37] leading-none select-none">${quote.latin.charAt(0)}</span>
                </div>

                <div class="quote-card reveal-up w-[92vw] sm:w-[85vw] md:w-full max-w-4xl bg-surface-container/60 backdrop-blur-xl py-12 sm:py-16 md:py-20 px-6 sm:px-10 md:px-16 text-center rounded-2xl border border-surface-container-low/50 shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col items-center gap-6 md:gap-10 cursor-pointer hover:border-[#b59a45]/40 hover:bg-surface-container/80 hover:shadow-[0_20px_50px_rgba(181,154,69,0.05)] active:scale-[0.98] transition-all duration-700 group relative"
                    data-latin="${quote.latin}" data-translation="${quote.translation}" data-icon="${iconName}" data-author="${quote.author}">
                    
                    <div class="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-[#b59a45]/20 to-transparent border border-[#b59a45]/20 flex items-center justify-center reveal-icon mb-2 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                        <span class="material-symbols-outlined text-[#d4af37] text-2xl md:text-3xl opacity-80 group-hover:opacity-100 transition-opacity" style="font-variation-settings:'FILL' 1">${iconName}</span>
                    </div>
                    
                    <h2 class="font-headline-display text-2xl md:text-3xl text-[#d4af37] tracking-[0.1em] uppercase leading-tight break-words reveal-child reveal-child-1 drop-shadow-md">
                        ${quote.latin}
                    </h2>
                    
                    <div class="flex items-center gap-3 w-16 md:w-24 reveal-child reveal-child-2 opacity-60">
                        <div class="flex-1 h-px bg-gradient-to-r from-transparent to-[#b59a45]"></div>
                        <div class="w-1.5 h-1.5 rotate-45 bg-[#b59a45]"></div>
                        <div class="flex-1 h-px bg-gradient-to-l from-transparent to-[#b59a45]"></div>
                    </div>
                    
                    <p class="font-serif text-base md:text-lg text-on-surface-variant leading-relaxed px-2 md:px-8 reveal-child reveal-child-3">
                        « <span class="italic text-on-surface/90">${quote.translation}</span> »
                    </p>
                    
                    <div class="mt-2 md:mt-4 inline-flex items-center gap-2 bg-surface-container-high/50 border border-surface-container-low px-4 py-2 rounded-full reveal-child reveal-child-4">
                        <span class="material-symbols-outlined text-[#b59a45] text-xs">history_edu</span>
                        <p class="font-label-caps text-[10px] md:text-[11px] text-[#b59a45]/80 tracking-[0.3em] uppercase">
                            ${quote.author}
                        </p>
                    </div>
                </div>
            </section>
        `;
        container.insertAdjacentHTML('beforeend', cardHTML);
    });

    // ─── Scroll Reveal Observer ────────────────────────────────────────────
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            entry.target.classList.toggle('active', entry.isIntersecting);
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.reveal-up, .reveal-credita').forEach(el => observer.observe(el));

    // ─── Ouvrir l'overlay ──────────────────────────────────────────────────
    document.querySelectorAll('.quote-card').forEach(card => {
        card.addEventListener('click', (e) => {
            // Centrer la section au clic si elle n'est pas déjà parfaitement centrée
            e.currentTarget.parentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

            const latinText = e.currentTarget.getAttribute('data-latin');
            const translationText = e.currentTarget.getAttribute('data-translation');
            const iconName = e.currentTarget.getAttribute('data-icon');
            const authorText = e.currentTarget.getAttribute('data-author');

            detailLatin.textContent = latinText;
            detailLatin.setAttribute('data-text', latinText);
            detailTranslation.textContent = translationText;
            if (detailIcon) detailIcon.textContent = iconName;
            if (detailAuthor) detailAuthor.textContent = authorText;

            detailOverlay.classList.remove('hidden');
            detailOverlay.classList.add('flex');
            setTimeout(() => detailOverlay.classList.remove('opacity-0'), 10);
            document.getElementById('main-scroll').style.overflowY = 'hidden';
        });
    });

    // ─── Fermer l'overlay ──────────────────────────────────────────────────
    function closeOverlay() {
        detailOverlay.classList.add('opacity-0');
        setTimeout(() => {
            detailOverlay.classList.add('hidden');
            detailOverlay.classList.remove('flex');
            document.getElementById('main-scroll').style.overflowY = '';
        }, 500);
    }

    if (exitusBtn) {
        exitusBtn.addEventListener('click', (e) => {
            e.preventDefault();
            closeOverlay();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !detailOverlay.classList.contains('hidden')) closeOverlay();
    });

    // ─── Thème Jour/Nuit (desktop + mobile) ───────────────────────────────
    function applyTheme(isLight) {
        document.body.classList.toggle('light-mode', isLight);
        // Synchroniser avec Tailwind dark mode sur le HTML
        if (isLight) {
            document.documentElement.classList.remove('dark');
        } else {
            document.documentElement.classList.add('dark');
        }

        // Icône desktop (sidebar)
        const desktopIcon = document.querySelector('#theme-toggle .material-symbols-outlined');
        if (desktopIcon) desktopIcon.textContent = isLight ? 'dark_mode' : 'light_mode';
        // Icône tablette (topbar)
        const tabletIcon = document.querySelector('#tablet-theme-toggle .material-symbols-outlined');
        if (tabletIcon) tabletIcon.textContent = isLight ? 'dark_mode' : 'light_mode';
        // Icône floating (global)
        const floatingIcon = document.querySelector('#floating-theme-toggle .material-symbols-outlined');
        if (floatingIcon) floatingIcon.textContent = isLight ? 'dark_mode' : 'light_mode';
        // Icône mobile
        const mobileIcon = document.querySelector('.mobile-theme-icon');
        if (mobileIcon) mobileIcon.textContent = isLight ? 'dark_mode' : 'light_mode';
        
        try {
            localStorage.setItem('sententiae-theme', isLight ? 'light' : 'dark');
        } catch (e) {}
    }

    // Restaurer le thème
    try {
        if (localStorage.getItem('sententiae-theme') === 'light') applyTheme(true);
    } catch (e) {
        console.warn("LocalStorage indisponible pour le thème.");
    }

    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) themeToggle.addEventListener('click', () => applyTheme(!document.body.classList.contains('light-mode')));

    const tabletThemeToggle = document.getElementById('tablet-theme-toggle');
    if (tabletThemeToggle) tabletThemeToggle.addEventListener('click', () => applyTheme(!document.body.classList.contains('light-mode')));

    const floatingThemeToggle = document.getElementById('floating-theme-toggle');
    if (floatingThemeToggle) floatingThemeToggle.addEventListener('click', () => applyTheme(!document.body.classList.contains('light-mode')));

    const mobileThemeToggle = document.getElementById('mobile-theme-toggle');
    if (mobileThemeToggle) mobileThemeToggle.addEventListener('click', () => applyTheme(!document.body.classList.contains('light-mode')));

    // ─── Collapse Sidebar (desktop uniquement) ─────────────────────────────
    const collapseToggle = document.getElementById('collapse-toggle');
    const sidebar = document.getElementById('sidebar');
    if (collapseToggle && sidebar) {
        collapseToggle.addEventListener('click', () => sidebar.classList.toggle('sidebar-collapsed'));
    }

    // ─── Scroll Spy Sidebar (Desktop) ──────────────────────────────────────
    const sidebarLinks = document.querySelectorAll('#sidebar .nav-item[href^="#"]');
    const tabletNavLinks = document.querySelectorAll('#tablet-topbar .tablet-nav-item');
    const sections = [
        document.getElementById('home-section'),
        ...document.querySelectorAll('#quotes-container section'),
        document.getElementById('quotidianum-section'),
        document.getElementById('credita-section')
    ].filter(s => s);
    const scrollContainer = document.getElementById('main-scroll');

    function setActiveLink(id) {
        // Sidebar desktop
        sidebarLinks.forEach(link => {
            const isActive = link.getAttribute('href') === `#${id}`;
            link.classList.toggle('active', isActive);
        });
        // Topbar tablette
        tabletNavLinks.forEach(link => {
            const isActive = link.getAttribute('href') === `#${id}`;
            if (isActive) {
                link.classList.add('text-[#b59a45]', 'border-[#b59a45]');
                link.classList.remove('text-stone-500', 'border-transparent');
            } else {
                link.classList.remove('text-[#b59a45]', 'border-[#b59a45]');
                link.classList.add('text-stone-500', 'border-transparent');
            }
        });
    }

    const observerOptions = {
        root: scrollContainer,
        rootMargin: '-10% 0px -80% 0px', // Déclenchement plus réactif dès le haut de la section
        threshold: 0
    };

    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setActiveLink(entry.target.id);
            }
        });
    }, observerOptions);

    sections.forEach(section => navObserver.observe(section));

    // Smooth scroll nav desktop (déjà présent mais on s'assure de l'interaction)
    sidebarLinks.forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const target = document.getElementById(targetId);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                // L'observer s'occupera de mettre la classe active une fois le scroll fini
            }
        });
    });

    // ─── Masquer/Afficher la Topbar au scroll ──────────────────────────────
    let lastScrollTop = 0;
    const topbar = document.getElementById('tablet-topbar');
    const scrollContent = document.getElementById('main-scroll');

    if (topbar && scrollContent) {
        scrollContent.addEventListener('scroll', () => {
            let scrollTop = scrollContent.scrollTop;
            if (scrollTop > lastScrollTop && scrollTop > 80) {
                // Scroll vers le bas - cacher la barre
                topbar.style.transform = 'translateY(-100%)';
            } else if (scrollTop < lastScrollTop) {
                // Scroll vers le haut - afficher la barre
                topbar.style.transform = 'translateY(0)';
            }
            lastScrollTop = scrollTop;
        }, { passive: true });
    }
});

// ─── Active state barre navigation mobile ─────────────────────────────────
function mobileNavSetActive(clickedEl) {
    document.querySelectorAll('.mobile-nav-item').forEach(el => {
        el.classList.remove('text-[#b59a45]', 'border-[#b59a45]');
        el.classList.add('text-stone-500', 'border-transparent');
    });
    clickedEl.classList.remove('text-stone-500', 'border-transparent');
    clickedEl.classList.add('text-[#b59a45]', 'border-[#b59a45]');
}

// ─── Quotidian Slider Dots ─────────────────────────────────────────────────
(function () {
    const slider = document.getElementById('quotidian-slider');
    const dots = document.querySelectorAll('#quotidian-dots .dot');
    const swipeHint = document.getElementById('swipe-hint');
    if (!slider || !dots.length) return;

    let hintDismissed = false;

    function updateDots() {
        if (!slider) return;
        const cards = slider.querySelectorAll(':scope > div');
        if (!cards.length) return;

        const cardWidth = cards[0].offsetWidth + parseInt(getComputedStyle(slider).gap || 12);
        const index = Math.round(slider.scrollLeft / cardWidth);
        const clampedIndex = Math.max(0, Math.min(index, dots.length - 1));

        dots.forEach((dot, i) => {
            if (i === clampedIndex) {
                dot.style.width = '20px';
                dot.style.background = '#d4af37';
                dot.style.opacity = '1';
            } else {
                dot.style.width = '6px';
                dot.style.background = 'rgba(181,154,69,0.25)';
                dot.style.opacity = '0.7';
            }
        });

        // Masquer le hint de swipe au premier glissement
        if (!hintDismissed && slider.scrollLeft > 20 && swipeHint) {
            hintDismissed = true;
            swipeHint.style.transition = 'opacity 0.4s ease';
            swipeHint.style.opacity = '0';
            setTimeout(() => { swipeHint.style.display = 'none'; }, 400);
        }
    }

    slider.addEventListener('scroll', updateDots, { passive: true });
    // Init
    updateDots();
})();
