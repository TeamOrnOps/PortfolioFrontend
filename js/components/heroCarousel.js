// ============================================
// HERO CAROUSEL COMPONENT
// Featured images slider with Swiper.js
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
    return url.startsWith('/') ? url : `/${url}`;
}

/**
 * Render hero carousel HTML
 * @param {Array} featuredImages - Array of featured images
 * @returns {string} HTML string
 */
export function renderHeroCarousel(featuredImages) {
    console.log('[HeroCarousel] Featured images:', featuredImages);

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
            (image) => {
                const imageUrl = buildImageUrl(image.url);
                console.log('[HeroCarousel] Rendering slide:', imageUrl);
                return `
        <div class="swiper-slide">
            <img
                src="${imageUrl}"
                alt="${image.projectTitle || 'Featured project'}"
                class="slide-image"
                loading="eager"
                onerror="console.error('Failed to load image:', this.src); this.onerror=null; this.parentElement.innerHTML='<div style=\\'background: #f1f5f9; height: 100%; display: flex; align-items: center; justify-content: center;\\'>Billede kunne ikke indlæses</div>';"
            />
            <div class="slide-overlay"></div>
            <div class="slide-content">
                <div class="container">
                    <h2 class="slide-title">${image.projectTitle || ''}</h2>
                    <p class="slide-description">${image.projectWorkType || ''}</p>
                </div>
            </div>
        </div>
    `;
            }
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