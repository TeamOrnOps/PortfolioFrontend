// ============================================
// ADMIN DASHBOARD VIEW
// Admin overview with project management
// Made by Claude Code
// ============================================

import { fetchAllProjects, deleteProject } from '../../api.js';
import { renderAdminNavigation, initAdminNavigation } from '../../components/adminNavigation.js';
import { getNavigationCategories } from '../../components/navigation.js';

// =============================
// Helpers (reused from presentation view)
// =============================

function formatDate(dateStr) {
    // made by claude code
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('da-DK', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

function getFeaturedImage(project) {
    // made by claude code
    if (!project.images || project.images.length === 0) return null;
    const featured = project.images.find((img) => img.isFeatured);
    return featured || project.images[0];
}

// =============================
// Filter Bar Component (reused)
// =============================

function renderFilterBar(categories, activeCategory = null) {
    // made by claude code
    const filterButtons = categories
        .map(
            (cat) => `
        <button
            class="filter-button ${activeCategory === cat.value ? 'active' : ''}"
            data-category="${cat.value || ''}"
            onclick="window.applyAdminFilter('${cat.value || ''}')"
        >
            ${cat.label}
        </button>
    `
        )
        .join('');

    return `
        <section class="filter-bar">
            <div class="filter-bar-container">
                <div class="filter-buttons">
                    ${filterButtons}
                </div>
            </div>
        </section>
    `;
}

// =============================
// Project Card Component (with admin actions)
// =============================

function renderAdminProjectCard(project) {
    // made by claude code
    const featured = getFeaturedImage(project);

    return `
        <article class="project-card admin-project-card">
            <div class="project-card-image-wrapper">
                ${
                    featured
                        ? `<img
                            src="${featured.url}"
                            alt="Projekt: ${project.title}"
                            class="project-card-image"
                            loading="lazy"
                        />`
                        : '<div class="project-card-image placeholder"></div>'
                }
            </div>
            <div class="project-card-content">
                <div class="project-card-tags">
                    <span>${project.workType}</span>
                    <span>•</span>
                    <span>${project.customerType}</span>
                </div>
                <h3 class="project-card-title">${project.title}</h3>
                <p class="project-card-description">
                    ${project.description}
                </p>
                ${
                    project.executionDate
                        ? `<div class="project-card-meta">
                            <span>Udført: ${formatDate(project.executionDate)}</span>
                        </div>`
                        : ''
                }

                <!-- Admin Actions -->
                <div class="admin-actions">
                    <a href="#/edit-project/${project.id}" class="admin-btn admin-btn-edit">
                        Rediger
                    </a>
                    <button
                        onclick="window.confirmDeleteProject(${project.id}, '${project.title}')"
                        class="admin-btn admin-btn-delete"
                    >
                        Slet
                    </button>
                </div>
            </div>
        </article>
    `;
}

// =============================
// Dashboard Overview
// =============================

function renderDashboard(projects, activeCategory = null) {
    // made by claude code
    const categories = getNavigationCategories();

    // Render project cards
    const projectCards =
        projects && projects.length > 0
            ? projects.map((project) => renderAdminProjectCard(project)).join('')
            : `
        <div class="project-grid-empty">
            <h3>Ingen projekter fundet</h3>
            <p>Opret dit første projekt for at komme i gang.</p>
            <a href="#/create-project" class="admin-btn admin-btn-primary">+ Opret Projekt</a>
        </div>
    `;

    return `
        ${renderAdminNavigation()}

        ${renderFilterBar(categories, activeCategory)}

        <section class="project-grid-section admin-section">
            <div class="project-grid-container">
                <div class="admin-section-header">
                    <h2>Alle Projekter (${projects.length})</h2>
                </div>
                <div class="project-grid">
                    ${projectCards}
                </div>
            </div>
        </section>
    `;
}

// =============================
// Main Render Function
// =============================

export async function renderAdminDashboard(params) {
    // made by claude code

    // Get current category from URL params
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
    const activeCategory = urlParams.get('category') || null;

    try {
        const filters = {};
        if (activeCategory) {
            filters.workType = activeCategory;
        }

        const projects = await fetchAllProjects(filters);

        const html = renderDashboard(projects, activeCategory);

        // Initialize components after render
        setTimeout(() => {
            initAdminNavigation();
        }, 100);

        return html;
    } catch (error) {
        console.error('Error fetching projects:', error);
        return `
            ${renderAdminNavigation()}
            <div class="container" style="padding: var(--space-12) 0; text-align: center;">
                <h2>Kunne ikke indlæse projekter</h2>
                <p>Prøv igen senere.</p>
            </div>
        `;
    }
}

// =============================
// Global Filter Handler
// =============================

window.applyAdminFilter = function (category) {
    // made by claude code
    const newHash = category ? `#/admin?category=${category}` : '#/admin';
    window.location.hash = newHash;
};

// =============================
// Global Delete Handler
// =============================

window.confirmDeleteProject = async function (projectId, projectTitle) {
    // made by claude code
    const confirmed = confirm(
        `Er du sikker på at du vil slette projektet "${projectTitle}"?\n\nDenne handling kan ikke fortrydes.`
    );

    if (confirmed) {
        try {
            await deleteProject(projectId);
            alert('Projektet blev slettet succesfuldt.');

            // Reload dashboard
            window.location.reload();
        } catch (error) {
            console.error('Error deleting project:', error);
            alert('Kunne ikke slette projektet. Prøv igen.');
        }
    }
};
