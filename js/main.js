import { renderFrontPage } from './views/frontpage.js';
import { renderPresentationView } from './views/presentationview.js';
import { renderLoginView } from './views/loginview.js';

// Routes config (maps hash routes to view render functions)
const routes = {
    '': renderFrontPage,
    '/': renderFrontPage,
    '/projects': renderFrontPage,
    '/project/:id': renderPresentationView,
    '/login': renderLoginView,
};

// Get current route from URL hash
function getCurrentRoute() {
    const hash = window.location.hash.slice(1);
    return hash || '/';
}

// Extract route params from hash
function matchRoute(route, hash) {
    const routeParts = route.split('/');
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

// Router function for navigation handling
// Follows single responsibility - ONLY routing logic
async function router() {
    const hash = getCurrentRoute();
    const mainContent = document.getElementById('main-content');

    let matchedRoute = null;
    let params = {};

    // Find first match to current hash, capture its params, stop
    for (const [route, renderFunction] of Object.entries(routes)) {
        const match = matchRoute(route, hash);
        if (match !== null) {
            matchedRoute = renderFunction;
            params = match;
            break;
        }
    }

    if (matchedRoute) {
        try {
            // Pass null to frontpage, pass params object to other views (frontpage has no params)
            const html = matchedRoute === renderFrontPage
                ? await matchedRoute(null)
                : await matchedRoute(params);

            mainContent.innerHTML = html;
        } catch (error) {
            console.error('Error rendering view:', error);
            mainContent.innerHTML = `
                <div style="padding: 2rem; text-align: center;">
                    <h2>An error has occurred!</h2>
                    <p>Couldn't load page. Please try again later</p>
                    <button onclick="window.location.hash = '#/'">Back to front page</button>
                </div>
            `;
        }
    } else {
        // 404 - Route not found
        mainContent.innerHTML = `
            <div style="padding: 2rem; text-align: center;">
                <h2>404 - Page not found</h2>
                <p>This page does not exist.</p>
                <button onclick="window.location.hash = '#/'">Back to front page</button>
            </div>
        `;
    }
}

// Initialize application
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