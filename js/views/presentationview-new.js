// ============================================
// PRESENTATION VIEW (NEW UI/UX)
// Public-facing portfolio with new design
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
import { renderComparisonSlider, getBeforeAfterImages } from '../components/comparisonSlider.js';

// =============================
// Helpers
// =============================

function formatDate(dateStr) {
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
    if (!project.images || project.images.length === 0) return null;
    const featured = project.images.find((img) => img.isFeatured);
    return featured || project.images[0];
}

/**
 * Build full image URL
 * Handles both relative and absolute URLs
 * @param {string} url - Image URL from API
 * @returns {string} Full image URL
 */
function buildImageUrl(url) {
    if (!url) return '';
    // If URL is already absolute (starts with http:// or https://), return as-is
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }
    // Otherwise, prepend backend URL (hardcoded for development)
    return `http://localhost:8080${url}`;
}

// =============================
// Intro Section Component
// =============================

function renderIntroSection() {
    return `
        <section class="intro-section">
            <div class="container">
                <h1 class="intro-title">Velkommen til AlgeNord Portfolio</h1>
                <p class="intro-description">
                    Vi specialiserer os i professionel rensning og vedligeholdelse.
                    Se vores gennemførte projekter nedenfor, opdelt efter kategori.
                </p>
            </div>
        </section>
    `;
}

// =============================
// Horizontal Project Row Component (with Comparison Slider)
// =============================

function renderProjectRow(project) {
    const { beforeImage, afterImage } = getBeforeAfterImages(project);

    return `
        <article class="project-row">
            <!-- Venstre: Comparison Slider -->
            <div class="project-row-images">
                ${renderComparisonSlider(beforeImage, afterImage)}
            </div>

            <!-- Højre: Info -->
            <div class="project-row-info">
                <h3 class="project-title">${project.title}</h3>
                <p class="project-description">${project.description}</p>
                <div class="project-meta">
                    <span class="badge">${project.customerType}</span>
                    ${project.executionDate ? `
                        <span class="date">Udført: ${formatDate(project.executionDate)}</span>
                    ` : ''}
                </div>
            </div>
        </article>
    `;
}

// =============================
// Category Sections Component
// =============================

function renderCategorySections(projects) {
    const categories = getNavigationCategories();

    // Grupper projekter efter workType
    const projectsByCategory = {};

    categories.forEach(cat => {
        if (cat.value) {  // Skip "Alle"
            projectsByCategory[cat.value] = projects.filter(
                p => p.workType === cat.value
            );
        }
    });

    // Render hver kategori sektion
    const sections = categories
        .filter(cat => cat.value)  // Skip "Alle"
        .map(cat => {
            const categoryProjects = projectsByCategory[cat.value] || [];

            if (categoryProjects.length === 0) return '';

            return `
                <section id="category-${cat.value}" class="category-section">
                    <div class="container">
                        <h2 class="category-title">${cat.label}</h2>
                        <div class="project-list">
                            ${categoryProjects.map(renderProjectRow).join('')}
                        </div>
                    </div>
                </section>
            `;
        })
        .join('');

    return sections;
}

// =============================
// Filter Bar Component
// =============================

function renderFilterBar(categories, activeCategory = null) {
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
    const featured = getFeaturedImage(project);
    const imageUrl = featured ? buildImageUrl(featured.url) : null;

    return `
        <article class="project-card">
            <a href="#/project/${project.id}" style="text-decoration: none; color: inherit;">
                <div class="project-card-image-wrapper">
                    ${
                        imageUrl
                            ? `<img
                                src="${imageUrl}"
                                alt="Projekt: ${project.title}"
                                class="project-card-image"
                                loading="lazy"
                                onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'project-card-image placeholder\\'></div>';"
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
    const categories = getNavigationCategories();

    // Get featured images (all projects, not filtered by category)
    const featuredImages = getFeaturedImages(projects);

    return `
        ${renderNavigation(categories, activeCategory)}

        ${renderIntroSection()}

        ${renderHeroCarousel(featuredImages)}

        ${renderCategorySections(projects)}

        ${renderFooter()}
    `;
}

// =============================
// Detail View (Single Project)
// =============================

function renderProjectDetail(project) {
    const categories = getNavigationCategories();
    const featuredImage = getFeaturedImage(project);
    const featuredImageUrl = featuredImage ? buildImageUrl(featuredImage.url) : null;

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
                        src="${buildImageUrl(img.url)}"
                        alt="${title} – ${project.title}"
                        class="project-card-image"
                        loading="lazy"
                        onerror="this.onerror=null; this.style.display='none';"
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
                            featuredImageUrl
                                ? `<img
                                    src="${featuredImageUrl}"
                                    alt="${project.title}"
                                    style="width: 100%; height: auto; display: block;"
                                    onerror="this.onerror=null; this.style.display='none';"
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
                initSmoothScroll();
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
// Smooth Scroll to Category
// =============================

function initSmoothScroll() {
    // Add smooth scroll to navigation links
    const navLinks = document.querySelectorAll('[data-category]');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const category = link.getAttribute('data-category');

            // If "Alle" (empty category), scroll to top
            if (!category) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }

            // Otherwise, scroll to the category section
            const section = document.getElementById(`category-${category}`);
            if (section) {
                e.preventDefault();
                const offset = 100; // Account for sticky navigation
                const elementPosition = section.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - offset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// =============================
// Global Filter Handler
// =============================

window.applyPublicFilter = function (category) {
    const newHash = category ? `#/projects?category=${category}` : '#/projects';
    window.location.hash = newHash;
};