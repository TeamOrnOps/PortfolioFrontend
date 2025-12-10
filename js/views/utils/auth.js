/**
 * Authentication utility functions
 * Centralized auth state management for AlgeNord Portfolio
 */

const TOKEN_KEY = 'jwt_token';

/**
 * Check if user is authenticated (has valid token)
 * @returns {boolean}
 */
export function isAuthenticated() {
    const token = getToken();
    if (!token) return false;

    // Check if token is expired (JWT tokens have exp claim)
    try {
        const payload = parseJwtPayload(token);
        const now = Date.now() / 1000; // Convert to seconds

        if (payload.exp && payload.exp < now) {
            // Token expired, clean up
            logout();
            return false;
        }
        return true;
    } catch (error) {
        // Invalid token format
        logout();
        return false;
    }
}

/**
 * Get stored JWT token
 * @returns {string|null}
 */
export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

/**
 * Store JWT token
 * @param {string} token
 */
export function setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Remove token and log out user
 */
export function logout() {
    localStorage.removeItem(TOKEN_KEY);
}

/**
 * Parse JWT payload (middle part of token)
 * @param {string} token
 * @returns {object}
 */
function parseJwtPayload(token) {
    const parts = token.split('.');
    if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
    }

    const payload = parts[1];
    // Base64 decode (handle URL-safe base64)
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
}

/**
 * Get user info from token
 * @returns {object|null}
 */
export function getCurrentUser() {
    const token = getToken();
    if (!token) return null;

    try {
        const payload = parseJwtPayload(token);
        return {
            username: payload.sub,
            roles: payload.roles || [],
            exp: payload.exp
        };
    } catch (error) {
        return null;
    }
}

/**
 * Check if current user has specific role
 * @param {string} role
 * @returns {boolean}
 */
export function hasRole(role) {
    const user = getCurrentUser();
    if (!user || !user.roles) return false;
    return user.roles.includes(role);
}

/**
 * Redirect to login page
 */
export function redirectToLogin() {
    window.location.hash = '#/login';
}