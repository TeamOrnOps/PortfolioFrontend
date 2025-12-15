import { fetchUserById, updateUser } from '../../api.js';

// validation rules
const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 20;
const PASSWORD_MIN_LENGTH = 6;

// render edit user form
function renderEditUserForm(user) {
    return `
        <div class="admin-container">
            <nav class="breadcrumb">               
                <a href="#/admin/users/${user.id}">← Back to detail</a>
            </nav>

            <header class="page-header">
                <h1>Edit user: ${user.username}</h1>
            </header>
            
            <form id="edit-user-form" class="user-form" novalidate>
            <input type="hidden" id="user-id" value="${user.id}" />
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
                            value="${user.username}"
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
                            value="${user.email}"
                        />
                        <span class="error-message" id="email-error"></span>
                    </div>

                    <div class="form-group">
                        <label for="password">Password </label>
                        <input 
                            type="password" 
                            id="password" 
                            name="password" 
                            minlength="${PASSWORD_MIN_LENGTH}"
                            placeholder="Leave blank to keep current password"
                        />
                        <span class="error-message" id="password-error"></span>
                    </div>
                </section>

               <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="window.location.hash='#/admin/users/${user.id}'">
                        Cancel
                    </button>
                    <button type="submit" class="btn btn-primary" id="submit-btn">
                        Save Changes
                    </button>
                </div>

                <div id="form-message" class="form-message" style="display: none;"></div>
            </form>
        </div>
    `;
}

// render error state
function renderErrorState(error, userId) {
    return `
    <div class="admin-container">
            <nav class="breadcrumb">               
                <a href="#/admin/users/${userId}">← Back to detail</a>
            </nav>
        <div class="error-state">
            <h2>Error</h2>
            <p>${error.message || 'User not found. Try again later.'}</p>
            <button class="btn btn-primary" onclick="window.location.reload()">Reload</button>
        </div>
    </div>
`;
}

// validate form fields
function validateForm() {
    let isValid = true;
    const errors = {};

    // clear previous errors
    document.querySelectorAll('.error-message').forEach(span => span.textContent = '');
    document.querySelectorAll('.form-group input').forEach(input => input.classList.remove('input-error'));

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
        errors.email = 'Invalid email format.';
        isValid = false;
    }

    // password validation
    const password = document.getElementById('password').value;
    if (password && password.length < PASSWORD_MIN_LENGTH) {
        errors.password = `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
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

// show form message (error / success)
function showFormMessage(message, isError = true) {
    const messageDiv = document.getElementById('form-message');
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className = `form-message ${isError ? 'error' : 'success'}`;
        messageDiv.style.display = 'block';
        messageDiv.scrollIntoView({behavior: 'smooth', block: 'center'});
    }
}

// set loading state
function setLoadingState(isLoading) {
    const submitBtn = document.getElementById('submit-btn');
    if (submitBtn) {
        submitBtn.disabled = isLoading;
        submitBtn.textContent = isLoading ? 'Saving...' : 'Save Changes';
    }
}

// handle form submission
async function handleEditUserSubmit(event) {
    event.preventDefault();

    // validate form
    if (!validateForm()) return;

    setLoadingState(true);

    try {
        const form = event.target;
        const userId = document.getElementById('user-id').value;
        // build update data
        const updatedData = {
            username: form.username.value.trim(),
            email: form.email.value.trim(),
        };
        // include password, if changed
        const password = form.password.value;
        if (password) {
            updatedData.password = password;
        }
        // update user
        await updateUser(userId, updatedData);
        showFormMessage('User updated successfully.', false);

        // redirect to user detail after short delay
        setTimeout(() => {
            window.location.hash = `#/admin/users/${userId}`;
        }, 1500);
    } catch (error) {
        showFormMessage(error.message || 'Error updating user. Please try again later.', true);
    } finally {
        setLoadingState(false);
    }
}

// initialize form event listeners
function initEditUserForm() {
    const form = document.getElementById('edit-user-form');
    if (form) {
        form.addEventListener('submit', handleEditUserSubmit);
    }
}

// main render function for edit user view
export async function renderEditUserView(params) {
    const userId = params?.id;

    if (!userId) {
        return `
        <div class="admin-container">
            <div class="error-state">
                <h2>Error</h2>
                <p>User ID is missing. Cannot load user data.</p>
        < a href="#/admin/users" > ← Back to user list</a >
            </div >
        </div >
    `;
    }
    try {
        // fetch user by ID
        const user = await fetchUserById(userId);
        const html = renderEditUserForm(user);

        // initialize form after DOM is loaded
        setTimeout(() => {
            initEditUserForm();
        }, 0);

        return html;
    } catch (error) {
        return renderErrorState(error, userId);
    }
}

