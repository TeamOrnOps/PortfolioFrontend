// ============================================
// COMPARISON SLIDER COMPONENT
// Before/After image comparison slider
// ============================================

/**
 * Render Before/After comparison slider
 * Uses img-comparison-slider web component
 *
 * @param {Object} beforeImage - Image object with url property
 * @param {Object} afterImage - Image object with url property
 * @param {string} baseUrl - Optional base URL to prepend (leave empty if backend returns full URLs)
 * @returns {string} HTML string
 */
export function renderComparisonSlider(beforeImage, afterImage, baseUrl = '') {
    // Validate input
    if (!beforeImage || !afterImage) {
        return `
            <div class="comparison-placeholder">
                <div class="placeholder-content">
                    <p>Før/efter billeder ikke tilgængelige</p>
                </div>
            </div>
        `;
    }

    // Construct URLs (prepend baseUrl if provided)
    const beforeUrl = baseUrl
        ? `${baseUrl}${beforeImage.url}`
        : beforeImage.url;
    const afterUrl = baseUrl
        ? `${baseUrl}${afterImage.url}`
        : afterImage.url;

    return `
        <div class="comparison-slider-wrapper">
            <img-comparison-slider class="comparison-slider">
                <img
                    slot="first"
                    src="${beforeUrl}"
                    alt="Før billede"
                    loading="lazy"
                />
                <img
                    slot="second"
                    src="${afterUrl}"
                    alt="Efter billede"
                    loading="lazy"
                />
                <div slot="handle" class="slider-handle">
                    <svg width="40" height="40" viewBox="0 0 40 40">
                        <circle cx="20" cy="20" r="18" fill="white" stroke="#333" stroke-width="2"/>
                        <path d="M15 20l5-5v3h10v-3l5 5-5 5v-3H20v3l-5-5z" fill="#333"/>
                    </svg>
                </div>
            </img-comparison-slider>

            <div class="image-labels">
                <span class="label-before">Før</span>
                <span class="label-after">Efter</span>
            </div>
        </div>
    `;
}

/**
 * Get before and after images from project
 * Helper function to extract correct images
 *
 * @param {Object} project - Project object with images array
 * @returns {Object} Object with beforeImage and afterImage properties
 */
export function getBeforeAfterImages(project) {
    if (!project.images || project.images.length === 0) {
        return { beforeImage: null, afterImage: null };
    }

    const beforeImage = project.images.find(img => img.imageType === 'BEFORE');
    const afterImage = project.images.find(img => img.imageType === 'AFTER');

    return { beforeImage, afterImage };
}
