// ============================================
// PRESENTATION VIEW (NEW UI/UX)
// Public-facing portfolio with new design
// Made by Claude Code
// ============================================

import { fetchProjectById, fetchAllProjectsPublic } from '../api.js';
import {
    renderHeroCarousel,
    initHeroCarousel,
    getFeaturedImages,
} from '../components/heroCarousel.js';
import {
    renderNavigation,
    initNavigation,
    getNavigationCategories,
} from '../components/navigation.js';
import { renderFooter } from '../components/footer.js';

// =============================
// Helpers
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
// Filter Bar Component
// =============================

function renderFilterBar(categories, activeCategory = null) {
    // made by claude code
    const filterButtons = categories
        .map(
            (cat) => `
        <button
            class="filter-button ${activeCategory === cat.value ? 'active' : ''}"
            data-category="${cat.value || ''}"
            onclick="window.applyPublicFilter('${cat.value || ''}')"
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
// Project Card Component
// =============================

function renderProjectCard(project) {
    // made by claude code
    const featured = getFeaturedImage(project);

    return `
        <article class="project-card">
            <a href="#/project/${project.id}" style="text-decoration: none; color: inherit;">
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
                </div>
            </a>
        </article>
    `;
}

// =============================
// Overview View (List of Projects)
// =============================

function renderProjectsOverview(projects, activeCategory = null) {
    // made by claude code
    const categories = getNavigationCategories();

    // Get featured images (filtered by category if active)
    const featuredImages = getFeaturedImages(projects, activeCategory);

    // Render project cards
    const projectCards =
        projects && projects.length > 0
            ? projects.map((project) => renderProjectCard(project)).join('')
            : `
        <div class="project-grid-empty">
            <h3>Ingen projekter fundet</h3>
            <p>Der er ingen projekter i denne kategori endnu.</p>
        </div>
    `;

    return `
        ${renderNavigation(categories, activeCategory)}

        ${renderHeroCarousel(featuredImages)}

        <section class="project-grid-section">
            <div class="project-grid-container">
                <div class="project-grid">
                    ${projectCards}
                </div>
            </div>
        </section>

        ${renderFooter()}
    `;
}

// =============================
// Detail View (Single Project)
// =============================

function renderProjectDetail(project) {
    // made by claude code
    const categories = getNavigationCategories();
    const featuredImage = getFeaturedImage(project);

    // Separate before/after images
    const beforeImages =
        project.images?.filter((img) => img.imageType === 'BEFORE' && !img.isFeatured) || [];
    const afterImages =
        project.images?.filter((img) => img.imageType === 'AFTER' && !img.isFeatured) || [];

    const renderImageGroup = (imageList, title, badgeClass) => {
        if (imageList.length === 0) return '';

        const imagesHtml = imageList
            .map(
                (img) => `
            <div class="project-card">
                <div class="project-card-image-wrapper">
                    <img
                        src="${img.url}"
                        alt="${title} – ${project.title}"
                        class="project-card-image"
                        loading="lazy"
                    />
                    <span class="project-card-badge ${badgeClass}">${title}</span>
                </div>
            </div>
        `
            )
            .join('');

        return `
            <div style="margin-bottom: var(--space-8);">
                <h3 style="margin-bottom: var(--space-4);">${title}</h3>
                <div class="project-grid">
                    ${imagesHtml}
                </div>
            </div>
        `;
    };

    return `
        ${renderNavigation(categories)}

        <!-- Hero Section -->
        <section style="
            width: 100%;
            min-height: 60vh;
            background: linear-gradient(135deg, var(--color-gray-100) 0%, var(--color-gray-50) 100%);
            display: flex;
            align-items: center;
            padding: var(--space-12) 0;
        ">
            <div class="container">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-12); align-items: center;">
                    <div>
                        <div style="display: flex; gap: var(--space-2); margin-bottom: var(--space-4); font-size: var(--text-sm); color: var(--color-text-muted);">
                            <span>${project.workType}</span>
                            <span>•</span>
                            <span>${project.customerType}</span>
                        </div>
                        <h1 style="font-size: var(--text-5xl); margin-bottom: var(--space-4);">${project.title}</h1>
                        <p style="font-size: var(--text-lg); color: var(--color-text-secondary); margin-bottom: var(--space-6);">
                            ${project.description}
                        </p>
                        ${
                            project.executionDate
                                ? `<p style="color: var(--color-text-muted);">
                                    Udført: <strong>${formatDate(project.executionDate)}</strong>
                                </p>`
                                : ''
                        }
                        <div style="margin-top: var(--space-6);">
                            <a
                                href="#/projects"
                                style="
                                    display: inline-flex;
                                    align-items: center;
                                    padding: var(--space-3) var(--space-6);
                                    background-color: var(--color-primary);
                                    color: var(--color-white);
                                    border-radius: var(--radius-full);
                                    text-decoration: none;
                                    font-weight: var(--weight-semibold);
                                    transition: all var(--transition-fast);
                                "
                            >
                                ← Tilbage til projekter
                            </a>
                        </div>
                    </div>
                    <div style="border-radius: var(--radius-xl); overflow: hidden; box-shadow: var(--shadow-2xl);">
                        ${
                            featuredImage
                                ? `<img
                                    src="${featuredImage.url}"
                                    alt="${project.title}"
                                    style="width: 100%; height: auto; display: block;"
                                />`
                                : ''
                        }
                    </div>
                </div>
            </div>
        </section>

        <!-- Images Section -->
        <section class="project-grid-section">
            <div class="project-grid-container">
                <h2 style="margin-bottom: var(--space-8);">Projekt billeder</h2>
                ${renderImageGroup(beforeImages, 'Før', 'before')}
                ${renderImageGroup(afterImages, 'Efter', 'after')}

                ${beforeImages.length === 0 && afterImages.length === 0 ? '<p style="color: var(--color-text-muted); text-align: center;">Ingen yderligere billeder tilgængelige.</p>' : ''}
            </div>
        </section>

        ${renderFooter()}
    `;
}

// =============================
// Main Render Function
// =============================

export async function renderPresentationView(params) {
    // made by claude code
    const projectId = params?.id;

    // Get current category from URL params
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
    const activeCategory = urlParams.get('category') || null;

    // No ID → Show overview
    if (!projectId) {
        try {
            const filters = {};
            if (activeCategory) {
                filters.workType = activeCategory;
            }

            const projects = await fetchAllProjectsPublic(filters);

            const html = renderProjectsOverview(projects, activeCategory);

            // Initialize components after render
            setTimeout(() => {
                initNavigation();
                initHeroCarousel();
            }, 100);

            return html;
        } catch (error) {
            console.error('Error fetching projects:', error);
            return `
                ${renderNavigation(getNavigationCategories())}
                <div class="container" style="padding: var(--space-12) 0; text-align: center;">
                    <h2>Kunne ikke indlæse projekter</h2>
                    <p>Prøv igen senere.</p>
                </div>
                ${renderFooter()}
            `;
        }
    }

    // With ID → Show detail
    try {
        const project = await fetchProjectById(projectId);
        const html = renderProjectDetail(project);

        // Initialize navigation after render
        setTimeout(() => {
            initNavigation();
        }, 100);

        return html;
    } catch (error) {
        console.error('Error fetching project:', error);
        return `
            ${renderNavigation(getNavigationCategories())}
            <div class="container" style="padding: var(--space-12) 0; text-align: center;">
                <h2>Kunne ikke indlæse projektet</h2>
                <p>Prøv igen senere.</p>
                <a href="#/projects" style="display: inline-block; margin-top: var(--space-4); padding: var(--space-3) var(--space-6); background-color: var(--color-primary); color: var(--color-white); border-radius: var(--radius-full); text-decoration: none;">
                    Tilbage til projekter
                </a>
            </div>
            ${renderFooter()}
        `;
    }
}

// =============================
// Global Filter Handler
// =============================

window.applyPublicFilter = function (category) {
    // made by claude code
    const newHash = category ? `#/projects?category=${category}` : '#/projects';
    window.location.hash = newHash;
};