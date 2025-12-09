import { fetchProjectById } from '../api.js';

// Render image gallery with before/after images
function renderImageGallery(images) {
    if (!images || images.length === 0) {
        return '<p>No images available.</p>';
    }

    // Separate BEFORE and AFTER images, EXCLUDING featured images
    const beforeImages = images.filter(img => img.imageType === 'BEFORE' && !img.isFeatured);
    const afterImages = images.filter(img => img.imageType === 'AFTER' && !img.isFeatured);

    const renderImageGroup = (imageList, title) => {
        if (imageList.length === 0) return '';

        // Generate HTML for each image in the group
        const imagesHtml = imageList.map(img => `
            <div class="gallery-image">
                <img src="${img.url}" alt="${title}" />
            </div>
        `).join('');

        // Return the complete section for the image group
        return `
            <section class="image-group">
                <h3>${title}</h3>
                <div class="image-grid">
                    ${imagesHtml}
                </div>
            </section>
        `;
    };

    return `
        <div class="image-gallery">
            ${renderImageGroup(beforeImages, 'Before Images')}
            ${renderImageGroup(afterImages, 'After Images')}
        </div>
    `;
}

// Render project metadata section
function renderProjectMetadata(project) {
    const executionDate = new Date(project.executionDate).toLocaleDateString('da-DK', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const creationDate = new Date(project.creationDate).toLocaleDateString('da-DK', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return `
        <div class="project-metadata">
            <div class="metadata-item">
                <strong>Work type:</strong>
                <span>${project.workType}</span>
            </div>
            <div class="metadata-item">
                <strong>Customer type:</strong>
                <span>${project.customerType}</span>
            </div>
            <div class="metadata-item">
                <strong>Done:</strong>
                <span>${executionDate}</span>
            </div>
            <div class="metadata-item">
                <strong>Created:</strong>
                <span>${creationDate}</span>
            </div>
        </div>
    `;
}

// Main render function for presentation view
export async function renderPresentationView(params) {
    const projectId = params.id;

    if (!projectId) {
        return `
            <div class="error-state">
                <p>Invalid project ID.</p>
                <button onclick="window.location.hash = '#/'">Go back to Home</button>
            </div>
        `;
    }

    try {
        // Fetch project by ID
        const project = await fetchProjectById(projectId);

        return `
            <div class="presentation-view">
                <nav class="breadcrumb">
                    <a href="#/">← Back to overview</a>
                </nav>
                
                <header class="project-header">
                    <h1>${project.title}</h1>
                    ${renderProjectMetadata(project)}
                </header>
                
                <section class="project-description">
                    <h2>Description</h2>
                    <p>${project.description}</p>
                </section>
                
                <section class="project-images">
                    <h2>Pictures</h2>
                    ${renderImageGallery(project.images)}
                </section>
            </div>
        `;
    } catch (error) {
        console.error('Error fetching project:', error);
        return `
            <div class="error-state">
                <p>Could not load project details. Please try again later.</p>
                <button onclick="window.location.hash = '#/'">Go back to Home</button>
            </div>
        `;
    }
}