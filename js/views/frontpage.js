import { fetchAllProjects } from '../api.js';

// Render single project card
function renderProjectCard(project) {
    const featuredImage = project.images?.find(img => img.isFeatured) || project.images?.[0]; // fallback to first image if no featured
    const imageUrl = featuredImage ? featuredImage.url : '/static/placeholder-image.jpg'; // placeholder image

    // Format date to DK format
    const executionDate = new Date(project.executionDate).toLocaleDateString('da-DK', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // wrapped in an onclick for project details
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
export async function renderFrontPage() {
    try {
        // Fetch all projects (sorted newest first by default)
        const projects = await fetchAllProjects();

        // Handle empty state
        if (!projects || projects.length === 0) {
            return `
                <div class="frontpage">
                    <header class="frontpage-header">
                        <h1>AlgeNord Portfolio</h1>
                        <p>Our projects are currently being cleaned and maintained!</p>
                    </header>
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