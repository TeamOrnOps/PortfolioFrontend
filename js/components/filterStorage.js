// ============================================
// FILTER STORAGE UTILITY
// localStorage persistence for filters
// ============================================

const STORAGE_KEY = 'algenord_project_filters';

/**
 * Save filters to localStorage
 *
 * @param {Object} filters - Filter object
 * @param {string|null} filters.workType - Selected work type
 * @param {string|null} filters.customerType - Selected customer type
 * @param {string} filters.sortOrder - Sort order ('asc' or 'desc')
 */
export function saveFilters(filters) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    } catch (error) {
        console.warn('Could not save filters to localStorage:', error);
    }
}

/**
 * Load filters from localStorage
 *
 * @returns {Object} Saved filters or empty object if none
 */
export function loadFilters() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : {};
    } catch (error) {
        console.warn('Could not load filters from localStorage:', error);
        return {};
    }
}

/**
 * Clear saved filters from localStorage
 */
export function clearFilters() {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.warn('Could not clear filters from localStorage:', error);
    }
}

/**
 * Get filter value with fallback
 *
 * @param {string} filterName - Name of filter (workType, customerType, sortOrder)
 * @param {any} defaultValue - Default value if not found
 * @returns {any} Filter value or default
 */
export function getFilter(filterName, defaultValue = null) {
    const filters = loadFilters();
    return filters[filterName] !== undefined ? filters[filterName] : defaultValue;
}
