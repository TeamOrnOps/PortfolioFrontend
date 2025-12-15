// ============================================
// APPLICATION CONFIGURATION
// Centralized config for environment-specific values
// ============================================

/**
 * Application configuration
 *
 * In production, these can be set via environment variables
 * or build-time configuration
 */
export const config = {
    /**
     * API Base URL
     * Used for constructing full image URLs
     *
     * Development: http://localhost:8080
     * Production: Set to your domain (e.g., https://algenord.dk)
     */
    apiBaseUrl: getApiBaseUrl(),
};

/**
 * Get API base URL based on environment
 * Can be extended to read from environment variables
 */
function getApiBaseUrl() {
    // Check if running in production
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        // Production - use same origin
        return window.location.origin;
    }

    // Development - use localhost:8080
    return 'http://localhost:8080';
}

// TODO: Unused function - consider removing
/**
 * Check if running in development mode
 */
export function isDevelopment() {
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
}

// TODO: Unused function - consider removing
/**
 * Check if running in production mode
 */
export function isProduction() {
    return !isDevelopment();
}
