import { fetchUserById, deleteUser } from '../../api.js';

// render user detail information
function renderUserDetail(user) {
    return `
        <div class="admin-container">
            <nav class="breadcrumb">               
                <a href="#/admin/users">← Back to list</a>
            </nav>

            <header class="page-header">
                <h1>User Detail: ${user.username}</h1>
            </header>

            <section class="user-detail">
                <p><strong>User ID:</strong> ${user.id}</p>
                <p><strong>Username:</strong> ${user.username}</p>
                <p><strong>Email:</strong> ${user.email}</p>
            </section>

            <div class="user-actions">
                <a href="#/admin/users/${user.id}/edit" class="btn btn-primary">Edit User</a>
                <button 
                    class="btn btn-danger" 
                    onclick="window.handleDeleteUser(${user.id}, '${user.username}')"
                >
                    Delete User
                </button>
            </div>
        </div>
    `;
}

// render error state
function renderErrorState(error) {
    return `
    <div class="admin-container">
            <nav class="breadcrumb">               
                <a href="#/admin/users">← Back to list</a>
            </nav>
        <div class="error-state">
            <h2>Error</h2>
            <p>${error.message || 'User not found. Try again later.'}</p>
            <button class="btn btn-primary" onclick="window.location.reload()">Reload</button>
        </div>
    </div>
`;
}

// handle user deletion
async function handleDeleteUser(userId, username) {
    // confirm deletion
    const confirmed = confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`);
    if (!confirmed) return;

    try {
        await deleteUser(userId);
        alert(`User "${username}" deleted successfully.`);
        // redirect to user list
        window.location.href = '#/admin/users';
    } catch (error) {
        alert(`Error deleting user: ${error.message || 'Please try again later.'}`);
    }
}

// main render function for user detail view
export async function renderUserDetailView(userId) {
    try {
        const user = await fetchUserById(userId);
        return renderUserDetail(user);
    } catch (error) {
        return renderErrorState(error);
    }
}

window.handleDeleteUser = handleDeleteUser;