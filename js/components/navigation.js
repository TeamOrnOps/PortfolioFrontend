// ============================================
// NAVIGATION COMPONENT
// Sticky nav with scroll transparency & mobile menu
// Made by Claude Code
// ============================================

/**
 * Render navigation HTML
 * @param {Array} categories - Array of category objects {value, label}
 * @param {string|null} activeCategory - Currently active category
 * @returns {string} HTML string
 */
export function renderNavigation(categories, activeCategory = null) {
    // made by claude code
    const categoryLinks = categories
        .map(
            (cat) => `
        <li>
            <a
                href="#/projects${cat.value ? '?category=' + cat.value : ''}"
                class="nav-link ${activeCategory === cat.value ? 'active' : ''}"
                data-category="${cat.value || ''}"
            >
                ${cat.label}
            </a>
        </li>
    `
        )
        .join('');

    const mobileLinks = categories
        .map(
            (cat) => `
        <li>
            <a
                href="#/projects${cat.value ? '?category=' + cat.value : ''}"
                class="nav-mobile-link ${activeCategory === cat.value ? 'active' : ''}"
                data-category="${cat.value || ''}"
            >
                ${cat.label}
            </a>
        </li>
    `
        )
        .join('');

    return `
        <nav class="main-navigation" id="main-nav">
            <div class="nav-container">
                <!-- Logo -->
                <a href="#/projects" class="nav-logo">
                    <img
                        src="/assets/logo-algenord.svg"
                        alt="AlgeNord Logo"
                        class="nav-logo-image"
                    />
                </a>

                <!-- Desktop Navigation -->
                <ul class="nav-links">
                    ${categoryLinks}
                </ul>

                <!-- Mobile Menu Toggle -->
                <button
                    class="nav-toggle"
                    id="nav-toggle"
                    aria-label="Toggle navigation menu"
                    aria-expanded="false"
                >
                    <div class="nav-toggle-icon">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </button>
            </div>

            <!-- Mobile Menu Overlay -->
            <div class="nav-mobile-overlay" id="nav-overlay"></div>

            <!-- Mobile Menu Panel -->
            <div class="nav-mobile-menu" id="nav-mobile-menu">
                <ul class="nav-mobile-links">
                    ${mobileLinks}
                </ul>
            </div>
        </nav>

        <!-- Spacer to prevent content hiding under fixed nav -->
        <div class="nav-spacer"></div>
    `;
}

/**
 * Initialize navigation functionality
 * - Scroll transparency effect
 * - Mobile menu toggle
 */
export function initNavigation() {
    // made by claude code
    const nav = document.getElementById('main-nav');
    const navToggle = document.getElementById('nav-toggle');
    const navOverlay = document.getElementById('nav-overlay');
    const navMobileMenu = document.getElementById('nav-mobile-menu');

    if (!nav) {
        console.log('Navigation element not found');
        return;
    }

    // === Scroll transparency effect ===
    let lastScrollY = window.scrollY;

    function handleScroll() {
        const currentScrollY = window.scrollY;

        if (currentScrollY > 100) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }

        lastScrollY = currentScrollY;
    }

    // Throttle scroll events for performance
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                handleScroll();
                ticking = false;
            });
            ticking = true;
        }
    });

    // Run once on init
    handleScroll();

    // === Mobile menu toggle ===
    if (navToggle && navOverlay && navMobileMenu) {
        function openMobileMenu() {
            navToggle.classList.add('active');
            navOverlay.classList.add('active');
            navMobileMenu.classList.add('active');
            navToggle.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden'; // Prevent scroll
        }

        function closeMobileMenu() {
            navToggle.classList.remove('active');
            navOverlay.classList.remove('active');
            navMobileMenu.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = ''; // Restore scroll
        }

        // Toggle button click
        navToggle.addEventListener('click', () => {
            const isOpen = navToggle.classList.contains('active');
            if (isOpen) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });

        // Overlay click (close menu)
        navOverlay.addEventListener('click', closeMobileMenu);

        // Close menu when clicking a link
        const mobileLinks = navMobileMenu.querySelectorAll('.nav-mobile-link');
        mobileLinks.forEach((link) => {
            link.addEventListener('click', closeMobileMenu);
        });

        // Close menu on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navToggle.classList.contains('active')) {
                closeMobileMenu();
            }
        });
    }

    console.log('Navigation initialized');
}

/**
 * Get categories for navigation
 * @returns {Array} Array of category objects
 */
export function getNavigationCategories() {
    // made by claude code
    return [
        { value: null, label: 'Alle' },
        { value: 'PAVING_CLEANING', label: 'Fliser' },
        { value: 'WOODEN_DECK_CLEANING', label: 'Træ' },
        { value: 'ROOF_CLEANING', label: 'Tag' },
        { value: 'FACADE_CLEANING', label: 'Facade' },
        // Add more categories as needed
    ];
}