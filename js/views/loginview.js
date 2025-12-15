import { login } from '../api.js';
import { isAuthenticated, setToken } from '../utils/auth.js';

/**
 * Render login form HTML
 */
function renderLoginForm() {
    return `
        <div class="login-container">
            <div class="login-card">
                <!-- Logo -->
                <div class="login-logo">
                    <img
                        src="/assets/logo-algenord.svg"
                        alt="AlgeNord Logo"
                        class="login-logo-image"
                    />
                </div>

                <h1>Administrator Login</h1>
                <p class="login-subtitle">Adgang til admin panel</p>
                
                <form id="login-form" class="login-form">
                    <div class="form-group">
                        <label for="username">Brugernavn</label>
                        <input 
                            type="text" 
                            id="username" 
                            name="username" 
                            required 
                            autocomplete="username"
                            placeholder="Indtast brugernavn"
                        />
                    </div>
                    
                    <div class="form-group">
                        <label for="password">Kodeord</label>
                        <input 
                            type="password" 
                            id="password" 
                            name="password" 
                            required 
                            autocomplete="current-password"
                            placeholder="Indtast kodeord"
                        />
                    </div>
                    
                    <button type="submit" class="login-button">Log Ind</button>
                    
                    <div id="login-error" class="login-error" style="display: none;"></div>
                </form>
                
                <div class="login-footer">
                    <a href="#/" class="customer-link">Tilbage til portefølje →</a>
                </div>
            </div>
        </div>
    `;
}

/**
 * Handle login form submission
 */
async function handleLoginSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const username = form.username.value.trim();
    const password = form.password.value;
    const errorDiv = document.getElementById('login-error');
    const submitButton = form.querySelector('button[type="submit"]');

    // Clear previous errors
    errorDiv.style.display = 'none';
    errorDiv.textContent = '';

    // Disable submit button during request
    submitButton.disabled = true;
    submitButton.textContent = 'Logging in...';

    try {
        // Call login API
        const response = await login({ username, password });

        // Store JWT token using auth utility
        if (response.token) {
            setToken(response.token);

            // Check if there's a redirect destination stored
            const redirectTo = sessionStorage.getItem('redirectAfterLogin');
            sessionStorage.removeItem('redirectAfterLogin');

            // Redirect to intended destination or admin dashboard
            window.location.hash = redirectTo || '#/admin';
        } else {
            throw new Error('No token received from server');
        }

    } catch (error) {
        // Show error message
        errorDiv.textContent = error.message || 'Invalid username or password. Please try again.';
        errorDiv.style.display = 'block';

        // Re-enable button
        submitButton.disabled = false;
        submitButton.textContent = 'Log In';

        // Clear password field
        form.password.value = '';
        form.password.focus();
    }
}

/**
 * Main render function for login view
 */
export async function renderLoginView() {
    // Check if already logged in
    if (isAuthenticated()) {
        // User already logged in, redirect to admin dashboard
        window.location.hash = '#/admin';
        return '<div class="redirect-message">Redirecting...</div>';
    }

    // Render login form
    const html = renderLoginForm();

    // Attach event listener after DOM is updated
    setTimeout(() => {
        const form = document.getElementById('login-form');
        if (form) {
            form.addEventListener('submit', handleLoginSubmit);
        }
    }, 0);

    return html;
}