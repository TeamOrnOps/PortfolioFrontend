import { createUser } from '../../api.js';

// validation rules
const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 20;
const PASSWORD_MIN_LENGTH = 6;

// render create user form
function renderCreateUserForm() {
    return `
        <div class="admin-container">
            <nav class="breadcrumb">               
                <a href="#/admin/users">← Back to list</a>
            </nav>

            <header class="page-header">
                <h1>Create new user</h1>
            </header>

            <form id="create-user-form" class="user-form" novalidate>
                <section class="form-section">
                    <h2>User Information</h2>

                    <div class="form-group">
                        <label for="username">Username *</label>
                        <input 
                            type="text" 
                            id="username" 
                            name="username" 
                            required
                            minlength="${USERNAME_MIN_LENGTH}"
                            maxlength="${USERNAME_MAX_LENGTH}"
                            placeholder="Write a username"
                        />
                        <span class="error-message" id="username-error"></span>
                    </div>

                    <div class="form-group">
                        <label for="email">Email *</label>
                        <input 
                            type="email" 
                            id="email" 
                            name="email" 
                            required
                            placeholder="user@algenord.dk"
                        />
                        <span class="error-message" id="email-error"></span>
                    </div>

                    <div class="form-group">
                        <label for="password">Password *</label>
                        <input 
                            type="password" 
                            id="password" 
                            name="password" 
                            required
                            minlength="${PASSWORD_MIN_LENGTH}"
                            placeholder="At least ${PASSWORD_MIN_LENGTH} characters"
                        />
                        <span class="error-message" id="password-error"></span>
                    </div>

                    <div class="form-group">
                        <label for="confirm-password">Confirm password *</label>
                        <input 
                            type="password" 
                            id="confirm-password" 
                            name="confirmPassword" 
                            required
                            minlength="${PASSWORD_MIN_LENGTH}"
                            placeholder="retype password"
                        />
                        <span class="error-message" id="confirm-password-error"></span>
                    </div>
                </section>

                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="window.location.hash='#/admin/users'">
                        Cancel
                    </button>
                    <button type="submit" class="btn btn-primary" id="submit-btn">
                        Create User
                    </button>
                </div>

                <div id="form-message" class="form-message" style="display: none;"></div>
            </form>
        </div>
    `;
}

// validate form fields
function validateForm(){
    let isValid = true;
    const errors = {};

    // clear previous errors
    document.querySelectorAll('.error-message').forEach(span => span.textContent = '');
    document.querySelectorAll('.form-group input').forEach(input => input.classList.remove('input-error'));

    // username validation
    const username = document.getElementById('username').value.trim();
    if (!username) {
        errors.username = 'Username is required.';
        isValid = false;
    } else if (username.length < USERNAME_MIN_LENGTH) {
        errors.username = `Username must be at least ${USERNAME_MIN_LENGTH} characters.`;
        isValid = false;
    } else if (username.length > USERNAME_MAX_LENGTH) {
        errors.username = `Username must be at most ${USERNAME_MAX_LENGTH} characters.`;
        isValid = false;
    }

    // email validation
    const email = document.getElementById('email').value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
        errors.email = 'Email is required.';
        isValid = false;
    } else if (!emailPattern.test(email)) {
        errors.email = 'Please enter a valid email address.';
        isValid = false;
    }

    // password validation
    const password = document.getElementById('password').value;
    if (!password) {
        errors.password = 'Password is required.';
        isValid = false;
    } else if (password.length < PASSWORD_MIN_LENGTH) {
        errors.password = `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
        isValid = false;
    }

    // confirm password validation
    const confirmPassword = document.getElementById('confirm-password').value;
    if (!confirmPassword) {
        errors['confirm-password'] = 'Confirm password';
        isValid = false;
    } else if (password !== confirmPassword) {
        errors['confirm-password'] = 'Passwords do not match.';
        isValid = false;
    }

    // display errors
    Object.keys(errors).forEach(field => {
        const errorSpan = document.getElementById(`${field}-error`);
        if (errorSpan) {
            errorSpan.textContent = errors[field];
        }
        const inputField = document.getElementById(field);
        if (inputField) {
            inputField.classList.add('input-error');
        }
    });

    return isValid;
}

// show form message (success / error)
function showFormMessage(message, isError = false) {
    const messageElement = document.getElementById('form-message');
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.className = `form-message ${isError ? 'error' : 'success'}`;
        messageElement.style.display = 'block';
        messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// set loading state
function setLoadingState(isLoading) {
    const submitBtn = document.getElementById('submit-btn');
    if (submitBtn) {
        submitBtn.disabled = isLoading;
        submitBtn.textContent = isLoading ? 'Creating...' : 'Create User';
    }
}

// handle form submission
async function handleCreateUserSubmit(event) {
    event.preventDefault();

    //validate form
    if (!validateForm()) {
        return;
    }

    // set loading state
    setLoadingState(true);

    try {
        const form = event.target;
        const userData = {
            username: form.username.value.trim(),
            email: form.email.value.trim(),
            password: form.password.value,
        };

        // create user via API
        await createUser(userData);

        // success!
        showFormMessage(`User "${userData.username}" created successfully!`, false);

        // redirect to user list after short delay
        setTimeout(() => {
            window.location.hash = '#/admin/users';
        }, 1500);
    } catch (error) {
        showFormMessage(error.message || 'Error creating user. Please try again later.', true);
    } finally {
        setLoadingState(false);
    }
}

// initialize form event listener
function initCreateUserForm() {
    const form = document.getElementById('create-user-form');
    if (form) {
        form.addEventListener('submit', handleCreateUserSubmit);
    }
}

// main render function for create user view
export async function renderCreateUserView() {
    const html = renderCreateUserForm();

    // initialize form after DOM is loaded
    setTimeout(() => {
        initCreateUserForm();
    }, 0);

    return html;
}
