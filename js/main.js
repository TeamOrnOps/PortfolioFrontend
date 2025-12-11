import { isAuthenticated, logout } from './utils/auth.js';
import { renderFrontPage } from './views/frontpage.js';
import { renderPresentationView } from './views/presentationview.js';
import { renderLoginView } from './views/loginview.js';
import { renderCreateProjectView } from './views/formulas/createProject.js';
import { renderEditProjectView } from './views/formulas/editProject.js';
import { renderUserListView } from './views/admin/userlist.js';
import { renderCreateUserView } from './views/admin/createuser.js';
import { renderUserDetailView } from './views/admin/userdetail.js';
import { renderEditUserView } from './views/admin/edituser.js';

// ============================================
// ROUTE CONFIGURATION
// ============================================

// Public routes - accessible without authentication
const publicRoutes = [
    '/login',
    '/projects',
    '/project/:id',  // Presentation view for customers
];

// Routes config (maps hash routes to view render functions)
const routes = {
    '': renderFrontPage,
    '/': renderFrontPage,
    '/projects': renderPresentationView,
    '/project/:id': renderPresentationView,
    '/login': renderLoginView,
    '/create-project': renderCreateProjectView,
    '/edit-project/:id': renderEditProjectView,
    '/admin/users': renderUserListView,
    '/admin/users/create': renderCreateUserView,
    '/admin/users/:id': renderUserDetailView,
    '/admin/users/:id/edit': renderEditUserView,
};

// ============================================
// ROUTE MATCHING
// ============================================

/**
 * Get current route from URL hash
 * @returns {string}
 */
function getCurrentRoute() {
    const hash = window.location.hash.slice(1);
    return hash || '/';
}

/**
 * Check if route matches pattern and extract params
 * @param {string} routePattern - Route pattern (e.g., '/project/:id')
 * @param {string} hash - Current hash (e.g., '/project/123')
 * @returns {object|null} - Params object or null if no match
 */
function matchRoute(routePattern, hash) {
    const routeParts = routePattern.split('/');
    const hashParts = hash.split('/');

    if (routeParts.length !== hashParts.length) {
        return null;
    }

    // Collect dynamic route params (':id'), return null if no match
    const params = {};
    for (let i = 0; i < routeParts.length; i++) {
        if (routeParts[i].startsWith(':')) {
            const paramName = routeParts[i].slice(1);
            params[paramName] = hashParts[i];
        } else if (routeParts[i] !== hashParts[i]) {
            return null;
        }
    }
    return params;
}

/**
 * Check if current route is public (no auth required)
 * @param {string} hash - Current hash route
 * @returns {boolean}
 */
function isPublicRoute(hash) {
    for (const publicRoute of publicRoutes) {
        if (matchRoute(publicRoute, hash) !== null) {
            return true;
        }
    }
    return false;
}

// ============================================
// AUTHENTICATION GUARD
// ============================================

/**
 * Check authentication and redirect if needed
 * @param {string} hash - Current route hash
 * @returns {boolean} - true if route is accessible, false if redirected
 */
function checkAuth(hash) {
    // Public routes - always accessible
    if (isPublicRoute(hash)) {
        return true;
    }

    // Protected routes - require authentication
    if (!isAuthenticated()) {
        console.log('Authentication required for:', hash);
        // Store intended destination for redirect after login
        sessionStorage.setItem('redirectAfterLogin', hash);
        window.location.hash = '#/login';
        return false;
    }

    return true;
}

// ============================================
// ROUTER
// ============================================

/**
 * Main router function - handles navigation
 */
async function router() {
    const hash = getCurrentRoute();
    const mainContent = document.getElementById('main-content');

    // Check authentication before rendering protected routes
    if (!checkAuth(hash)) {
        return; // Redirect happened, don't render
    }

    let matchedRoute = null;
    let params = {};

    // Find first match to current hash, capture its params
    for (const [routePattern, renderFunction] of Object.entries(routes)) {
        const match = matchRoute(routePattern, hash);
        if (match !== null) {
            matchedRoute = renderFunction;
            params = match;
            break;
        }
    }

    if (matchedRoute) {
        try {
            // Pass null to frontpage, pass params object to other views
            const html = matchedRoute === renderFrontPage
                ? await matchedRoute(null)
                : await matchedRoute(params);

            mainContent.innerHTML = html;

            // 🔥 IMPORTANT: Run init AFTER HTML is in DOM
            if (matchedRoute === renderEditProjectView) {
                import('./views/formulas/editProject.js').then(module => {
                    module.initEditProjectForm(params.id);
                });
            }


            // Update navigation state after render
            updateNavigationUI();

        } catch (error) {
            console.error('Error rendering view:', error);
            mainContent.innerHTML = `
                <div class="error-container">
                    <h2>An error has occurred!</h2>
                    <p>Couldn't load page. Please try again later.</p>
                    <button onclick="window.location.hash = '#/'">Back to front page</button>
                </div>
            `;
        }
    } else {
        // 404 - Route not found
        mainContent.innerHTML = `
            <div class="error-container">
                <h2>404 - Page not found</h2>
                <p>This page does not exist.</p>
                <button onclick="window.location.hash = '#/'">Back to front page</button>
            </div>
        `;
    }
}

// ============================================
// NAVIGATION UI
// ============================================

/**
 * Update navigation UI based on auth state
 */
function updateNavigationUI() {
    const navContainer = document.getElementById('nav-auth');
    if (!navContainer) return;

    if (isAuthenticated()) {
        navContainer.innerHTML = `
            <button onclick="window.handleLogout()" class="nav-logout-btn">
                Log ud
            </button>
        `;
    } else {
        navContainer.innerHTML = `
            <a href="#/login" class="nav-login-link">Log ind</a>
        `;
    }
}

/**
 * Handle logout action
 */
window.handleLogout = function() {
    logout();
    window.location.hash = '#/login';
};

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize application
 */
function init() {
    // Listen for hash changes (navigation)
    window.addEventListener('hashchange', router);

    // Handle initial route on page load
    router();

    console.log('AlgeNord Portfolio initialized');
}

// Start application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}