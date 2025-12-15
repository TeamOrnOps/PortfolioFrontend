// ============================================
// ADMIN NAVIGATION COMPONENT
// Navigation bar for admin dashboard
// ============================================

import { logout } from '../utils/auth.js';

/**
 * Render admin navigation HTML
 * @returns {string} HTML string
 */
export function renderAdminNavigation() {
    return `
        <nav class="admin-navigation" id="admin-nav">
            <div class="admin-nav-container">
                <!-- Logo & Title -->
                <a href="#/admin" class="admin-nav-logo">
                    <img
                        src="/assets/logo-algenord.svg"
                        alt="AlgeNord Logo"
                        class="admin-nav-logo-image"
                    />
                    <span class="admin-nav-title">Admin Dashboard</span>
                </a>

                <!-- Actions -->
                <div class="admin-nav-actions">
                    <a href="#/create-project" class="admin-nav-btn admin-nav-btn-primary">
                        + Opret Projekt
                    </a>
                    <a href="#/admin/users" class="admin-nav-btn admin-nav-btn-secondary">
                        Brugere
                    </a>
                    <button
                        onclick="window.handleAdminLogout()"
                        class="admin-nav-btn admin-nav-btn-logout"
                    >
                        Log ud
                    </button>
                </div>
            </div>
        </nav>

        <!-- Spacer to prevent content hiding under fixed nav -->
        <div class="admin-nav-spacer"></div>
    `;
}

/**
 * Initialize admin navigation functionality
 */
export function initAdminNavigation() {
    const nav = document.getElementById('admin-nav');
    if (!nav) {
        console.log('Admin navigation element not found');
        return;
    }

    console.log('Admin navigation initialized');
}

/**
 * Handle admin logout
 */
window.handleAdminLogout = function () {
    const confirmed = confirm('Er du sikker på at du vil logge ud?');

    if (confirmed) {
        logout();
        window.location.hash = '#/';
    }
};
