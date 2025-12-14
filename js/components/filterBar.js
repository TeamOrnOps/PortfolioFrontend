// ============================================
// FILTER BAR COMPONENT
// Configurable filter bar for projects
// ============================================

/**
 * Get work type categories
 * Centralized category data
 *
 * @returns {Array} Array of category objects {value, label}
 */
export function getWorkTypeCategories() {
    return [
        { value: null, label: 'Alle Projekter' },
        { value: 'PAVING_CLEANING', label: 'Fliserens' },
        { value: 'WOODEN_DECK_CLEANING', label: 'Rens af trædæk' },
        { value: 'ROOF_CLEANING', label: 'Tagrens' },
        { value: 'FACADE_CLEANING', label: 'Facaderens' }
    ];
}

/**
 * Render filter bar with configurable options
 *
 * @param {Object} config - Configuration object
 * @param {Array} config.categories - Work type categories (use getWorkTypeCategories())
 * @param {string|null} config.activeCategory - Currently selected category
 * @param {string|null} config.selectedCustomerType - Currently selected customer type
 * @param {string} config.sortOrder - Current sort order ('asc' or 'desc')
 * @param {boolean} config.showCustomerType - Show customer type filter dropdown
 * @param {boolean} config.showSort - Show sort dropdown
 * @param {string} config.onFilterChange - Name of global function to call on filter change
 * @returns {string} HTML string
 */
export function renderFilterBar({
    categories = [],
    activeCategory = null,
    selectedCustomerType = null,
    sortOrder = 'desc',
    showCustomerType = true,
    showSort = true,
    onFilterChange = 'applyFilters'
}) {
    // Render category filter buttons
    const categoryButtons = categories
        .map(cat => `
            <button
                class="filter-button ${activeCategory === cat.value ? 'active' : ''}"
                data-category="${cat.value || ''}"
                onclick="window.${onFilterChange}('${cat.value || ''}', '${selectedCustomerType || ''}', '${sortOrder}')"
            >
                ${cat.label}
            </button>
        `)
        .join('');

    // Render customer type filter (optional)
    const customerTypeFilter = showCustomerType ? `
        <div class="filter-group">
            <label for="customer-type-filter">Kundetype:</label>
            <select
                id="customer-type-filter"
                class="filter-dropdown"
                onchange="window.${onFilterChange}('${activeCategory || ''}', this.value, '${sortOrder}')"
            >
                <option value="">Alle kunder</option>
                <option value="PRIVATE_CUSTOMER" ${selectedCustomerType === 'PRIVATE_CUSTOMER' ? 'selected' : ''}>
                    Privat kunde
                </option>
                <option value="BUSINESS_CUSTOMER" ${selectedCustomerType === 'BUSINESS_CUSTOMER' ? 'selected' : ''}>
                    Erhvervskunde
                </option>
            </select>
        </div>
    ` : '';

    // Render sort filter (optional)
    const sortFilter = showSort ? `
        <div class="filter-group">
            <label for="sort-filter">Sorter:</label>
            <select
                id="sort-filter"
                class="filter-dropdown"
                onchange="window.${onFilterChange}('${activeCategory || ''}', '${selectedCustomerType || ''}', this.value)"
            >
                <option value="desc" ${sortOrder === 'desc' ? 'selected' : ''}>
                    Nyeste først
                </option>
                <option value="asc" ${sortOrder === 'asc' ? 'selected' : ''}>
                    Ældste først
                </option>
            </select>
        </div>
    ` : '';

    return `
        <section class="filter-bar">
            <div class="filter-bar-container">
                <div class="filter-buttons">
                    ${categoryButtons}
                </div>
                ${(showCustomerType || showSort) ? `
                    <div class="additional-filters">
                        ${customerTypeFilter}
                        ${sortFilter}
                    </div>
                ` : ''}
            </div>
        </section>
    `;
}
