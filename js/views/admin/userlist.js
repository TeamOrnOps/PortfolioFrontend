import { fetchAllUsers, deleteUser } from '../../api.js';

//render single user row in table
function renderUserRow(user) {
    return `
        <tr class="user-row">
            <td class="user-id">${user.id}</td>
            <td class="user-username">${user.username}</td>
            <td class="user-email">${user.email}</td>
            <td class="user-actions">
                <a href="#/admin/users/${user.id}" class="btn btn-small btn-view">Show</a>
                <a href="#/admin/users/${user.id}/edit" class="btn btn-small btn-edit">Edit</a>
                <button 
                    class="btn btn-small btn-danger" 
                    onclick="window.handleDeleteUser(${user.id}, '${user.username}')"
                >
                    Delete
                </button>
            </td>
        </tr>
    `;
}

// render empty state
function renderEmptyState() {
    return `
        <div class="empty-state">
            <p>No users found.</p>
            <a href="#/admin/users/create" class="btn btn-primary">+ Create User</a>
        </div>
    `;
}

// render error state
function renderErrorState(error) {
    return `
        <div class="error-state">
            <h2>Error</h2>
            <p>${error.message || 'Users not found. Try again later.'}</p>
            <button class="btn btn-primary" onclick="window.location.reload()">Reload</button>
        </div>
    `;
}

//handle user deletion
async function handleDeleteUser(userId, username) {
    //confirm deletion
    const confirmed = confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`);
    if (!confirmed) return;

    try {
        await deleteUser(userId);
        alert(`User "${username}" deleted successfully.`);
        //reload user list
        window.location.reload();
    } catch (error) {
        alert(`Error deleting user: ${error.message || 'Please try again later.'}`);
    }
}

//main render function for user list view
export async function renderUserListView() {
    try {
        const users = await fetchAllUsers();

        if (!users || users.length === 0) {
           return `
           <div class="admin-container">
           <header class="admin-header">
                <h1>User Management</h1>
                <a href="#/" class="btn btn-secondary">← Back to Dashboard</a>
              </header>
                ${renderEmptyState()}
              </div>
              `;
        }

        // render user table
        const userRows = users.map(user => renderUserRow(user)).join('');

        return `
            <div class="admin-container">
                <header class="admin-header">
                    <div class="admin-header-content">
                        <h1>User Management</h1>                       
                    </div>
                    <div class="admin-header-actions">
                        <a href="#/" class="btn btn-secondary">← Back</a>
                        <a href="#/admin/users/create" class="btn btn-primary">+ Create new User</a>
                    </div>
                </header>

                <section class="user-table-section">
                    <table class="user-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${userRows}
                        </tbody>
                    </table>
                </section>
            </div>
        `;

    } catch (error) {
        console.error('Error rendering user list:', error);
        return `
            <div class="admin-container">
                ${renderErrorState(error)}
            </div>
        `;
    }
}

// Expose delete handler to global scope for inline onclick usage
window.handleDeleteUser = handleDeleteUser;