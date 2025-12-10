import { login } from '../api.js';

// Render login form
function renderLoginForm() {
    return `
        <div class="login-container">
            <div class="login-card">
                <h1>AlgeNord Login</h1>
                <p class="login-subtitle">Administrator Access</p>
                
                <form id="login-form" class="login-form">
                    <div class="form-group">
                        <label for="username">Username</label>
                        <input 
                            type="text" 
                            id="username" 
                            name="username" 
                            required 
                            autocomplete="username"
                            placeholder="Enter username"
                        />
                    </div>
                    
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input 
                            type="password" 
                            id="password" 
                            name="password" 
                            required 
                            autocomplete="current-password"
                            placeholder="Enter password"
                        />
                    </div>
                    
                    <button type="submit" class="login-button">Log In</button>
                    
                    <div id="login-error" class="login-error" style="display: none;"></div>
                </form>
            </div>
        </div>
    `;
}

// Handle login form submission
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

        // Store JWT token in localStorage
        if (response.token) {
            localStorage.setItem('jwt_token', response.token);

            // Redirect to main page
            window.location.hash = '#/';
        } else {
            throw new Error('No token received from server');
        }

    } catch (error) {
        // Show error message
        errorDiv.textContent = 'Invalid username or password. Please try again.';
        errorDiv.style.display = 'block';

        // Re-enable button
        submitButton.disabled = false;
        submitButton.textContent = 'Log In';

        // Clear password field
        form.password.value = '';
        form.password.focus();
    }
}

// Main render function for login view
export async function renderLoginView() {
    // Check if already logged in
    const token = localStorage.getItem('jwt_token');
    if (token) {
        // User already logged in, redirect to home
        window.location.hash = '#/';
        return '<div>Redirecting...</div>';
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