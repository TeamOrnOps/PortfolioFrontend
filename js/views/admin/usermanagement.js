// made by claude code
import { fetchAllUsers, deleteUser, updateUser } from '../../api.js';
import { getCurrentUser } from '../../utils/auth.js';

//render single user row in table
function renderUserRow(user) {
    // made by claude code
    const currentUser = getCurrentUser();
    const isCurrentUser = currentUser && currentUser.username === user.username;

    return `
        <tr class="user-row ${isCurrentUser ? 'current-user-row' : ''}" data-user-id="${user.id}" data-username="${user.username}" data-email="${user.email}" data-is-current-user="${isCurrentUser}">
            <td class="user-id">${user.id}</td>
            <td class="user-username ${isCurrentUser ? '' : 'editable-cell'}" data-field="username" data-user-id="${user.id}">
                <span class="cell-display">${user.username}${isCurrentUser ? ' <span class="current-user-badge">(dig)</span>' : ''}</span>
                ${!isCurrentUser ? `<input type="text" class="cell-input" value="${user.username}" style="display: none;" />` : ''}
            </td>
            <td class="user-email ${isCurrentUser ? '' : 'editable-cell'}" data-field="email" data-user-id="${user.id}">
                <span class="cell-display">${user.email}</span>
                ${!isCurrentUser ? `<input type="email" class="cell-input" value="${user.email}" style="display: none;" />` : ''}
            </td>
            <td class="user-actions">
                <button class="btn btn-small btn-edit" onclick="window.openPasswordModal(${user.id}, '${user.username}', ${isCurrentUser})">
                    Ændr password
                </button>
                ${!isCurrentUser ? `<button
                    class="btn btn-small btn-danger"
                    onclick="window.handleDeleteUserFromList(${user.id}, '${user.username}')"
                >
                    Slet
                </button>` : '<span class="btn btn-small btn-disabled" title="Kan ikke slette din egen bruger">Slet</span>'}
            </td>
        </tr>
    `;
}

// render empty state
function renderEmptyState() {
    return `
        <div class="empty-state">
            <p>Ingen brugere fundet.</p>
            <a href="#/admin/users/create" class="btn btn-primary">+ Opret bruger</a>
        </div>
    `;
}

// render error state
function renderErrorState(error) {
    return `
        <div class="error-state">
            <h2>Fejl</h2>
            <p>${error.message || 'Kunne ikke finde brugere. Prøv igen senere.'}</p>
            <button class="btn btn-primary" onclick="window.location.reload()">Genindlæs</button>
        </div>
    `;
}

