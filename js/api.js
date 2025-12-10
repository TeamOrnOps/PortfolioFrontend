import { getToken, logout, redirectToLogin } from './utils/auth.js';

const API_BASE_URL = 'http://localhost:8080/api';
const AUTH_BASE_URL = 'http://localhost:8080/auth';

/**
 * Generic fetch handler with JWT authentication and error handling
 * @param {string} url - API endpoint URL
 * @param {object} options - Fetch options
 * @param {boolean} requiresAuth - Whether request requires authentication (default: true)
 */
async function apiFetch(url, options = {}, requiresAuth = true) {
    try {
        // Build headers
        const headers = { ...options.headers };

        // Add Content-Type for JSON requests (not for FormData)
        if (!(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        // Add JWT token if authenticated
        if (requiresAuth) {
            const token = getToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        const response = await fetch(url, {
            ...options,
            headers,
        });

        // Handle 401 Unauthorized - redirect to login
        if (response.status === 401) {
            console.warn('Unauthorized - redirecting to login');
            logout();
            redirectToLogin();
            throw new Error('Session expired. Please log in again.');
        }

        // Handle 403 Forbidden - no permission
        if (response.status === 403) {
            console.warn('Forbidden - insufficient permissions');
            throw new Error('You do not have permission to perform this action.');
        }

        // Handle 204 No Content (for DELETE requests)
        if (response.status === 204) {
            return null;
        }

        // Parse JSON response body
        const data = await response.json();

        // Handle other HTTP errors
        if (!response.ok) {
            const errorMsg = data.message || 'An error occurred';
            const trackingId = data.trackingId;
            console.error(`API Error [${trackingId}]:`, data);
            throw new Error(errorMsg);
        }

        return data;
    } catch (error) {
        // Re-throw if already handled
        if (error.message.includes('Session expired') ||
            error.message.includes('permission')) {
            throw error;
        }

        console.error('Network Error:', error);
        throw error;
    }
}

// ============================================
// PROJECT ENDPOINTS
// ============================================

/**
 * Fetch all projects with optional filters
 * @param {object} filters - { workType, customerType, sort }
 */
export async function fetchAllProjects(filters = {}) {
    const params = new URLSearchParams();

    if (filters.workType) params.append('workType', filters.workType);
    if (filters.customerType) params.append('customerType', filters.customerType);
    if (filters.sort) params.append('sort', filters.sort);

    const queryString = params.toString();
    const url = `${API_BASE_URL}/projects${queryString ? `?${queryString}` : ''}`;

    return apiFetch(url, {}, true); // Requires auth (admin frontpage)
}

/**
 * Fetch single project by ID (public - for presentation view)
 * @param {number} id
 */
export async function fetchProjectById(id) {
    return apiFetch(`${API_BASE_URL}/projects/${id}`, {}, false); // Public endpoint
}

/**
 * Create new project with images
 * @param {FormData} formData
 */
export async function createProject(formData) {
    return apiFetch(`${API_BASE_URL}/projects`, {
        method: 'POST',
        body: formData,
    }, true); // Requires auth
}

/**
 * Update existing project
 * @param {number} id
 * @param {object} updateData
 */
export async function updateProject(id, updateData) {
    return apiFetch(`${API_BASE_URL}/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
    }, true); // Requires auth
}

/**
 * Delete project by ID
 * @param {number} id
 */
export async function deleteProject(id) {
    return apiFetch(`${API_BASE_URL}/projects/${id}`, {
        method: 'DELETE',
    }, true); // Requires auth
}

/**
 * Upload images to existing project
 * @param {number} projectId
 * @param {FormData} formData
 */
export async function uploadProjectImages(projectId, formData) {
    return apiFetch(`${API_BASE_URL}/projects/${projectId}/images`, {
        method: 'PATCH',
        body: formData,
    }, true); // Requires auth
}

/**
 * Update image metadata
 * @param {number} projectId
 * @param {number} imageId
 * @param {object} updateData
 */
export async function updateImageMetadata(projectId, imageId, updateData) {
    return apiFetch(`${API_BASE_URL}/projects/${projectId}/images/${imageId}`, {
        method: 'PATCH',
        body: JSON.stringify(updateData),
    }, true); // Requires auth
}

/**
 * Delete image from project
 * @param {number} projectId
 * @param {number} imageId
 */
export async function deleteImage(projectId, imageId) {
    return apiFetch(`${API_BASE_URL}/projects/${projectId}/images/${imageId}`, {
        method: 'DELETE',
    }, true); // Requires auth
}

// ============================================
// AUTH ENDPOINTS
// ============================================

/**
 * Login user and get JWT token
 * @param {object} credentials - { username, password }
 */
export async function login(credentials) {
    return apiFetch(`${AUTH_BASE_URL}/login`, {
        method: 'POST',
        body: JSON.stringify(credentials),
    }, false); // Public endpoint
}

// ============================================
// USER ENDPOINTS (for admin user management)
// ============================================

/**
 * Fetch all users (admin only)
 */
export async function fetchAllUsers() {
    return apiFetch(`${API_BASE_URL}/users`, {}, true);
}

/**
 * Fetch single user by ID
 * @param {number} id
 */
export async function fetchUserById(id) {
    return apiFetch(`${API_BASE_URL}/users/${id}`, {}, true);
}

/**
 * Create new user (admin only)
 * @param {object} userData - { username, email, password, roles }
 */
export async function createUser(userData) {
    return apiFetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        body: JSON.stringify(userData),
    }, true);
}

/**
 * Update existing user
 * @param {number} id
 * @param {object} updateData
 */
export async function updateUser(id, updateData) {
    return apiFetch(`${API_BASE_URL}/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
    }, true);
}

/**
 * Delete user by ID
 * @param {number} id
 */
export async function deleteUser(id) {
    return apiFetch(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE',
    }, true);
}