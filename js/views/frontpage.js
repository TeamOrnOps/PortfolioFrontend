import { fetchAllProjects } from '../api.js';

// Render hero image section
function renderHeroImage(projects, selectedWorkType) {
    // only show hero when specific workType is selected (not on "all")
    if (!selectedWorkType) {
        return '';
    }

    // Find first project with selected workType that has featured image
    const projectWithHero = projects.find(project =>
        project.workType === selectedWorkType &&
        project.images?.some(img => img.isFeatured)
    );

    if (!projectWithHero) {
        return '';
    }

    // Get the featured image
    const heroImage = projectWithHero.images.find(img => img.isFeatured);

    return `
        <section class="hero-section">
            <img src="${heroImage.url}" alt="${projectWithHero.title}" class="hero-image" />
            <div class="hero-overlay">
                <h2>${projectWithHero.workType}</h2>
            </div>
        </section>
    `;
}

// Render workType filter buttons
function renderWorkTypeFilters(selectedWorkType) {
    // WorkType values from backend enum
    const workTypes = [
        { value: null, label: 'All Projects' },
        { value: 'PAVING_CLEANING', label: 'Fliserens' },
        { value: 'WOODEN_DECK_CLEANING', label: 'Rens af træterrasse' },
        { value: 'ROOF_CLEANING', label: 'Tagrens' },
        { value: 'FACADE_CLEANING', label: 'Facaderens' }
    ];

    const filtersHtml = workTypes.map(type => {
        const isActive = selectedWorkType === type.value;
        const activeClass = isActive ? 'filter-active' : '';

        return `
            <button 
                class="filter-button ${activeClass}" 
                onclick="window.filterByWorkType('${type.value || ''}')"
            >
                ${type.label}
            </button>
        `;
    }).join('');

    return `
        <nav class="work-type-filters">
            ${filtersHtml}
        </nav>
    `;
}

// Render single project card (grid view)
function renderProjectCard(project) {
    // Get first non-featured image for card thumbnail
    const thumbnailImage = project.images?.find(img => !img.isFeatured) || project.images?.[0];
    const imageUrl = thumbnailImage ? thumbnailImage.url : '/static/placeholder-image.jpg';

    // Format date to DK format
    const executionDate = new Date(project.executionDate).toLocaleDateString('da-DK', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return `
        <article class="project-card" onclick="window.location.hash = '#/project/${project.id}'">
            <img src="${imageUrl}" alt="${project.title}" class="project-card-image" />
            <div class="project-card-content">
                <h3>${project.title}</h3>
                <p class="project-meta">
                    <span>${project.workType}</span> • 
                    <span>${project.customerType}</span>
                </p>
                <p class="project-description">${project.description.substring(0, 150)}${project.description.length > 150 ? '...' : ''}</p>
                <p class="project-date">${executionDate}</p>
            </div>
        </article>
    `;
}

// Render loading state
function renderLoading() {
    return `
        <div class="loading">
            <p>Loading projects...</p>
        </div>
    `;
}

// Render empty state when no projects exist
function renderEmptyState() {
    return `
        <div class="empty-state">
            <p>No projects found. Please check back later.</p>
        </div>
    `;
}

// Main render function for front page
export async function renderFrontPage(selectedWorkType = null) {
    try {
        // Fetch all projects (or filtered by workType)
        const filters = selectedWorkType ? { workType: selectedWorkType } : {};
        const projects = await fetchAllProjects(filters);

        // Handle empty state
        if (!projects || projects.length === 0) {
            return `
                <div class="frontpage">
                    <header class="frontpage-header">
                        <h1>AlgeNord Portfolio</h1>
                        <p>Our projects are currently being cleaned and maintained!</p>
                    </header>
                    ${renderWorkTypeFilters(selectedWorkType)}
                    ${renderEmptyState()}
                </div>
            `;
        }

        // Render project grid
        const projectCards = projects.map(project => renderProjectCard(project)).join('');

        return `
            <div class="frontpage">
                <header class="frontpage-header">
                    <h1>AlgeNord Portfolio</h1>
                    <p>Our projects are currently being cleaned and maintained!</p>
                </header>
                
                ${renderWorkTypeFilters(selectedWorkType)}
                ${renderHeroImage(projects, selectedWorkType)}
                
                <section class="projects-grid">
                    ${projectCards}
                </section>
            </div>
        `;

    } catch (error) {
        console.error('Error rendering front page:', error);
        return `
            <div class="error-state">
                <h2>Error loading projects</h2>
                <p>An error occurred loading this page. Please try reload.</p>
                <button onclick="window.location.reload()">Reload</button>
            </div>
        `;
    }
}

// Global function for filter buttons (attached to window for onclick handlers)
window.filterByWorkType = function(workType) {
    // Store selected filter and re-render
    const selectedType = workType || null;

    // Re-render frontpage with selected filter
    renderFrontPage(selectedType).then(html => {
        document.getElementById('main-content').innerHTML = html;
    });
};