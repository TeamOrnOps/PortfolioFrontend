import {fetchAllProjects, deleteProject} from '../api.js';

// Render hero image section
function renderHeroImage(projects, selectedWorkType) {
    // only show hero when specific workType is selected (not on "all")
    if (!selectedWorkType) {
        return '';
    }

    // Find first project with selected workType that has featured image
    const projectWithHero = projects.find(project => project.workType === selectedWorkType && project.images?.some(img => img.isFeatured));

    if (!projectWithHero) {
        return '';
    }

    // Get the featured image
    const heroImage = projectWithHero.images.find(img => img.isFeatured);

    return `
        <section class="hero-section">
            <img src="http://localhost:8080${heroImage.url}" alt="${projectWithHero.title}" class="hero-image" />
            <div class="hero-overlay">
                <h2>${projectWithHero.workType}</h2>
            </div>
        </section>
    `;
}

// Render workType filter buttons
function renderWorkTypeFilters(selectedWorkType, selectedCustomerType, sortOrder) {
    // WorkType values from backend enum
    const workTypes = [{value: null, label: 'All Projects'}, {
        value: 'PAVING_CLEANING',
        label: 'Fliserens'
    }, {value: 'WOODEN_DECK_CLEANING', label: 'Rens af træterrasse'}, {
        value: 'ROOF_CLEANING',
        label: 'Tagrens'
    }, {value: 'FACADE_CLEANING', label: 'Facaderens'}];

    const filtersHtml = workTypes.map(type => {
        const isActive = selectedWorkType === type.value;
        const activeClass = isActive ? 'filter-active' : '';

        return `
            <button 
                class="filter-button ${activeClass}" 
                onclick="window.applyFilters('${type.value || ''}', '${selectedCustomerType || ''}', '${sortOrder || ''}')"
            >
                ${type.label}
            </button>
        `;
    }).join('');

    return `
        <nav class="work-type-filters">
            ${filtersHtml}
        <div class="additional-filters">
            <div class="filter-group">
                <label for="customer-type-filter">Customer Type:</label>
                <select 
                    id="customer-type-filter" 
                    class="filter-dropdown"
                    onchange="window.applyFilters('${selectedWorkType || ''}', this.value, '${sortOrder || ''}')"
                >
                    <option value="">All Customers</option>
                    <option value="PRIVATE_CUSTOMER" ${selectedCustomerType === 'PRIVATE_CUSTOMER' ? 'selected' : ''}>Private Customer</option>
                    <option value="BUSINESS_CUSTOMER" ${selectedCustomerType === 'BUSINESS_CUSTOMER' ? 'selected' : ''}>Business Customer</option>
                </select>
            </div>

            <div class="filter-group">
                <label for="sort-filter">Sort By:</label>
                <select 
                    id="sort-filter" 
                    class="filter-dropdown"
                    onchange="window.applyFilters('${selectedWorkType || ''}', '${selectedCustomerType || ''}', this.value)"
                >
                    <option value="executionDate,desc" ${sortOrder === 'executionDate,desc' ? 'selected' : ''}>Newest First</option>
                    <option value="executionDate,asc" ${sortOrder === 'executionDate,asc' ? 'selected' : ''}>Oldest First</option>
                </select>
            </div>
        </div>
    `;
}