// render password modal
function renderPasswordModal() {
    // made by claude code
    return `
        <div id="password-modal" class="modal" style="display: none;">
            <div class="modal-backdrop" onclick="window.closePasswordModal()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2 id="modal-title">Ændr password</h2>
                    <button class="modal-close" onclick="window.closePasswordModal()">&times;</button>
                </div>
                <form id="password-form" class="modal-form">
                    <input type="hidden" id="password-user-id" />
                    <input type="hidden" id="password-is-current-user" />

                    <div class="form-group">
                        <label for="new-password">Nyt password *</label>
                        <input
                            type="password"
                            id="new-password"
                            name="password"
                            required
                            minlength="6"
                            placeholder="Indtast nyt password (min. 6 tegn)"
                        />
                        <span class="error-message" id="password-error"></span>
                    </div>

                    <div class="form-group">
                        <label for="confirm-password">Bekræft password *</label>
                        <input
                            type="password"
                            id="confirm-password"
                            name="confirmPassword"
                            required
                            minlength="6"
                            placeholder="Gentag password"
                        />
                        <span class="error-message" id="confirm-error"></span>
                    </div>

                    <div id="modal-message" class="form-message" style="display: none;"></div>

                    <div class="modal-actions">
                        <button type="button" class="btn btn-secondary" onclick="window.closePasswordModal()">
                            Annuller
                        </button>
                        <button type="submit" class="btn btn-primary" id="password-submit-btn">
                            Gem password
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

// Show toast notification
function showToast(message, type = 'success') {
    // made by claude code
    // Remove existing toast if any
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Handle inline editing
function initInlineEditing() {
    // made by claude code
    const editableCells = document.querySelectorAll('.editable-cell');

    editableCells.forEach(cell => {
        const displaySpan = cell.querySelector('.cell-display');
        const input = cell.querySelector('.cell-input');

        if (!displaySpan || !input) return;

        // Normalize displaySpan textContent to fix CSS ::after positioning
        // This fixes the issue where "Rediger" appears inline before first edit
        const row = cell.closest('tr');
        const field = cell.dataset.field;
        const currentValue = field === 'username' ? row.dataset.username : row.dataset.email;
        displaySpan.textContent = currentValue;

        // Click to edit
        displaySpan.addEventListener('click', () => {
            displaySpan.style.display = 'none';
            input.style.display = 'block';
            input.focus();
            input.select();
        });

        // Save on blur
        input.addEventListener('blur', async () => {
            await saveInlineEdit(cell, input, displaySpan);
        });

        // Save on Enter key
        input.addEventListener('keydown', async (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                input.blur(); // This will trigger the blur event which saves
            } else if (e.key === 'Escape') {
                // Cancel editing - restore original value from data attributes
                const row = cell.closest('tr');
                const field = cell.dataset.field;
                const originalValue = field === 'username' ? row.dataset.username : row.dataset.email;
                input.value = originalValue;
                input.style.display = 'none';
                displaySpan.style.display = 'block';
            }
        });
    });
}

// Save inline edit
async function saveInlineEdit(cell, input, displaySpan) {
    // made by claude code
    const userId = parseInt(cell.dataset.userId, 10);
    const field = cell.dataset.field;
    const newValue = input.value.trim();
    // Use the cached data from row instead of displaySpan.textContent to avoid ::after content
    const row = cell.closest('tr');
    const oldValue = field === 'username' ? row.dataset.username : row.dataset.email;

    // No change, just hide input
    if (newValue === oldValue) {
        input.style.display = 'none';
        displaySpan.style.display = 'block';
        return;
    }

    // Validate
    if (!newValue) {
        showToast('Feltet må ikke være tomt', 'error');
        input.value = oldValue;
        input.style.display = 'none';
        displaySpan.style.display = 'block';
        return;
    }

    if (field === 'email' && !isValidEmail(newValue)) {
        showToast('Ugyldig email adresse', 'error');
        input.value = oldValue;
        input.style.display = 'none';
        displaySpan.style.display = 'block';
        return;
    }

    try {
        // Get current data from DOM (cached in data attributes)
        const row = cell.closest('tr');
        const currentUsername = row.dataset.username;
        const currentEmail = row.dataset.email;

        // Build update data with all required fields
        const updateData = {
            username: field === 'username' ? newValue : currentUsername,
            email: field === 'email' ? newValue : currentEmail
        };

        await updateUser(userId, updateData);

        // Update display
        displaySpan.textContent = newValue;
        input.style.display = 'none';
        displaySpan.style.display = 'block';

        // Update cached data in row
        if (field === 'username') {
            row.dataset.username = newValue;
        } else if (field === 'email') {
            row.dataset.email = newValue;
        }

        showToast(`${field === 'username' ? 'Brugernavn' : 'Email'} opdateret succesfuldt`, 'success');
    } catch (error) {
        console.error('Error updating user:', error);
        showToast(`Fejl: ${error.message}`, 'error');
        input.value = oldValue;
        input.style.display = 'none';
        displaySpan.style.display = 'block';
    }
}

// Simple email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Handle user deletion from list view
async function handleDeleteUserFromList(userId, username) {
    // made by claude code
    // Confirm deletion
    const confirmed = confirm(`Er du sikker på at du vil slette brugeren "${username}"? Denne handling kan ikke fortrydes.`);
    if (!confirmed) return;

    try {
        await deleteUser(userId);

        // Remove the row from DOM with animation
        const row = document.querySelector(`tr[data-user-id="${userId}"]`);

        if (row) {
            const tbody = row.closest('tbody');
            const remainingRows = tbody.querySelectorAll('tr').length - 1; // Subtract the one we're deleting

            // Add fade-out animation
            row.style.transition = 'opacity 0.3s ease-out';
            row.style.opacity = '0';

            // Remove after animation completes
            setTimeout(() => {
                row.remove();

                // ONLY reload if this was the last row
                if (remainingRows === 0) {
                    window.location.reload();
                }
            }, 350); // Slightly longer to ensure animation completes
        }

        // Show toast AFTER starting animation
        showToast(`Brugeren "${username}" blev slettet succesfuldt`, 'success');
    } catch (error) {
        console.error('Error deleting user:', error);
        showToast('Kunne ikke slette brugeren. Prøv igen.', 'error');
    }
}

// Open password modal
function openPasswordModal(userId, username, isCurrentUser) {
    // made by claude code
    const modal = document.getElementById('password-modal');
    const modalTitle = document.getElementById('modal-title');
    const userIdInput = document.getElementById('password-user-id');
    const isCurrentUserInput = document.getElementById('password-is-current-user');
    const form = document.getElementById('password-form');

    // Set modal title
    modalTitle.textContent = `Ændr password for ${username}${isCurrentUser ? ' (dig)' : ''}`;

    // Set hidden values
    userIdInput.value = userId;
    isCurrentUserInput.value = isCurrentUser;

    // Clear form
    form.reset();
    document.querySelectorAll('.error-message').forEach(span => span.textContent = '');
    const modalMessage = document.getElementById('modal-message');
    if (modalMessage) {
        modalMessage.style.display = 'none';
    }

    // Show modal
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling

    // Focus first input
    setTimeout(() => {
        document.getElementById('new-password').focus();
    }, 100);
}

// Close password modal
function closePasswordModal() {
    // made by claude code
    const modal = document.getElementById('password-modal');
    modal.style.display = 'none';
    document.body.style.overflow = ''; // Restore scrolling
}

// Show modal message
function showModalMessage(message, isError = true) {
    // made by claude code
    const messageDiv = document.getElementById('modal-message');
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className = `form-message ${isError ? 'error' : 'success'}`;
        messageDiv.style.display = 'block';
        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Set loading state for modal
function setModalLoadingState(isLoading) {
    // made by claude code
    const submitBtn = document.getElementById('password-submit-btn');
    if (submitBtn) {
        submitBtn.disabled = isLoading;
        submitBtn.textContent = isLoading ? 'Gemmer...' : 'Gem password';
    }
}

// Handle password change
async function handlePasswordChange(event) {
    // made by claude code
    event.preventDefault();

    // Clear previous errors
    document.querySelectorAll('.error-message').forEach(span => span.textContent = '');

    const userId = document.getElementById('password-user-id').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Validate
    let isValid = true;

    if (!newPassword) {
        document.getElementById('password-error').textContent = 'Password er påkrævet';
        isValid = false;
    } else if (newPassword.length < 6) {
        document.getElementById('password-error').textContent = 'Password skal være mindst 6 tegn';
        isValid = false;
    }

    if (!confirmPassword) {
        document.getElementById('confirm-error').textContent = 'Bekræft password er påkrævet';
        isValid = false;
    } else if (newPassword !== confirmPassword) {
        document.getElementById('confirm-error').textContent = 'Passwords matcher ikke';
        isValid = false;
    }

    if (!isValid) return;

    setModalLoadingState(true);

    try {
        await updateUser(userId, { password: newPassword });

        showToast('Password opdateret succesfuldt', 'success');
        closePasswordModal();
    } catch (error) {
        console.error('Error updating password:', error);
        showModalMessage(error.message || 'Fejl ved opdatering af password. Prøv igen senere.', true);
    } finally {
        setModalLoadingState(false);
    }
}

// Initialize password modal
function initPasswordModal() {
    // made by claude code
    const form = document.getElementById('password-form');
    if (form) {
        form.addEventListener('submit', handlePasswordChange);
    }

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modal = document.getElementById('password-modal');
            if (modal && modal.style.display === 'flex') {
                closePasswordModal();
            }
        }
    });
}

// Main render function for user management view
export async function renderUserManagementView() {
    // made by claude code
    try {
        const users = await fetchAllUsers();

        if (!users || users.length === 0) {
           return `
           <div class="admin-container">
           <header class="admin-header">
                <h1>Brugeradministration</h1>
                <a href="#/admin" class="btn btn-secondary">← Tilbage til admin dashboard</a>
              </header>
                ${renderEmptyState()}
              </div>
              `;
        }

        // render user table
        const userRows = users.map(user => renderUserRow(user)).join('');

        const html = `
            <div class="admin-container">
                <header class="admin-header">
                    <div class="admin-header-content">
                        <h1>Brugeradministration</h1>
                        <p class="admin-subtitle">Klik på brugernavn eller email for at redigere</p>
                    </div>
                    <div class="admin-header-actions">
                        <a href="#/admin" class="btn btn-secondary">← Tilbage</a>
                        <a href="#/admin/users/create" class="btn btn-primary">+ Opret ny bruger</a>
                    </div>
                </header>

                <section class="user-table-section">
                    <table class="user-table">
                        <thead>
                            <tr>
                                <th class="th-id">ID</th>
                                <th class="th-username">Brugernavn</th>
                                <th class="th-email">Email</th>
                                <th class="th-actions">Handlinger</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${userRows}
                        </tbody>
                    </table>
                </section>
            </div>

            ${renderPasswordModal()}
        `;

        // Initialize inline editing and password modal after render
        setTimeout(() => {
            initInlineEditing();
            initPasswordModal();
        }, 100);

        return html;

    } catch (error) {
        console.error('Error rendering user management view:', error);
        return `
            <div class="admin-container">
                ${renderErrorState(error)}
            </div>
        `;
    }
}

// Expose handlers to global scope for inline onclick usage
window.handleDeleteUserFromList = handleDeleteUserFromList;
window.openPasswordModal = openPasswordModal;
window.closePasswordModal = closePasswordModal;
