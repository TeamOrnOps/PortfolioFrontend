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

    // Build URLs with smart check
    // If URL already starts with http://, use as-is (backend returns full URLs now)
    // Otherwise prepend baseUrl or default to localhost:8080 for backward compatibility
    const buildUrl = (imageUrl) => {
        console.log('[ComparisonSlider] Input URL:', imageUrl);
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            console.log('[ComparisonSlider] Using full URL as-is:', imageUrl);
            return imageUrl;
        }
        //Uses relative URL
        const fullUrl = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
        console.log('[ComparisonSlider] Built URL:', fullUrl);
        return fullUrl;
    };

    const beforeUrl = buildUrl(beforeImage.url);
    const afterUrl = buildUrl(afterImage.url);
    console.log('[ComparisonSlider] Final URLs:', { beforeUrl, afterUrl });

    return `
        <div class="comparison-slider-wrapper">
            <img-comparison-slider class="comparison-slider">
                <img
                    slot="first"
                    src="${beforeUrl}"
                    alt="Før billede"
                    loading="lazy"
                    onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22400%22 height=%22300%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22%3EBillede ikke fundet%3C/text%3E%3C/svg%3E';"
                />
                <img
                    slot="second"
                    src="${afterUrl}"
                    alt="Efter billede"
                    loading="lazy"
                    onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22400%22 height=%22300%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22%3EBillede ikke fundet%3C/text%3E%3C/svg%3E';"
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