// RENDER LIST OF PROJECT CARDS
function renderProjectCard(project) {

    // Find BEFORE and AFTER images (du garanterer de findes)
    const beforeImage = project.images.find(img => img.imageType === 'BEFORE');
    const afterImage = project.images.find(img => img.imageType === 'AFTER');

    const beforeUrl = beforeImage ? `http://localhost:8080${beforeImage.url}` : '/static/placeholder-image.jpg';
    const afterUrl = afterImage ? `http://localhost:8080${afterImage.url}` : '/static/placeholder-image.jpg';


    // Format date
    const executionDate = new Date(project.executionDate).toLocaleDateString('da-DK', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    return `
        <article class="project-row">
        
            
            <!-- LEFT SIDE -->
            <div class="project-row-images">

    <div class="project-image-block">
        <h4>Før</h4>
        <img src="${beforeUrl}" class="project-image" alt="Før billede">

        ${beforeImage ? `
            <button class="btn btn-small"
                    onclick="window.location.hash = '#/edit-image/${project.id}/${beforeImage.id}'">
                Rediger før-billede
            </button>
        ` : ''}
    </div>

    <div class="project-image-block">
        <h4>Efter</h4>
        <img src="${afterUrl}" class="project-image" alt="Efter billede">

        ${afterImage ? `
            <button class="btn btn-small"
                    onclick="window.location.hash = '#/edit-image/${project.id}/${afterImage.id}'">
                Rediger efter-billede
            </button>
        ` : ''}
    </div>

</div>
         

            <!-- RIGHT SIDE -->
            <div class="project-row-info">
                <h3>${project.title}</h3>
                <p><strong>Kundetype:</strong> ${project.customerType}</p>
                <p>${project.description}</p>
                <p><strong>Udført:</strong> ${executionDate}</p>
            
                <div class="project-actions">
                    <button class="btn btn-secondary"
                            onclick="window.location.hash = '#/edit-project/${project.id}'">
                        Edit project
                    </button>
                    <button class="btn btn-danger"
                            onclick="window.confirmDeleteProject(${project.id}, '${project.title}')">
                        Delete project
                    </button>
                </div>
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
export async function renderFrontPage(selectedWorkType = null, selectedCustomerType = null, sortOrder = 'executionDate,desc') {
    // load saved filters from localStorage
    const savedFilters = JSON.parse(localStorage.getItem('projectFilters') || '{}');
    selectedWorkType = selectedWorkType || savedFilters.workType || null;
    selectedCustomerType = selectedCustomerType || savedFilters.customerType || null;
    sortOrder = sortOrder || savedFilters.sortOrder || 'executionDate,desc';

    try {
        // Fetch all projects (with optional filters)
        const filters = {};
        if (selectedWorkType) filters.workType = selectedWorkType;
        if (selectedCustomerType) filters.customerType = selectedCustomerType;
        if (sortOrder) filters.sort = sortOrder;

        const projects = await fetchAllProjects(filters);

        // Handle empty state
        if (!projects || projects.length === 0) {
            return `
            <div class="frontpage">
                <header class="frontpage-header">
                    <h1>AlgeNord Portfolio</h1>
                    <p>Our projects are currently being cleaned and maintained!</p>
                    <div class="admin-actions">
                        <a href="#/create-project" class="btn btn-primary">+ Create new Project</a>
                        <a href="#/admin/users" class="btn btn-secondary">User Management</a>
                    </div>
                </header>
                ${renderWorkTypeFilters(selectedWorkType, selectedCustomerType, sortOrder)}
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
                    <div class="admin-actions">
                        <a href="#/create-project" class="btn btn-primary">+ Create new Project</a>
                        <a href="#/admin/users" class="btn btn-secondary">User Management</a>
                    </div>
                </header>
                
                ${renderWorkTypeFilters(selectedWorkType, selectedCustomerType, sortOrder)}
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
window.applyFilters = function (workType, customerType, sortOrder) {
    // Store selected filter and re-render
    const selectedWorkType = workType || null;
    const selectedCustomerType = customerType || null;
    const selectedSort = sortOrder || 'executionDate,desc';

    //save to localstorage
    localStorage.setItem('projectFilters', JSON.stringify({
        workType: selectedWorkType,
        customerType: selectedCustomerType,
        sortOrder: selectedSort
    }));

    // Show loading state
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = '<div class="loading"><p>Loading projects...</p></div>';

    // Re-render frontpage with selected filter
    renderFrontPage(selectedWorkType, selectedCustomerType, selectedSort).then(html => {
        document.getElementById('main-content').innerHTML = html;
    });
};

// Global function to confirm project deletion
window .confirmDeleteProject = async function (projectId, projectTitle) {
    // Show confirm dialog
    const confirmed = window.confirm(`Are you sure you want to delete the project "${projectTitle}"? This action cannot be undone.`);
    if (!confirmed) return;

    try {
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = '<div class="loading"><p>Deleting project...</p></div>';

        // delete project
        await deleteProject(projectId);

        // show success message
        alert(`Project "${projectTitle}" has been deleted.`);

        // reload frontpage
        const html = await renderFrontPage();
        mainContent.innerHTML = html;
    } catch (error) {
        console.error('Error deleting project:', error);
        alert(`Error deleting project: ${error.message}`);

        // reload frontpage
        const html = await renderFrontPage();
        document.getElementById('main-content').innerHTML = html;
    }
}