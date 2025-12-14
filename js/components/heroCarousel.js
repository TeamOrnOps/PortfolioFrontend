// ============================================
// HERO CAROUSEL COMPONENT
// Featured images slider with Swiper.js
// Made by Claude Code
// ============================================

/**
 * Build full image URL
 * Handles both relative and absolute URLs
 * Backend now returns full URLs in new uploads
 * But old data might still have relative URLs
 * @param {string} url - Image URL from API
 * @returns {string} Full image URL
 */
function buildImageUrl(url) {
    if (!url) return '';
    // If URL already starts with http:// or https://, return as-is
    // This handles new uploads from backend (full URLs)
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }
    // Otherwise prepend localhost:8080 for backward compatibility
    // This handles any old relative URLs still in database
    return `http://localhost:8080${url}`;
}

/**
 * Render hero carousel HTML
 * @param {Array} featuredImages - Array of featured images
 * @returns {string} HTML string
 */
export function renderHeroCarousel(featuredImages) {
    // made by claude code
    if (!featuredImages || featuredImages.length === 0) {
        return `
            <div class="hero-carousel-placeholder">
                <div>
                    <h2>Hero sektion, kommer...</h2>
                    <p>Ingen featured billeder tilgængelige endnu</p>
                </div>
            </div>
        `;
    }

    const slidesHtml = featuredImages
        .map(
            (image) => `
        <div class="swiper-slide">
            <img
                src="${buildImageUrl(image.url)}"
                alt="${image.title || 'Featured project'}"
                class="slide-image"
                loading="eager"
                onerror="this.onerror=null; this.style.display='none';"
            />
            <div class="slide-overlay"></div>
        </div>
    `
        )
        .join('');

    return `
        <div class="hero-carousel" id="hero-carousel">
            <div class="swiper">
                <div class="swiper-wrapper">
                    ${slidesHtml}
                </div>

                <!-- Navigation arrows -->
                <div class="swiper-button-prev"></div>
                <div class="swiper-button-next"></div>

                <!-- Pagination dots -->
                <div class="swiper-pagination"></div>
            </div>
        </div>
    `;
}

/**
 * Initialize Swiper carousel
 * Should be called after DOM is rendered
 */
export function initHeroCarousel() {
    // made by claude code
    const carouselElement = document.getElementById('hero-carousel');

    if (!carouselElement) {
        console.log('Hero carousel element not found');
        return null;
    }

    // Check if Swiper is loaded
    if (typeof Swiper === 'undefined') {
        console.error('Swiper.js is not loaded');
        return null;
    }

    // Initialize Swiper
    const swiper = new Swiper('#hero-carousel .swiper', {
        // Auto-rotate settings
        autoplay: {
            delay: 5000, // 5 seconds
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
        },

        // Transition effect
        effect: 'fade',
        fadeEffect: {
            crossFade: true,
        },

        // Speed of transition
        speed: 600,

        // Loop slides
        loop: true,

        // Navigation arrows
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },

        // Pagination dots
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
            dynamicBullets: false,
        },

        // Keyboard control
        keyboard: {
            enabled: true,
            onlyInViewport: true,
        },

        // Touch/swipe settings
        touchRatio: 1,
        touchAngle: 45,
        grabCursor: true,

        // Accessibility
        a11y: {
            enabled: true,
            prevSlideMessage: 'Forrige billede',
            nextSlideMessage: 'Næste billede',
            paginationBulletMessage: 'Gå til billede {{index}}',
        },
    });

    console.log('Hero carousel initialized with Swiper');
    return swiper;
}

/**
 * Get featured images from projects
 * Optionally filter by workType
 * @param {Array} projects - Array of project objects
 * @param {string|null} workType - Optional work type filter
 * @returns {Array} Array of featured image objects
 */
export function getFeaturedImages(projects, workType = null) {
    // made by claude code
    if (!projects || projects.length === 0) {
        return [];
    }

    // Filter projects by workType if provided
    let filteredProjects = projects;
    if (workType) {
        filteredProjects = projects.filter((project) => project.workType === workType);
    }

    // Extract featured images from all projects
    const featuredImages = [];

    filteredProjects.forEach((project) => {
        if (project.images && project.images.length > 0) {
            const featured = project.images.filter((img) => img.isFeatured === true);

            // Add project context to each featured image
            featured.forEach((img) => {
                featuredImages.push({
                    ...img,
                    projectId: project.id,
                    projectTitle: project.title,
                    projectWorkType: project.workType,
                });
            });
        }
    });

    return featuredImages;
}