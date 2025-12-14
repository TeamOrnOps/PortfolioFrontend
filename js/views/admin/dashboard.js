// ============================================
// ADMIN DASHBOARD VIEW
// Admin overview with project management
// Made by Claude Code
// ============================================

import { fetchAllProjects, deleteProject } from '../../api.js';
import { renderAdminNavigation, initAdminNavigation } from '../../components/adminNavigation.js';
import { renderComparisonSlider, getBeforeAfterImages } from '../../components/comparisonSlider.js';
import { renderFilterBar, getWorkTypeCategories } from '../../components/filterBar.js';
import { saveFilters, loadFilters } from '../../components/filterStorage.js';

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


// =============================
// Project Card Component (with admin actions)
// =============================

function renderAdminProjectCard(project) {
    // Get before/after images for comparison slider
    const { beforeImage, afterImage } = getBeforeAfterImages(project);

    return `
        <article class="project-card admin-project-card">
            <!-- Before/After Comparison Slider -->
            ${renderComparisonSlider(beforeImage, afterImage)}

            <!-- Project Info -->
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

                ${project.executionDate ? `
                    <div class="project-card-meta">
                        <span>Udført: ${formatDate(project.executionDate)}</span>
                    </div>
                ` : ''}

                <!-- Admin Actions -->
                <div class="admin-actions">
                    <a href="#/edit-project/${project.id}" class="admin-btn admin-btn-edit">
                        Rediger
                    </a>
                    <button
                        onclick="window.confirmDeleteProject(${project.id}, '${project.title.replace(/'/g, "\\'")}')"
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

function renderDashboard(projects, filters = {}) {
    const { workType = null, customerType = null, sortOrder = 'desc' } = filters;
    const categories = getWorkTypeCategories();

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

        ${renderFilterBar({
            categories: categories,
            activeCategory: workType,
            selectedCustomerType: customerType,
            sortOrder: sortOrder,
            showCustomerType: true,
            showSort: true,
            onFilterChange: 'applyAdminFilter'
        })}

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
    // Get URL params
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);

    // Load saved filters from localStorage
    const savedFilters = loadFilters();

    // Merge URL params with saved filters (URL takes precedence)
    const filters = {
        workType: urlParams.get('workType') || savedFilters.workType || null,
        customerType: urlParams.get('customerType') || savedFilters.customerType || null,
        sortOrder: urlParams.get('sort') || savedFilters.sortOrder || 'desc'
    };

    try {
        // Build API filters
        const apiFilters = {};
        if (filters.workType) apiFilters.workType = filters.workType;
        if (filters.customerType) apiFilters.customerType = filters.customerType;
        if (filters.sortOrder) apiFilters.sort = filters.sortOrder;

        // Fetch projects
        const projects = await fetchAllProjects(apiFilters);

        // Render dashboard
        const html = renderDashboard(projects, filters);

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

window.applyAdminFilter = function(workType, customerType, sortOrder) {
    // Save filters to localStorage
    saveFilters({
        workType: workType || null,
        customerType: customerType || null,
        sortOrder: sortOrder || 'desc'
    });

    // Build URL params
    const params = new URLSearchParams();
    if (workType) params.set('workType', workType);
    if (customerType) params.set('customerType', customerType);
    if (sortOrder && sortOrder !== 'desc') params.set('sort', sortOrder);

    // Navigate with new filters
    const newHash = params.toString()
        ? `#/admin?${params.toString()}`
        : '#/admin';

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
